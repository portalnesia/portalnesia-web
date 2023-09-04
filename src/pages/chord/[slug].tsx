import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError, useSelector } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import { ChordDetail, ChordPagination } from "@model/chord";
import Fab from "@mui/material/Fab";
import Iconify from "@design/components/Iconify";
import Portal from "@mui/material/Portal";
import Tooltip from "@mui/material/Tooltip";
import MenuPopover from "@design/components/MenuPopover";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@comp/Button";
import { Span } from "@design/components/Dom";
import { getDayJs, href, portalUrl, staticUrl } from "@utils/main";
import { ArticleJsonLd } from "next-seo";
import Chord from '@comp/Chord'
import { CombineAction } from "@comp/Action";
import Comment from "@comp/Comment";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import Stack from "@mui/material/Stack";
import CustomCard from "@design/components/Card";
import { BoxPagination } from "@design/components/Pagination";
import Link from "@design/components/Link";
import Divider from "@mui/material/Divider";
import Breadcrumbs from "@comp/Breadcrumbs";
import useAPI from "@design/hooks/api";
import { getAnalytics, logEvent } from "@utils/firebase";
import Ads300 from "@comp/ads/Ads300";
import AdsNative from "@comp/ads/AdsNative";

export const getServerSideProps = wrapper<ChordDetail>(async ({ params, redirect, fetchAPI }) => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return redirect();

    try {
        const url: string = `/v2/chord/${slug}?with_original=true`;
        const data: ChordDetail = await fetchAPI<ChordDetail>(url);

        const desc = truncate(data?.original || "", 800);

        return {
            props: {
                data: data,
                meta: {
                    title: `Chord ${data?.artist} ${data?.title}`,
                    desc: `${data?.title} by ${data?.artist}.\n${desc}`,
                    image: staticUrl(`/ogimage/chord/${data.slug}`)
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

type IRecommendation = {
    relateds: ChordPagination[];
    recents: ChordPagination[];
    populars: ChordPagination[];
}

const sidebarArr: { key: keyof IRecommendation, title: string }[] = [{
    key: 'relateds',
    title: "Recommendation"
}, {
    key: "populars",
    title: "Popular Chords"
}, {
    key: 'recents',
    title: "Recent Chords"
}]

export default function ChordPage({ data: chord, meta }: IPages<ChordDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const { data, error } = useSWR<ChordDetail>(`/v2/chord/${slug}`, { fallbackData: chord });
    const appToken = useSelector(s => s.appToken);
    const { data: recommendation, error: errRecommendation } = useSWR<IRecommendation>(data ? `/v2/chord/recommendation/${data.id}` : null);
    const [transpose, setTranspose] = React.useState(0);
    const [fontsize, setFontsize] = React.useState(5);
    const [scrollSpeed, setScrollSpeed] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const anchorEl = React.useRef(null)
    const scrollInterval = React.useRef<NodeJS.Timer>()
    const iframeRef = React.useRef<HTMLIFrameElement>();
    const [liked, setLiked] = React.useState(!!chord.liked);
    const [disable, setDisable] = React.useState({ t: { u: false, d: false }, a: { u: false, d: true }, f: { u: false, d: false } });
    const { get } = useAPI();

    const handleTranspose = React.useCallback((type: 'up' | 'down' | 'reset') => () => {
        let res: number;
        if (type === 'reset') {
            res = 0;
            setDisable({
                ...disable,
                t: {
                    u: false,
                    d: false
                }
            })
        } else if (type === 'up') {
            res = transpose + 1;
            const dis = res >= 12 ? true : false;
            setDisable({
                ...disable,
                t: {
                    u: dis,
                    d: false
                }
            })
        } else {
            res = transpose - 1;
            const dis = res <= -12 ? true : false;
            setDisable({
                ...disable,
                t: {
                    u: false,
                    d: dis
                }
            })
        }
        setTranspose(res);
    }, [disable, transpose])

    const handleAutoScroll = React.useCallback((type: 'up' | 'down' | 'reset') => () => {
        let res: number;
        if (type === 'reset') {
            res = 0;
            setDisable({
                ...disable,
                a: {
                    u: false,
                    d: true
                }
            })
        } else if (type === 'up') {
            res = scrollSpeed >= 5 ? 5 : scrollSpeed + 1;
            const dis = res >= 5 ? true : false;
            setDisable({
                ...disable,
                a: {
                    u: dis,
                    d: false
                }
            })
        } else {
            res = scrollSpeed <= 0 ? 0 : scrollSpeed - 1;
            const dis = res <= 0 ? true : false;
            setDisable({
                ...disable,
                a: {
                    u: false,
                    d: dis
                }
            })
        }
        setScrollSpeed(res);
    }, [disable, scrollSpeed])

    const handleFontSize = React.useCallback((type: 'up' | 'down' | 'reset') => () => {
        let res: number;
        if (type === 'reset') {
            res = 5;
            setDisable({
                ...disable,
                f: {
                    u: false,
                    d: false
                }
            })
        } else if (type === 'up') {
            res = fontsize + 1;
            const dis = res >= 10 ? true : false;
            setDisable({
                ...disable,
                f: {
                    u: dis,
                    d: false
                }
            })
        } else {
            res = fontsize - 1;
            const dis = res <= 1 ? true : false;
            setDisable({
                ...disable,
                f: {
                    u: false,
                    d: dis
                }
            })
        }
        setFontsize(res);
    }, [disable, fontsize])

    React.useEffect(() => {
        if (scrollInterval.current) clearInterval(scrollInterval.current)
        if (scrollSpeed > 0) {
            const skala = [0, 150, 110, 70, 45, 20];
            scrollInterval.current = setInterval(() => {
                window.scrollBy(0, 1);
            }, skala[scrollSpeed]);
        } else {
            scrollInterval.current = undefined;
        }
    }, [scrollSpeed]);

    React.useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            const con = document.getElementById('chord-content-container');
            if (con) {
                const conHeight = con?.clientHeight || con?.offsetHeight;
                const conTop = con?.offsetTop;
                //console.log((scrollTop + docHeight),(conHeight + conTop));
                if ((scrollTop + docHeight) > (conHeight + conTop + 200)) {
                    handleAutoScroll('reset')();
                }
            }
        }
        const onMessage = (e: MessageEvent<any>) => {
            if (e.origin !== process.env.URL) return;
            //if(e.origin!=='https://debug.portalnesia.com') return;
            if (typeof e.data.print === 'undefined') return;
            //console.log(iframe)
            if (iframeRef.current) {
                document.body.removeChild(iframeRef.current);
                iframeRef.current = undefined;
            }
        }

        window.addEventListener('message', onMessage)
        window.addEventListener('scroll', onScroll)

        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('message', onMessage)
            if (iframeRef.current) {
                document.body.removeChild(iframeRef.current);
                iframeRef.current = undefined;
            }
            if (scrollInterval.current) clearInterval(scrollInterval.current)
        }
    }, [slug, handleAutoScroll]);

    React.useEffect(() => {
        let timeout: NodeJS.Timer | undefined;
        if (appToken) {
            timeout = setTimeout(() => {
                get(`/v2/chord/${chord.slug}/update`).catch(() => { })
                const analytics = getAnalytics();
                logEvent(analytics, "select_content", {
                    content_type: "chord",
                    item_id: `${chord.id}`
                })
            }, 10000)
        }

        setLiked(!!chord.liked)

        return () => {
            clearTimeout(timeout);
        }
    }, [chord, appToken, get]);

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/chord/${data?.slug}`} image={meta?.image}>
            <ArticleJsonLd
                url={portalUrl(`chord/${slug}`)}
                title={data?.title || ""}
                images={meta?.image ? [meta?.image] : [""]}
                datePublished={data?.created || ""}
                dateModified={data?.last_modified || data?.created || ""}
                authorName={[{
                    name: data?.user?.name,
                    url: portalUrl(`/user/${data?.user?.username}`)
                }]}
                publisherName="Portalnesia"
                publisherLogo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
                description={adddesc(meta?.desc || "")}
            />
            <DefaultLayout>
                {data && (
                    <Breadcrumbs title={data.title} routes={[{
                        label: "Chord",
                        link: "/chord"
                    }, {
                        label: data.artist,
                        link: `/chord/artist/${data.slug_artist}`
                    }]} />
                )}
                <SWRPages loading={!data && !error} error={error}>
                    <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={0.5}>
                        <Typography variant='h3' component='h1'>{`Chord ${data?.title} - ${data?.artist}`}</Typography>
                        {data && (
                            <Box mt={1}>
                                <CombineAction list={{
                                    like: {
                                        type: 'chord',
                                        posId: data.id,
                                        liked: liked,
                                        onChange: setLiked
                                    },
                                    share: {
                                        campaign: "chord",
                                        posId: data.id
                                    },
                                    donation: true,
                                    report: {
                                        report: {
                                            type: "konten",
                                            information: {
                                                konten: {
                                                    id: data.id,
                                                    type: "chord"
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
                            <Box id='chord-content'>
                                {data && (
                                    <>
                                        <Box id='chord-content-container'>
                                            <Stack mb={5}><AdsNative deps={[slug]} /></Stack>

                                            <Chord template={data?.text} transpose={transpose} sx={{ fontSize: fontsize + 9 }} />

                                            <Stack mt={5}><Ads300 /></Stack>
                                            <Divider sx={{ my: 5 }} />

                                            <Box>
                                                <Typography>Your chords aren&apos;t here? <Link href={`/contact?subject=Request%20Chord`}><Span sx={{ color: 'customColor.link' }}>request your chord</Span></Link> or <Link href={`/dashboard/chord/new`}><Span sx={{ color: 'customColor.link' }}>create a new one</Span></Link>.</Typography>
                                            </Box>
                                        </Box>
                                        <Box mt={10}>
                                            <Comment posId={data.id} type='chord' collapse={false} />
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Sidebar id='chord-content'>
                                <Stack alignItems='flex-start' spacing={5} width='100%'>
                                    {sidebarArr.map(arr => (
                                        <PaperBlock key={arr.key} title={arr.title} sx={{ width: '100%' }} content={{ sx: { px: 2 } }}>
                                            <SWRPages loading={!recommendation && !errRecommendation} error={errRecommendation}>
                                                <Stack alignItems='flex-start' spacing={1}>
                                                    {(recommendation && recommendation?.[arr.key]?.length) ? recommendation?.[arr.key]?.map(d => (
                                                        <CustomCard key={d.slug} link={href(d.link)} title={`${d.artist} - ${d.title}`} variant='outlined' />
                                                    )) : (
                                                        <BoxPagination>
                                                            <Typography>No data</Typography>
                                                        </BoxPagination>
                                                    )}
                                                </Stack>
                                            </SWRPages>
                                        </PaperBlock>
                                    ))}
                                </Stack>
                            </Sidebar>
                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
            <Portal>
                <Tooltip title="Tools">
                    <Fab ref={anchorEl} size='medium' aria-label="Chord Tools" sx={{ position: 'fixed', right: 16, bottom: 16 + 48 + 8 }} onClick={() => setOpen(true)}>
                        <Iconify icon='arcticons:chordanalyser' width={40} height={40} />
                    </Fab>
                </Tooltip>
                <MenuPopover anchorOrigin={undefined} transformOrigin={undefined} arrow={false} open={open} anchorEl={anchorEl.current} onClose={() => setOpen(false)} paperSx={{ width: 320 }}>
                    <Box width="100%" py={1} px={2} display="flex" flexDirection={"column"} justifyContent="center" alignItems="center">
                        <Typography variant='h5'>Chord Tools</Typography>
                        <ButtonGroup key="auto-scroll" sx={{ mt: 2, width: '100%', justifyContent: 'center', border: t => `1px solid ${t.palette.divider}`, borderRadius: '8px' }}>
                            <Button color="error" onClick={handleAutoScroll('reset')}>X</Button>
                            <Button disabled={disable.a.d} onClick={handleAutoScroll('down')}>-</Button>
                            <Span sx={{ p: 1, px: 2, minWidth: 120, flexGrow: 1, textAlign: 'center' }}>{`Auto Scroll: ${scrollSpeed}`}</Span>
                            <Button disabled={disable.a.u} onClick={handleAutoScroll('up')}>+</Button>
                        </ButtonGroup>

                        <ButtonGroup key="transpose" sx={{ my: 2, width: '100%', justifyContent: 'center', border: t => `1px solid ${t.palette.divider}`, borderRadius: '8px' }}>
                            <Button color="error" onClick={handleTranspose('reset')}>X</Button>
                            <Button disabled={disable.t.d} onClick={handleTranspose('down')}>-</Button>
                            <Span sx={{ p: 1, px: 2, minWidth: 120, flexGrow: 1, textAlign: 'center' }}>{`Transpose: ${transpose}`}</Span>
                            <Button disabled={disable.t.u} onClick={handleTranspose('up')}>+</Button>
                        </ButtonGroup>

                        <ButtonGroup key="font-size" sx={{ width: '100%', justifyContent: 'center', border: t => `1px solid ${t.palette.divider}`, borderRadius: '8px' }}>
                            <Button color="error" onClick={handleFontSize('reset')}>X</Button>
                            <Button disabled={disable.f.d} onClick={handleFontSize('down')}>-</Button>
                            <Span sx={{ p: 1, px: 2, minWidth: 120, flexGrow: 1, textAlign: 'center' }}>{`Font Size: ${fontsize}`}</Span>
                            <Button disabled={disable.f.u} onClick={handleFontSize('up')}>+</Button>
                        </ButtonGroup>
                    </Box>
                </MenuPopover>
            </Portal>
        </Pages>
    )
}