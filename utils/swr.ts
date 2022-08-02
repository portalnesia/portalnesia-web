import React from 'react'
import useSWRR,{SWRConfiguration,Fetcher} from "swr"
import useAPI,{ResponseData} from './api'

export default function useSWR<D=any,F=string>(path: string|null,config:SWRConfiguration={}){
    const {fetcher}=useAPI();
    const swr = useSWRR<D,F>(path,{
        fetcher:fetcher,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...config
    });
    return swr;
}