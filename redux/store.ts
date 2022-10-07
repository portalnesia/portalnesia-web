import { createStore, applyMiddleware, Dispatch,Store } from 'redux'
import thunk from 'redux-thunk'
import {createWrapper} from 'next-redux-wrapper';
import rootReducer from './reducers/rootReducer';
import {State,ActionType,dataUserType} from 'portal/types'
import crypto from 'portal/utils/crypto'
import dayjs from 'dayjs'
import db from 'portal/utils/db'
import {isTrue} from '@portalnesia/utils'
import {GetServerSidePropsContext,GetServerSidePropsResult} from 'next'
import { ParsedUrlQuery } from 'querystring'

export function stored(store: Store<State,ActionType> & {dispatch: Dispatch<ActionType>},data: {config: Record<string,string>,user:dataUserType}) {
    const tokenDecrypt=JSON.stringify({token:'P0rTAlNESiA V3RS1 2 NeW TErB4Ru SIgNAtUre',date:dayjs().format('YYYY-MM-DD HH:mm:ss')});
    const token=crypto.encrypt(tokenDecrypt);
    store.dispatch({
        type:'CUSTOM',
        payload:{
            ...data,
            token,
            ...(process.env.NODE_ENV !== 'production' ? {debugToken:crypto.encrypt(JSON.stringify({token:"Portalnen14 D3buG",date:"2023-08-08 12:00:00",userid:2,session_id:238}))} : {})
        }
    })
    return token;
}

export const makeStore = () => {
    const store = createStore<State,ActionType,{dispatch:Dispatch<ActionType>},{}>(rootReducer, applyMiddleware(thunk));

    if ((module as any).hot) {
        (module as any).hot.accept('./reducers/rootReducer', () => {
            store.replaceReducer(require('./reducers/rootReducer').default);
        });
    }

    return store;
};

export const wrapperRoot = createWrapper(makeStore);

type CallbackParams = GetServerSidePropsContext<ParsedUrlQuery,any> & ({store: Store<State, ActionType> & {
    dispatch: Dispatch<ActionType>;
}}) & ({
    pn: {config: Record<string,string>,user:dataUserType},
    token: string,
    redirect<P>(urlOrNotFound?:string): GetServerSidePropsResult<P>
})
type Callback<P> = (params: CallbackParams)=>Promise<GetServerSidePropsResult<P>>

export function wrapper<P>(callback?: Callback<P>|'login'|'admin') {
    return wrapperRoot.getServerSideProps((store)=>async(props)=>{
        try {
            const data = await db.getInitial(props?.req?.cookies?.portalid);
            const token = stored(store,data);
            if(isTrue(data.config.maintenance) && (data.user === null || !data.user.admin)) {
                if(props.res) {
                    props.res.statusCode=503;
                    props.res.setHeader('Retry-After',3600);
                }
                return {
                    props:({err:1234} as unknown as P)
                }
            }
            const redirect = db.redirect
            if(!callback) return {
                props:({} as unknown as P)
            }
            if(typeof callback === 'string') {
                if(callback === 'login') {
                    if(data.user === null) return db.redirect<P>(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${props.resolvedUrl}`)}`);
                }
                if(callback === 'admin') {
                    if(data.user === null || !data.user.admin) return db.redirect<P>();
                }
                return {
                    props:({} as unknown as P)
                }
            }
            const result = await callback({store,pn:data,token,redirect,...props})
            return result
        } catch(err) {
            console.log(err)
            if(props.res) {
                props.res.statusCode=503;
                props.res.setHeader('Retry-After',3600);
            }
            return {
                props:({err:503} as unknown as P)
            }
        }
    })
}