import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import { staticUrl } from "@utils/main";
import Button from "@comp/Button";
import TextField from "@mui/material/TextField";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import Recaptcha from "@design/components/Recaptcha";
import useSocket from "@comp/Socket";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Ads300 from "@comp/ads/Ads300";

const Backdrop = dynamic(() => import("@design/components/Backdrop"));
const Image = dynamic(() => import('@comp/Image'))

type IYoutubeMedia = {
    id: string;
    itag: number;
    hasAudio: boolean;
    hasVideo: boolean;
    quality: string | null;
    mimeType: string;
    bitrate?: number;
    download_url?: string;
}
type IResult = {
    type: 'soundcloud'
    id: string
    title: string
    description: string
    thumbnail: string
    download_url: string
} | {
    type: 'twitter'
    id: string,
    title?: string,
    data: {
        thumbnail: string
        media: {
            bitrate: number
            download_url: string
        }[]
    }[]
} | {
    type: 'youtube',
    id: string,
    description: string | null,
    thumbnail: string,
    title: string,
    media: IYoutubeMedia[]
}

export default function DownloaderPages() {
    const router = useRouter();
    const socket = useSocket();
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState(typeof router.query?.url === "string" ? decodeURIComponent(router.query?.url || "") : "");
    const [error, setError] = React.useState<string | null>(null)
    const [data, setData] = React.useState<IResult | null>(null)

    const setNotif = useNotification();
    const { post } = useAPI();
    const [backdrop, setBackdrop] = React.useState(false)
    const [bdProgress, setBdProgress] = React.useState(0);
    const [bdMsg, setBdMsg] = React.useState("");
    const [bdLink, setBdLink] = React.useState<string | null>(null);
    const captchaRef = React.useRef<Recaptcha>(null)

    const checkValue = React.useCallback(async (val: string) => {
        if (val.trim().match(/^https?\:\/\//i)) {
            if (val.trim().match(/\byoutube\.com\b|\bsoundcloud\.com\b|\byoutu\.be\b|\binstagram\.com\b|\btwitter\.com\b/)) {
                return;
            }
            throw new Error("Only support Youtube, Soundcloud, Instagram, and Twitter.");

        }
        throw new Error("Please start with http or https");
    }, [])

    const handleDownload = React.useCallback((urls: string) => {
        window?.open(urls);
    }, [])

    const handlePrepareDownloadYoutube = React.useCallback((data: IYoutubeMedia & ({ title: string, url: string })) => () => {
        if (socket) {
            setBdMsg("Preparing...");
            setBackdrop(true);
            socket.emit("youtube downloader", data);
        }
    }, [socket])

    const handleChange = React.useCallback((val: string) => {
        setValue(val.trim());
        checkValue(val).then(() => {
            setError(null);
        }).catch((err) => {
            if (err instanceof Error) setError(err.message);
        })
    }, [checkValue])

    const closeBackdrop = React.useCallback(() => {
        setBackdrop(false)
        setBdMsg("");
        setBdLink(null);
        setBdProgress(0);
    }, [])

    const handleDownloadYoutube = React.useCallback((link: string) => () => {
        window?.open(link);
        closeBackdrop();
    }, [closeBackdrop])

    const submitDownload = React.useCallback(async (input: string) => {
        try {
            setLoading(true);
            await checkValue(input)
            try {
                const recaptcha = input.match(/\binstagram\.com\/p\/\b/) === null ? await captchaRef.current?.execute() : "";
                if (input.match(/\binstagram\.com\/p\/\b/)) {
                    setNotif("Under maintenance", true);
                    setLoading(false);
                } else if (input.match(/\bsoundcloud\.com\b/)) {
                    const res = await post<IResult>('/v2/tools/downloader/soundcloud', { url: input, recaptcha }, {}, { success_notif: false })
                    setData(res);
                } else if (input.match(/\byoutube\.com\b|\byoutu\.be\b/)) {
                    const res = await post<IResult>('/v2/tools/downloader/youtube', { url: input, recaptcha }, {}, { success_notif: false })
                    setData(res);
                } else if (input.match(/\btwitter\.com\b/)) {
                    const res = await post<IResult>('/v2/tools/downloader/twitter', { url: input, recaptcha }, {}, { success_notif: false })
                    setData(res);
                } else {
                    setNotif("Only support Youtube, Soundcloud, and Twitter.", true);
                    setLoading(false);
                }
            } catch (err) {
                if (err instanceof Error) setNotif(err.message, true);
            } finally {
                setLoading(false);
            }
        } catch (err) {
            if (err instanceof Error) setNotif(err.message, true);
            setLoading(false);
        }
    }, [setNotif, post, checkValue])

    React.useEffect(() => {
        function onYoutubeDownloader(dt: { error: boolean, finish: boolean, progress: number, url: string | null }) {
            if (dt?.progress >= 100) {
                setBdProgress(100);
                setBdMsg("Generating download links");
            }
            else if (dt?.error) {
                setBdProgress(0);
                setBdMsg("An error occured");
            } else {
                setBdMsg("Concatenating audio and video files");
                setBdProgress(dt?.progress);
            }
            if (dt?.finish && typeof dt?.url === 'string') {
                setBdProgress(0);
                setBdLink(dt?.url);
            }
        }
        if (socket) {
            socket.on("youtube downloader", onYoutubeDownloader)
        }

        return () => {
            if (socket) {
                socket.off("youtube downloader");
            }
        }
    }, [socket])

    const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setData(null);
        if (error === null) {
            submitDownload(value);
        }
    }, [error, value])

    return (
        <Pages title="Media Downloader" canonical="/downloader">
            <DefaultLayout maxWidth='md'>
                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>Downloader</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            value={value}
                            onChange={e => handleChange(e.target.value)}
                            fullWidth
                            required
                            error={error !== null}
                            helperText={error !== null ? error : ''}
                            label="URL"
                            disabled={loading}
                            placeholder="https://"
                        />
                    </Box>

                    <Stack my={3}>
                        <Ads300 />
                    </Stack>

                    {data !== null && (
                        <Box mb={5}>
                            <Grid container spacing={4} justifyContent='center'>
                                {data.type === 'twitter' ? (
                                    <Grid item xs={12}>
                                        <div style={{ textAlign: 'center', margin: '20px auto' }}>
                                            <Typography variant='body2' gutterBottom>{data?.title}</Typography>
                                        </div>
                                        <Grid container spacing={4} justifyContent='center'>
                                            {data?.data?.map((twitter, i) => (
                                                <Grid key={`twitter-${twitter.thumbnail}`} item xs={12}>
                                                    <Box mb={3} textAlign='center' display='flex' alignItems='center' justifyContent='center'><Image alt={data?.title} webp dataSrc={twitter?.thumbnail} src={staticUrl(`img/url?size=300&image=${encodeURIComponent(twitter?.thumbnail)}`)} fancybox caption={data?.title} style={{ width: '100%', maxWidth: 250 }} /></Box>
                                                    <Grid container spacing={4} justifyContent='center'>
                                                        {twitter?.media?.map((file, i) => (
                                                            <Grid key={`twitter-${i}`} item xs={12} sm={6} md={4}>
                                                                <div style={{ textAlign: 'center' }}><Button color='secondary' onClick={() => handleDownload(file?.download_url)} icon='download'>{`bitrate: ${file?.bitrate}`}</Button></div>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                ) : data?.type === 'youtube' ? (
                                    <React.Fragment key='youtube'>
                                        <Grid key={`youtube-thumb`} item xs={12} md={6} lg={4}>
                                            <Box textAlign='center' display='flex' alignItems='center' justifyContent='center'><Image alt={data?.title} webp dataSrc={data?.thumbnail} src={staticUrl(`img/url?size=300&image=${encodeURIComponent(data?.thumbnail)}`)} fancybox caption={data?.title} style={{ width: '100%', maxWidth: 250 }} /></Box>
                                        </Grid>
                                        <Grid key={`youtube-title`} item xs={12}>
                                            <div style={{ textAlign: 'center' }}><Typography variant='h6' paragraph>{data?.title}</Typography></div>
                                            <Typography variant="body2">{data?.description}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {data?.media?.length ? (
                                                <Grid container spacing={4} justifyContent='center'>
                                                    {data?.media?.map((file, i) => (
                                                        <Grid key={`youtube-${i}`} item xs={6} sm={4} md={3} lg={2}>
                                                            {typeof file?.download_url === 'string' ? (
                                                                <div style={{ textAlign: 'center' }}><Button color='secondary' onClick={() => handleDownload(file?.download_url as string)} icon='download'>{file?.quality ? file?.quality : file?.mimeType}</Button></div>
                                                            ) : (
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <Button color='secondary' onClick={handlePrepareDownloadYoutube({ ...file, title: data?.title, url: value })} icon='download'>{`${file?.quality}`}</Button>
                                                                </div>
                                                            )}
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            ) : (
                                                <div style={{ margin: '20px auto', textAlign: 'center' }}>
                                                    <Typography variant="body2">Sorry, we couldn&apos;t find the download links for you.</Typography>
                                                </div>
                                            )}
                                        </Grid>
                                    </React.Fragment>
                                ) : data?.type === 'soundcloud' ? (
                                    <Grid key={`soundcloud`} item xs={12}>
                                        <Box textAlign='center' mb={2.5} display='flex' flexDirection='column' alignItems='center'>
                                            <Image alt={data?.title} webp dataSrc={data?.thumbnail} src={staticUrl(`img/url?size=300&image=${encodeURIComponent(data?.thumbnail)}`)} fancybox caption={data?.title} style={{ width: '100%', maxWidth: 250, marginBottom: 10 }} />
                                            <Typography>{data?.title}</Typography>
                                            <Typography variant='body2'>{data?.description}</Typography>
                                        </Box>
                                        <div style={{ textAlign: 'center' }}><Button color='secondary' onClick={() => handleDownload(data?.download_url)} icon='download'>Download</Button></div>
                                    </Grid>
                                ) : null}
                            </Grid>
                        </Box>
                    )}
                    <Divider sx={{ my: 3 }} />
                    <Box textAlign='center'>
                        <Button type='submit' icon='submit' disabled={loading} loading={loading}>Submit</Button>
                    </Box>
                </form>
            </DefaultLayout>
            <Backdrop open={backdrop} {...(bdProgress > 0 ? { progress: bdProgress } : {})} loading={bdLink === null && bdMsg !== "An error occured"}>
                <Box my={2} display='block'>
                    <Typography variant='h6'>{bdLink !== null ? "File ready" : bdMsg}</Typography>
                </Box>
                {bdLink !== null ? (
                    <React.Fragment>
                        <Stack sx={{ mt: 2 }} direction='row' spacing={4}>
                            <Button size='medium' color='secondary' onClick={handleDownloadYoutube(bdLink)} icon='download'>Download</Button>
                            <Button text color='inherit' onClick={closeBackdrop}>Close</Button>
                        </Stack>
                    </React.Fragment>
                ) : (
                    <Box my={2}>
                        <Typography variant='h6'>Do not close or refresh the browser!</Typography>
                    </Box>
                )}
            </Backdrop>
            <Recaptcha ref={captchaRef} />
        </Pages>
    )
}