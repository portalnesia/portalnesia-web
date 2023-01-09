import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import SWRPages from "@comp/SWRPages";
import { TwibbonPagination } from "@model/twibbon";
import CustomCard from "@design/components/Card";
import { href, portalUrl, staticUrl } from "@utils/main";
import Router, { useRouter } from "next/router";
import { NewsPagination } from "@model/news";
import { UserPagination } from "@model/user";
import { ChordPagination } from "@model/chord";
import { BlogPagination } from "@model/pages";
import { ucwords } from "@portalnesia/utils";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Link from "@design/components/Link";

type ResultData = {
    type:'twibbon',
    data: TwibbonPagination[]
} | {
    type:'news',
    data: NewsPagination[]
} | {
    type:"user",
    data: UserPagination[]
} | {
    type:"chord",
    data: ChordPagination[]
} | {
    type:"blog",
    data:BlogPagination[]
}

type IResponse = {
    page: number|null
    total: number|null,
    total_page: number|null
    can_load: boolean|null
    data: ResultData[]
}

export default function SearchPages() {
    const router=useRouter();
    const [page,setPage] = usePagination(true);
    const q = router.query?.q;
    const filter = router.query?.filter
    const title = React.useMemo(()=>typeof q === 'string' ? `Search result for ${decodeURIComponent(q)}` : "Search",[q]);
    const {data,error} = useSWR<IResponse>(typeof q === 'string' ? `/v2/search${typeof filter === 'string' ? `/${filter}` : ''}?q=${q}&page=${page}&per_page=${24}` : null)

    const canonical = React.useMemo(()=>{
        const url = new URL("/search",portalUrl());
        if(typeof q === "string") url.searchParams.set("q",q);
        if(typeof filter === "string") url.searchParams.set('filter',filter);
        const search = url.searchParams.toString();
        return `${url.pathname}${search.length > 0 ? `?${search}` : ''}`
    },[filter,q])

    return (
        <Pages title="Search" canonical={canonical}>
            <DefaultLayout>
                <Box pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>{title}</Typography>
                </Box>

                {typeof q === 'string' ? (
                    <SWRPages loading={!data&&!error} error={error}>
                        {!data ? null : data.data.filter(t=>!['thread','quiz'].includes(t.type)).map((type)=>(
                            <Box key={type.type} mb={5}>
                                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                    <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                                        <Typography variant='h4' component='h2'>{ucwords(type.type)}</Typography>
                                        {type.data.length === 6 && (
                                            <Link href={`/search?q=${q}&filter=${type.type}`} legacyBehavior passHref shallow scroll><Button component='a' outlined color='inherit'>View More</Button></Link>
                                        )}
                                    </Stack>
                                </Box>
                                <Grid container spacing={4}>
                                    {type.data.length === 0 ? (
                                        <Grid key={'no-data'} item xs={12}>
                                            <BoxPagination>
                                                <Typography>No data</Typography>
                                            </BoxPagination>
                                        </Grid>
                                    ) : type.data.map(d=>{
                                        const title = 'artist' in d ? `${d.artist} - ${d.title}` : 'title' in d ? d.title : ('name' in d && 'username' in d) ? `${d.name} (@${d.username})` : '';
                                        const link = 'link' in d ? d.link : 'username' in d ? href(`/user/${d.username}`) : ''
                                        const image = 'image' in d ? `${d.image}&export=banner&size=300` : 'picture' in d ? (d.picture ? `${d.picture}&watermark=no` : staticUrl('img/content?image=notfound.png&watermark=no')) : undefined;

                                        return (
                                            <Grid key={`${type}-${d.id}`} item xs={12} sm={6} md={4} lg={3}>
                                                <CustomCard link={href(link)} title={title} {...(image ? {image}:{})} />
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                                {(typeof filter === 'string' && (data?.total||0) > 0) &&  (
                                    <Box mt={5}>
                                        <Pagination page={page} onChange={setPage} count={data?.total_page||0} />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </SWRPages>
                ) : (
                    <BoxPagination>
                        <Typography variant='h5'>Type a query in search box...</Typography>
                    </BoxPagination>
                )}
            </DefaultLayout>
        </Pages>
    )
}