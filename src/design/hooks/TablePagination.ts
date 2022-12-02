import {useState,useCallback,useMemo, ElementType} from 'react'
import Router,{useRouter} from 'next/router';

export default function useTablePagination(initialPage: number|true=1,initialPerPage=25) {
  const router = useRouter();
  const rPage = router.query?.page;
  const [sPage,setPage] = useState(typeof initialPage === 'number' ? initialPage : Number(rPage||1));
  const [rowsPerPage,setRowsPerPage] = useState(initialPerPage);

  const page = useMemo(()=>{
    if(typeof initialPage === 'number') return sPage;
    if(typeof rPage === 'string') {
      const page = Number(rPage);
      if(Number.isNaN(page)) return 1;
      return page;
    }
    return sPage;
  },[sPage,rPage,initialPage])

  const onPageChange = useCallback((_e: any, newPage: number) => {
    if(typeof initialPage === 'number') {
      setPage(newPage+1);
    } else {
      const {pathname,query,asPath}=Router;
      const q = {...query,page:newPage+1};
      const url = new URL(`${process.env.NEXT_PUBLIC_URL}/${asPath}`);
      const quer = url.searchParams;
      quer.set('page',`${newPage+1}`)
      const path = `${url.pathname}?${quer.toString()}`
      Router.push({pathname,query:q},path,{shallow:true,scroll:true})
    }
  },[initialPage]);

  const onRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    if(page !== 1) onPageChange({},0);
  },[onPageChange,page]);

  return {page,rowsPerPage,onPageChange,onRowsPerPageChange,component:'div' as ElementType<any>,rowsPerPageOptions:[10,25,50]}
}