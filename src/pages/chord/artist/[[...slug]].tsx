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
import wrapper from "@redux/store";
import { IPages } from "@type/general";
import Breadcrumbs from "@comp/Breadcrumbs";

export const getServerSideProps = wrapper<(PaginationResponse<ChordPagination|({artist:string,slug_artist: string})>)|{}>(async({fetchAPI,query,params})=>{
    const slug = params?.slug;
    try {
        const pageQuery = Number.parseInt(typeof query?.page === 'string' ? query?.page : '1');
        const page = Number.isNaN(pageQuery) ? 1 : pageQuery
        let data: PaginationResponse<ChordPagination|({artist:string,slug_artist: string})>
        let title: string
        if(typeof slug?.[0] === 'string') {
            data = await fetchAPI<PaginationResponse<ChordPagination>>(`/v2/chord/artist/${slug?.[0]}?page=${page}&per_page=24`);
            if(typeof data?.data?.[0]?.artist === "string") title = `Chord by ${data?.data?.[0]?.artist}`;
            else {
                const temp = ucwords(slug[0].replace(/\-/gim," "));
                title = `Chord by ${temp}`;
            }
        } else {
            data = await fetchAPI<PaginationResponse<{artist:string,slug_artist: string}>>(`/v2/chord/artist/list?page=${page}&per_page=24`);
            title = 'Chord by Artist'
        }
        return {
            props:{
                data,
                meta:{
                    title
                }
            }
        }
    } catch {
        let title: string
        if(typeof slug?.[0] === 'string') {
            const temp = ucwords(slug[0].replace(/\-/gim," "));
            title = `Chord by ${temp}`;
        } else {
            title = "Chord by Artist"
        }
        return {
            props:{
                data:{},
                meta:{title}
            }
        }
    }
})

export default function ChordArtistPage({data:server,meta}: IPages<(PaginationResponse<ChordPagination|({artist:string,slug_artist: string})>)|{}>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const [page,setPage] = usePagination(true)
    const {data,error} = useSWR<PaginationResponse<ChordPagination|({artist:string,slug_artist: string})>>(typeof slug?.[0] === 'string' ? `/v2/chord/artist/${slug[0]}?page=${page}&per_page=24` : `/v2/chord/artist/list?page=${page}&per_page=24`,{fallbackData: 'data' in server ? server : undefined})

    return (
        <Pages title={`${meta?.title} - Chord`} canonical={`/chord/artist${typeof slug?.[0] === 'string' ? `/${slug[0]}` : ''}`}>
            <DefaultLayout>
                <Breadcrumbs title={meta?.title||""} routes={[{
                    label:"Chord",
                    link:"/chord"
                },...(typeof slug?.[0] === 'string' ? [{
                    label:"Artist",
                    link:"/chord/artist"
                }] : [])]} />

                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>{meta?.title}</Typography>
                </Box>

                <SWRPages loading={!data&&!error} error={error}>
                    <Grid container spacing={2}>
                        {data && data?.data?.length > 0 ? data.data.map(d=>{
                            if('title' in d) {
                                return (
                                    <Grid key={d.slug} item xs={12} sm={6} md={4} lg={3}>
                                        <CustomCard link={href(d.link)} title={`${d.artist} - ${d.title}`} />
                                    </Grid>
                                )
                            } else {
                                return (
                                    <Grid key={d.slug_artist} item xs={12} sm={6} md={4} lg={3}>
                                        <CustomCard link={href(`/chord/artist/${d.slug_artist}`)} title={`${d.artist}`} />
                                    </Grid>
                                )
                            }
                        }) : (
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