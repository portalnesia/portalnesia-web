import Container from "@comp/Container";
import Pages from "@comp/Pages";
import { Parser } from "@comp/Parser";
import SWRPages from "@comp/SWRPages";
import View from "@comp/View";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { PagesDetail } from "@model/pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";

export const getServerSideProps = wrapper<PagesDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug === 'undefined') return redirect();

    try {
        const url = `/v2/pages/${slug}`;
        const data = await fetchAPI<PagesDetail>(url);
        
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

export default function BlogPages({data:blog,meta}: IPages<PagesDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<PagesDetail>(`/v2/pages/${slug}`,{fallbackData:blog});

    return (
        <Pages title={meta?.title} desc={meta?.desc}>
            <DefaultLayout>
                <View>
                    <SWRPages loading={!data&&!error} error={error}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} lg={8}>
                                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                    <Typography variant='h3' component='h1'>{data?.title||blog.title}</Typography>
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