import Pages from "@comp/Pages";
import { Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { NewsDetail } from "@model/news";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, clean, truncate, ucwords } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import Hidden from "@mui/material/Hidden";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import useTableContent, { HtmlMdUp } from "@design/components/TableContent";
import { NewsArticleJsonLd } from "next-seo";
import { portalUrl, staticUrl } from "@utils/main";

export const getServerSideProps = wrapper<NewsDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug?.[1] === 'undefined') return redirect();

    try {
        const url: string = `/v2/news/${slug[0]}/${slug[1]}`;
        const data: NewsDetail = await fetchAPI<NewsDetail>(url);

        const desc = truncate(clean(data?.text||""),800);
        return {
            props:{
                data:data,
                meta:{
                    title: data?.title,
                    desc,
                    image: staticUrl(`ogimage/news/${data.source.toLowerCase()}/${slug?.[1]}`)
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
    usePageContent(news);
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<NewsDetail>(`/v2/news/${slug?.[0]}/${slug?.[1]}`,{fallbackData:news});
    const {content} = useTableContent({data})

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/news/${data?.source}/${encodeURIComponent(data?.title||"")}`} image={meta?.image}>
            <NewsArticleJsonLd
                section={""}
                keywords={""}
                dateCreated={data?.created||""}
                body={typeof meta?.desc === 'string' ? adddesc(meta?.desc) : ""}
                url={portalUrl(`news/${slug?.[0]}/${slug?.[1]}`)}
                title={data?.title || ""}
                images={meta?.image ? [meta?.image] : [""]}
                datePublished={data?.created || ""}
                dateModified={data?.created}
                authorName={adddesc(ucwords(slug?.[0] as string))}
                publisherName="Portalnesia"
                publisherLogo="https://content.portalnesia.com/icon/ms-icon-310x310.png"
                description={typeof meta?.desc === 'string' ? adddesc(meta?.desc) : ""}
            />
            <DefaultLayout navbar={{tableContent:data}}>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>{data?.title||news.title}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Box id='blog-content'>
                                {data && <Parser html={data?.text} />}
                            </Box>
                        </Grid>
                        {/* TODO - Create comments */}
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
                            {/* TODO - Create recommendation */}
                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}