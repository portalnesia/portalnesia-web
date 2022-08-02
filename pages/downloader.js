import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import {AdsRect} from 'portal/components/Ads'
import {useRouter} from 'next/router'
import PaperBlock from 'portal/components/PaperBlock'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {ucwords} from '@portalnesia/utils'
import {Grid,Typography,TextField} from '@mui/material'
import dynamic from 'next/dynamic'
import {useSocket} from 'portal/utils/Socket'
import Recaptcha from 'portal/components/ReCaptcha'

const Image=dynamic(()=>import('portal/components/Image'))
const Backdrop=dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper()

const Downloader=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const socket = useSocket();
    const {url:urlParams}=router.query;
    const [loading,setLoading]=React.useState(false);
    const [value,setValue]=React.useState(urlParams ? decodeURIComponent(urlParams) : "");
    const [error,setError]=React.useState(null)
    const [data,setData]=React.useState(null)
    const {setNotif}=useNotif()
    const [backdrop,setBackdrop]=React.useState(false)
    const [bdProgress,setBdProgress] = React.useState(0);
    const [bdMsg,setBdMsg] = React.useState("");
    const [bdLink,setBdLink] = React.useState(null);
    const {post} = useAPI()
    const captchaRef = React.useRef(null)

    const handleSubmit=(e)=>{
        e.preventDefault();
        setData(null);
        if(error===null) {
            router.replace({
                pathname:'/downloader',
                query:{
                    url:encodeURIComponent(value)
                }
            },`/downloader?url=${encodeURIComponent(value)}`,{shallow:true});
        }
    }

    const checkValue=React.useCallback((val)=>{
        return new Promise((res,rej)=>{
            if(val.trim().match(/^https?\:\/\//i)) {
                if(val.trim().match(/\byoutube\.com\b|\bsoundcloud\.com\b|\byoutu\.be\b|\binstagram\.com\b|\btwitter\.com\b/)){
                    return res();
                }
                return rej("Only support Youtube, Soundcloud, Instagram, and Twitter.");
                
            }
            return rej("Please start with http or https");
        });
    },[])

    const handleDownload=React.useCallback((urls)=>{
        window?.open(urls);
    },[])

    const handlePrepareDownloadYoutube=React.useCallback((data)=>{
        if(socket) {
            setBdMsg("Preparing...");
            setBackdrop(true);
            socket.emit("youtube downloader",data);
        }
    },[socket])

    const handleChange=React.useCallback((val)=>{
        setValue(val.trim());
        checkValue(val).then(()=>{
            setError(null);
        }).catch((err)=>{
            setError(err);
        })
    },[])

    const handleDownloadYoutube = React.useCallback((link)=>{
        window?.open(link);
        setBackdrop(false)
        setBdMsg("");
        setBdLink(null);
        setBdProgress(0);
    },[])

    React.useEffect(async()=>{
        if(router.query.url) {
            setLoading(true);
            const input=decodeURIComponent(router.query.url)
            try {
                await checkValue(input)
                try {
                    const recaptcha = input.match(/\binstagram\.com\/p\/\b/) === null ? await captchaRef.current?.execute() : "";
                    if(input.match(/\binstagram\.com\/p\/\b/)){
                        setNotif("Under maintenance",true);
                        setLoading(false);
                    } else if(input.match(/\bsoundcloud\.com\b/)) {
                        const [res] = await post('/v1/tools/downloader/soundcloud',{url:input,recaptcha},{},{success_notif:false})
                        setData(res);
                    } else if(input.match(/\byoutube\.com\b|\byoutu\.be\b/)) {
                        const [res] = await post('/v1/tools/downloader/youtube',{url:input,recaptcha},{},{success_notif:false})
                        setData(res);
                    } else if(input.match(/\btwitter\.com\b/))  {
                        const [res] = await post('/v1/tools/downloader/twitter',{url:input,recaptcha},{},{success_notif:false})
                        setData(res);
                    } else {
                        setNotif("Only support Youtube, Soundcloud, Instagram, and Twitter.",true);
                        setLoading(false);
                    }
                } catch {
                    
                } finally {
                    setLoading(false);
                }
            } catch(err) {
                setNotif(err,true);
                setLoading(false);
            }
        }
    },[router.query])

    React.useEffect(()=>{
        function onYoutubeDownloader(dt) {
            if(dt?.progress >= 100) {
                setBdMsg("Generating download links");
            }
            else if(dt?.error) {
                setBdProgress(0);
                setBdMsg("An error occured");
            } else if(dt?.finish && dt?.url) {
                setBdProgress(0);
                setBdLink(dt?.url);
            } else {
                setBdMsg("Concatenating audio and video files");
                setBdProgress(dt?.progress);
            }
        }
        if(socket) {
            socket.on("youtube downloader",onYoutubeDownloader)
        }

        return ()=>{
            if(socket) {
                socket.off("youtube downloader");
            }
        }
    },[socket])

    return(
        <Header navTitle="Downloader" iklan canonical='/downloader' title="Media Downloader" desc="Instagram photo/video, Twitter video, Youtube video/music, and Soundcloud music downloader" active='tools' subactive='downloader'>
            <Grid container justifyContent="center">
                <Grid item xs={12} md={10} lg={8}>
                    <form onSubmit={handleSubmit}>
                        <PaperBlock title="Downloader" whiteBg
                        footer={
                            <Button disabled={loading} loading={loading} type='submit' icon='submit'>Submit</Button>
                        }
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        value={value}
                                        onChange={e=>handleChange(e.target.value)}
                                        fullWidth
                                        required
                                        error={error!==null}
                                        helperText={error!==null ? error : ''}
                                        label="URL"
                                        disabled={loading}
                                    />
                                </Grid>
                                {data!==null && (
                                    <Grid item xs={12}>
                                        <Grid container spacing={2} justifyContent='center'>
                                            {data?.type==='twitter' ? (
                                                <Grid item xs={12}>
                                                    <div style={{textAlign:'center',margin:'20px auto'}}>
                                                        <Typography variant='body2' gutterBottom>{data?.title}</Typography>
                                                    </div>
                                                    <Grid container spacing={2} justifyContent='center'>
                                                        {data?.data?.map((twitter,i)=>(
                                                            <Grid item xs={12}>
                                                                <center><Image blured webp dataSrc={twitter?.thumbnail} src={`${process.env.CONTENT_URL}/img/url?size=300&image=${encodeURIComponent(twitter?.thumbnail)}`} fancybox style={{width:'100%',maxWidth:250}} /></center>
                                                                <Grid container spacing={2} justifyContent='center'>
                                                                    {twitter?.media?.map((file,i)=>(
                                                                        <Grid key={`twitter-${i}`} item xs={12} md={6} lg={4}>
                                                                            <div style={{textAlign:'center'}}><Button color='secondary' onClick={()=>handleDownload(file?.download_url)} icon='download'>{`bitrate: ${file?.bitrate}`}</Button></div>
                                                                        </Grid>
                                                                    ))}
                                                                </Grid>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Grid>
                                            ) : data?.type==='instagram' ? data?.media?.map((file,i)=>(
                                                <Grid key={`instagram-${i}`} item xs={12} md={6} lg={4}>
                                                    <div style={{textAlign:'center',margin:'20px auto'}}>
                                                        <Image blured webp dataSrc={`${process.env.CONTENT_URL}/img/url?watermark=no&image=${encodeURIComponent(file?.thumbnails)}`} src={`${process.env.CONTENT_URL}/img/url?size=250&image=${encodeURIComponent(file?.thumbnails)}`} fancybox style={{width:'100%',maxWidth:250,marginBottom:10}} />
                                                        <Typography variant='body2'>{ucwords(file?.type)}</Typography>
                                                    </div>
                                                    <div style={{textAlign:'center'}}><Button color='secondary' icon='download' onClick={()=>handleDownload('/')}>Download</Button></div>
                                                </Grid>
                                            )) : data?.type==='youtube' ? (
                                                <>
                                                    <Grid key={`youtube-thumb`} item xs={12} md={6} lg={4}>
                                                        <center><Image blured webp dataSrc={data?.thumbnail} src={`${process.env.CONTENT_URL}/img/url?size=300&image=${encodeURIComponent(data?.thumbnail)}`} fancybox style={{width:'100%',maxWidth:250}} /></center>
                                                    </Grid>
                                                    <Grid key={`youtube-title`} item xs={12}>
                                                        <div style={{textAlign:'center'}}><Typography>{data?.title}</Typography></div>
                                                        <Typography variant="body2">{data?.description}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        {data?.media?.length ? (
                                                            <Grid container spacing={2} justifyContent='center'>
                                                                {data?.media?.map((file,i)=>(
                                                                    <Grid key={`youtube-${i}`} item xs={12} md={6} lg={4}>
                                                                        {file?.download_url ? (
                                                                            <div style={{textAlign:'center'}}><Button color='secondary' onClick={()=>handleDownload(file?.download_url)} icon='download'>{file?.quality}</Button></div>
                                                                        ) : (
                                                                            <div style={{textAlign:'center'}}>
                                                                                <Button color='secondary' onClick={handlePrepareDownloadYoutube({...file,title:data?.title,url:value})} icon='download'>{`${file?.quality}`}</Button>
                                                                            </div>
                                                                        )}
                                                                        
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        ) : (
                                                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                                                <Typography variant="body2">Sorry, we couldn't find the download links for you.</Typography>
                                                            </div>
                                                        )}
                                                    </Grid>
                                                </>
                                            ) : data?.type==='soundcloud' ? (
                                                <Grid key={`soundcloud`} item xs={12}>
                                                    <div style={{textAlign:'center',marginBottom:20}}>
                                                        <Image blured webp dataSrc={data?.thumbnail} src={`${process.env.CONTENT_URL}/img/url?size=300&image=${encodeURIComponent(data?.thumbnail)}`} fancybox style={{width:'100%',maxWidth:250,marginBottom:10}} />
                                                        <Typography>{data?.title}</Typography>
                                                        <Typography variant='body2'>{data?.description}</Typography>
                                                    </div>
                                                    <div style={{textAlign:'center'}}><Button color='secondary' onClick={()=>handleDownload(data?.download_url)} icon='download'>Download</Button></div>
                                                </Grid>
                                            ) : null}
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                            <AdsRect />
                        </PaperBlock>
                    </form>
                </Grid>
            </Grid>
            <Backdrop open={backdrop} {...(bdProgress > 0 ? {progress: bdProgress} : {})}>
                <div style={{marginTop:15}}>
                    <Typography>{bdMsg}</Typography>
                </div>
                {bdLink !== null && (
                    <div style={{marginTop:15}}>
                        <Button size='medium' color='secondary' onClick={()=>handleDownloadYoutube(bdLink)} icon='download'>Download</Button>
                    </div>
                )}
            </Backdrop>
            <Recaptcha ref={captchaRef} />
        </Header>
    )
}

export default Downloader