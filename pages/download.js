import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import {AdsRect,AdsBanner2} from 'portal/components/Ads'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import {withStyles} from 'portal/components/styles';
import {useContentAPI} from 'portal/utils/api'
import {number_size} from '@portalnesia/utils'
import db from 'portal/utils/db'
import clx from 'classnames'
import {Grid,Typography,Divider} from '@mui/material'

export const getServerSideProps = wrapper(async({pn:data,req,res,query})=>{
    const {token}=query
    const crypto = (await import('portal/utils/crypto')).default
    if(token) {
        if(data.user===null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${req.url}`)}`);
        try {
            const decryptToken=crypto.decrypt(token);
            const objToken=JSON.parse(decryptToken);
            const file=await db.kata(`SELECT judul as 'title',size FROM klekle_file WHERE unik=? LIMIT 1`,[objToken.id]);
            if(!file) {
                return db.redirect();
            }
            const {title,size}=file[0];
            return {props:{meta:{title:title,size:number_size(size)}}}
        } catch(err) {
            return db.redirect();
        }
    }
    return db.redirect();
})

const styles=theme=>({
    baseTimer:{
        position:'relative',
        width:300,
        height:300,
    },
    baseTimerSvg:{
        transform:'scaleX(-1)'
    },
    baseTimerCircle:{
        fill:'none',
        stroke:'none',
    },
    baseTimerElapsed:{
        strokeWidth:7,
        stroke:'grey',
    },
    baseTimerRemaining:{
        strokeWidth:7,
        strokeLinecap:'round',
        transform:'rotate(90deg)',
        transformOrigin: 'center',
        transition: '1s linear all',
        fillRule: 'nonzero',
        stroke: 'currentColor',
    },
    greenn:{
        color: 'rgb(65, 184, 131)',
    },
    orangee:{
        color:'orange'
    },
    redd:{color:'red'},
    baseTimerLabel:{
        position:'absolute',
        width:300,
        height:300,
        top:0,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        fontSize:98
    },
    divider:{
        padding:'.5rem 0',
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
    },
})

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;
const TIME_LIMIT = 15;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

const DownloadPage=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {token,download_token}=router.query;

    const [timeLeftText,setTimeLeft]=React.useState(TIME_LIMIT);
    const [isTimer,setTimer]=React.useState(true);
    const [counterPage,setCounterPage]=React.useState(true);
    const [stroke,setStroke]=React.useState('283');
    const [canDownload,setCanDownload]=React.useState(false)
    const [loading,setLoading]=React.useState(false);
    const {setNotif}=useNotif()
    const [downloadText,setDownloadText]=React.useState("Generate Link");
    const post = useContentAPI()

    const handleDownload=()=>{
        setLoading(true);
        if(token) {
            post(`/download`,{token:token},undefined,{error_notif:true,success_notif:false}).then((res)=>{
                setLoading(false);
                router.replace({
                    pathname:'/download',
                    query:{
                        download_token:res.token
                    }
                },`/download?download_token=${res.token}`,{shallow:true});
            }).catch((err)=>{
                setLoading(false);
            })
        } else if(download_token){
            post(`/download`,{download_token:download_token},undefined,{error_notif:true,success_notif:false}).then(()=>{
                setLoading(false);
                window.open(`${process.env.CONTENT_URL}/download_files`);
                router.back();
            }).catch((err)=>{
                setLoading(false);
            })
        }
    }

    const startTimer=()=>{
        setCounterPage(true)
        setCanDownload(false)
        setStroke('283')
        setTimer(true)
        timerInterval = setInterval(() => {
            timePassed = timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            setTimeLeft(timeLeft)
            setCircleDasharray();

            if (timeLeft === 0) {
                clearInterval(timerInterval);
                setTimer(false)
                setCanDownload(true)
            }
        }, 1000);
    }

    const calculateTimeFraction=()=>{
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction===0?0:rawTimeFraction-(1/TIME_LIMIT)*(1 - rawTimeFraction);
    }

    const setCircleDasharray=()=>{
        var circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} 283`;
        setStroke(circleDasharray)
    }

    React.useEffect(()=>{
        if(download_token) {
            setCounterPage(false)
            setDownloadText("Download")
        } else if(token) {
            setTimeout(()=>startTimer(),1000);
        }

        return ()=>{
            //if(token) {
                clearInterval(timerInterval);
                timePassed = 0;
                timeLeft = TIME_LIMIT;
                timerInterval=null;
            //}
        }
    },[router.query])

    return(
        <Header navTitle="Download" iklan canonical="/download" title={`Download ${meta.title}`}>
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12} lg={8} md={10}>
                    <PaperBlock title={meta.title} whiteBg
                    header={
                        <div>
                            <div className={classes.divider}>
                                <Typography variant="body2">Size: {meta.size}</Typography>
                            </div>
                        </div>
                    }
                    >
                        <AdsRect />
                        {counterPage && (
                            <div>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <div className={classes.baseTimer}>
                                        <svg className={classes.baseTimerSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                            <g className={classes.baseTimerCircle}>
                                            <circle className={classes.baseTimerElapsed} cx="50" cy="50" r="45"></circle>
                                            {isTimer && <path id="base-timer-path-remaining" strokeDasharray={stroke} className={clx(classes.baseTimerRemaining,timeLeftText <= ALERT_THRESHOLD ? classes.redd : timeLeftText <= WARNING_THRESHOLD ? classes.orangee : classes.greenn)} d=" M 50, 50 m -45, 0 a 45,45 0 1,0 90,0a 45,45 0 1,0 -90,0"></path>}
                                            </g>
                                        </svg>
                                        <span id="base-timer-label" className={classes.baseTimerLabel}>{timeLeftText}</span>
                                    </div>
                                </div>
                                <div style={{margin:'20px 0'}}><Divider /></div>
                            </div>
                        )}

                        <div style={{textAlign:'center'}}>
                            <Button disabled={!canDownload || loading} loading={loading} icon='download' onClick={handleDownload}>{downloadText}</Button>
                        </div>
                        <AdsBanner2 />
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    )
}

export default withStyles(DownloadPage,styles)