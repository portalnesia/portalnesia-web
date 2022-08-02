import React from 'react'
import axios,{AxiosRequestConfig,AxiosError,AxiosAdapter} from 'axios'
import {useDispatch,useSelector} from 'react-redux'
import {State} from 'portal/types/index'
import API,{APILocal,APIContent} from './axios'
import {useNotif} from 'portal/components/Notification'
import QueryString from 'qs'
import {setupCache} from 'axios-cache-adapter'

type ApiErrorTypes = boolean | {
    name: string,
    code: number,
    description: string
}

export interface ResponseData<R=any> {
    error: ApiErrorTypes,
    data: R;
    message: string;
    token?: string;
}
export type ContentResponseData = {
    error: number,
    msg: string,
    token: string
}
export type Pagination<D> = {
    page: number,
    total_page: number,
    can_load:boolean,
    total: number,
    data: D[]
}

class CatchApiError extends Error {
    constructor(dt: ResponseData<any>) {
        let msg="";
        if(typeof dt?.error === 'boolean') {
            msg = dt?.message;
        } else {
            msg = dt?.error?.description
        }
        super(msg);
        this.name="CatchApiError";
    }
}
export class ApiError extends Error {
    constructor(msg?:string) {
        super(msg);
        this.name="ApiError";
    }
}

const CancelToken=axios.CancelToken;
export const source=CancelToken.source();

export const cancelRequest=()=>{
    if(typeof source.cancel === 'function') source.cancel("Cancel by users")
};
//Router.events.on('routeChangeStart',cancelRequest);
type ApiOptions = {
    feedback?: boolean,
    error_notif?:boolean,
    success_notif?:boolean
}
const defaultOptions: ApiOptions = {
    feedback:true,
    error_notif:true,
    success_notif:true
}

export async function getLocal<R=any>(token: string,url: string,options?:ApiOptions): Promise<R> {
    try {
        const opt={
            headers:{
                'PN-auth':token,
            },
            withCredentials:true,
            cancelToken:source.token,
        }
        const res = await APILocal.get<ResponseData<R>>(url,opt);
        return res?.data?.data;
    } catch(e: any) {
        throw 'Something went wrong'
    }
}

function getData(data: Record<string,any>|FormData|null) {
    const dt = data===null ? {} : data;
    return dt;
}

