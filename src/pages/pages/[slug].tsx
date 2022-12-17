import Container from "@comp/Container";
import Pages from "@comp/Pages";
import { Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import View from "@comp/View";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { PagesDetail } from "@model/pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import useTableContent, { HtmlMdUp } from "@design/components/TableContent";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import Hidden from "@mui/material/Hidden";
import { ArticleJsonLd } from "next-seo";
import { portalUrl, staticUrl } from "@utils/main";
import { CombineAction } from "@comp/Action";
import useAPI from "@design/hooks/api";
import { getAnalytics, logEvent } from "@utils/firebase";

export const getServerSideProps = wrapper<PagesDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const url = `/v2/pages/${slug}`;
        const data: PagesDetail = await fetchAPI<PagesDetail>(url);
        
        const desc = truncate(clean(data?.text||""),200);
        return {
            props:{
                data:data,
                meta:{
                    title: data?.title,
                    desc,
                    image:staticUrl(`ogimage/pages/${data.slug}`)
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

export default function BlogPages({data:pages,meta}: IPages<PagesDetail>) {
    usePageContent(pages);
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<PagesDetail>(`/v2/pages/${slug}`,{fallbackData:pages});
    const {content} = useTableContent({data});
    const {get} = useAPI();

    React.useEffect(()=>{
        let timeout = setTimeout(()=>{
            get(`/v2/blog/${pages.slug}/update`).catch(()=>{})
            const analytics = getAnalytics();
            logEvent(analytics,"select_content",{
                content_type:"pages",
                item_id:`${pages.id}`
            })
        },5000)

        return ()=>{
            clearTimeout(timeout);
        }
    },[pages])
    
    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/pages/${data?.slug}`} image={meta?.image}>
            <ArticleJsonLd
                url={portalUrl(`pages/${data?.slug}`)}
                title={meta?.title || ""}
                datePublished={data?.created || ""}
                dateModified={data?.last_modified || data?.created || ""}
                authorName={[{
                    name:"Portalnesia",
                    url: portalUrl(`/user/portalnesia`)
                }]}
                description={adddesc(meta?.desc || "")}
                images={meta?.image ? [meta?.image] : [""]}
            />
            <DefaultLayout navbar={{tableContent:data}}>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>{data?.title||pages.title}</Typography>
                        {data && (
                            <Box mt={1}>
                                <CombineAction list={{
                                    share:{
                                        campaign:"pages",
                                        posId:data.id
                                    },
                                    donation:true,
                                    report:{
                                        report:{
                                            type:"konten",
                                            information:{
                                                konten:{
                                                    id:data.id,
                                                    type:"blog"
                                                }
                                            }
                                        }
                                    }
                                }} />
                            </Box>
                        )}
                    </Box>
                    <Grid container spacing={2} justifyContent='center'>
                        <Grid item xs={12} md={content.length > 0 ? 8 : 10}>
                            <Box key='page-content' id='page-content'>
                                {data && <Parser html={data?.text} />}
                            </Box>
                        </Grid>
                        {content.length > 0 && (
                            <Hidden mdDown>
                                <Grid item xs={12} md={4}>
                                    <Sidebar id='page-content' disabled={!error && !data}>
                                        <PaperBlock title="Table of Content">
                                            <HtmlMdUp data={data} />
                                        </PaperBlock>
                                    </Sidebar>
                                </Grid>
                            </Hidden>
                        )}
                    </Grid>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}