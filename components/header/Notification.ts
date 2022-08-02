import {useEffect,useCallback,useMemo} from 'react'
import {ResponseData} from 'portal/utils/api'
import {useRouter} from 'next/router'
import {arrayNotificationType} from 'portal/types/notification'
import {dataUserType} from 'portal/types/user'
import {useSelector as useReduxSelector,TypedUseSelectorHook,useDispatch} from 'react-redux'
import useSWR from 'portal/utils/swr'
import QS from 'qs'

type RootState={
    user: dataUserType,
    totalNotif: number|string
}

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

//let tot: number=0;
type ResponseType={
    data: Array<arrayNotificationType>,
    total: number|string
    total_unread: number
}
let boleh=false;

export const slugAs = {
    news:'/news/[...slug]',
    blog:'/blog/[slug]',
    chord:'/chord/[[...slug]]',
    thread:'/twitter/thread/[[...slug]]',
}

export const useNotification=()=>{
    const router=useRouter();
    const {user,totalNotif}=useSelector(state=>({user:state?.user,totalNotif:state.totalNotif}))
    const dispatch=useDispatch()
    //let total=useRef<number>(tot)
    //const [total,setTotall]=useState(tot);
    const {data:dataa,error:errorr,mutate}=useSWR<ResponseType>(user!==null ? `/v1/notification?page=1` : null,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
        revalidateOnMount:false
    })

    const total_all = useMemo(()=>!dataa ? 0 : Number(dataa.total),[dataa,errorr])
    const total = useMemo(()=>!dataa ? 0 : Number(dataa.total_unread),[dataa,errorr])
    const error = useMemo(()=>Boolean(errorr),[dataa,errorr])
    const loading = useMemo(()=>Boolean(!dataa && !errorr),[dataa,errorr])
    const data = useMemo(()=>{
        if(!dataa) return [];
        const a = dataa?.data;
        a.splice(6,dataa.data.length);
        const data = a.map(p=>{
            if(p?.type == 'comment') {
                let query={};
                const as = (p?.url as string)?.replace((process.env.DOMAIN||''),"");
                const queryParams = as.split("?")[1];
                if(queryParams.length > 0) query = QS.parse(queryParams);
                p.as = {
                    pathname:as,
                    query
                };
                p.url = {
                    pathname:typeof slugAs?.[p.comment_type as keyof typeof slugAs] !== 'undefined' ?  slugAs?.[p.comment_type as keyof typeof slugAs] : '/',
                    query
                };
            }
            if(p?.type === 'messages') {
                p.as = `/messages/${p?.username}`
                p.url = "/messages/[[...slug]]"
            }
            if(p?.type == "notification") {
                p.as = `/notification/portalnesia`
                p.url = "/notification/[[...slug]]"
            }
            if(p?.type == "support") {
                p.as = `/support/${p?.support_id as string}`
                p.url = "/support/[[...slug]]"
            }
            if(p?.type=='follow' && p?.username) {
                const query = {ref:'notification',refid:`${p?.id}`}
                p.as = {
                    pathname:`/user/${p?.username}`,
                    query
                }
                p.url = {
                    pathname:"/user/[...slug]",
                    query
                }
            }
            if(p?.type=='follow_pending') {
                p.as = `/user/${user?.user_login}/friend-request`;
                p.url = "/user/[...slug]"
            }
            return p;
        })
        return data;
    },[dataa,errorr])

    const handleNotification=useCallback((index: number,dt: arrayNotificationType): void=>{
        if(!dt?.read){
            let b=[...data]
            b[index]={
                ...b[index],
                read:true
            }
            setTimeout(()=>{
                mutate({
                    total:total_all,
                    total_unread:total,
                    data:b
                })
            },5000);
        }
        router.push(dt?.url,dt?.as);
    },[data,total])

    const setTotal=useCallback((t: number,validate?: boolean): void=>{
        if(typeof t === 'number') {
            if(validate) {
                mutate({
                    total: total_all,
                    total_unread:t,
                    data:data
                })
            } else {
                boleh=false;
                dispatch({type:'TOTAL_NOTIF',payload:t})
            }
        }
    },[data])

    const refreshNotification=useCallback((data?: ResponseType,shouldRevalidate?: boolean)=>{
        boleh=true;
        mutate(data,shouldRevalidate)
    },[mutate])

    useEffect(()=>{
        if(boleh) dispatch({type:'TOTAL_NOTIF',payload:total})
    },[total])

    return {
        data,
        loading,
        error,
        total:Number(totalNotif),
        total_all,
        setTotal,
        onClick:handleNotification,
        refreshNotification
    }
} 