import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import Comments from 'portal/components/Comments'
import Player from 'portal/components/Player'
import Button from 'portal/components/Button'
import {useNotif,useAPI,db,getLocal,useHotKeys,ApiError} from 'portal/utils'
import {truncate as Ktruncate,copyTextBrowser as Kcopy,specialHTML} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import clx from 'classnames';
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import {connect} from 'react-redux';
import useSWR from 'portal/utils/swr';
import {isMobile} from 'react-device-detect';
import {ListItemIcon,Grid,Typography,IconButton,AppBar,Tabs,Tab,CircularProgress,Menu,MenuItem,TextField,Divider} from '@mui/material'
import Link from 'next/link'
import TweetEmbed from 'react-tweet-embed'
import {MoreVert as MoreVertIcon,Autorenew,Delete,FileCopy} from '@mui/icons-material';
import style from 'portal/styles/Home.module.css'
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'
import ReCaptcha from 'portal/components/ReCaptcha'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));
const CombineAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.CombineAction))
const LikeAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.LikeAction))
const AdsRect=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsRect))
const AdsBanner1=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsBanner1))
const AdsBanner2=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsBanner2))
const CountUp=dynamic(()=>import('portal/components/CountUp'))
const Image=dynamic(()=>import('portal/components/Image'))
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export const getServerSideProps = wrapper(async({pn:data,token,req,res,params})=>{
    const slug=params.slug;
    if(slug?.length > 1) {
        return db.redirect();
    }
    const meta={
        title:"Twitter Thread Reader",
        description:'Read twitter thread more easy',
    }
    if(typeof slug !== 'undefined' && slug?.[0]!=='popular') {
        try {
            const thread = await db.get("twitter_thread",{tweet_id:slug[0]},{limit:1});
            if(!thread) return db.redirect();

            const {screen_name,id:tweet_id,tweet_id:id,tweet} = thread;
            const twt = JSON.parse(tweet);
            const firstTweet = twt[0].full_text.replace(/\&amp\;/g,"&").replace(/\n/g,"<br />");
            meta.description = Ktruncate(firstTweet.replace("",""),300);
            meta.title=`Threads by @${screen_name}`;
            meta.image=`${process.env.CONTENT_URL}/ogimage/thread/${id}`
            meta.screen_name=screen_name;
            meta.id=id;
            meta.tweet_id=tweet_id;
            try {
                const a = await getLocal(token,`/v1/twitter/thread/${slug[0]}`)
                meta.initial = a;
            } catch {
                meta.initial=null;
            }
            return {props:{meta:meta}}
        } catch(err) {
            console.log(err)
            if(res) res.statusCode=503;
            return {props:{err:503}}
        }
    } else {
        return {props:{meta:meta}}
    }
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
        WebkitLineClamp:1
        // height: 40
    },
    description:{
        fontSize:'.9rem !important',
        marginBottom:'1rem !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:3,
        position:'absolute !important',
        top:40,
        left:0
        // height: 80.8
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
        // height: 16.1
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
            bottom: `${theme.spacing(2) + 56} !important`,
        },
    }
})

