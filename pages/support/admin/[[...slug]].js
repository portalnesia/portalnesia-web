import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import Avatar from 'portal/components/Avatar'
import {useNotif} from 'portal/components/Notification'
import {Parser} from 'portal/components/Parser'
import {styles,styleList,styleDetail} from 'portal/components/MsgStyle'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import {useAPI,db,useSocket,getDayJs} from 'portal/utils'
import {copyTextBrowser as Kcopy,clean} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import {connect} from 'react-redux'
import clx from 'classnames'
import Slidedown from 'react-slidedown'
import dayjs from 'dayjs'
import {isMobile} from 'react-device-detect'
import {withStyles} from 'portal/components/styles';
import {Hidden,ListItemIcon,Drawer,Paper,Typography, AppBar,Divider,List,ListItemAvatar,ListItem,ListItemText,IconButton,Menu,MenuItem,Badge,
    Toolbar,CircularProgress,TextareaAutosize} from '@mui/material'
import {Search as SearchIcon,Info as InfoIcon,ArrowBack,Send as SendIcon,Done,DoneAll,Refresh,ArrowDownward,
    Close as CloseIcon,Image as ImageIcon,FileCopy} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export const getServerSideProps = wrapper(async({pn:data,params})=>{
    const slug=params.slug;
    if(slug?.length > 1) {
        return db.redirect();
    }
    if(data.user === null || data.user?.admin !== true) {
        return db.redirect();
    }
    const meta={
        title:'Support Admin'
    }
    if(typeof slug !== 'undefined') {
        const userss=await db.get("support",{unik:slug?.[0]},{limit:1});
        if(!userss) {
            return db.redirect();
        }
        const {subjek}=userss;
        meta.title=`${subjek} - Support Admin`
    }
    return {props:{meta:meta}}
})

