import React from 'react'
import Header from 'portal/components/Header'
import Image from 'portal/components/Image'
import Avatar from 'portal/components/Avatar'
import {useNotif} from 'portal/components/Notification'
import PaperBlock from 'portal/components/PaperBlock'
import {styleDetail} from 'portal/components/MsgStyle'
import Skeleton from 'portal/components/Skeleton'
import {Parser} from 'portal/components/Parser'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import useSWR from 'portal/utils/swr'
import db from 'portal/utils/db'
import {time_ago,getDayJs} from 'portal/utils/Main'
import {copyTextBrowser as Kcopy, clean} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import clx from 'classnames'
import {withStyles} from 'portal/components/styles';
import {connect} from 'react-redux'
import {Hidden,Grid,Typography,CircularProgress,List,ListItemSecondaryAction,ListItem, ListItemAvatar,ListItemText,
    AppBar,Toolbar,IconButton,Menu,MenuItem} from '@mui/material'
import {Refresh,ArrowDownward,ArrowBack} from '@mui/icons-material'
import { Pagination } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {slugAs} from 'portal/components/header/Notification'

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,res,params})=>{
    const slug=params.slug;
    if(slug?.length > 1) {
        return db.redirect();
    }
    if(typeof slug !== 'undefined' && slug?.[0] !== 'portalnesia') {
        return db.redirect();
    }
    if(data.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    return {props:{}}
})

