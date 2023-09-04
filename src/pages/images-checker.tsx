import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import { ApiError } from "@design/hooks/api";
import { ucwords } from "@portalnesia/utils";
import Button from "@comp/Button";
import TextField from "@mui/material/TextField";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import Stack from "@mui/material/Stack";
import { Div } from "@design/components/Dom";
import Recaptcha from "@design/components/Recaptcha";
import Image from "@comp/Image";
import DragableFiles, { HandleChangeEvent } from "@design/components/DragableFiles";
import Divider from "@mui/material/Divider";
import { AxiosRequestConfig } from "axios";
import dynamic from "next/dynamic";
import AdsNative from "@comp/ads/AdsNative";
import Ads300 from "@comp/ads/Ads300";

const Backdrop = dynamic(() => import("@design/components/Backdrop"));
const List = dynamic(() => import("@mui/material/List"));
const ListItem = dynamic(() => import("@mui/material/ListItem"));
const ListItemText = dynamic(() => import("@mui/material/ListItemText"));

export default function ImagesCheckerPages() {
    const [dataFile, setDataFile] = React.useState<string | null>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [loading, setLoading] = React.useState(false)
    const [progress, setProgress] = React.useState(0);
    const setNotif = useNotification();
    const [url, setUrl] = React.useState("");
    const [result, setResult] = React.useState<{ category: string, probability: number }[]>([])
    const { post } = useAPI();
    const resultRef = React.useRef<HTMLDivElement>(null)
    const captchaRef = React.useRef<Recaptcha>(null);

    const handleChange = React.useCallback((e: HandleChangeEvent) => {
        let picture: File | undefined
        if ('dataTransfer' in e) {
            if (e.dataTransfer.files.length === 1) {
                picture = e.dataTransfer.files[0];
            }
        } else {
            if (e.target.files && e.target.files.length === 1) {
                picture = e.target.files[0]
            }
        }
        if (!picture) return setNotif("Something went wrong, we couldn't find your image", true);
        if (picture.size > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB", true);
        const type = picture.type.toLowerCase();
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(type)) return setNotif("File not supported, only jpg, jpeg, png", true);

        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
            if (typeof e.target?.result === "string") {
                setDataFile(e.target?.result)
                if (picture) setFile(picture)
            }
        }
        reader.readAsDataURL(picture);
    }, [setNotif])

    const inputRemove = React.useCallback(() => {
        setFile(null);
        setDataFile(null);
        setUrl("")
        setResult([])
    }, [])

    const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setResult([])
        if (file === null && url.trim().match(/^https?\:\/\//i) === null) setNotif("Please select image first", true);
        else {
            try {
                setProgress(0)
                setLoading(true);
                const form = new FormData();
                if (file !== null) form.append('image', file);
                if (url.trim().match(/^https?\:\/\//i) !== null) form.append('url', url);

                const opt: AxiosRequestConfig = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progEvent) => {
                        const complete = Math.round((progEvent.loaded * 100) / (progEvent.total || 1));
                        setProgress(complete);
                    }
                }
                const recaptcha = await captchaRef.current?.execute();
                if (recaptcha) form.append('recaptcha', recaptcha);

                const result = await post<{ category: string, probability: number }[]>(`/v2/tools/nsfw`, form, opt);
                setResult(result);
                setTimeout(() => {
                    const top = resultRef.current?.offsetTop;
                    if (typeof top === 'number') {
                        window.scrollTo({ top, left: 0, behavior: 'smooth' });
                    }
                }, 400)

            } catch (e) {
                if (e instanceof ApiError) {
                    setNotif(e.message, true)
                }
            } finally {
                setLoading(false);
            }
        }
    }, [url, file, post, setNotif])

    return (
        <Pages title="Images Checker" canonical="/images-checker">
            <DefaultLayout maxWidth='sm'>
                <form onSubmit={handleSubmit}>
                    <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={3}>
                        <Typography variant='h4' component='h1'>Images Checker</Typography>
                    </Box>
                    <Box>
                        <Typography paragraph>{`This online tool will help you to check if your image contains NSFW (Not Safe To Work) or not. Using 5 categories: Sexy, Neutral, Porn, Drawing, or Hentai.`}</Typography>
                    </Box>

                    <Stack mt={3} mb={5}>
                        <AdsNative />
                    </Stack>

                    <Box>
                        <DragableFiles file={Boolean(file)} id='picture-input' label="Drag images or click here to select images" type="file" accept="image/*" handleChange={handleChange}>
                            <Box display='flex' justifyContent='center' alignItems='center' textAlign='center'>
                                {dataFile && (
                                    <Image src={dataFile} sx={{ width: '100%', maxWidth: 400 }} alt="Image" />
                                )}
                            </Box>
                        </DragableFiles>
                    </Box>

                    <Divider sx={{ my: 5 }} />

                    <Box mb={5}>
                        <Typography paragraph>You can also use an image URL for analysis</Typography>
                        <TextField
                            label='Image URL'
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            fullWidth
                            placeholder="https://"
                        />
                    </Box>

                    <Stack my={3}>
                        <Ads300 />
                    </Stack>

                    <Div ref={resultRef}>
                        {result.length > 0 && (
                            <React.Fragment>
                                <Divider sx={{ my: 5 }} />
                                <Typography variant='h6'>Result:</Typography>
                                <List>
                                    {result.map(r => (
                                        <ListItem key={r.category} divider sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={<Typography sx={{ fontSize: 16 }}>{ucwords(r.category)}</Typography>}
                                                secondary={<Typography>{`Probability: ${r.probability}`}</Typography>}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </React.Fragment>
                        )}
                    </Div>

                    <Stack sx={{ mt: 5 }} direction='row' justifyContent='space-between' alignItems='center'>
                        <Button icon='submit' type="submit">Analysis</Button>
                        <Button color='error' onClick={inputRemove}>Reset</Button>
                    </Stack>
                </form>
            </DefaultLayout>
            <Recaptcha ref={captchaRef} />
            <Backdrop open={loading} progress={progress} loading />
        </Pages>
    )
}