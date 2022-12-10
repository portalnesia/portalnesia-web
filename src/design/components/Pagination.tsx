import {useCallback,useState,useMemo, useEffect} from 'react'
import type {PaginationProps} from '@mui/material'
import Paging from '@mui/material/Pagination';
import Box,{BoxProps} from '@mui/material/Box';
import Router,{useRouter} from 'next/router';
import { Circular } from './Loading';

export function usePagination(initialPage: number|true=true): [number,(e: any,page: number)=>void] {
  const router = useRouter();
  const rPage = router.query?.page;
  const [sPage,setPage] = useState(typeof initialPage === 'number' ? initialPage : Number(rPage||1));

  const page = useMemo(()=>{
    if(typeof initialPage === 'number') return sPage;
    if(typeof rPage === 'string') {
      const page = Number(rPage);
      if(Number.isNaN(page)) return 1;
      return page;
    }
    return sPage;
  },[sPage,rPage,initialPage])

  const handlePage=useCallback((e: any,next_page: number)=>{
    if(typeof initialPage === 'number') {
      setPage(next_page);
    } else {
      const {pathname,query,asPath}=Router;
      const q = {...query,page:next_page};
      const url = new URL(`${process.env.NEXT_PUBLIC_URL}${asPath}`);
      const quer = url.searchParams;
      quer.set('page',`${next_page}`)
      const path = `${url.pathname}?${quer.toString()}`
      Router.push({pathname,query:q},path,{shallow:true})
      window.scrollTo({left:0,top:0,behavior:'smooth'})
    }
  },[initialPage])

  return [page,handlePage]
}

export default function Pagination({page,count,...other}: PaginationProps) {
    return <Paging color='primary' count={Number(count)} page={Number(page)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton {...other} />
}

export interface BoxPaginationProps extends BoxProps {
  loading?: boolean
}

export function BoxPagination({loading,children,...props}: BoxPaginationProps) {
  return (
    <Box width="100%" minHeight={200} display='flex' flexDirection="column" justifyContent="center" alignItems='center' textAlign='center' {...props}>
      {loading ? (
        <Circular />
      ) : children}
    </Box>
  )
}