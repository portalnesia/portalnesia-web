import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import { apiUrl, portalUrl } from "@utils/main";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Link from "@design/components/Link";
import wrapper, { BackendError } from "@redux/store";
import { UrlPagination } from "@model/url";
import urlMetadata from 'url-metadata'
import { IPages } from "@type/general";
import PaperBlock from "@design/components/PaperBlock";
import Image from "@comp/Image";
import useAPI from "@design/hooks/api";
import { Span } from "@design/components/Dom";
import Ads300 from "@comp/ads/Ads300";
import AdsNative from "@comp/ads/AdsNative";

type UrlCustom = UrlPagination & ({
    meta: {
        title?: string
        description?: string
    }
})
export const getServerSideProps = wrapper<UrlCustom | ({ url: string })>(async ({ params, query, redirect, fetchAPI }) => {
    const slug = params?.slug;
    const u = query?.u
    const s = query?.s
    const m = query?.m
    const c = query?.c
    const q = query?.q;

    try {
        const url = new URL(process.env.NEXT_PUBLIC_URL as string);
        if (typeof slug?.[0] === 'string') {
            // Twitter Chord News 
            if (['t', 'c', 'n', 'g'].includes(slug[0])) {
                if (typeof s === 'string') url.searchParams.set("utm_source", s);
                if (typeof m === 'string') url.searchParams.set("utm_medium", m);
                if (typeof c === 'string') url.searchParams.set("utm_campaign", c);

                if (slug[0] === 'g') {
                    url.pathname = `/native${typeof slug?.[1] !== 'string' ? '' : `/${slug?.[1]}`}`
                    return redirect(url.toString())
                }
                // Index page
                if (typeof slug?.[1] !== 'string') {
                    const tmp = slug?.[0] === 't' ? '/twitter/thread' : (slug?.[0] === 'c' ? '/chord' : (slug?.[0] === 'n' ? '/news' : '/url'));
                    url.pathname = tmp;
                    return redirect(url.toString())
                }
                // Detail page
                else {
                    const link: string = await fetchAPI<string>(`/v2/url-shortener/check/${slug[0]}/${slug[1]}`);
                    return redirect(link);
                }
            }
            // URL Shortener
            else {
                const data: UrlCustom = await fetchAPI<UrlCustom>(`/v2/url-shortener/${slug[0]}`);
                return {
                    props: {
                        data: data,
                        meta: {
                            title: data?.meta?.title || "",
                            desc: data?.meta?.description
                        }
                    }
                }
            }
        }
        // External Link
        else if (typeof u === 'string') {
            if (typeof slug !== 'undefined') {
                return redirect()
            }
            let link: string;
            let meta: { title: string, desc: string }
            try {
                link = decodeURIComponent(Buffer.from(u, 'base64').toString('ascii').replace(/\+/g, " "));
                const metaData = await urlMetadata(link);
                meta = {
                    title: metaData?.title || "Redirect...",
                    desc: metaData?.description || "",
                }
                return {
                    props: {
                        data: { url: link },
                        meta
                    }
                }
            } catch (er) {
                link = decodeURIComponent(Buffer.from(u, 'base64').toString('ascii').replace(/\+/g, " "));
                meta = {
                    title: "Redirect...",
                    desc: ""
                }
                return {
                    props: {
                        data: { url: link },
                        meta
                    }
                }
            }
        }
        // Quiz
        else if (typeof q === "string") {
            const link: string = await fetchAPI<string>(`/v2/quiz/${q}/check`);
            return redirect(link);
        }
        // To Url Shortener Index
        else {
            return redirect(portalUrl('/url'))
        }
    } catch (e) {
        console.log(e)
        if (e instanceof BackendError) {
            if (e?.status === 404) return redirect();
        }
        throw e;
    }
})

