import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import type { PaginationResponse } from "@design/hooks/api";
import CustomCard from "@design/components/Card";
import { href } from "@utils/main";
import Container from "@comp/Container";
import { ChordPagination } from "@model/chord";
import { useRouter } from "next/router";
import { ucwords } from "@portalnesia/utils";
import Button from "@comp/Button";
import MenuPopover from "@design/components/MenuPopover";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Iconify from "@design/components/Iconify";

const selectArr: ('recent'|'popular')[] = ['recent','popular']

export default function News() {
    const router = useRouter();
    const query = router.query
    const [order,setOrder] = React.useState<'recent'|'popular'>('recent');
    const [page,setPage] = usePagination();
    const {data,error} = useSWR<PaginationResponse<ChordPagination>>(`/v2/chord?page=${page}&per_page=24&order=${order}`);
    const [dOrder,setDOrder] = React.useState(false);
    const orderRef = React.useRef(null);

    const handleOrder=React.useCallback((order:'recent'|'popular')=>()=>{
        setDOrder(false);
        router.push({pathname:'/chord',query:{order}},`/chord?order=${order}`,{shallow:true,scroll:true});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[])

    React.useEffect(()=>{
        if(typeof query?.order === 'string') {
            if(['recent','popular'].includes(query.order)) setOrder(query.order as 'recent'|'popular');
        }
    },[query])

    return (
        <Pages title="Chord">
            <DefaultLayout>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                        <Box sx={{display:"flex",flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                            <Typography variant='h4' component='h1'>Recent Chord</Typography>
                            <Button disabled={!data&&!error} ref={orderRef} color='inherit' text onClick={()=>setDOrder(true)} endIcon={<Iconify icon='fe:list-order' />}>{order}</Button>

                            <MenuPopover open={dOrder} onClose={()=>setDOrder(false)} anchorEl={orderRef.current} paperSx={{py:1,width:150}}>
                                {selectArr.map(s=>(
                                    <MenuItem key={s} sx={{ color: 'text.secondary',py:1 }} onClick={handleOrder(s)} selected={order === s}>
                                        <ListItemText primary={ucwords(s)} />
                                    </MenuItem>
                                ))}
                            </MenuPopover>
                        </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                        {data && data?.data?.length > 0 ? ( data.data.map(d=>(
                            <Grid key={d.title} item xs={12} sm={6} md={4} lg={3}>
                                <CustomCard link={href(d.link)} title={`${d.artist} - ${d.title}`} />
                            </Grid>
                        ))) : (
                            <Grid key={'no-data'} item xs={12}>
                                <BoxPagination>
                                    <Typography>No data</Typography>
                                </BoxPagination>
                            </Grid>
                        )}
                        {data && (
                            <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                                <Pagination page={page} onChange={setPage} count={data?.total_page} />
                            </Grid>
                        )}
                    </Grid>
                        
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}