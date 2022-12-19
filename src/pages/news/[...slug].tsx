import Pages from "@comp/Pages";
import { Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { NewsDetail, NewsPagination } from "@model/news";
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
import { getDayJs, href, portalUrl, staticUrl } from "@utils/main";
import { CombineAction } from "@comp/Action";
import Comment from "@comp/Comment";
import Stack from "@mui/material/Stack";
import CustomCard from "@design/components/Card";
import { BoxPagination } from "@design/components/Pagination";
import Breadcrumbs from "@comp/Breadcrumbs";
import useAPI from "@design/hooks/api";
import { getAnalytics, logEvent } from "@utils/firebase";
import Button from "@comp/Button";
import Link from "@design/components/Link";
import Divider from "@mui/material/Divider";

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
    const {data:recommendation,error:errRecommendation} = useSWR<NewsPagination[]>(data ? `/v2/news/recommendation/${data.id}` : null);
    const {get} = useAPI();
    const [liked,setLiked] = React.useState(!!news.liked);

    React.useEffect(()=>{
        let timeout = setTimeout(()=>{
            get(`/v2/news/${slug?.[0]}/${slug?.[1]}/update`).catch(()=>{})
            const analytics = getAnalytics();
            logEvent(analytics,"select_content",{
                content_type:"news",
                item_id:`${news.id}`
            })
        },10000)

        return ()=>{
            clearTimeout(timeout);
        }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[news,slug])

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
                {data && <Breadcrumbs title={data.title} routes={[{
                    label:"News",
                    link:"/news"
                }]} />}
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={0.5}>
                    <Typography variant='h3' component='h1'>{data?.title||news.title}</Typography>
                    {data && (
                        <Box mt={1}>
                            <CombineAction list={{
                                like:{
                                    type:'news',
                                    posId:data.id,
                                    liked:liked,
                                    onChange:setLiked
                                },
                                share:{
                                    campaign:"news",
                                    posId:data.id
                                },
                                donation:true,
                                report:{
                                    report:{
                                        type:"konten",
                                        information:{
                                            konten:{
                                                id:data.id,
                                                type:"news"
                                            }
                                        }
                                    }
                                }
                            }} />
                        </Box>
                    )}
                </Box>
                <Box mb={5}>
                    <Typography>{`${getDayJs(data?.created).time_ago().format}`}</Typography>
                </Box>

                <SWRPages loading={!data&&!error} error={error}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Box id='blog-content'>
                                {data && (
                                    <>
                                        <Parser html={data?.text} />

                                        <Divider sx={{mt:5,mb:3}} />

                                        <Box textAlign='right'>
                                            <Link href={data?.source_link} passHref legacyBehavior><Button component='a' className="no-blank" target='_blank' rel="nofollow noopener noreferrer" outlined color='inherit'>Artikel Asli</Button></Link>
                                        </Box>

                                        <Box mt={10}>
                                            <Comment posId={data.id} type='news' collapse={false} />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Sidebar id='blog-content'>
                                <PaperBlock title="Recommendation" content={{sx:{px:2}}}>
                                    <SWRPages loading={!recommendation&&!errRecommendation} error={errRecommendation}>
                                        <Stack alignItems='flex-start' spacing={1}>
                                            {(recommendation && recommendation.length) ? recommendation.map(d=>(
                                                <CustomCard key={d.title} link={href(d.link)} title={d.title} variant='outlined' />
                                            )) : (
                                                <BoxPagination>
                                                    <Typography>No data</Typography>
                                                </BoxPagination>
                                            )}
                                        </Stack>
                                    </SWRPages>
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}