export const useAPI=(useCache?: boolean)=>{
    const dispatch=useDispatch()
    const {setNotif} = useNotif();
    const {token:tokenn,debugToken} = useSelector<State,Pick<State,'token'|'debugToken'>>(state=>({token:state?.token,debugToken:state?.debugToken}));
    const token = tokenn === null ? "" : tokenn;
    const adapter = React.useRef<AxiosAdapter>();

    React.useEffect(()=>{
        if(useCache) {
            (async function(){
                const cache = await getAxiosCache();
                adapter.current = cache.adapter;
            })
        }
    },[useCache])

    const getHeaders = React.useCallback((formdata?: AxiosRequestConfig)=>{
        let opt: AxiosRequestConfig;
        if(formdata) {
            const {headers:otherHeader,...other}=formdata;
            opt={
                headers:{
                    'PN-auth':token,
                    ...(process.env.NODE_ENV !== 'production' ? {'x-debug':debugToken as string} : {}),
                    ...otherHeader
                },
                withCredentials:true,
                cancelToken:source.token,
                ...(useCache ? {adapter:adapter.current} : {}),
                ...other
            }
        } else {
            opt={
                headers:{
                    'PN-auth':token,
                    ...(process.env.NODE_ENV !== 'production' ? {'x-debug':debugToken as string} : {}),
                },
                withCredentials:true,
                cancelToken:source.token,
                ...(useCache ? {adapter:adapter.current} : {}),
            }
        }
        return opt;
    },[token,debugToken,useCache])

    const catchError = React.useCallback((url: string,e: any,options:ApiOptions)=>{
        if(e instanceof CatchApiError) {
            if(typeof e?.message === 'string' && options?.error_notif) {
                if(options?.error_notif) setNotif(e?.message,true);
                return e.message;
            }
            else {
                console.error(e);
                if(options?.feedback) dispatch({type:'REPORT',payload:{type:'url',url:window?.location?.href,endpoint:url}})
                if(options?.error_notif) setNotif("Something went wrong",true);
                return "Something went wrong";
            }
        } else {
            const err = e as AxiosError;
            if(axios.isCancel(err)) {
                return "Canceled";
            } else if(err?.code === 'ECONNABORTED') {
                if(options?.error_notif) setNotif("Connection timeout",true);
                return "Connection timeout"
            }
            else {
                if((err?.response?.status && ![500,503].includes(err?.response?.status)) && err?.response?.data?.error?.description) {
                    if(options?.error_notif) setNotif(err?.response?.data?.error?.description||"Something went wrong",true);
                    return (err?.response?.data?.error?.description||"Something went wrong") as string
                }
                else if((err?.response?.status && ![500,503].includes(err?.response?.status)) && typeof err?.response?.data.error === 'boolean') {
                    if(options?.error_notif) setNotif(err?.response?.data?.message||"Something went wrong",true)
                    return (err?.response?.data?.message||"Something went wrong") as string
                }
                else if((err?.response?.status && ![500,503].includes(err?.response?.status)) && err?.response?.status==440) {
                    if(options?.error_notif) setNotif("Token expired. Please refresh browser",true);
                    return "Token expired. Please refresh browser"
                }
                else {
                    console.error(err);
                    if(options?.feedback) dispatch({type:'REPORT',payload:{type:'url',url:window?.location?.href,endpoint:url}})
                    if(options?.error_notif) setNotif("Something went wrong",true);
                    return "Something went wrong";
                }
            }
        }
    },[dispatch,setNotif])

    const fetcher = React.useCallback(async<R=any>(url: string): Promise<R>=>{
        try {
            const opt = getHeaders();
            const res = await API.get<ResponseData<R>>(url,opt);

            if(res?.data?.token) {
                dispatch({type:"TOKEN",payload:res.data.token})
            }
            if(typeof res.data.error === 'boolean') {
                if(res.data.error === true) throw res.data.message;
            } else {
                throw res.data.error.description;
            }
            return res.data.data;
        } catch(e: any) {
            if(typeof e === 'string') throw e;
            if(e?.response?.status==440) throw "Token expired. Please refresh browser";
            if(e?.response?.data?.error) {
                if(typeof e?.response?.data?.error === 'boolean') {
                    if(e?.response?.data?.error === true) throw e?.response?.data?.message;
                } else {
                    throw e?.response?.data?.error?.description;
                }
            }
            if(typeof e?.message === 'string') throw e?.message;
            throw "Failed to load data";
        }
    },[getHeaders]);

    /**
     * @param url
     * @param options
     * @returns [data,message]
     */
    const get = React.useCallback(async<R=any>(url: string,option?:ApiOptions): Promise<[R,string]>=>{
        const options: ApiOptions = {
            feedback:true,
            error_notif:true,
            ...(option ? option : {})
        }
        try {
            const opt = getHeaders();
            const res = await API.get<ResponseData<R>>(url,opt);

            if(res?.data?.token) {
                dispatch({type:"TOKEN",payload:res.data.token})
            }
            if(res?.data?.error) {
                throw new CatchApiError(res?.data)
            }
            return [res.data.data,res.data.message];
        } catch(e: any) {
            const string = catchError(url,e,options);
            throw new ApiError(string);
        }
    },[catchError,getHeaders]);

    const del = React.useCallback(async<R=any>(url: string,option?:ApiOptions): Promise<[R,string]>=>{
        const options: ApiOptions = {
            ...defaultOptions,
            ...(option ? option : {})
        }
        try {
            const opt = getHeaders();
            const res = await API.delete<ResponseData<R>>(url,opt);

            if(res?.data?.token) {
                dispatch({type:"TOKEN",payload:res.data.token})
            }
            if(res?.data?.error) {
                throw new CatchApiError(res?.data)
            }
            return [res.data.data,res.data.message];
        } catch(e: any) {
            const string = catchError(url,e,options);
            throw new ApiError(string);
        }
    },[catchError,getHeaders,useCache]);

    const post = React.useCallback(async<R=any>(url: string,data: Record<string,any>|null|FormData,formdata?: AxiosRequestConfig,option?:ApiOptions): Promise<[R,string]>=>{
        const options: ApiOptions = {
            ...defaultOptions,
            ...(option ? option : {})
        }
        const dt = getData(data);
        const opt = getHeaders(formdata);
        try {
            const res = await API.post<ResponseData<R>>(url,dt,opt);

            if(res?.data?.token) {
                dispatch({type:"TOKEN",payload:res.data.token})
            }
            if(res?.data?.error) {
                throw new CatchApiError(res?.data)
            }
            if(options?.success_notif) {
                setNotif(res.data.message,false)
            }
            return [res.data.data,res.data.message];
        } catch(e: any) {
            const string = catchError(url,e,options);
            throw new ApiError(string);
        }
    },[getData,getHeaders,catchError,setNotif,useCache]);

    const put = React.useCallback(async<R=any>(url: string,data: Record<string,any>|null|FormData,formdata?: AxiosRequestConfig,option?:ApiOptions): Promise<[R,string]>=>{
        const options: ApiOptions = {
            ...defaultOptions,
            ...(option ? option : {})
        }
        const dt = getData(data);
        const opt = getHeaders(formdata);
        try {
            const res = await API.put<ResponseData<R>>(url,dt,opt);

            if(res?.data?.token) {
                dispatch({type:"TOKEN",payload:res.data.token})
            }
            if(res?.data?.error) {
                throw new CatchApiError(res?.data);
            }
            if(options?.success_notif) {
                setNotif(res.data.message,false)
            }
            return [res.data.data,res.data.message];
        } catch(e: any) {
            const string = catchError(url,e,options);
            throw new ApiError(string);
        }
    },[getData,getHeaders,catchError,setNotif,useCache]);

    return {
        get,
        post,
        del,
        put,
        fetcher
    }
}

