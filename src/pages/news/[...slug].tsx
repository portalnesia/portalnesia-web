import Container from "@comp/Container";
import Pages from "@comp/Pages";
import { Parser } from "@comp/Parser";
import SWRPages from "@comp/SWRPages";
import View from "@comp/View";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { NewsDetail } from "@model/news";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";

export const getServerSideProps = wrapper<NewsDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug?.[1] === 'undefined') return redirect();

    try {
        const url = `/v2/news/${slug[0]}/${slug[1]}`;
        const data = await fetchAPI<NewsDetail>(url);

        const desc = truncate(clean(data?.text||""),200);
        return {
            props:{
                data:data,
                meta:{
                    title: data?.title,
                    desc
                }
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})

export default function NewsPages({data:news,meta}: IPages<NewsDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<NewsDetail>(`/v2/news/${slug?.[0]}/${slug?.[1]}`,{fallbackData:news});

    return (
        <Pages title={meta?.title} desc={meta?.desc}>
            <DefaultLayout>
                <View>
                    <SWRPages loading={!data&&!error} error={error}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={8}>
                                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                    <Typography variant='h3' component='h1'>{data?.title||news.title}</Typography>
                                </Box>
                                {data && <Parser html={data?.text} />}
                            </Grid>
                        </Grid>
                    </SWRPages>
                </View>
            </DefaultLayout>
        </Pages>
    )
}