const HomeTabStyle=({classes,meta,toggleDrawer})=>{
    const router=useRouter();
    const {setNotif}=useNotif()
    const {slug,page,reloadedPage,url:urlInput}=router.query;
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [recent,setRecent]=React.useState([])
    const [popular,setPopular]=React.useState([])
    const [isLoading,setIsLoading]=React.useState(true);
    const [isReachEnd,setReacEnd]=React.useState(false);
    const [error,setError]=React.useState(false);
    const [input,setInput]=React.useState("")
    const [disable,setDisable]=React.useState(false);
    const [result,setResult]=React.useState(null)
    const [value,setValue]=React.useState(slug?.[0]==='popular' ? 1 : 0);
    const captchaRef=React.useRef(null)
    const {get,post} = useAPI()
    const {keyboard,feedback}=useHotKeys()
    const {data:dataRecommend,error:errorRecommend,mutate:mutateRecommend}=useSWR(`/v1/twitter/thread/recommendation`)
    const getData=(pg,aaa)=>{
        setError(false)
        if(!isReachEnd || aaa) {
            setIsLoading(true);
            get(`/v1/twitter/thread?page=${pg}`)
            .then(([res])=>{
                setReacEnd(!res?.can_load);
                if(aaa) {
                    setRecent(res?.data?.recent)
                    setPopular(res?.data?.popular)
                } else {
                    const a=recent;
                    const b=a.concat(res?.data?.recent)
                    setRecent(b);
                    const c=popular;
                    const d=c.concat(res?.data?.popular)
                    setPopular(d);
                }
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
        }
    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        if(input.trim().match(/twitter\.com/)) {
            setDisable(true)
            captchaRef.current?.execute()
            .then((recaptcha)=>post(`/v1/twitter/thread`,{url:input,recaptcha},{},{success_notif:false}))
            .then(([res])=>{
                setDisable(false)
                setResult(res)
            }).catch(err=>{
                setDisable(false)
            })
        } else {
            setNotif("Invalid URL",true);
        }
    }

    React.useEffect(()=>{
        setValue(slug?.[0]==='popular' ? 1 : 0)
    },[slug])

    React.useEffect(()=>{
        if(reloadedPage) {
            setError(false)
            setReacEnd(false)
            setIsLoading(true);
            setRecent([])
            setPopular([])
            getData(1,true)
            mutateRecommend()
        }
    },[reloadedPage])

    React.useEffect(()=>{
        if(urlInput) {
            setInput(decodeURIComponent(urlInput))
        }
    },[urlInput])

    React.useEffect(()=>{
        mutateRecommend()
        if(recent.length == 0) {
            setIsLoading(true);
            getData(page||1);
        }
    },[])

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage!==1) {
            setIsLoadingFP(true);
            get(`/v1/twitter/thread?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res?.data?.recent;
                const b=a.concat(recent)
                setRecent(b);
                const c=res?.data?.popular;
                const d = c.concat(popular);
                setPopular(d);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch(()=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-200)) {
                if(!isLoading && !isReachEnd && !feedback && !keyboard) {
                    setIsLoading(true);
                    const {page:pg,reloadedPage,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.replace({
                        pathname:'/twitter/thread/[[...slug]]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/twitter/thread/${(slug?.[0]||'')}${pgg ? '?page='+pgg : ''}`,{shallow:true})
                    getData(pgg)
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

    return <>
        <AppBar position='sticky' color='default' className={clx(classes.rootAppBar,!toggleDrawer&&classes.drawerClose)}>
            <Tabs
                value={value}
                indicatorColor="primary"
                aria-label="Tab Menu"
                variant="fullWidth"
            >
                <Tab component='a' onClick={linkClick({pathname:'/twitter/thread/[[...slug]]',query:{...(page? {page:page} :{})}},`/twitter/thread${page ? `?page=${page}` : ''}`)} href={`/twitter/thread${page ? `?page=${page}` : ''}`} label="RECENT" className={clx('MuiTab-fullWidth',classes.rootTab,value==0 ? classes.selected : '')} />
                <Tab component='a' onClick={linkClick({pathname:'/twitter/thread/[[...slug]]',query:{slug:['popular'],...(page ? {page:page} :{})}},`/twitter/thread/popular${page ? `?page=${page}` : ''}`)} href={`/twitter/thread/popular${page ? `?page=${page}` : ''}`} label="POPULAR" className={clx('MuiTab-fullWidth',classes.rootTab,value==1 ? classes.selected : '')} />
            </Tabs>
        </AppBar>
        <Breadcrumbs title="Twitter Thread" sx={{pt:7}} />
        <PaperBlock key={0} whiteBg>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Thread URL"
                    variant='outlined'
                    fullWidth
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    disabled={disable}
                />
                <Divider style={{margin:'20px 0'}} />
                <div key='button' style={{textAlign:'center'}}><Button disabled={disable} loading={disable} type='submit' icon='submit'>Submit</Button></div>
                {result!==null && (
                    <div>
                        <Divider style={{margin:'30px 0'}} />
                        <Typography gutterBottom>
                            {result?.title.split("\n").map((t,idx)=>(
                                <React.Fragment key={`fragment-tweet-${idx}`}>
                                    {t.match(/\S/) !== null && <span key={`tweet-${idx}`}>{t}</span>}
                                    <br />
                                </React.Fragment>
                            ))}
                        </Typography>
                        <Link href='/twitter/thread/[[...slug]]' as={`/twitter/thread/${result?.id}`} passHref><a><Button>Read Thread</Button></a></Link>
                    </div>
                )}
            </form>
        </PaperBlock>

        {!dataRecommend && !errorRecommend ? (
            <PaperBlock key='recommend-loading' title="Recommended" whiteBg>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Skeleton type='grid' number={8} gridProps={{xs:12,sm:6}} />
                    </Grid>
                </Grid>
            </PaperBlock>
        ) : dataRecommend && dataRecommend?.length > 0 ? (
            <PaperBlock key='recommend' title="Recommended" whiteBg>
                <Grid container spacing={2}>
                    {dataRecommend?.map((dt,i)=>{
                        const twt=specialHTML(dt?.title).replace(/\n{2,}/gim,"\n");
                        return (
                            <Grid key={`recommend-${dt.id}-2`} item xs={12} sm={6}>
                                <Card style={{position:'relative'}} elevation={0} >
                                    <Link href={`/twitter/thread/${dt.id}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <div style={{height:(40+80.8+16.1),position:'relative'}}>
                                                <Typography component='p' className={classes.title}>{`Threads by @${dt?.screen_name}`}</Typography>
                                                <Typography component='p' className={classes.description}>
                                                    {twt?.replace(`Threads by @${dt?.screen_name}: `,"").split("\n").map((t,idx)=>(
                                                        <React.Fragment key={`fragment-tweet-${i}-${idx}`}>
                                                            {t.match(/\S/) !== null && <span key={`tweet-${i}-${idx}`}>{t}</span>}
                                                            <br />
                                                        </React.Fragment>
                                                    ))}
                                                </Typography>
                                                <Typography variant="body2" className={classes.overfloww}>{dt?.created?.format}</Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </PaperBlock>
        ) : null}

        <PaperBlock whiteBg key={1} title={`${slug?.[0]==='popular' ? 'Popular ' : 'Recent '}Threads`}>
            <Grid container spacing={2}>
                {firstPage!==1 ?
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

                {error!==false && !isLoading ? (
                    <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typography>
                            </div>
                    </Grid>
                ) : error === false && popular.length > 0 && value===1 ? popular.map((dt,i)=>{
                    const twt=specialHTML(dt?.title).replace(/\n{2,}/gim,"\n");
                    return(
                        <React.Fragment key={`popular-${dt.id}`}>
                            <Grid key={`popular-${dt.id}-2`} item xs={12} sm={6}>
                                <Card style={{position:'relative'}} elevation={0} >
                                    <Link href={`/twitter/thread/${dt.id}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <div style={{height:(40+80.8+16.1),position:'relative'}}>
                                                <Typography component='p' className={classes.title}>{`Threads by @${dt?.screen_name}`}</Typography>
                                                <Typography component='p' className={classes.description}>
                                                    {twt?.replace(`Threads by @${dt?.screen_name}: `,"").split("\n").map((t,idx)=>(
                                                        <React.Fragment key={`fragment-tweet-${i}-${idx}`}>
                                                            {t.match(/\S/) !== null && <span key={`tweet-${i}-${idx}`}>{t}</span>}
                                                            <br />
                                                        </React.Fragment>
                                                    ))}
                                                </Typography>
                                                <Typography variant="body2" className={classes.overfloww}>{dt?.created?.format}</Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            </Grid>
                        </React.Fragment>
                    )
                }) : error === false && recent.length > 0 && value===0 ? recent.map((dt,i)=>{
                    const twt=specialHTML(dt?.title).replace(/\n{2,}/gim,"\n");
                    return(
                        <React.Fragment key={`recent-${dt.id}`}>
                            <Grid key={`recent-${dt.id}-2`} item xs={12} sm={6}>
                                <Card style={{position:'relative'}} elevation={0} >
                                    <Link href={`/twitter/thread/${dt.id}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <div style={{height:(40+80.8+16.1),position:'relative'}}>
                                                <Typography component='p' className={classes.title}>{`Threads by @${dt?.screen_name}`}</Typography>
                                                <Typography component='p' className={classes.description}>
                                                    {twt?.replace(`Threads by @${dt?.screen_name}: `,"").split("\n").map((t,idx)=>(
                                                        <React.Fragment key={`fragment-tweet-${i}-${idx}`}>
                                                            {t.match(/\S/) !== null && <span key={`tweet-${i}-${idx}`}>{t}</span>}
                                                            <br />
                                                        </React.Fragment>
                                                    ))}
                                                </Typography>
                                                <Typography variant="body2" className={classes.overfloww}>{dt?.created?.format}</Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            </Grid>
                        </React.Fragment>
                    )
                }) : null }

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
        </PaperBlock>
        <ReCaptcha ref={captchaRef} />
    </>;
}

const HomeTab=connect(state=>({toggleDrawer:state.toggleDrawer}))(withStyles(HomeTabStyle,stylesTab))

const styles=(theme,_,classes)=>{
    return {
        divider:{
            paddingTop:'.5rem !important',
            borderTop:`1px solid ${theme.palette.divider}`,
            '& > div':{
                [theme.breakpoints.down('sm')]: {
                    paddingLeft:`${theme.spacing(2)} !important`,
                    paddingRight:`${theme.spacing(2)} !important`,
                },
                    [theme.breakpoints.up('sm')]: {
                    paddingLeft:`${theme.spacing(3)} !important`,
                    paddingRight:`${theme.spacing(3)} !important`,
                },
            },
            '&.pbottom':{
                paddingBottom:'.5rem !important',
            }
        },
        wrapper:{
            position:'relative',
            borderBottom:`1px solid ${theme.palette.divider}`,
            '&:last-child':{
                borderBottom:`none`,
            },
            [`& .${classes.child}`]:{
                [theme.breakpoints.down('sm')]: {
                    paddingLeft:theme.spacing(2),
                    paddingRight:theme.spacing(2),
                },
                    [theme.breakpoints.up('sm')]: {
                    paddingLeft:theme.spacing(3),
                    paddingRight:theme.spacing(3),
                },
            },
            '&:hover':{
                [`& .${classes.option}`]:{
                    opacity:1
                }
            }
        },
        child:{
            padding:'48px 0 !important',
        },
        option:{
            position:'absolute',
            top:5,
            right:5,
            opacity:isMobile?0.7:0
        },
        title:{
            textOverflow:'ellipsis',
            display:'-webkit-box!important',
            overflow:'hidden',
            WebkitBoxOrient:'vertical',
            WebkitLineClamp:3,
        },
    }
}

const ThreadPageStyles=({classes,meta,user,theme})=>{
    const router=useRouter();
    const {post,del} = useAPI()
    const {slug,ref,refid}=router.query;
    const {data,error,mutate}=useSWR(`/v1/twitter/thread/${meta?.id}`,{fallbackData:meta?.initial});
    const {data:dataOthers,error:errorOthers}=useSWR(`/v1/twitter/thread/recommendation/${meta?.tweet_id}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
    })
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    const [loading,setLoading]=React.useState('')
    const {setNotif}=useNotif()
    

    const handleMenu=menu=>(e)=>{
        setOpenMenu(openMenu === menu ? null : menu);
        setAnchorEl(e.currentTarget);
    }

    const handleClose = () => {
        setOpenMenu(null);
        setAnchorEl(null);
    };

    const handleReload=(e)=>{
        e.preventDefault()
        setLoading('reload')
        post(`/v1/twitter/thread/${slug[0]}`,null,{},{success_notif:false}).then(([res])=>{
            setLoading(null)
            const aa = data.tweets
            const b = aa.concat(res)
            mutate({
                ...data,
                tweets:b
            })
        }).catch(err=>{
            setLoading(null)
        })
    }

    const handleDeleteTweet=(index)=>()=>{
        handleClose();
        if(user?.admin===true) {
            del(`/v1/twitter/thread/${slug[0]}?index=${index}`).then(()=>{
                const aa = data?.tweets
                aa.splice(index,1)
                mutate({
                    ...data,
                    tweets:aa
                })
            }).catch(err=>{
                
            })
        } 
    }

    const handleDelete=()=>{
        if(user?.admin===true) {
            setLoading('delete')
            del(`/v1/twitter/thread/${slug[0]}?index=${index}`).then(()=>{
                setLoading(null)
                router.push('/twitter/thread/[[...slug]]','/twitter/thread')
            }).catch(err=>{
                setLoading(null)
            })
        }
    }

    const handleCopyText=(i)=>{
        if(data?.tweets?.[i]?.tweet) {
            Kcopy(data?.tweets?.[i]?.tweet).then(()=>{
                setNotif("Tweet copied",'default')
            }).catch(()=>{
                setNotif("Something went wrong when trying to copy tweet",true)
            })
        }
        handleClose();
    }

    /*React.useEffect(()=>{
        if(dataa) setData(dataa)
        setLoading(null)
    },[dataa])*/

    React.useEffect(()=>{
        //setLoading('loading')
        const timeout=setTimeout(async()=>{
            if(process.env.NODE_ENV === 'production') {
                const url = new URL(window.location.href)
                if(meta?.id) await get(`/v1/twitter/thread/${meta?.id}/update${url.search}`);
            }
            gtag.event({
                action:'select_content',
                content_type:'twitter_thread',
                item_id:meta.tweet_id
            })
        },5000)
        return ()=>clearTimeout(timeout)
    },[meta])

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Breadcrumbs routes={[{label:"Twitter Thread",href:"/twitter/thread",as:"/twitter/thread/[[...slug]]"}]} title={meta?.title} />
            </Grid>
            <Grid id='cardContainer' item xs={12} lg={8}>
                <PaperBlock whiteBg noPadding linkColor noPaddingHeader title={`Threads by @${meta?.screen_name}`}
                header={data ? (
                    <div>
                        <div key='header-1' className={`flex-header ${classes.divider} pbottom`}>
                            <div key='header-1-1'>
                                <Typography variant="body2"><a target='_blank' rel='nofollow noopener noreferrer' href={`https://twitter.com/${meta?.screen_name}/status/${meta?.id}`}>Original Thread</a></Typography>
                            </div>
                            <div key='header-1-2'><Typography variant="body2"><CountUp data={data?.seen} /> views</Typography></div>
                        </div>
                        <div key='header-2' className={`flex-header ${classes.divider}`}>
                            <div key='header-2-1'>
                                <LikeAction
                                    liked={data?.liked}
                                    onChange={(e)=>mutate({...data,liked:e})}
                                    type='thread'
                                    posId={meta.tweet_id}
                                />
                            </div>
                            <div key='header-2-2'>
                                <CombineAction
                                    list={{
                                        share:{
                                            campaign:'twitter thread',
                                            posId:meta.tweet_id
                                        },
                                        donation:true,
                                        report:true
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : ""
                }
                footer={
                    <div className='flex-header'>
                        <Typography>Missing tweets? <a disabled={loading==='reload'} onClick={handleReload}>Click here</a> to reload.</Typography>
                        {user?.admin===true && <IconButton onClick={handleDelete} disabled={loading==='delete'} size="large"><Delete /></IconButton>}
                    </div>
                }
                >
                    {(!error && !data) ? (
                        <Skeleton type='paragraph' number={3} />
                    ) : error ? (
                        <div key='error' style={{margin:'20px auto',textAlign:'center'}}>
                            <Typography variant="h5">{error}</Typography>
                        </div>
                    ) : data?.tweets?.length > 0 ? (
                        <div key='data'>
                            {data?.tweets?.map((dt,i)=>(
                                <React.Fragment key={`div-div-${i}`}>
                                    {i==Math.round(data?.tweets?.length/3) && data?.tweets?.length > 4 ? (
                                        <div key={`div-ads-1`} className={classes.wrapper}>
                                            <div className={classes.child}>
                                                <AdsBanner1 />
                                            </div>
                                        </div>
                                    ) : i==Math.round(2*data?.tweets?.length/3) && data?.tweets?.length > 4 ? (
                                        <div key={`div-ads-2`} className={classes.wrapper}>
                                            <div className={classes.child}>
                                                <AdsBanner2 />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div key={`div-index-${i}`} className={classes.wrapper}>
                                        <div key='div-2' className={classes.option}>
                                            <IconButton onClick={handleMenu(`menu-${i}`)} size="large"><MoreVertIcon /></IconButton>
                                        </div>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={openMenu === `menu-${i}`}
                                            onClose={handleClose}
                                        >
                                            <MenuItem key='menu-0' onClick={()=>handleCopyText(i)}><ListItemIcon><FileCopy /></ListItemIcon> Copy text</MenuItem>
                                            {user?.admin===true && <MenuItem key='menu-1' onClick={handleDeleteTweet(i)}><ListItemIcon><Delete /></ListItemIcon> Delete tweet</MenuItem>}
                                        </Menu>
                                        <div key='div-3' className={`${classes.child} noselect`}>
                                            <Typography variant="body1" component='p'>
                                                {dt?.tweet?.split("\n").map((t,idx)=>{
                                                    const twt=t.match(/\S/) !== null ? specialHTML(t) : "";
                                                    return (
                                                        <React.Fragment key={`fragment-tweet-${i}-${idx}`}>
                                                            {twt.match(/\S/) !== null && <span key={`tweet-${i}-${idx}`}>{twt}</span>}
                                                            <br />
                                                            </React.Fragment>
                                                    )
                                                })}

                                                {dt?.urls?.length > 0 ? dt?.urls?.map((u,ii)=>
                                                    u?.url.match(/^https?\:\/\/twitter\.com/)===null ? (
                                                        <React.Fragment key={`fragment-url-${i}-${ii}`}>
                                                            <a key={`url-${i}-${ii}`} href={u.url} target='_blank' rel='nofollow noopener noreferrer'>{u?.text}</a>
                                                            <br />
                                                        </React.Fragment>
                                                    ) : null
                                                ) : null}
                                            </Typography>
                                            {dt?.media ? dt?.media?.photo_count > 2 ? (
                                                <div key='div-4' style={{marginTop:'1rem'}} className={style.masonry}>
                                                    {dt?.media?.urls?.map((m,ii)=>{
                                                        if(m?.type == 'photo') {
                                                            return (
                                                                <div key={`image-${i}-${ii}`} className={style.brick} style={{width:'100%'}}>
                                                                    <Image blured style={{maxWidth:'100%'}} src={`${process.env.CONTENT_URL}/img/url?output=webp&height=200&size=350&image=${encodeURIComponent(m.url)}`} dataSrc={m.url} webp fancybox className={style['image-container']} />
                                                                </div>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                                ) : dt?.media?.photo_count > 0 && dt?.media?.photo_count <= 2 ? (
                                                    <div key='div-4' style={{marginTop:'1rem'}}><center>
                                                        {dt?.media?.urls?.map((m,ii)=>{
                                                            if(m?.type == 'photo') {
                                                                return (
                                                                    <div key={`image-${i}-${ii}`} style={{width:'100%'}}>
                                                                        <Image blured style={{maxWidth:'100%'}} src={`${process.env.CONTENT_URL}/img/url?output=webp&height=200&size=350&image=${encodeURIComponent(m.url)}`} dataSrc={m.url} webp fancybox className={style['image-container']} />
                                                                    </div>
                                                                )
                                                            }
                                                        })}
                                                    </center></div>
                                                ) : dt?.media?.video_count > 0 ? 
                                                    dt?.media?.urls?.map((m,ii)=>{
                                                        if(m?.type != 'photo') {
                                                            return (
                                                                <div key='div-4' style={{marginTop:'1rem'}}><center>
                                                                    <div style={{width:'100%',maxWidth:400}}>
                                                                        <Player
                                                                            type='video'
                                                                            thumbnails={`${process.env.CONTENT_URL}/img/url?size=800&image=${dt?.media?.poster}`}
                                                                            url={m?.url}
                                                                        />
                                                                    </div>
                                                                </center></div>
                                                            )
                                                        } 
                                                    })
                                                : null
                                            : null}
                                            {dt?.urls?.length > 0 ? dt?.urls?.map((u,ii)=>
                                                u?.url.match(/^https?\:\/\/twitter\.com/) ? (
                                                    <TweetEmbed
                                                        key={`tweetembed-${i}-${ii}`}
                                                        id={u?.id}
                                                        options={{
                                                            conversation:'none',
                                                            align:'center',
                                                            theme:theme
                                                        }}
                                                    />
                                                ) : null
                                            ) : null}
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                            {loading==='reload' && (
                                <div key='reload' style={{margin:'20px auto',textAlign:'center'}}>
                                    <CircularProgress thickness={5} size={50}/>
                                </div>
                            )}
                        </div>
                    ) : null }
                </PaperBlock>
                <Comments type='twitter_thread' posId={meta.tweet_id} {...(ref==='comment' ? {comment_id:Number(refid)} : {})} />
            </Grid>
            <Grid item xs={12} lg={4}>
                <PaperBlock title='Advertisement'>
                    {(!error && !data) || loading==='loading' ? (
                        <Skeleton type='ads' />
                    ) : <AdsRect /> }
                </PaperBlock>
                <Sidebar id='cardContainer' disabled={(!error && !data && !errorOthers && !dataOthers) || loading==='loading'}>
                    <PaperBlock title="Recommended">
                        {!errorOthers && !dataOthers ? (
                            <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                        ) : errorOthers ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">Failed to load data</Typography>
                            </div>
                        ) : dataOthers?.length ? dataOthers?.map((item,i)=>{
                            const twt=specialHTML(item?.title).replace(/\n{2,}/gim,"\n");
                            return(
                                <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                    <Link href={`/twitter/thread/${item?.id}`} passHref><a title={item?.title}><CardActionArea>
                                        <CardContent>
                                            <Typography component='p' className={classes.title}>{twt}</Typography>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            )
                        }) : (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">No thread</Typography>
                            </div>
                        )}
                    </PaperBlock>
                </Sidebar>
            </Grid>
        </Grid>
    );
}
const ThreadPage = connect(state=>({user:state.user,theme:state.redux_theme}))(withStyles(ThreadPageStyles,styles))

const ThreadContainer=({err,meta})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query;

    return(
        <Header iklan navTitle="Twitter Thread" active='thread' subactive={typeof slug === 'undefined' || typeof slug!=='undefined' && slug?.[0]==='popular' ? '' : 'twitter_detail'} title={meta?.title} desc={meta?.description} image={meta?.image||''} keyword='twitter, thread, reader, utas, baca utas, thread reader' canonical={slug?.[0] && slug?.[0]!=='popular' ? `/twitter/thread/${meta?.slug}` : slug?.[0]==='popular' ? '/twitter/thread/popular' : '/twitter/thread'}>
            {typeof slug === 'undefined' || typeof slug!=='undefined' && slug?.[0]==='popular' ? (
                <HomeTab meta={meta} />
            ) : (
                <ThreadPage meta={meta} />
            )}
        </Header>
    )
}

export default ThreadContainer