const NotifAdmComp=({classes,homeReady,toggleDrawer})=>{
    const router=useRouter();
    const {slug}=router.query
    const {setNotif}=useNotif()
    const [page,setPage]=React.useState(1);
    const [data,setData]=React.useState([]);
    const [loading,setLoading]=React.useState(false)
    const [reachEnd,setReachEnd]=React.useState(false);
    const [showBottom,setShowBottom]=React.useState(false)
    const [lastScroll,setLastScroll]=React.useState(0)
    const [cekScroll,setCekScroll]=React.useState(false)
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    const {get} = useAPI()
    const handleBack=()=>{
        if(homeReady) return router.back();
        else return router.replace('/notification/[[...slug]]',`/notification`,{shallow:true})
    }
    const getMsg=(pg,scroll)=>{
        get(`/v1/notification/portalnesia?page=${pg}`).then(([res])=>{
            if(res?.data?.length) {
                const msgId=data?.length ? `msg-${data?.[0]?.id}` : false;
                setReachEnd(!res.can_load);
                const a = pg===1 ? [] : data;
                const c = res?.data?.map(dt=>{
                    const date = getDayJs(dt?.timestamp);
                    const day = date.format("MMM DD, YYYY");
                    const time = date.format("HH:mm");
                    return {
                        ...dt,
                        day,
                        time
                    }
                })
                const b = a.concat(c);
                setData(b);
                setPage(Number(res.page))
                setTimeout(()=>{
                    const con=document.getElementById('chat-detail')
                    if(scroll && msgId) {
                        const msgCon=document.getElementById(msgId)
                        if(msgCon) con.scrollTo(0,msgCon?.offsetTop - 100)
                    } else if(!scroll) {
                        con.scrollTo(0,con.scrollHeight)
                    }
                },50)
                setTimeout(()=>{
                    setLoading(false)
                },150)
            } else {
                setLoading(false);
                setReachEnd(true)
            }
        }).catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
            setLoading(false);
        })
    }

    const handleOpenMenu = React.useCallback((menu)=>(event)=> {
        event.preventDefault();
        setOpenMenu(openMenu === menu ? null : menu);
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[openMenu]);
    
    const handleCloseMenu = React.useCallback(() => {
        setOpenMenu(null);
        setAnchorEl(null);
    },[]);

    const handleToBottom=React.useCallback(()=>{
        setCekScroll(false);
        setShowBottom(false)
        const con=document.getElementById('chat-detail')
        con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'});
    },[])

    const handleCopy=React.useCallback((text)=>(e)=>{
        if(typeof text==='string') {
            Kcopy(clean(text)).then(()=>{
                setNotif("Text copied",'default');
                handleCloseMenu();
            }).catch(()=>{})
        }
    },[])

    const handleLoadMore=()=>{
        if(!loading && !reachEnd){
            setLoading(true)
            getMsg(page + 1,true)
        }
    }

    React.useEffect(()=>{
        if(slug?.[0]==='portalnesia') {
            setReachEnd(false);
            setLoading(true);
            getMsg(1,false)
        }
    },[router.query])

    React.useEffect(()=>{
        const con=document.getElementById('chat-detail')
        const onScroll=()=>{
            if(con) {
                const st=con?.scrollTop;
                if(st <= 100) {
                    if(!loading && !reachEnd){
                        setLoading(true)
                        getMsg(page + 1,true)
                    }
                }
                if(st + con?.clientHeight >= con?.scrollHeight - 200) {
                    setShowBottom(false)
                } else if(st <= lastScroll && (st + con?.clientHeight) < con?.scrollHeight){
                    setCekScroll(true);
                    setShowBottom(false)
                } else if(st > lastScroll && (st + con?.clientHeight) < (con?.scrollHeight-200) && cekScroll===true) {
                    setShowBottom(true)
                }
                setLastScroll(st);
            }
        }
        con?.addEventListener('scroll',onScroll);
        return ()=>{
            con?.removeEventListener('scroll',onScroll);
        }
    },[loading,reachEnd,lastScroll,cekScroll,getMsg,page])

    return (
        <Header title="System Notification" canonical='/notification/administrator' noIndex full active='notification' subactive='notification_detail'>
            <div className={clx(classes.roottt,toggleDrawer ? classes.rootttWidth : classes.rootttUnWidth)}>
                <div className={clx(classes.root,classes.rootCon)}>
                    <AppBar position='absolute' square elevation={0} className={classes.header}>
                        <Toolbar>
                            <Hidden mdDown>
                                <IconButton className={classes.headerIcon} style={{marginRight:8}} onClick={handleBack} size="large">
                                    <ArrowBack />
                                </IconButton>
                            </Hidden>
                            
                            <Avatar className={classes.avatar} alt="Portalnesia">
                                <Image width={40} height={40} webp src={`${process.env.CONTENT_URL}/img/content?image=${encodeURIComponent('icon/logo.png')}&size=40&watermark=no`} alt="Portalnesia" />
                            </Avatar>
                            <Typography noWrap variant='h6' component='h6' style={{flex:1}}>
                                Portalnesia System
                                <Typography noWrap variant='caption' component='p' style={{padding:'2px 6px 2px 0'}}>
                                    @portalnesia
                                </Typography>
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    {showBottom && (
                        <div className={classes.toBottom} style={{bottom:18}}>
                            <IconButton onClick={handleToBottom} size="large">
                                <ArrowDownward />
                            </IconButton>
                        </div>
                    )}
                    <ul id='chat-detail' className={clx(classes.container,classes.conNotif)}>
                        {loading && (
                            <li key='refreshing-msg' style={{textAlign:'center'}}>
                                <div style={{margin:'20px 0'}}>
                                    <CircularProgress thickness={4.5} size={45}/>
                                </div>
                            </li>
                        )}
                        {reachEnd ? (
                            <li key='info-msg' style={{textAlign:'center'}}>
                                <div style={{fontSize:13,margin:'20px 0'}}>
                                    <Typography>No more notification</Typography>
                                </div>
                            </li>
                        ) : !reachEnd && !loading ? (
                            <li key='refresh-msg' style={{textAlign:'center'}}>
                                <IconButton onClick={handleLoadMore} size="large">
                                    <Refresh />
                                </IconButton>
                            </li>
                        ) : null}
                        {data?.length ? data?.map((dt,i)=>(
                            <React.Fragment key={`fragment-msg-${dt?.id}`}>
                                {dt?.day !== data?.[i-1]?.day && (
                                    <li className={classes.date} key={`date-${dt?.id}`}>
                                        <span>{dt?.day}</span>
                                    </li>
                                )}
                                <li id={`msg-${dt?.id}`} key={`msg-${dt?.id}`} className={clx(classes.left)}>
                                    <div className={classes.chat}>
                                        <div className={classes.chatP}>
                                            <div onContextMenu={handleOpenMenu(`right-menu-${dt?.id}`)} className={`${classes.chatSpan} noselect`}>
                                                {dt?.image !==null && (
                                                    <Image fancybox src={`${dt?.image}&size=200`} dataSrc={`${dt?.photo}&watermark=no`} webp style={{maxWidth:200,maxHeight:200,marginBottom:5}} alt={dt?.message} />
                                                )}
                                                <Parser style={{marginBottom:5}} html={dt?.message} noMargin />
                                                <div className={classes.info}>
                                                    <Typography component='time'>{dt?.time}</Typography>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Menu
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                        }
                                        open={openMenu === `right-menu-${dt?.id}`}
                                        onClose={handleCloseMenu}
                                    >
                                        <MenuItem key={0} onClick={handleCopy(dt?.message)}>Copy</MenuItem>
                                    </Menu>
                                </li>
                            </React.Fragment>
                        )) : null}
                    </ul>
                </div>
            </div>
        </Header>
    );
}
const NotifAdm = connect(state=>({toggleDrawer:state.toggleDrawer}))(withStyles(NotifAdmComp,styleDetail))