export const useContentAPI=()=>{
    const dispatch=useDispatch()
    const {setNotif} = useNotif();
    const {token:tokenn,debugToken} = useSelector<State,Pick<State,'token'|'debugToken'>>(state=>({token:state?.token,debugToken:state?.debugToken}));
    const token = tokenn === null ? "" : tokenn;

    const getHeaders = React.useCallback((formdata?: AxiosRequestConfig)=>{
        let opt: AxiosRequestConfig;
        if(formdata) {
            const {headers:otherHeader,...other}=formdata;
            opt={
                headers:{
                    'PN-auth':token,
                    ...(process.env.NODE_ENV !== 'production' ? {'x-debug':debugToken as string} : {}),
                    ...otherHeader
                },
                withCredentials:true,
                cancelToken:source.token,
                ...other
            }
        } else {
            opt={
                headers:{
                    'PN-auth':token,
                    ...(process.env.NODE_ENV !== 'production' ? {'x-debug':debugToken as string} : {}),
                },
                withCredentials:true,
                cancelToken:source.token,
            }
        }
        return opt;
    },[token,debugToken])

    const catchError = React.useCallback((url: string,e: any,options:ApiOptions)=>{
        const err = e as AxiosError;
        if(axios.isCancel(err)) {
            throw new Error("Canceled")
        } else if(err?.code === 'ECONNABORTED' && options?.error_notif) setNotif("Connection timeout",true);
        else {
            if((err?.response?.status && ![500,503].includes(err?.response?.status)) && err?.response?.data?.error === 0 && options?.error_notif) setNotif(err?.response?.data?.msg||"Something went wrong",true);
            else if((err?.response?.status && ![500,503].includes(err?.response?.status)) && err?.response?.status==440 && options?.error_notif) setNotif("Token expired. Please refresh browser",true)
            else {
                if(typeof e?.message === 'string') {
                    if(options?.error_notif) setNotif(e?.message,true);
                } else {
                    console.error(err);
                    if(options?.feedback) dispatch({type:'REPORT',payload:{type:'url',url:window?.location?.href,endpoint:url}})
                    if(options?.error_notif) setNotif("Something went wrong",true);
                }
                
            }
        }
    },[dispatch,setNotif])

    const post = React.useCallback(async(url: string,data: Record<string,any>|null|FormData,formdata?: AxiosRequestConfig,option?:ApiOptions): Promise<ContentResponseData>=>{
        const options: ApiOptions = {
            ...defaultOptions,
            ...(option ? option : {})
        }
        const dt = data === null ? "" : typeof formdata === 'undefined' ? QueryString.stringify(data) : data;
        const opt = getHeaders(formdata);
        try {
            const res = await APIContent.post<ContentResponseData>(url,dt,opt);

            if(res?.data?.error) {
                throw new Error(res?.data?.msg)
            }
            if(options?.success_notif) {
                setNotif(res.data.msg,false)
            }
            return res.data;
        } catch(e: any) {
            catchError(url,e,options);
            throw new ApiError(e?.message);
        }
    },[getData,getHeaders,catchError,setNotif]);

    return post;
}

export async function getAxiosCache() {
    const localforage = (await import('localforage')).default
    const memoryDriver = (await import('localforage-driver-memory')).default;

    await localforage.defineDriver(memoryDriver);

    const forageStore = localforage.createInstance({
        driver:[
            localforage.INDEXEDDB,
            localforage.LOCALSTORAGE,
            memoryDriver._driver
        ],
        name:'http-cache'
    })

    const cache = setupCache({
        maxAge:5*60*1000,
        store:forageStore
    })

    return cache;
}

export default useAPI;