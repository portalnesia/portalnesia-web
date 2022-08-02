import React from 'react'
import Header from 'portal/components/Header'
import ErrorPage from 'portal/pages/_error'
import Widget from 'portal/components/ProfileWidget'
import PaperBlock from 'portal/components/PaperBlock'
import Player from 'portal/components/Player'
import {AdsRect} from 'portal/components/Ads'
import {CombineAction} from 'portal/components/Action'
import Button from 'portal/components/Button'
import Sidebar from 'portal/components/Sidebar'
import {useNotif} from 'portal/components/Notification'
import {styled} from '@mui/material/styles'
import db from 'portal/utils/db'
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr';
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import useAPI from 'portal/utils/api'
import CountUp from 'portal/components/CountUp'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {connect} from 'react-redux';
import {Paper,Typography,Grid,TextField,CircularProgress,Divider} from '@mui/material'
import dynamic from 'next/dynamic'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));

export const getServerSideProps = wrapper(async({pn:data,req,res,params})=>{
    const slug=params.slug;
    const media = await db.kata(`SELECT f.id as 'id_number',f.userid,f.judul as 'title',f.jenis as 'type',f.thumbs,f.private,f.block,f.tampil,f.unik as id,f.artist,u.user_login,u.media_private FROM klekle_file f LEFT JOIN klekle_users u ON u.id=f.userid WHERE f.unik = ? AND BINARY(f.unik) = BINARY(?) AND f.jenis != 'foto' AND f.jenis != 'apps' LIMIT 1`,[slug,slug]);
    if(!media) {
        return {
            notFound:true
        }
    }
    const {user_login,title,private:Kprivate,block,tampil,userid,type,thumbs,id,id_number,artist}=media[0];
    // BLOCK
    if(block==1 && data?.user?.id != userid) {
        return {
            notFound:true
        }
    }
    else if(block==1 && data?.user?.id == userid) return {props:{meta:{err:'blocked'}}}
    // TAMPIL
    if(tampil==0 && data?.user?.id != userid) {
        return {
            notFound:true
        }
    }
    // PRIVATE
    if(Kprivate==1 && data?.user?.id != userid) {
        return {
            notFound:true
        }
    }
    const image=type=='vdeo' ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(thumbs)}&export=twibbon` : `${process.env.CONTENT_URL}/img/content?image=${thumbs==null ? 'image/lagu.png' : thumbs}&export=twibbon`;
    const meta={
        title:((type === 'lagu' && artist != null) ? `${artist} - ${title}` : title),
        description:`${title} - Media from ${user_login}. Watch/Listen now`,
        image:image,
        slug:slug,
        id:id,
        id_number:id_number
    }
    return {props:{meta:meta}}
})

const DivDivider = styled('div')(({theme})=>({
    paddingTop:'.5rem',
    borderTop:`1px solid ${theme.palette.divider}`,
    '& > div':{
        [theme.breakpoints.down('sm')]: {
            paddingLeft:theme.spacing(2),
            paddingRight:theme.spacing(2)
        },
            [theme.breakpoints.up('sm')]: {
            paddingLeft:theme.spacing(3),
            paddingRight:theme.spacing(3)
        },
    }
}))

const PTitle = styled('p')(()=>({
    lineHeight:1,
    fontSize:'1rem',
    fontWeight:500,
    textOverflow:'ellipsis',
    display:'-webkit-box!important',
    WwebkitBoxOrient:'vertical',
    overflow:'hidden',
    WebkitLineClamp:2,
}))

const DivAutoPlay = styled('div')(({muncul})=>({
    position:'absolute',
    zIndex:900,
    fontSize:15,
    backgroundColor:'#ffffff',
    padding:10,
    '& p':{
        color:'#000000'
    },
    display:'none',
    ...(muncul ? {display:'block !important'} : {})
}))

const SpanLink = styled('span')(({theme})=>({
    color:theme.palette.primary.link,
    cursor:'pointer',
    fontWeight:'bold',
    fontSize:16,
}))

const OverflowTypo = styled(Typography)(()=>({
    textOverflow:'ellipsis',
    overflow:'hidden',
    WebkitLineClamp:1,
}))

const Media=({meta,err,user})=>{
    if(err) return <ErrorPage statusCode={err} />
    if(meta.err==='blocked') return <Paper><div style={{margin:'20px auto',textAlign:'center'}}><Typography variant="h6">Your Media is Blocked</Typography></div></Paper>
    const {get} = useAPI();
    const router=useRouter();
    const {data,error}= useSWR(`/v1/files/${meta?.slug}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
    })
    const {data:dataOther,error:errorOther}= useSWR(`/v1/files/recommendation/${meta?.id_number}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
    })
    const [plyrCon,setPlyrCon]=React.useState({h:0,w:0})
    const {setNotif}=useNotif()
    const [muncul,setMuncul]=React.useState(false)
    const plyr=React.useRef()
    const intrvl=React.useRef(null)
    const autoplay=React.useRef(6)
    const [autop,setAutoPlay]=React.useState(6)
    const [imgSrc,setImgSrc]=React.useState()

    const handlePlayerReady=()=>{
        if(data?.type!=='audio') {
            const w=document.getElementsByClassName('plyr')[0].offsetWidth,
            h=document.getElementsByClassName('plyr')[0].offsetHeight;
            setPlyrCon({
                w:w,
                h:h
            })
        }
    }

    React.useEffect(()=>{
        const timeout=setTimeout(async()=>{
            if(process.env.NODE_ENV === 'production') {
                const url = new URL(window.location.href)
                if(meta?.slug) await get(`/v1/files/${meta.slug}/update${url.search}`,{error_notif:false});
            }
        },5000)

        return ()=>clearTimeout(timeout)
    },[meta.slug])

    React.useEffect(()=>{
        setImgSrc(undefined)
        setTimeout(()=>setImgSrc(data?.user?.picture),500)
    },[data])

    React.useEffect(()=>{
        return()=>{
            clearInterval(intrvl.current)
        }
    },[])

    const ulangVideo=()=>{
        if(autoplay.current===0) {
            setMuncul(false)
            clearInterval(intrvl.current)
            intrvl.current=null
            autoplay.current=6
            setAutoPlay(6)
            router.push('/media/[slug]',`/media/${dataOther?.[0]?.id}`);
        } else {
            setAutoPlay(autoplay.current-1)
            autoplay.current=autoplay.current - 1;
        }
        const www=(plyrCon.w)/2,ttt=(plyrCon.h)/2,
        div=document.getElementById('autoplay'),
        wwww = div.offsetWidth/2,tttt=div.offsetHeight/2,tt=ttt-tttt,ww=www-wwww;
        div.style.top=`${tt}px`;
        div.style.left=`${ww}px`;
    }
    const ulangAudio=()=>{
        if(autoplay.current===0) {
            setMuncul(false)
            clearInterval(intrvl.current)
            intrvl.current=null
            autoplay.current=6
            setAutoPlay(6)
            router.push('/media/[slug]',`/media/${dataOther?.[0]?.id}`);
        } else {
            setAutoPlay(autoplay.current-1)
            autoplay.current=autoplay.current-1
        }
        if(plyr.current) {
            plyr.current?.setTitle(
                (
                    <div>
                        <OverflowTypo key='next' variant='body1' component='p'>
                            Next : {dataOther?.[0]?.title}
                        </OverflowTypo>
                        <Typography key='cancel' variant='body1' component='p'>
                            <SpanLink onClick={handleCancel}>Cancel</SpanLink>
                        </Typography>
                    </div>
                ),(
                    <div>
                        <Typography key='autoplay' variant='body1' component='p'>
                            Auto play in {autoplay.current}
                        </Typography>
                    </div>
                    
                )
            )
        }
    }
    const handleEnded=()=>{
        autoplay.current=6
        setMuncul(true)
        if(plyr.current) {
            console.log(plyr.current)
            if(data?.type!=='audio') {
                intrvl.current=setInterval(ulangVideo,1000)
            } else {
                if(typeof plyr.current?.setTitle === 'function') intrvl.current=setInterval(ulangAudio,1000)
            }
        }
    }

    const handleCancel=()=>{
        /*setAutoPlay(8)
        autoplay=8;
        setCancel(true)
        if(data?.file?.type==='audio') {
            plyr?.current.setTitle(data?.file?.title,"Paused...");
        }*/
        setMuncul(false)
        clearInterval(intrvl.current)
        intrvl.current=null
        autoplay.current=6
        setAutoPlay(6)
        if(data?.type==='audio' && typeof plyr.current?.setTitle === 'function') {
            plyr.current?.setTitle(data?.title,"Paused...");
        }
    }

    const handleCopy=(e)=>{
        e.preventDefault();
        Kcopy(e.target.value).then((res)=>{
            setNotif("Text copied",'default');
        }).catch(()=>{})
    }

    const handleDownload=()=>{
        if(user===null) return setNotif("Only for registered users",true);
        else {
            if(data?.download_token) {
                window?.open(`/download?token=${data?.download_token}`)
            } else if(data?.file?.download?.type==='download') {
                window?.open(`/downloader?url=${encodeURIComponent(data?.url)}`)
            }
        }
    }

    return (
        <Header navTitle="Media" iklan title={meta?.title} desc={meta?.description} image={meta?.image} canonical={`/media/${meta?.slug}`}>
            <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                    <PaperBlock id='mediaContainer' title={meta?.title} noPaddingHeader whiteBg
                    header={
                        <div>
                            {data && (
                                <DivDivider className='flex-header'>
                                    <div key={1}>
                                        <Typography variant="body2">Watched: &nbsp;{data?.seen?.number !== undefined && <CountUp data={data?.seen} />}</Typography>
                                    </div>
                                    <div key={2}>
                                        <CombineAction
                                            list={{
                                                share:{
                                                    campaign:'media',
                                                    posId:meta?.id_number
                                                },
                                                report:true
                                            }}
                                        />
                                    </div>
                                </DivDivider>
                            )}
                        </div>
                    }
                    footer={
                        <Button onClick={handleDownload}>Download</Button>
                    }
                    >
                        <Grid container spacing={2}>
                            {!data && !error ? (
                                <Grid item xs={12}>
                                    <div style={{margin:'20px auto',textAlign:'center'}}>
                                        <CircularProgress thickness={5} size={50}/>
                                    </div>
                                </Grid>
                            ) : error  ? (
                                <Grid item xs={12}>
                                    <div style={{margin:'20px auto',textAlign:'center'}}>
                                        <Typography variant="h5">{error}</Typography>
                                    </div>
                                </Grid>
                            ) : (
                                <>
                                <Grid key='grid-0' item xs={12}>
                                    <div style={{marginBottom:30,position:'relative'}}>
                                        {data?.type!=='audio' && (
                                            <DivAutoPlay id='autoplay' muncul={muncul}>
                                                <Typography key='next' variant='body1' component='p'>
                                                    Next : {dataOther?.[0]?.type == 'audio' && dataOther?.[0]?.artist !== dataOther?.[0]?.title ? `${dataOther?.[0]?.artist} - ${dataOther?.[0]?.title}` : dataOther?.[0]?.title}
                                                </Typography>
                                                <Typography key='autoplay' variant='body1' component='p'>
                                                    Auto play in {autop}
                                                </Typography>
                                                <Typography key='cancel' variant='body1' component='p'>
                                                    <SpanLink onClick={handleCancel}>Cancel</SpanLink>
                                                </Typography>
                                            </DivAutoPlay>
                                        )}
                                        <Player
                                            ref={plyr}
                                            url={data?.url}
                                            title={data?.type == 'audio' && data?.artist !== data?.title ? `${data?.artist} - ${data?.title}` : data?.title}
                                            type={data?.type==='audio' ? 'audio' : 'video'}
                                            {...(data?.type==='youtube' ? {provider:'youtube'} : {})}
                                            onended={handleEnded}
                                            onready={handlePlayerReady}
                                        />
                                    </div>
                                </Grid>
                                <Grid key='grid-1' item xs={12}>
                                    <AdsRect />
                                    <Typography variant="h6" component='h5' gutterBottom>Embed</Typography>
                                    <TextField
                                        value={`<div style="position:relative;padding-top:56.25%;"><iframe src="${process.env.APP_URL}/media/embed/${meta?.slug}" frameborder="0" allowfullscreen="yes" scrolling="no" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>`}
                                        onClick={handleCopy}
                                        multiline
                                        rows={3}
                                        maxRows={3}
                                        fullWidth
                                        variant='outlined'
                                        disabled
                                        inputProps={{style:{cursor:'pointer'}}}
                                    />
                                </Grid>
                                </>
                            )}
                        </Grid>
                    </PaperBlock>
                </Grid>
                <Grid item xs={12} lg={4}>
                    {(!dataOther && !errorOther) ? (
                        <PaperBlock title="Others Media">
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        </PaperBlock>
                    ) : errorOther  ? (
                        <PaperBlock title="Others Media">
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{errorOther}</Typography>
                            </div>
                        </PaperBlock>
                    ) : (
                        <>
                        {typeof imgSrc !== 'undefined' && (
                            <Widget name={data?.user?.name} dataSrc={data?.user?.picture} src={`${data?.user?.picture}&size=200&watermark=no`} title={
                                <center>
                                    <Typography component='h6'>Media from</Typography>
                                    <Typography variant="h5" component='h4'>{data?.user?.name}</Typography>
                                </center>
                            }>
                                <Divider style={{margin:'20px 0'}} />
                                <div style={{textAlign:'center'}}>
                                    <Link href={`/user/${data?.user?.username}/media`} passHref><a><Button>See More</Button></a></Link>
                                </div>
                            </Widget>
                        )}
                        
                        <Sidebar id='mediaContainer'>
                            <PaperBlock title="Recommended">
                                {dataOther?.map((o,i)=>(
                                    <Card key={`others-${i.toString()}`} style={{position:'relative'}} elevation={0} >
                                        <Link href='/media/[slug]' as={`/media/${o?.id}`} passHref><a><CardActionArea>
                                            <CardContent>
                                                <PTitle>{o?.type == 'audio' && o?.artist !== o?.title ? `${o?.artist} - ${o?.title}` : o?.title}</PTitle>
                                            </CardContent>
                                        </CardActionArea></a></Link>
                                    </Card>
                                ))}
                            </PaperBlock>
                        </Sidebar>
                        </>
                    )}
                </Grid>
            </Grid>
        </Header>
    );
}

export default connect(state=>state)(Media)