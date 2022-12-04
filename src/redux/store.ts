import { Dispatch,Store } from 'redux'
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/root';
import type {State,ActionType} from '@type/redux'
import type {IPages} from '@type/general'
import {GetServerSidePropsContext,GetServerSidePropsResult} from 'next'
import { ParsedUrlQuery } from 'querystring'
import {useDispatch as originalUseDispatch,useSelector as originalUseSelector} from 'react-redux'
import { createToken, verifyToken } from '@utils/main';
import getDatabase from '@model/index';
import { Session } from '@model/session';
import User, { UserAttribute } from '@model/user';
import { getCookie,setCookie } from 'cookies-next';
import { domainCookie } from '@src/config';
import { ResponseData } from '@design/hooks/api';

export const useDispatch = ()=>originalUseDispatch<Dispatch<ActionType>>()
export const useSelector = <D=State>(selector: (state: State)=>D)=>originalUseSelector<State,D>(selector)

export const makeStore = () => {
    const store = configureStore({
        reducer:rootReducer,
        middleware(getDefaultMiddleware) {
            return getDefaultMiddleware().concat(thunk)
        },
        devTools: process.env.NODE_ENV !== 'production',
    })
    if (process.env.NODE_ENV !== 'production' && (module as any)?.hot) {
        (module as any).hot.accept('./reducers/root', () => store.replaceReducer(rootReducer))
    }
  
    return store;
};

export const wrapperRoot = createWrapper(makeStore);

function stored(store: Store<State,ActionType> & {dispatch: Dispatch<ActionType>},data: Partial<State>) {
    store.dispatch({
        type:'CUSTOM',
        payload:{
            ...data,
        }
    })
}

const redirect=<P>({req,res}: {req:GetServerSidePropsContext['req'],res:GetServerSidePropsContext['res']}) => (destination?:string,message?: string) => {
    if(destination) {
        if(message) {
            setCookie("msg",message,{req,res,domain:domainCookie})
        }
        if(!(/localhost/.test(destination)) && process.env.NODE_ENV!=='production') {
            return {
                notFound:true
            } as GetServerSidePropsResult<P>
        } else {
            return {
                redirect: {
                    destination,
                    permanent:false
                }
            } as GetServerSidePropsResult<P>
        }
    } else {
        return {
            notFound:true
        } as GetServerSidePropsResult<P>
    }
}

type CallbackParams<P extends {}> = GetServerSidePropsContext<ParsedUrlQuery,any> & ({store: Store<State, ActionType> & {
    dispatch: Dispatch<ActionType>;
}}) & ({
    redirect(destination?:string,message?: string): GetServerSidePropsResult<IPages<P>>
    session?: Session
    getUser: typeof getUser
    fetchAPI: <D = any>(url: string) => Promise<D>
})

type Callback<P extends {}> = (params: CallbackParams<P>)=>Promise<GetServerSidePropsResult<IPages<P>>>

async function getUser(where?: Partial<UserAttribute>) {
    if(!where) return undefined;
    const user = await User.findOne({
        where
    });
    if(!user) return undefined;
    return user;
}

export class BackendError {
    status: number
    message: string
    constructor(status: number,message: string){
        this.status=status;
        this.message = message
    }
}

async function checkUserCookie(portalid: string) {
    const cookie = verifyToken<{id?:number,userid?:number}>(portalid.replace("%3A",":"),[30,'day']);
    if(cookie && cookie.id && cookie.userid) {
        const session = await Session.findOne({
            where:{
                id:cookie.id,
                userid:cookie.userid
            },
            include:{
                model: User,
                where:{
                    remove:false,
                    block:false,
                    suspend:false,
                    active:true
                },
                required:true
            }
        })
        if(session) {
            return session;
        }
    }
    return undefined;
}

export default function wrapper<P extends {}>(callback: Callback<P>) {
    return wrapperRoot.getServerSideProps((store)=>async(ctx)=>{
        try {
            let session: Session|undefined;
            await getDatabase();
            const portalid = getCookie("portalid",{req:ctx.req,res:ctx.res});
            if(typeof portalid === "string") {
                session = await checkUserCookie(portalid)
                if(session && session.user) stored(store,{user:session.user.toPagination()});
                else stored(store,{user:null});
            } else stored(store,{user:null});
            
            const fetchAPI = async<D=any>(url: string)=>{
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`,{
                    headers:{
                        'Pn-Internal-Server':createToken({
                            ...(session ? {
                                id:session.id,
                                userid:session.userid
                            } : {}),
                            token:process.env.INTERNAL_SERVER_SECRET
                        })
                    }
                })
                const data = await resp.json() as ResponseData<D>;
                if(!resp.ok) {
                    const message = typeof data.error === 'object' && 'description' in data.error ? data.error.description : data.message;
                    throw new BackendError(resp.status,message);
                }
                return data.data;
            }

            const result = await callback({store,redirect:redirect({req:ctx.req,res:ctx.res}),getUser,session,fetchAPI,...ctx})
            return result;
        } catch(err) {
            if(process.env.NEXT_PUBLIC_PN_ENV !== 'production') console.log(err)
            if(ctx.res) {
                ctx.res.statusCode=503;
                ctx.res.setHeader('Retry-After',3600);
            }
            throw err;
        }
    })
}