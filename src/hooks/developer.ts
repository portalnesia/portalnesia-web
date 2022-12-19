import useSWR from 'swr';
import {useEffect, useMemo} from 'react'
import { INavbar } from '@layout/navbar.config';
import config from '@src/config';

const fetcher = (url: string)=>fetch(url).then(res=>res.json())

type IBaseDeveloperMenu = {
    key: string
    name: string
    as: string
}

type IDeveloperMenu = IBaseDeveloperMenu & {
    child?: IBaseDeveloperMenu[]
}

type CustomNavbar = {
    name: string,
    link: string,
    tooltip?: string
    icon?: string
    iconActive?: string
    desc?: string
    key: string
    child?: (INavbar & {key: string})[]
}

export function useDeveloperMenu() {
    const {data}=useSWR<IDeveloperMenu[]>(`${config.url.datas}/developers.json`,{
        fetcher
    })

    const menu: CustomNavbar[] = useMemo(()=>{
        if(!data) return []
        return data.filter(d=>d.key !== 'api-reference').map(d=>({
            name:d.name,
            link: `${d.as}`,
            child: d.child?.map(c=>({
                name:c.name,
                link:`${c.as}`,
                key: c.key
            })),
            key: d.key
        }))
    },[data])

    return menu;
}