export default function LinkPages({ data, meta }: IPages<UrlCustom | ({ url: string })>) {
    const [second, setSecond] = React.useState(5);
    const { get } = useAPI();
    const handleRedirect = React.useCallback(async () => {
        if ('url' in data) {
            const base_url = "https://link-to.net/926051/" + Math.random() * 1000 + "/dynamic/";
            const href = base_url + "?r=" + Buffer.from(encodeURI(data.url)).toString("base64");
            window.open(href, '_blank', 'noopener,noreferrer,popup=0');
            window.location.href = 'https://turnstileunavailablesite.com/xmnx0vva0?key=2755538a6a40f5d84b50de5828fae4a5'
        } else {
            window.open(data.long_url, '_blank', 'noopener,noreferrer,popup=0');
            await get(`/v2/url-shortener/${data.id}/update`, { success_notif: false });
        }
    }, [data, get]);

    React.useEffect(() => {
        let interval: NodeJS.Timer | undefined;
        if ('url' in data) {
            let local = 5;
            interval = setInterval(() => {
                if (local === 0) {
                    clearInterval(interval);
                    setSecond(0);
                } else {
                    setSecond(local--);
                }
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        }
    }, [data]);

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/link${'custom' in data ? `/${data.custom}` : ''}`}>
            <DefaultLayout>
                <Grid container spacing={4} justifyContent='center'>
                    {'url' in data ? (
                        <Grid item md={10} lg={8}>
                            <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                                <Typography variant='h3' component='h1'>{meta?.title}</Typography>
                            </Box>
                            {meta?.desc && (
                                <Box mb={5}>
                                    <Typography>{meta?.desc}</Typography>
                                </Box>
                            )}
                            <Box mb={5}>
                                <Typography sx={{ fontWeight: 'bold' }} gutterBottom>Notes:</Typography>
                                <Typography><Span sx={{ color: 'error.main' }}>*</Span> You are about to be redirected to another page. We are not responsible for the content of that page or the consequences it may have on you.</Typography>
                            </Box>
                            <Stack direction='row' spacing={4}>
                                <Link href={"/"} passHref legacyBehavior><Button sx={{ width: '100%' }} component='a' outlined color='inherit'>Homepage</Button></Link>
                                <Button sx={{ width: '100%' }} onClick={handleRedirect} disabled={second !== 0}>{second !== 0 ? second : "Redirect"}</Button>
                            </Stack>
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12} md={5}>
                                <PaperBlock title="Thumbnails">
                                    <Box display='flex' justifyContent='center' alignItems='center' textAlign='center'>
                                        <Box maxWidth='80%'>
                                            <Image fancybox dataFancybox="Thumbbnails" alt={meta?.title} src={apiUrl(`/url-shortener/screenshot/${data.custom}`)} />
                                        </Box>
                                    </Box>
                                </PaperBlock>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                                    <Typography variant='h3' component='h1'>{meta?.title}</Typography>
                                </Box>
                                <Stack my={3}>
                                    <Ads300 deps={[data]} />
                                </Stack>
                                {meta?.desc && (
                                    <Box mb={5}>
                                        <Typography>{meta?.desc}</Typography>
                                    </Box>
                                )}
                                <Box mb={5}>
                                    <Typography sx={{ fontWeight: 'bold' }} gutterBottom>Notes:</Typography>
                                    <Typography gutterBottom><Span sx={{ color: 'error.main' }}>*</Span> You are about to be redirected to another page. We are not responsible for the content of that page or the consequences it may have on you.</Typography>
                                    <Typography><Span sx={{ color: 'error.main' }}>*</Span> See website thumbnails to make sure that the website you are going to is right.</Typography>
                                </Box>
                                <Stack my={3}>
                                    <AdsNative deps={[data]} />
                                </Stack>
                                <Stack direction='row' spacing={4}>
                                    <Link href={"/"} passHref legacyBehavior><Button sx={{ width: '100%' }} component='a' outlined color='inherit'>Homepage</Button></Link>
                                    <Button sx={{ width: '100%' }} onClick={handleRedirect}>Redirect</Button>
                                </Stack>
                            </Grid>
                        </>
                    )}

                </Grid>
            </DefaultLayout>
        </Pages>
    )
}