let pindah=false,badgee=0;
const SupportDetailComp=({classes,homeReady,selected,users,initImage,changeStatus})=>{
    const router=useRouter()
    const socket=useSocket();
    const [input,setInput]=React.useState({message:''})
    const [imageUrl,setImageUrl]=React.useState(null);
    const [image,setImage]=React.useState(null);
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    const [loading,setLoading]=React.useState(true);
    const [reachEnd,setReachEnd]=React.useState(false);
    const [lastId,setLastId] = React.useState(0);
    const [data,setData]=React.useState([]);
    const [notif,setNotiff]=React.useState(null);
    const {setNotif}=useNotif()
    const [showBottom,setShowBottom]=React.useState(false)
    const [lastScroll,setLastScroll]=React.useState(0)
    const [cekScroll,setCekScroll]=React.useState(false)
    const [botPos,setBotPos]=React.useState(66)
    const [disabled,setDisabled]=React.useState(null);
    const [dialog,setDialog]=React.useState(false);
    const [badge,setBadge]=React.useState(0);
    const {get,post,put} = useAPI()

    const fileRef=React.useRef(null)
    const inputRef=React.useRef(null)
    const conRef=React.useRef(null)
    const textRef=React.useRef(null)
    const prevUser=React.useRef(null);

    const handleBack=React.useCallback(()=>{
        if(homeReady) return router.back();
        else return router.replace('/support/admin/[[...slug]]',`/support/admin`,{shallow:true})
    },[homeReady])

    const getMsg=React.useCallback((lastId,scroll,conc)=>{
        get(`/v1/support/admin/${users?.id}?lastId=${lastId}`).then(([res])=>{
            pindah=false;
            setReachEnd(!res?.can_laod)
            if(res?.data?.length) {
                const msgId=data?.length ? `msg-${data?.[0]?.id}` : false;
                setLastId(res?.data?.[res?.data?.length - 1]);
                const a = conc ? data : [];
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
                setData(b)
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
            }
            else {
                setLoading(false)
            }
        }).catch((err)=>{
            setLoading(false)
            pindah=false;
        })
    },[get,data,users])

    const processBottom=React.useCallback(()=>{
        setBotPos(conRef?.current?.clientHeight - inputRef?.current?.offsetTop)
    },[])

    const handleOpenMenu = React.useCallback((menu)=>(event) => {
        event.preventDefault();
        setOpenMenu(openMenu === menu ? null : menu);
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[openMenu]);
    
    const handleCloseMenu = React.useCallback(() => {
        setOpenMenu(null);
        setAnchorEl(null);
    },[]);

    const handleCopy=React.useCallback((text)=>(e)=>{
        handleCloseMenu();
        if(typeof text==='string') {
            Kcopy(clean(text)).then(()=>{
                setNotif("Text copied",'default');
            }).catch(()=>{})
        }
    },[setNotif])

    const handleLoadMore=React.useCallback(()=>{
        if(!loading && !reachEnd && lastId!==0){
            setLoading(true)
            getMsg(lastId,true)
        }
    },[lastId,loading,reachEnd])

    const handleToBottom=React.useCallback(()=>{
        setCekScroll(false);
        setShowBottom(false)
        const con=document.getElementById('chat-detail')
        con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'});
        setBadge(0)
    },[])

    const handleFileChange=React.useCallback((e)=>{
        const file=e?.target?.files?.[0] || e?.dataTransfer?.files?.[0] || false;
        if(file){
            if(file?.size>5242880) setNotif("Maximum file size is 5 MB!",true);
            if(file.type.match("image/*")) setImage(file);
            else setNotif("Only support images",true);
        }
    },[setNotif])

    const handleChange=React.useCallback((e)=>{
        setInput({
            ...input,
            message:e.target.value
        })
        setTimeout(()=>processBottom(),100);
    },[input,processBottom])

    const handleKeyPress=React.useCallback((e)=>{
        if(e?.keyCode==13 && !e?.shiftKey && !isMobile) {
            if(input?.message?.match(/\S/) !== null){
                e.preventDefault();
                handleSubmit();
            }
        }
    },[input.message,handleSubmit])

    const handleCloseSupport=React.useCallback(()=>{
        setDisabled('dialog')
        put(`/v1/support/${users?.id}`).then(()=>{
            setDisabled(null)
            changeStatus(users?.id,'status','close');
            setDialog(false)
        }).catch(err=>{
            setDisabled(null)
        })
    },[put,changeStatus,users])

    const handleSubmit=()=>{
        if(image===null && input?.message?.match(/\S/) === null) return setNotif("Messages cannot be empty",true);
        setDisabled('send')
        const form=new FormData();
        form.append('message',input?.message)
        if(image!==null) form.append('image',image);
        const opt={
            headers:{
                'Content-Type':'multipart/form-data'
            },
        }
        
        post(`/v1/support/admin/${users?.id}`,form,opt)
        .then(([res])=>{
            setDisabled(null)
            const con=document.getElementById('chat-detail')
            const date = getDayJs(res?.timestamp);
            const day = date.format("MMM DD, YYYY");
            const time = date.format("HH:mm");
            const a=data.concat([{...res,day,time}]);
            setData(a)
            setImage(null)
            setInput({message:''})
            setTimeout(()=>{
                changeStatus(users?.id,'status','answered')
                setNotiff(null)
                con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'})
                socket?.emit("send message",res);
            },100);
            textRef?.current?.focus();
        }).catch((err)=>{
            setDisabled(null)
            textRef?.current?.focus();
        })
    }

    React.useEffect(()=>{
        if(initImage!==null) {
            if(initImage?.size>5242880) setNotif("Maximum file size is 5 MB!",true);
            if(initImage?.type?.match("image/*")) setImage(initImage);
            else setNotif("Only support images",true);
        }
    },[initImage])

    React.useEffect(()=>{
        badgee=badge;
    },[badge])

    React.useEffect(()=>{
        pindah=true;

        if(users!==null && prevUser?.current?.id !== users?.id) {
            setLoading(true)
            setData([])
            setReachEnd(false)
            setLastId(0)
            setImage(null)
            setInput({message:''});
            setBotPos(68)
            getMsg(0,false,false);
            setBadge(0)
            changeStatus(users?.id,'read',true);
        }
        return ()=>{
            prevUser.current = users;
        }
    },[users])

    React.useEffect(()=>{
        if(image!==null){
            const reader = new FileReader();
            reader.onload = (e)=>{
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(image);
        } else {
            setImageUrl(null)
        }
    },[image])

    React.useEffect(()=>{
        const con=document.getElementById('chat-detail')
        const onScroll=()=>{
            if(users!==null && pindah===false && con) {
                const st=con?.scrollTop;
                if(st <= 100) {
                    if(!loading && !reachEnd && lastId!==0){
                        setLoading(true)
                        getMsg(lastId,true,true)
                    }
                }
                if(st + con?.clientHeight >= con?.scrollHeight - 200) {
                    setShowBottom(false)
                    setBadge(0)
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
    })

    return (
        <div ref={conRef} className={clx(classes.root,selected!==null ? classes.rootCon : classes.rootLight)}>
            {selected===null ? (
                <div id='chat-detail' className={clx(classes.container,classes.empty)}>
                    <div>
                        <Typography variant='h6' component='h5' className='no-drag'>Please select a message to start messaging</Typography>
                    </div>
                </div>
            ) : (
                <>
                    <AppBar position='absolute' square elevation={0} className={classes.header}>
                        <Toolbar>
                            <Hidden mdDown>
                                <IconButton className={classes.headerIcon} style={{marginRight:8}} onClick={handleBack} size="large">
                                    <ArrowBack />
                                </IconButton>
                            </Hidden>
                            
                            {users?.user?.picture!==null ? (
                                <Avatar className={classes.avatar} alt={users?.ticket?.name}>
                                    <Image width={40} height={40} webp src={`${users?.user?.picture}&size=40&watermark=no`} alt={users?.ticket?.name} />
                                </Avatar>
                            ) : (
                                <Avatar className={classes.avatar} alt={users?.ticket?.name}>{users?.ticket?.name}</Avatar>
                            )}
                            <Typography noWrap variant='h6' component='h6' style={{flex:1}}>
                                {users?.ticket?.name}
                                <Typography noWrap variant='caption' component='p' style={{padding:'2px 6px 2px 0'}}>
                                    {users?.ticket?.email}
                                </Typography>
                            </Typography>
                            <IconButton className={classes.headerIcon} onClick={()=>setDialog(true)} size="large">
                                <InfoIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Slidedown className={classes.notifSlide}>
                        {notif!==null && (
                            <div className={classes.notif}>
                                <div><Typography>{notif?.split("\n").map((item,key)=><React.Fragment key={key}>{item}<br/></React.Fragment>)}</Typography></div>
                                <IconButton onClick={()=>setNotiff(null)} size="large">
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        )}
                    </Slidedown>
                    {showBottom && (
                        <div className={classes.toBottom}>
                            <IconButton onClick={handleToBottom} size="large">
                                {badge===0 ?  <ArrowDownward /> : (
                                    <Badge badgeContent={badge} color="primary">
                                        <ArrowDownward />
                                    </Badge>
                                )}
                            </IconButton>
                        </div>
                    )}
                    <ul id='chat-detail' className={classes.container}>
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
                                    <Typography>No more messages</Typography>
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
                                <li id={`msg-${dt?.id}`} key={`msg-${dt?.id}`} className={clx(dt?.from==1 ? classes.right : classes.left)}>
                                    <div className={classes.chat}>
                                        <div className={classes.chatP}>
                                            <div onContextMenu={handleOpenMenu(`right-menu-${dt?.id}`)} className={`${classes.chatSpan} noselect`}>
                                                {dt?.image !==null && (
                                                    <Image fancybox src={`${dt?.image}&size=200`} dataSrc={`${dt?.image}&watermark=no`} webp style={{maxWidth:200,maxHeight:200,marginBottom:5}} alt={dt?.message} />
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
                                        <MenuItem key={0} onClick={handleCopy(dt?.message)}><ListItemIcon><FileCopy /></ListItemIcon> Copy</MenuItem>
                                    </Menu>
                                </li>
                            </React.Fragment>
                        )) : null}
                    </ul>
                    <Slidedown style={{zIndex:80}}>
                        {imageUrl!==null ? (
                            <div className={classes.image} style={{bottom:botPos}}>
                                <div className={classes.imgBtn}>
                                    <IconButton onClick={()=>setImage(null)} size="large"><CloseIcon /></IconButton>
                                </div>
                                <Image fancybox src={imageUrl} />
                            </div>
                        ) : (
                            <div className={classes.file} style={{bottom:(botPos+6)}}>
                                <ImageIcon onClick={()=>fileRef?.current?.click()} />
                                <input ref={fileRef} type='file' accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                            </div>
                        )}
                    </Slidedown>
                    <Paper ref={inputRef} className={clx(classes.inputContainer,disabled==='send' && classes.disabled)}>
                        <div key={0} style={{height:'100%',position:'relative',flex:1}}>
                            <TextareaAutosize ref={textRef} minRows={1} maxRows={4} placeholder='Type a message' className={clx(classes.input)} value={input?.message} onChange={handleChange} onKeyDown={handleKeyPress}  disabled={disabled==='send'} />
                        </div>
                        <div key={1} title="Send">
                            <IconButton size='small' onClick={handleSubmit} disabled={disabled==='send'} className={clx(disabled==='send' && classes.disabled)}>
                                <span className={classes.iconLabel}>
                                    <SendIcon />
                                </span>
                            </IconButton>
                        </div>
                    </Paper>
                </>
            )}
            <Dialog open={dialog} scroll='body'>
                <DialogTitle>Information</DialogTitle>
                <DialogContent dividers>
                    <div style={{overflowX:'auto'}}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>{users?.subject}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>{users?.ticket?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Email</TableCell>
                                    <TableCell>{users?.ticket?.email}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>{users?.status}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' onClick={handleCloseSupport} disabled={disabled==='dialog'||users?.status==='close'} isloading={disabled==='dialog'}>Close</Button>
                    <Button outlined onClick={()=>setDialog(false)} disabled={disabled==='dialog'}>OK</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
const SupportDetail= withStyles(SupportDetailComp,styleDetail);

const SupportListComp=({classes,selected,list,onClick,onSearch,getData,chatLoading})=>{
    const [search,setSearch]=React.useState("")
    const [reachEnd,setReachEnd] = React.useState(false);
    const [page,setPage] = React.useState(1);

    const handleSearch=React.useCallback((e)=>{
        setSearch(e.target.value)
        onSearch(e.target.value)
    },[onSearch])

    const handleClick=React.useCallback((id)=>(e)=>{
        onClick(id);
    },[onClick])

    React.useEffect(()=>{
        const div = document.getElementById('chat-list-component');
        async function onScroll() {
            if(div) {
                const scrollTop = div.scrollTop;
                const scrollHeight = div.scrollHeight ;
                const docHeight = div.clientHeight;
                //console.log(scrl);
                if((scrollTop + docHeight) > (scrollHeight-200)) {
                    if(!chatLoading && !reachEnd) {
                        const res = await getData(page+1);
                        if(res !== null) {
                            setReachEnd(!res?.can_load);
                            setPage(res?.page);
                        }
                    }
                }
            }
        }
        div.addEventListener('scroll',onScroll);
        
        return ()=>{
            div.removeEventListener('scroll',onScroll);
        }
    },[chatLoading,getData,reachEnd,page])

    return (
        <Drawer
            open
            variant='permanent'
            PaperProps={{square:true,elevation:0,className:classes.root}}
            className={classes.docked}
        >
            <div key={0} className={classes.header}>
                <div className={classes.headerContainer}>
                    <div className={classes.inputContainer}>
                        <div className={classes.search}><SearchIcon /></div>
                        <input className={classes.input} placeholder="Search..." value={search} onChange={handleSearch} />
                        {search?.length > 0 && <IconButton
                            className={classes.closeSearch}
                            onClick={()=>{setSearch(""),onSearch("")}}
                            size="large"><CloseIcon /></IconButton>}
                    </div>
                </div>
            </div>
            <Divider />
            <div key={1} id='chat-list-component' className={classes.list}>
                <List>
                    {list.map((dt)=>(
                        <ListItem button key={`chatlist-${dt}`} className={clx(dt?.id == selected ? classes.selected : classes.listItem)} onClick={handleClick(dt?.id)}
                            {...(!dt?.read ? {secondaryAction:(<span className={clx(classes.read)}></span>)} : {})}
                        >
                            <ListItemAvatar>
                                {dt?.user?.picture!==null ? (
                                    <Avatar alt={dt?.name}>
                                        <Image width={40} height={40} webp src={`${dt?.user?.picture}&size=40&watermark=no`} alt={dt?.name} />
                                    </Avatar>
                                ) : (
                                    <Avatar alt={dt?.name}>{dt?.name}</Avatar>
                                )}
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant='body1'>{dt?.ticket?.name}</Typography>}
                                secondary={<Typography variant='body2'>{`${dt?.subject} (${dt?.status})`}</Typography>}
                            />
                        </ListItem>
                    ))}
                    {chatLoading && (
                        <div style={{textAlign:'center',justifyContent:'center',alignItems:'center'}}>
                            <CircularProgress thickness={4} size={40}/>
                        </div>
                    )}
                </List>
            </div>
        </Drawer>
    );
}
const SupportList=withStyles(SupportListComp,styleList)

const Support=({classes,err,meta,toggleDrawer,dispatch})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query
    const [title,setTitle]=React.useState(meta.title);
    const [selected,setSelected]=React.useState(slug ? slug?.[0] : null)
    const [search,setSearch]=React.useState(null);
    const [data,setData]=React.useState([]);
    const {setNotif}=useNotif()
    const [isDrop,setIsDrop]=React.useState(false);
    const [image,setImage]=React.useState(null);
    const [sudahHome,setSudahHome]=React.useState(false)
    const [chatLoading,setChatLoading]=React.useState(false)
    const {get} = useAPI();

    const handleClickList=React.useCallback((id)=>{
        router.push('/support/admin/[[...slug]]',`/support/admin/${id}`,{shallow:true})
    },[])

    const changeStatus=React.useCallback((id,status,newstatus)=>{
        const i = data.findIndex(d=>d?.id == id);
        if(i > -1 && data?.[i]) {
            let a = [...data];
            a[id]={
                ...a[id],
                [status]:newstatus
            }
            setData(a);
        }
    },[data])

    const changeTitle=React.useCallback((type,subject)=>{
        if(type) {
            setTitle(`${subject} - Support Admin`)
        } else {
            setTitle("Support Admin")
        }
    },[])

    const getData=React.useCallback(async(page)=>{
        setChatLoading(true)
        try {
            const [res] = await get(`/v1/support/admin?page=${page||1}`);
            const a = data;
            const b = res?.data;
            b.sort((c)=>{
                if(['open','customer_reply'].includes(c?.status)) return -1;
            });
            setData(a.concat(b));
            setChatLoading(false)
            return res;
        } catch(e) {
            setChatLoading(false)
            return null;
        }
    },[get])

    const handleSearch=React.useCallback((value)=>{
        if(data.length > 0 && value.length > 0) {
            const filter = data.filter(item=>{
                return item?.subject?.toLowerCase().indexOf(value.toLowerCase()) > -1
            });
            if(filter?.length > 0) {
                setSearch(filter)
            } else {
                setSearch([])
            }
        } else {
            setSearch(null)
        }
    },[data])

    const handleDrag=React.useCallback((enter)=>(e)=>{
        e.preventDefault();
        if(selected!==null) {
            if(enter){
                setIsDrop(true)
            } else {
                setIsDrop(false)
            }
        }
    },[selected])

    const handleOnDrop=React.useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        if(e?.dataTransfer?.files?.[0]) setImage(e?.dataTransfer?.files?.[0]);
        setIsDrop(false)
    },[])

    React.useEffect(()=>{
        if(slug && data.length > 0) {
            const filter = data.find(item=>{
                return item?.id == slug?.[0]
            })
            if(filter) {
                setSelected(filter?.id)
                changeTitle(true,filter?.subject)
            }
        } else {
            setSelected(null)
            changeTitle(false)
        }
        if(typeof slug==='undefined') setSudahHome(true)
    },[slug,data])

    React.useEffect(()=>{
        getData(1);
        if(!isMobile) {
            setTimeout(()=>dispatch({type:'TOGGLE_DRAWER',payload:false}),500)
        }
        return ()=>{
            if(!isMobile) dispatch({type:'TOGGLE_DRAWER',payload:true})
        }
    },[])

    const users=React.useMemo(()=>{
        if(selected!==null && data.length > 0) {
            const filter = data.find(d=>d?.id == selected);
            if(filter) return filter;
        }
        return null;
    },[selected,data])

    return(
        <Header title={title} canonical={slug ? `/support/admin/${slug?.[0]}` : '/support/admin'}  full noIndex active='support' subactive='support_admin'>
            <div className={clx(classes.root,toggleDrawer ? classes.rootWidth : classes.rootUnWidth)}
            onDragEnter={handleDrag(true)}>
                <div className={clx(classes.root,classes.image,toggleDrawer ? classes.rootWidth : classes.rootUnWidth,isDrop && classes.show,'fadeIn')}
                onDragEnter={handleDrag(true)}
                onDragOver={(e)=>e.preventDefault()}
                onDragLeave={handleDrag(false)}
                onDrop={handleOnDrop}>
                    <Typography variant='h4' component='h4'>Drop your images now</Typography>
                </div>
                <SupportList chatLoading={chatLoading} list={search!==null ? search : data} selected={selected} onClick={handleClickList} onSearch={handleSearch} getData={getData} />
                <SupportDetail homeReady={sudahHome} selected={data.length > 0 ? selected : null} initImage={image} users={users} changeStatus={changeStatus} />
            </div>
        </Header>
    )
}

export default connect(state=>({toggleDrawer:state.toggleDrawer}))(withStyles(Support,styles))