import Pages from "@comp/Pages";
import { Markdown, Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { BlogDetail, BlogPagination } from "@model/pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, clean, slugFormat, truncate, ucwords } from "@portalnesia/utils";
import wrapper, { BackendError, useSelector } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import Sidebar from "@design/components/Sidebar";
import Hidden from "@mui/material/Hidden";
import useTableContent, { HtmlMdUp } from "@design/components/TableContent";
import PaperBlock from "@design/components/PaperBlock";
import { getDayJs, href, portalUrl, staticUrl } from "@utils/main";
import { ArticleJsonLd } from 'next-seo'
import Comment from "@comp/Comment";
import { CombineAction } from "@comp/Action";
import Stack from "@mui/material/Stack";
import CustomCard from "@design/components/Card";
import { BoxPagination } from "@design/components/Pagination";
import Scrollbar from "@design/components/Scrollbar";
import Carousel, { responsiveContentDefault } from "@comp/Carousel";
import Breadcrumbs from "@comp/Breadcrumbs";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Divider from "@mui/material/Divider";
import Chip from "@comp/Chip";
import useAPI from "@design/hooks/api";
import { getAnalytics } from "@utils/firebase";
import { logEvent } from 'firebase/analytics'
import Ads300 from "@comp/ads/Ads300";

export const getServerSideProps = wrapper<BlogDetail>(async ({ params, redirect, fetchAPI }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return redirect();

    try {
        const url: string = `/v2/blog/${slug}`;
        const data: BlogDetail = await fetchAPI<BlogDetail>(url);

        const desc = truncate(clean(data?.text || ""), 800);
        return {
            props: {
                data: data,
                meta: {
                    title: data?.title,
                    desc,
                    image: staticUrl(`ogimage/blog/${data.slug}`)
                }
            }
        }
    } catch (e) {
        if (e instanceof BackendError) {
            if (e?.status === 404) return redirect();
        }
        throw e;
    }
})

export default function BlogPages({ data: blog, meta }: IPages<BlogDetail>) {
    usePageContent(meta);
    const router = useRouter();
    const slug = router.query?.slug;
    const readyRedux = useSelector(s => s.ready);
    const { data, error, mutate } = useSWR<BlogDetail>(`/v2/blog/${slug}`, { fallbackData: blog });
    const { data: recommendation, error: errRecommendation } = useSWR<BlogPagination[]>(data ? `/v2/blog/recommendation/${data.id}` : null);
    const { content } = useTableContent({ data })
    const [liked, setLiked] = React.useState(!!blog.liked);
    const { get } = useAPI();

    React.useEffect(() => {
        let timeout: NodeJS.Timer | undefined;
        if (readyRedux) {
            timeout = setTimeout(() => {
                get(`/v2/blog/${blog.slug}/update`).catch(() => { })
                const analytics = getAnalytics();
                logEvent(analytics, "select_content", {
                    content_type: "blog",
                    item_id: `${blog.id}`
                })
            }, 10000)
        }

        setLiked(!!blog.liked)

        return () => {
            clearTimeout(timeout);
        }
    }, [blog, readyRedux, get]);

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/blog/${data?.slug}`} image={meta?.image}>
            <ArticleJsonLd
                type="BlogPosting"
                url={portalUrl(`blog/${data?.slug}`)}
                title={meta?.title || ""}
                datePublished={data?.created || ""}
                dateModified={data?.last_modified || data?.created || ""}
                authorName={[{
                    name: data?.user?.name,
                    url: portalUrl(`/user/${data?.user?.username}`)
                }]}
                description={adddesc(meta?.desc || "")}
                images={meta?.image ? [meta?.image] : [""]}
            />
            <DefaultLayout navbar={{ tableContent: data }}>
                {data?.user && (
                    <>
                        <div data-id="author" data-content={data?.user?.name} />
                        <div data-id="author_url" data-content={portalUrl(`/user/${data?.user?.username}`)} />
                    </>
                )}
                {data?.image && <div data-id="cover" data-content={data?.image} />}
                {data && <Breadcrumbs title={data.title} routes={[{
                    label: "Blog",
                    link: "/blog"
                }, {
                    label: ucwords(data.category),
                    link: `/blog/category/${data.category}`
                }]} />}

                <SWRPages loading={!data && !error} error={error}>
                    <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={0.5}>
                        <Typography variant='h3' component='h1'>{data?.title || blog?.title}</Typography>
                        {data && (
                            <Box mt={1}>
                                <CombineAction list={{
                                    like: {
                                        type: 'blog',
                                        posId: data.id,
                                        liked: liked,
                                        onChange: setLiked
                                    },
                                    share: {
                                        campaign: "blog",
                                        posId: data.id
                                    },
                                    donation: true,
                                    report: {
                                        report: {
                                            type: "konten",
                                            information: {
                                                konten: {
                                                    id: data.id,
                                                    type: "blog"
                                                }
                                            }
                                        }
                                    }
                                }} />
                            </Box>
                        )}
                    </Box>
                    <Box mb={5}>
                        <Typography>{`Last modified: ${getDayJs(data?.last_modified || data?.created).time_ago().format}`}</Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Box id='body-content'>
                                {data && (
                                    <>
                                        {data.format === 'html' ? <Parser html={data?.text} /> : data.format === 'markdown' ? <Markdown source={data?.text} /> : null}

                                        <Divider sx={{ my: 1 }} />

                                        <Box mb={3}>
                                            <Typography paragraph>Category: <Link href={`/blog/category/${slugFormat(data?.category)}`}><Span sx={{ color: 'customColor.link' }}>{ucwords(data?.category)}</Span></Link></Typography>
                                            <Grid container spacing={1}>
                                                {data?.tags?.map((t, i) => (
                                                    <Grid key={`chip-${i}`} item xs="auto" zeroMinWidth>
                                                        <Chip label={t} link={`/blog/tags/${slugFormat(t)}`} outlined clickable />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>

                                        <PaperBlock title={"Other Posts"} sx={{ width: '100%', mt: 10 }} content={{ sx: { px: 0 } }}>
                                            <SWRPages loading={!recommendation && !errRecommendation} error={errRecommendation}>
                                                <Scrollbar>
                                                    <Stack direction='row' pb={2} spacing={2} px={2}>
                                                        {(recommendation && recommendation.length) ? recommendation.map(d => (
                                                            <CustomCard ellipsis={2} key={d.title} link={href(d.link)} title={d.title} image={d.image} image_query="&export=banner&size=300" sx={{ minWidth: 250, maxWidth: 250, height: 'auto' }}>
                                                                <Typography variant='caption'>{getDayJs(d.last_modified).time_ago().format}</Typography>
                                                            </CustomCard>
                                                        )) : (
                                                            <BoxPagination>
                                                                <Typography>No data</Typography>
                                                            </BoxPagination>
                                                        )}
                                                        <Box>&nbsp;</Box>
                                                    </Stack>
                                                </Scrollbar>
                                            </SWRPages>
                                        </PaperBlock>

                                        <Box mt={10}>
                                            <Comment posId={data.id} type='blog' collapse={false} />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {content.length > 0 && (
                                <Hidden mdDown>
                                    <Sidebar id='body-content'>
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