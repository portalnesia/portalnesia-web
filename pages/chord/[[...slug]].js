import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import Comments from 'portal/components/Comments'
import Player from 'portal/components/Player'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import classNames from 'classnames';
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import {connect} from 'react-redux';
import useSWR from 'portal/utils/swr';
import {useAPI,db,useHotKeys,useMousetrap,getLocal,ApiError} from 'portal/utils'
import {adddesc} from '@portalnesia/utils'
import {isMobile} from 'react-device-detect';
import {Fab,Grid,Typography,Paper,IconButton,AppBar,Tabs,Tab,CircularProgress} from '@mui/material'
import Link from 'next/link'
import {Home as HomeIcon, Visibility as VisibilityIcon, Autorenew,Print as PrintIcon,KeyboardArrowDown,KeyboardArrowUp,Close as CloseIcon} from '@mui/icons-material';
import { ArticleJsonLd } from 'next-seo';
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'
import Chord from 'portal/components/Chord'
import chordKeyword from 'portal/components/header/chord-keyword'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));
const Tooltip=dynamic(()=>import('@mui/material/Tooltip'))
const ReportAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.ReportAction),{ssr:false})
const LikeAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.LikeAction),{ssr:false})
const DonationAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.DonationAction),{ssr:false})
const ShareAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.ShareAction),{ssr:false})
const AdsRect=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsRect),{ssr:false})
const AdsBanner1=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsBanner1),{ssr:false})
const CountUp=dynamic(()=>import('portal/components/CountUp'),{ssr:false})
//const Chord=dynamic(()=>import('portal/components/Chord'))

export const getServerSideProps = wrapper(async({pn:data,token,req,res,params})=>{
    const slug=params.slug;
    const meta={
        title:"Chord",
        description:'Find a variety of guitar chords.'
    }
    if(slug?.length > 1) {
        return db.redirect();
    }
    if(typeof slug !== 'undefined' && slug?.[0]!=='popular') {
        const dayjs=require('dayjs')
        const utc = require('dayjs/plugin/utc')
        dayjs.extend(utc)

        const chord= await db.kata(`SELECT c.id,c.userid,c.slug,c.slug_artist,c.artist,c.title,c.original,c.text,c.publish,c.block,c.youtube,c.datetime,c.datetime_edit,u.user_login,u.user_nama FROM klekle_chord c LEFT JOIN klekle_users u ON u.id=c.userid WHERE c.slug=? LIMIT 1`,[slug[0]]);
        if(!chord) {
            return {
                notFound:true
            }
        }
        const {id,title,artist,original,publish,block,userid,youtube,slug:slugg,user_login,user_nama,datetime,datetime_edit,slug_artist,text}=chord[0];
        if(publish==0 && data?.user?.id != userid || block==1 && data?.user?.id != userid) {
            return {
                notFound:true
            }
        }
        if(block==1 && data?.user?.id == userid) return {props:{meta:{err:'blocked'}}}
        meta.title=`Chord ${artist} ${title}`
        meta.description=`${title} by ${artist}.\n${original}`;
        meta.artist=artist;
        meta.song_title=title;
        meta.id=id;
        meta.slug=slugg;
        meta.image=`${process.env.CONTENT_URL}/ogimage/chord/${slugg}`
        meta.youtube=youtube
        meta.author=user_login;
        meta.authorName=user_nama;
        meta.published=dayjs(datetime).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
        meta.modified=dayjs((datetime_edit==null ? datetime : datetime_edit)).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
        try {
            const a = await getLocal(token,`/v1/chord/${slug[0]}`)
            meta.initial = a;
        } catch {
            meta.initial=null;
        }
    }
    return {props:{meta:meta}}
})

