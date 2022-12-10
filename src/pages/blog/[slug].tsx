import Pages from "@comp/Pages";
import { Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { BlogDetail } from "@model/pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import Sidebar from "@design/components/Sidebar";
import Hidden from "@mui/material/Hidden";
import useTableContent, { HtmlMdUp } from "@design/components/TableContent";
import PaperBlock from "@design/components/PaperBlock";
import { portalUrl, staticUrl } from "@utils/main";
import {ArticleJsonLd} from 'next-seo'

export const getServerSideProps = wrapper<BlogDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const url: string = `/v2/blog/${slug}`;
        const data: BlogDetail = await fetchAPI<BlogDetail>(url);
        
        const desc = truncate(clean(data?.text||""),800);
        return {
            props:{
                data:data,
                meta:{
                    title: data?.title,
                    desc,
                    image:staticUrl(`ogimage/blog/${data.slug}`)
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

export default function BlogPages({data:blog,meta}: IPages<BlogDetail>) {
    usePageContent(meta);
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<BlogDetail>(`/v2/blog/${slug}`,{fallbackData:blog});
    const {content} = useTableContent({data})

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/blog/${data?.slug}`} image={meta?.image}>
            <ArticleJsonLd
                type="BlogPosting"
                url={portalUrl(`blog/${data?.slug}`)}
                title={meta?.title || ""}
                datePublished={data?.created || ""}
                dateModified={data?.last_modified || data?.created || ""}
                authorName={[{
                    name:data?.user?.name,
                    url: portalUrl(`/user/${data?.user?.username}`)
                }]}
                description={adddesc(meta?.desc || "")}
                images={meta?.image ? [meta?.image] : [""]}
            />
            <DefaultLayout navbar={{tableContent:data}}>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>{data?.title||blog?.title}</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Box id='blog-content'>
                                {data && <Parser html={data?.text} />}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {content.length > 0 && (
                                <Hidden mdDown>
                                    <Sidebar id='blog-content'>
                                        <PaperBlock title="Table of Content">
                                            <HtmlMdUp data={data} />
                                        </PaperBlock>
                                    </Sidebar>
                                </Hidden>
                            )}
                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}