const styles=(theme)=>({
    action:{
        paddingRight:'96px !important'
    },
    selected:{
        background:`${alpha(theme.palette.primary.light,0.25)}`,
    }
})

const NotificationHomeComp=({classes,user})=>{
    const router=useRouter();
    const {page}=router.query
    const {data:dataa,error} = useSWR(`/v1/notification?page=${page||1}`)

    const handlePagination = (event, value) => {
        router.push({
            pathname:'/notification/[[...slug]]',
            query:{
                page:value
            }
        },`/notification?page=${value}`,{shallow:true})
    };

    const handleClick=(dt)=>()=>{
        router.push(dt?.url,dt?.as,dt?.shallow ? {shallow:true} : undefined);
    }

    const data = React.useMemo(()=>{
        if(!dataa) return undefined;
        const data = dataa?.data.map(p=>{
            if(p?.type == 'comment') {
                let query={};
                const as = (p?.url)?.replace((process.env.DOMAIN||''),"");
                const queryParams = as.split("?")[1];
                if(queryParams.length > 0) query = QS.parse(queryParams);
                p.as = {
                    pathname:as,
                    query
                };
                p.url = {
                    pathname:typeof slugAs?.[p.comment_type] !== 'undefined' ?  slugAs?.[p.comment_type] : '/',
                    query
                };
            }
            if(p?.type === 'messages') {
                p.as = `/messages/${p?.username}`
                p.url = "/messages/[[...slug]]"
            }
            if(p?.type == "notification") {
                p.as = `/notification/portalnesia`
                p.url = "/notification/[[...slug]]"
                p.shallow=true;
            }
            if(p?.type == "support") {
                p.as = `/support/${p?.support_id}`
                p.url = "/support/[[...slug]]"
            }
            if(p?.type=='follow' && p?.username) {
                const query = {ref:'notification',refid:`${p?.id}`}
                p.as = {
                    pathname:`/user/${p?.username}`,
                    query
                }
                p.url = {
                    pathname:"/user/[...slug]",
                    query
                }
            }
            if(p?.type=='follow_pending') {
                p.as = `/user/${user?.user_login}/friend-request`;
                p.url = "/user/[...slug]"
            }
            return p;
        })
        return {
            ...dataa,
            data
        };
    },[dataa,error])

    return (
        <Header title="Notification" canonical='/notification' noIndex
        >
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock title='Notification' noPadding divider={false} whiteBg
                    footer={
                        <Pagination color='primary' count={data ? data?.total_page : 1} page={data ? data?.page : 1} boundaryCount={3} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }>  
                        {!data && !error ? (
                            <Skeleton type='list' number={8} image />
                        ) : data && data?.data?.length === 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">There is no notification.</Typography>
                            </div>
                        ) : error ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{error}</Typography>
                            </div>
                        ) : data ? (
                            <List>
                                {data?.data?.map((dt,i)=>(
                                    <ListItem key={`${i.toString()}`} button divider onClick={handleClick(dt)} classes={{container:'not-even-old',secondaryAction:classes.action}} {...(!dt?.read ? {className:classes.selected} : {})}>
                                        <ListItemAvatar>
                                            {dt?.picture!==null ? (
                                                <Avatar alt={dt?.name}>
                                                    <Image width={40} height={40} webp src={`${dt?.picture}&size=40&watermark=no`} alt={dt?.name} />
                                                </Avatar>
                                            ) : (
                                                <Avatar alt={dt?.name}>{dt?.name}</Avatar>
                                            )}
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={dt?.name}
                                            secondary={dt?.message}
                                        />
                                        <ListItemSecondaryAction>
                                            <Typography noWrap variant='caption' component='span'>{time_ago(dt?.timestamp)}</Typography>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        ) : null}
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    )
}
const NotificationHome = connect(state=>({user:state.user}))(withStyles(NotificationHomeComp,styles))

const Notification=({err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query
    const [sudahHome,setSudahHome]=React.useState(false);

    React.useEffect(()=>{
        if(typeof slug==='undefined') setSudahHome(true)
    },[slug])

    if(typeof slug === 'undefined') return <NotificationHome />
    else return <NotifAdm homeReady={sudahHome} />
}

export default Notification