const stylesTab=theme=>({
    selected:{
        color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.dark} !important`
    },
    rootTab:{
        width:'100% !important'
    },
    rootAppBar:{
        marginBottom:'1rem !important',
        position:'fixed !important',
        top:'64px !important',
        backgroundColor:`${theme.palette.background.default} !important`,
        backgroundImage:'unset !important',
        [theme.breakpoints.down('lg')]: {
            width:'100% !important',
            left:'unset !important'
        },
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 240px) !important',
            left:'240px !important'
        },
    },
    drawerClose:{
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 68px) !important',
            left:'68px !important'
        },
    },
    root:{
        padding:'1rem'
    },
    title:{
        marginBottom:'1rem !important',
        fontWeight:'500 !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2
    },
    overfloww:{
        color:`${theme.palette.text.secondary} !important`,
        fontSize:'.7rem !important',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:1,
        position:'absolute !important',
        bottom:0,
        right:0
    },
    section:{
        position:'absolute',
        bottom:0,
        left:0
    },
    extendedIcon: {
        marginRight: `${theme.spacing(1)} !important`,
    },
    fab:{
        position: 'fixed !important',
        bottom: `${theme.spacing(2)} !important`,
        right: `${theme.spacing(2)} !important`,
        [theme.breakpoints.down('lg')]: {
            bottom: `${16+56}px !important`,
        },
    }
})

const HomeTabStyle=({classes,meta,toggleDrawer})=>{
    const router=useRouter();
    const {get} = useAPI()
    const {slug,page,reloadedPage}=router.query;
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [recent,setRecent]=React.useState([])
    const [popular,setPopular]=React.useState([])
    const [isLoading,setIsLoading]=React.useState(false);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [isReachEnd,setReacEnd]=React.useState(meta?.reachEnd||false);
    const [error,setError]=React.useState(false);
    const [value,setValue]=React.useState(slug?.[0]==='popular' ? 1 : 0);
    const {data:dataRecommend,error:errorRecommend,mutate:mutateRecommend}=useSWR(`/v1/chord/recommendation`)
    
    const {keyboard,feedback}=useHotKeys()
    const getData=(pg,aaa)=>{
        setError(false)
        if(!isReachEnd || aaa) {
            setIsLoading(true);
            get(`/v1/chord/?page=${pg}`)
            .then(([res])=>{
                setReacEnd(!res?.can_load);
                if(aaa) {
                    setPopular(res?.data?.popular)
                    setRecent(res?.data?.recent)
                } else {
                    const a=recent;
                    const b=a.concat(res?.data?.recent)
                    setRecent(b);
                    const c=popular;
                    const d = c.concat(res?.data?.popular);
                    setPopular(d);
                }
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
        }
    }

    React.useEffect(()=>{
        setValue(slug?.[0]==='popular' ? 1 : 0)
    },[slug])

    React.useEffect(()=>{
        if(reloadedPage) {
            setReacEnd(false)
            setError(false)
            setIsLoading(true);
            setRecent([])
            setPopular([])
            mutateRecommend()
            getData(1,true)
        }
    },[reloadedPage])

    React.useEffect(()=>{
        mutateRecommend()
        if(recent?.length == 0) {
            setIsLoading(true);
            getData(page||1);
        }
    },[])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-200)) {
                if(!isLoading && !isReachEnd && !feedback && !keyboard) {
                    setIsLoading(true)
                    const {page:pg,reloadedPage,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.replace({
                        pathname:'/chord/[[...slug]]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/chord/${(slug?.[0]||'')}${pgg ? '?page='+pgg : ''}`,{shallow:true})
                    getData(pgg);
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const linkClick=(href,as)=>(e)=>{
        e.preventDefault();
        router.replace(href,as,{shallow:true});
    }

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage > 1) {
            setIsLoadingFP(true);
            get(`/v1/chord/?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res?.data?.recent;
                const b=a.concat(recent)
                setRecent(b);
                const c=res?.data?.popular;
                const d = c.concat(popular);
                setPopular(d);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    return <>
        <AppBar position='sticky' color='default' className={classNames(classes.rootAppBar,!toggleDrawer&&classes.drawerClose)}>
            <Tabs
                value={value}
                indicatorColor="primary"
                aria-label="Tab Menu"
                variant="fullWidth"
            >
                <Tab component='a' href={`/chord${page ? `?page=${page}` : ''}`} onClick={linkClick({pathname:'/chord/[[...slug]]',query:{...(page? {page:page} :{})}},`/chord${page ? `?page=${page}` : ''}`)} label="RECENT" className={classNames('MuiTab-fullWidth',classes.rootTab,value==0 ? classes.selected : '')} />
                <Tab component='a'  href={`/chord/popular${page ? `?page=${page}` : ''}`} onClick={linkClick({pathname:'/chord/[[...slug]]',query:{slug:['popular'],...(page? {page:page} :{})}},`/chord/popular${page ? `?page=${page}` : ''}`)} label="POPULAR" className={classNames('MuiTab-fullWidth',classes.rootTab,value==1 ? classes.selected : '')} />
            </Tabs>
        </AppBar>
        <Breadcrumbs title={"Chord"} sx={{pt:7}} />
        {!dataRecommend && !errorRecommend ? (
            <PaperBlock key='recommend-loading-chord' title="Recommended" whiteBg>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Skeleton type='grid' number={8} gridProps={{xs:12,sm:6}} />
                    </Grid>
                </Grid>
            </PaperBlock>
        ) : dataRecommend && (!errorRecommend) && dataRecommend?.length > 0 ? (
            <PaperBlock key='recommend-chord' title="Recommended" whiteBg>
                <Grid container spacing={2}>
                    {dataRecommend?.map((chord,i)=>(
                        <Grid key={`recommend-${chord.slug}-2`} item xs={12} sm={6}>
                            <Card style={{position:'relative'}} elevation={0} >
                                <Link href={`/chord/${chord.slug}`} passHref><a><CardActionArea>
                                    <CardContent>
                                        <div style={{position:'relative',height:80.24}}>
                                            <Typography component='p' className={classes.title}>{`${chord?.artist} - ${chord?.title}`}</Typography>
                                            <Typography variant="body2" className={classes.overfloww}>{chord.created?.format}</Typography>
                                        </div>
                                    </CardContent>
                                </CardActionArea></a></Link>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </PaperBlock>
        ) : null}

        <PaperBlock key='paperCard' title={`${slug?.[0]==='popular' ? 'Populars ' : 'Recents '} Chord`} whiteBg>
            <Grid container spacing={2}>
                {firstPage > 1 ?
                    isLoadingFP ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <IconButton onClick={handleFirstPage} size="large">
                                    <Autorenew />
                                </IconButton>
                                <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                            </div>
                        </Grid>
                    )
                : null}
                
                {error !== false ? (
                    <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typography>
                            </div>
                    </Grid>
                ) : error===false && recent.length > 0 && value===0 ? recent.map((chord,i)=>(
                    <React.Fragment key={`recent-${chord.slug}`}>
                        

                        <Grid key={`recent-${chord.slug}-2`} item xs={12} sm={6}>
                            <Card style={{position:'relative'}} elevation={0} >
                                <Link href={`/chord/${chord.slug}`} passHref><a><CardActionArea>
                                    <CardContent>
                                        <div style={{position:'relative',height:80.24}}>
                                            <Typography component='p' className={classes.title}>{`${chord?.artist} - ${chord?.title}`}</Typography>
                                            <Typography variant="body2" className={classes.overfloww}>{chord.created?.format}</Typography>
                                        </div>
                                    </CardContent>
                                </CardActionArea></a></Link>
                            </Card>
                        </Grid>
                    </React.Fragment>
                )) : error===false && popular.length && value===1 ? popular.map((chord,i)=>(
                    <React.Fragment key={`popular-${chord.slug}`}>
                        <Grid key={`popular-${chord.slug}-2`} item xs={12} sm={6}>
                            <Card style={{position:'relative'}} elevation={0} >
                                <Link href={`/chord/${chord.slug}`} passHref><a><CardActionArea>
                                    <CardContent>
                                        <div style={{height:80.24,position:'relative'}}>
                                            <Typography component='p' className={classes.title}>{`${chord?.artist} - ${chord?.title}`}</Typography>
                                            <Typography variant="body2" className={classes.overfloww}>{chord.created?.format}</Typography>
                                        </div>
                                    </CardContent>
                                </CardActionArea></a></Link>
                            </Card>
                        </Grid>
                    </React.Fragment>
                )) : null}

                {isReachEnd && (
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="body2">You've reach the bottom of pages</Typography>
                        </div>
                    </Grid>
                )}
                {isLoading && (
                    <Grid item xs={12}>
                        {recent.length > 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        ) : <Skeleton type='grid' number={8} gridProps={{xs:12,sm:6}} />}
                    </Grid>
                )}
            </Grid>
            <Link href='/chord/dashboard' passHref>
                <Fab variant="extended" color='primary' href='/chord/dashboard' className={classes.fab}>
                    <HomeIcon className={classes.extendedIcon} />
                    Dashboard
                </Fab>
            </Link>
        </PaperBlock>
    </>;
}

const HomeTab=connect(state=>({toggleDrawer:state.toggleDrawer}))(withStyles(HomeTabStyle,stylesTab))

const styleChord=(theme,_,classes)=>{
    return {
        chordTools:{
            position:'fixed',
            bottom:0,
            zIndex:99,
            transition: 'bottom .3s ease-out',
            opacity:0,
            //width:'calc(100% - 252px)'
        },
        toolsContainer:{
            backgroundColor: theme.palette.primary.main,
            'border-top-left-radius': 5,
            'border-top-right-radius': 5,
        },
        toolsBtn:{
            [theme.breakpoints.down('lg')]: {
                display:'block',
                marginTop:0,
            },
            [theme.breakpoints.up('md')]: {
                display:'inline',
                marginTop:'1rem',
            },
            paddingLeft:'.5rem',
            [`& .${classes.dense1}`]:{
                [theme.breakpoints.down('lg')]: {
                    display:'none',
                },
                [theme.breakpoints.up('md')]: {
                    display:'inline',
                },
            },
            [`& .${classes.dense2}`]:{
                [theme.breakpoints.down('lg')]: {
                    display:'inline',
                },
                [theme.breakpoints.up('md')]: {
                    display:'none',
                },
            }
        },
        dense1:{},
        dense2:{},
        chordBtn:{
            cursor:'pointer',
            fontSize:15,
            padding:'7px 20px',
            backgroundColor: theme.palette.primary.main,
            position:'relative',
            display:'none',
            top:3,
            color:'#ffffff',
            borderRadius:'10px 10px 0 0',
            [theme.breakpoints.down('lg')]: {
                display:'inline-block',
            },
        },
        divider:{
            padding:'.5rem 0',
            borderTop:`1px solid ${theme.palette.divider}`,
            '& > div':{
                [theme.breakpoints.down('md')]: {
                    paddingLeft:theme.spacing(2),
                    paddingRight:theme.spacing(2)
                },
                    [theme.breakpoints.up('sm')]: {
                    paddingLeft:theme.spacing(3),
                    paddingRight:theme.spacing(3)
                },
            }
        },
        iconBtn:{
            padding:'4px !important',
            fontSize:'15px !important',
        },
        title:{
            marginBottom:'1rem !important',
            fontWeight:'500 !important',
            textOverflow:'ellipsis',
            display:'-webkit-box!important',
            overflow:'hidden',
            WebkitBoxOrient:'vertical',
            WebkitLineClamp:2,
            '&.others': {
                fontSize:'1rem',
                fontWeight:'unset !important',
                margin:'0 !important',
                marginBottom:'0! important'
            }
        },
        root:{
            display:'flex',
            alignItems:'center',
            [`& .${classes.child}`]:{
                marginLeft:theme.spacing(0.5),
                '&:first-child':{
                    marginLeft:'0 !important'
                }
            },
        },
        child:{},
        tooltip:{
            fontSize:15
        },
    }
}
let iframe=null;
const ChordPageStyle=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    if(meta.err==='blocked') return <Paper><div style={{margin:'20px auto',textAlign:'center'}}><Typography variant="h6">Your Chord is Blocked</Typography></div></Paper>
    
    const router=useRouter();
    const {slug,ref,refid}=router.query;
    const [transpose,setTranspose]=React.useState(0);
    const [fontsize,setFontsize]=React.useState(5);
    const [toolsHeight,setToolsHeight]=React.useState(0);
    const [isTools,setIsTools]=React.useState(false)
    const [toolsBottom,setToolsBottom]=React.useState(0);
    const [scrollSpeed,setScrollSpeed]=React.useState(0);
    const [autoScroll,setAutoScroll]=React.useState(null);
    const {data,error,mutate}=useSWR(`/v1/chord/${meta?.slug}`,{fallbackData:meta?.initital});
    //const [data,setData]=React.useState(null)
    const {data:dataOthers,error:errorOthers}=useSWR(`/v1/chord/recommendation/${meta?.id}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
    })
    const [disable,setDisable]=React.useState({t:{u:false,d:false},a:{u:false,d:true},f:{u:false,d:false}});

    useMousetrap('=',(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleScroll('up')
    })
    useMousetrap('-',(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleScroll('down')
    })
    useMousetrap(['esc'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleScroll('reset')
    },true)

    const handleTranspose=(type)=>{
        let res;
        if(type==='reset') {
            res=0;
            setDisable({
                ...disable,
                t:{
                    u:false,
                    d:false
                }
            })
        } else if(type==='up') {
            res=transpose+1;
            const dis=res>=12?true:false;
            setDisable({
                ...disable,
                t:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=transpose-1;
            const dis=res<=-12?true:false;
            setDisable({
                ...disable,
                t:{
                    u:false,
                    d:dis
                }
            })
        }
        setTranspose(res);
    }

    const handleFontSize=(type)=>{
        let res;
        if(type==='reset') {
            res=5;
            setDisable({
                ...disable,
                f:{
                    u:false,
                    d:false
                }
            })
        } else if(type==='up') {
            res=fontsize+1;
            const dis=res>=10?true:false;
            setDisable({
                ...disable,
                f:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=fontsize-1;
            const dis=res<=1?true:false;
            setDisable({
                ...disable,
                f:{
                    u:false,
                    d:dis
                }
            })
        }
        setFontsize(res);
    }

    const handleScroll=(type)=>{
        let res;
        if(type==='reset') {
            res=0;
            setDisable({
                ...disable,
                a:{
                    u:false,
                    d:true
                }
            })
        } else if(type==='up') {
            res=scrollSpeed >= 5 ? 5 : scrollSpeed+1;
            const dis=res >=5 ? true : false;
            setDisable({
                ...disable,
                a:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=scrollSpeed <= 0 ? 0 : scrollSpeed-1;
            const dis=res <= 0 ? true : false;
            setDisable({
                ...disable,
                a:{
                    u:false,
                    d:dis
                }
            })
        }
        setScrollSpeed(res);
    }

    const toolsClick=()=>{
        if(isTools) {
            setIsTools(false);
            setToolsBottom(`-${toolsHeight}px`);
        } else {
            setIsTools(true);
            setToolsBottom(0);
        }
    }

    const handlePrint=()=>{
        if(isMobile) {
            return window.open("/print/chord/"+ data?.slug +"?token="+ data?.token_print +"&transpose="+transpose)
        } else {
            if(iframe!==null){
                document.body.removeChild(iframe);
            }
            iframe=document.createElement("iframe");
            iframe.style.position="absolute";
            iframe.style.left="-9999px"
            iframe.src="/print/chord/"+ data?.slug +"?token="+ data?.token_print +"&transpose="+transpose;
            document.body.appendChild(iframe)
        }
    }

    React.useEffect(()=>{
        mutate()
        const timeout=setTimeout(async()=>{
            if(process.env.NODE_ENV === 'production') {
                const url = new URL(window.location.href)
                await get(`/v1/chord/${meta?.slug}/update${url.search}`,{error_notif:false});
            }
        },5000)
        gtag.event({
            action:'select_content',
            content_type:'chord',
            item_id:meta.id
        })
        return()=>{
            handleScroll('reset')
            handleFontSize('reset')
            handleTranspose('reset')
            clearTimeout(timeout);
        }
    },[router.query,meta])

    React.useEffect(()=>{
        const onResize=()=>{
            const wii=document.getElementById('chordGridContainer').clientWidth;
            const btnn=document.getElementById('chordToolsContainer');
            const cont=document.getElementById('chordTools');

            if(isMobile) {
                cont.style.left=0
                cont.style.width=`100%`;
                setToolsBottom(`-${btnn?.offsetHeight||btnn?.clientHeight}px`);
            } else {
                if((wii-10) < 730 ) {
                    const com=document.getElementById('mainContent').clientWidth
                    cont.style.width=`${com-265}px`;
                } else {
                    cont.style.width=`${wii-10}px`;
                }
            }
            setToolsHeight(btnn?.offsetHeight||btnn?.clientHeight);
            cont.style.opacity=1;
        }

        onResize();

        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            const con=document.getElementById('renderContainer');
            const conHeight = con?.clientHeight||con?.offsetHeight ;
            const conTop=con?.offsetTop;
            //console.log((scrollTop + docHeight),(conHeight + conTop));
            if((scrollTop + docHeight) > (conHeight + conTop + 200)) {
                handleScroll('reset');
            }
        }
        
        const onMessage=(e)=>{
            if(e.origin!==process.env.URL) return;
            //if(e.origin!=='https://debug.portalnesia.com') return;
            if(typeof e.data.print === 'undefined') return;
            //console.log(iframe)
            if(iframe!==null){
                document.body.removeChild(iframe);
                iframe=null
            }
        }
        window.addEventListener('resize',onResize)
        window.addEventListener('message',onMessage)
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('resize',onResize)
            window.removeEventListener('scroll',onScroll)
            window.removeEventListener('message',onMessage)
            if(iframe!==null){
                document.body.removeChild(iframe);
                iframe=null
            }
            clearInterval(autoScroll);
        }
    },[])

    React.useEffect(()=>{
        if(autoScroll!==null) clearInterval(autoScroll)
        if(scrollSpeed > 0) {
            const skala=[0,150,110,70,45,20];
            setAutoScroll(setInterval(()=>{
                window.scrollBy(0,1);
            },skala[scrollSpeed]));
        } else {
            setAutoScroll(null)
        }
    },[scrollSpeed]);

    return (
        <div key={0}>
            <ArticleJsonLd
                url={`${process.env.URL}/chord/${meta?.slug}`}
                title={meta?.title}
                {...(meta?.image ? {images:[meta?.image]} : {})}
                datePublished={meta?.published}
                dateModified={meta?.modified}
                authorName={adddesc(meta?.authorName)}
                publisherName="Portalnesia"
                publisherLogo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
                description={adddesc(meta?.description)}
            />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Breadcrumbs routes={[{label:"Chord",href:"/chord",as:'/chord/[[...slug]]'}]} title={meta.title} />
                </Grid>
                <Grid id='chordGridContainer' item xs={12} lg={8}>
                    <PaperBlock id='cardContent' title={meta.song_title} linkColor noPaddingHeader whiteBg
                    header={ data && (
                        <div>
                            <div key='flex-1' className={`flex-header ${classes.divider}`}>
                                <div key='flex-1-1'>
                                    <Typography variant="body2">Artist: <Link href='/chord/artist/[slug]' as={`/chord/artist/${data?.slug_artist}`}><a>{meta.artist}</a></Link></Typography>
                                </div>
                                <div key='flex-1-2' style={{display:'flex',alignItems:'center'}}>
                                    <div key='flex-1-2-1' style={{marginRight:15}}>
                                        <LikeAction liked={data?.liked} type='chord' posId={data?.id} onChange={(v)=>mutate({...data,chord:{...data,liked:v}})} />
                                    </div>
                                    <div key='flex-1-2-2' style={{display:'flex',alignItems:'center'}}><VisibilityIcon style={{marginRight:5}} /><Typography variant="body2">{data?.seen?.number !== undefined && <CountUp data={data?.seen} />}</Typography></div>
                                </div>
                            </div>
                            <div key='flex-2' className={`flex-header ${classes.divider}`}>
                                <div key='flex-2-1'>
                                    <Typography variant="body2">Author: <Link href='/user/[...slug]' as={`/user/${data?.user?.username}`} passHref><a>{data?.user?.name}</a></Link></Typography>
                                </div>
                                <div key='flex-2-2'>
                                    <div className={classes.root}>
                                        <div key={0} className={classes.child}><ShareAction campaign='chord' posId={data?.id} /></div>
                                        {data?.token_print && (
                                            <div key={1} className={classes.child}>
                                                <IconButton onClick={handlePrint} size="large">
                                                    <PrintIcon />
                                                </IconButton>
                                            </div>
                                        )}
                                        <div key={2} className={classes.child}><DonationAction /></div>
                                        <div key={3} className={classes.child}><ReportAction /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    footer={
                        <Typography>Your chords aren't here? <Link href={{pathname:'/contact',query:{subject:encodeURIComponent('Request Chord')}}} as={`/chord?subject=${encodeURIComponent('Request Chord')}`} passHref><a className="underline">request your chord</a></Link> or <Link href='/chord/dashboard/[...slug]' as='/chord/dashboard/new' passHref><a className="underline">Create a new one</a></Link>.</Typography>
                    }
                    >
                        {!error && !data ? (
                            <div>
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Skeleton type='other' variant="rectangular" height={300} />
                                </div>
                                <div style={{marginTop:15}}>
                                    <Skeleton type='paragraph' />
                                </div>
                            </div>
                        ) : data ? (
                            <div>
                                {meta?.youtube!==null && meta?.youtube?.length > 0 && data?.seen?.number !== undefined && (
                                    <div key='player' style={{marginBottom:30}}>
                                        <Player
                                            url={meta?.youtube}
                                            title=''
                                            type='video'
                                            provider='youtube'
                                        />
                                    </div>
                                )}
                                <div key='ads' style={{marginBottom:30}}><AdsBanner1 /></div>
                                <div key='chord-container' id='renderContainer'>
                                    <Chord template={data?.text} transpose={transpose} style={{fontSize:(fontsize+9)}} />
                                </div>
                            </div>
                        ) : (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{error||"Failed to load data"}</Typography>
                            </div>
                        )}
                    </PaperBlock>
                    {data?.seen?.number !== undefined && <Comments type='chord' posId={data?.id} {...(ref==='comment' ? {comment_id:Number(refid)} : {})} />}
                </Grid>
                <Grid item xs={12} lg={4}>
                    <PaperBlock title='Advertisement'>
                        {!error && !data ? (
                            <div key='wrapper' style={{margin:'20px auto',textAlign:'center'}}>
                                <Skeleton type='ads' />
                            </div>
                        ) : <AdsRect /> }
                    </PaperBlock>
                    <Sidebar id='chordGridContainer' disabled={errorOthers || !dataOthers}>
                        <PaperBlock key='related-chord' title="Recommended">
                            {!errorOthers && !dataOthers ? (
                                <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                            ) : dataOthers?.relateds?.length ? dataOthers?.relateds?.map((item,i)=>(
                                <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                    <Link href='/chord/[[...slug]]' as={`/chord/${item?.slug}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <p  className={`others ${classes.title}`}>{`${item?.artist} - ${item?.title}`}</p>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            )) : errorOthers  ? (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">{errorOthers}</Typography>
                                </div>
                            ) : (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">No data</Typography>
                                </div>
                            )}
                        </PaperBlock>
                        <PaperBlock key='popular-chord' title="Popular Chords">
                            {!errorOthers && !dataOthers ? (
                                <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                            ) : dataOthers?.populars?.length ? dataOthers?.populars?.map((item,i)=>(
                                <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                    <Link href='/chord/[[...slug]]' as={`/chord/${item?.slug}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <p className={`others ${classes.title}`}>{`${item?.artist} - ${item?.title}`}</p>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            )) : errorOthers ? (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">{errorOthers}</Typography>
                                </div>
                            ) : (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">No data</Typography>
                                </div>
                            )}
                        </PaperBlock>
                        <PaperBlock key='recent-chord' title="Recent Chords">
                            {!errorOthers && !dataOthers ? (
                                <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                            ) : dataOthers?.recents?.length ? dataOthers?.recents?.map((item,i)=>(
                                <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                    <Link href='/chord/[[...slug]]' as={`/chord/${item?.slug}`} passHref><a title={`Chord ${item?.artist} - ${item?.title}`}><CardActionArea>
                                        <CardContent>
                                            <p className={`others ${classes.title}`}>{`${item?.artist} - ${item?.title}`}</p>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            )) : errorOthers ? (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">{errorOthers}</Typography>
                                </div>
                            ) : (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h6">No data</Typography>
                                </div>
                            )}
                        </PaperBlock>
                    </Sidebar>
                </Grid>
            </Grid>
            <div key={1} className={`${classes.chordTools}`} id='chordTools' style={{bottom:toolsBottom}}>
                <div key={0} onClick={toolsClick} className={classes.chordBtn}>
                    Tools
                </div>
                <div key={1} id="chordToolsContainer" className={classes.toolsContainer}>
                    <div style={{fontSize:15,color:'#ffffff',display:'flex',paddingLeft:'1rem',paddingRight:'1rem',paddingTop:4,paddingBottom:4}}>
                        <div key={0} style={{width:'33%',textAlign:'center',paddingRight:'.5rem'}}>
                            <IconButton
                                onClick={()=>handleTranspose('reset')}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'red'
                                }}
                                size="large"><CloseIcon /></IconButton>
                            <IconButton
                                onClick={()=>handleTranspose('down')}
                                disabled={disable.t.d}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'white'
                                }}
                                size="large"><KeyboardArrowDown /></IconButton>
                            <IconButton
                                onClick={()=>handleTranspose('up')}
                                disabled={disable.t.u}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'white'
                                }}
                                size="large"><KeyboardArrowUp /></IconButton>
                            <div className={classes.toolsBtn}>
                                <span key={0} className={classes.dense1} title="Transpose">Transpose: </span>
                                <span key={1} className={classes.dense2} title="Transpose">T: </span>
                                <span key={2}>{transpose}</span>
                            </div>
                        </div>
                        <div key={1} style={{width:'33%',textAlign:'center',paddingRight:'.5rem'}}>
                            <Tooltip title="Esc">
                                <IconButton
                                    onClick={()=>handleScroll('reset')}
                                    className={classNames(classes.iconBtn)}
                                    sx={{
                                        color:'red'
                                    }}
                                    size="large"><CloseIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="-">
                                <IconButton
                                    onClick={()=>handleScroll('down')}
                                    disabled={disable.a.d}
                                    className={classNames(classes.iconBtn)}
                                    sx={{
                                        color:'white'
                                    }}
                                    size="large"><KeyboardArrowDown /></IconButton>
                            </Tooltip>
                            <Tooltip title="=">
                                <IconButton
                                    onClick={()=>handleScroll('up')}
                                    disabled={disable.a.u}
                                    className={classNames(classes.iconBtn)}
                                    sx={{
                                        color:'white'
                                    }}
                                    size="large"><KeyboardArrowUp /></IconButton>
                            </Tooltip>
                            <div className={classes.toolsBtn}>
                                <span key={0} className={classes.dense1} title="Transpose">Auto scroll: </span>
                                <span key={1} className={classes.dense2} title="Transpose">AS: </span>
                                <span key={2}>{scrollSpeed}</span>
                            </div>
                        </div>
                        <div key={2} style={{width:'33%',textAlign:'center',paddingRight:'.5rem'}}>
                            <IconButton
                                onClick={()=>handleFontSize('reset')}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'red'
                                }}
                                size="large"><CloseIcon /></IconButton>
                            <IconButton
                                onClick={()=>handleFontSize('down')}
                                disabled={disable.f.d}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'white'
                                }}
                                size="large"><KeyboardArrowDown /></IconButton>
                            <IconButton
                                onClick={()=>handleFontSize('up')}
                                disabled={disable.f.u}
                                className={classNames(classes.iconBtn)}
                                sx={{
                                    color:'white'
                                }}
                                size="large"><KeyboardArrowUp /></IconButton>
                            <div className={classes.toolsBtn}>
                                <span key={0} className={classes.dense1} title="Transpose">Font: </span>
                                <span key={1} className={classes.dense2} title="Transpose">F: </span>
                                <span key={2}>{fontsize}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ChordPage=withStyles(ChordPageStyle,styleChord)

const ChordContainer=({meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query;

    return(
        <Header notBack={typeof slug === 'undefined' || typeof slug!=='undefined' && slug?.[0]==='popular'} iklan title={meta.title} desc={meta.description} active='chord' subactive={typeof slug === 'undefined' || typeof slug!=='undefined' && slug?.[0]==='popular' ? '' : 'chord_detail'} image={meta?.image||''}
        canonical={slug?.[0] && slug?.[0]!=='popular' ? `/chord/${meta?.slug}` : slug?.[0]==='popular' ? '/chord/popular' : '/chord'}
        {...(slug?.[0] && slug?.[0]!=='popular' ? {
            openGraph:{
                type:'article',
                article:{
                    authors:[`${process.env.URL}/user/${meta?.author}`],
                    publishedTime:meta?.published,
                    modifiedTime:meta?.modified
                }
            }
        }:{})}
        keyword={chordKeyword}
        >
            {typeof slug === 'undefined' || typeof slug!=='undefined' && slug?.[0]==='popular' ? (
                <HomeTab meta={meta} />
            ) : (
                <ChordPage meta={meta} />
            )}
        </Header>
    )
}

export default ChordContainer