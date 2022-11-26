import useSWRR,{SWRConfiguration} from "swr"
import useAPI, { ResponseData } from './api'
import { useSelector } from "@redux/store";
import {State} from '@type/redux'

export type {SWRConfiguration};


export default function useSWR<D=any>(path: string|null,config:SWRConfiguration<D> = {}){
    const {get} = useAPI();
    const appToken = useSelector<State['appToken']>(s=>s.appToken);
    const {fallback,...rest} = config
    const swr = useSWRR<D>(!appToken ? null : path,{
        fetcher:get,
        revalidateOnReconnect:true,
        revalidateOnFocus:false,
        revalidateIfStale:true,
        ...rest
    });
    return swr;
}