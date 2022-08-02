import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import Avatar from 'portal/components/Avatar'
import {useNotif} from 'portal/components/Notification'
import {styles,styleList,styleDetail} from 'portal/components/MsgStyle'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import {getDayJs,time_ago} from 'portal/utils/Main'
import db from 'portal/utils/db'
import {useSocket,callSomeone} from 'portal/utils/Socket'
import {useRouter} from 'next/router'
import {connect} from 'react-redux'
import clx from 'classnames'
import Slidedown from 'react-slidedown'
import {isMobile} from 'react-device-detect'
import {withStyles} from 'portal/components/styles';
import {Hidden,ListItemIcon,Drawer,Paper,Typography, AppBar,List,ListItemAvatar,ListItem,ListItemText,IconButton,Menu,MenuItem,Badge,
Toolbar,CircularProgress,TextareaAutosize,TextField} from '@mui/material'
import {Search as SearchIcon,MoreVert,ArrowBack,Send as SendIcon,Done,DoneAll,Refresh,ArrowDownward,
    Close as CloseIcon,Image as ImageIcon,AccountCircle,FileCopy,Delete as DeleteIcon,Videocam,Call as CallIcon} from '@mui/icons-material'
import Autocomplete from '@mui/material/Autocomplete';
import {arrayMoveImmutable as arrayMove} from 'array-move'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,res,params})=>{
    const slug=params.slug;
    if(slug?.length > 1) {
        db.redirect();
    }
    if(data.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    if(slug?.[0] == 'portalnesia') return db.redirect(`${process.env.URL}/contact`);
    if(data.user.user_login == slug?.[0]) return db.redirect(`${process.env.URL}/messages`);
    if(typeof slug !== 'undefined') {
        const userss=await db.kata(`SELECT id from klekle_users WHERE user_login = ? AND BINARY(user_login) = BINARY(?) LIMIT 1`,[slug?.[0],slug?.[0]]);
        if(!userss) {
            db.redirect();
        }
    }
    return {props:{}}
})

let pindah=false,interval=null,idle=0,oonline=false,dataa=[],badgee=0;
const ChatDetailComp=({socket,classes,homeReady,selected,users,user,initImage,changeStatus})=>{
    const router=useRouter()
    const {call}=callSomeone()
    const {get,post,del} = useAPI()
    const [online,setOnline]=React.useState(false);
    const [input,setInput]=React.useState({message:''})
    const [imageUrl,setImageUrl]=React.useState(null);
    const [image,setImage]=React.useState(null);
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    const [loading,setLoading]=React.useState(true);
    const [reachEnd,setReachEnd]=React.useState(false);
    const [data,setData]=React.useState([]);
    const [notif,setNotiff]=React.useState(null);
    const {setNotif}=useNotif()
    const [showBottom,setShowBottom]=React.useState(false)
    const [lastScroll,setLastScroll]=React.useState(0)
    const [cekScroll,setCekScroll]=React.useState(false)
    const [botPos,setBotPos]=React.useState(68)
    const [status,setStatus]=React.useState('Offline');
    const [disabled,setDisabled]=React.useState(null);
    const [dialog,setDialog]=React.useState(null);
    const [badge,setBadge]=React.useState(0)
    const [canCall,setCanCall]=React.useState(false);
    const [usersData,setUsersData]=React.useState({})
    const [lastId,setLastId] = React.useState(0);

    const fileRef=React.useRef(null)
    const inputRef=React.useRef(null)
    const conRef=React.useRef(null)
    const textRef=React.useRef(null)
    const prevUser=React.useRef(null);

    const handleBack=React.useCallback(()=>{
        if(homeReady) return router.back();
        else return router.replace('/messages/[[...slug]]',`/messages`,{shallow:true})
    },[homeReady])

    const getMsg=React.useCallback((lastId,scroll,conc)=>{
        get(`/v1/messages/${users?.id}?lastId=${lastId}`).then(([res])=>{
            pindah=false;
            //if(id===0) setNotiff(res.notification);
            setReachEnd(!res?.can_load)
            setLoading(false)
            if(res?.data?.length > 0) {
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
                }).reverse();
                const b = c.concat(a);
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
        setBotPos((conRef?.current?.clientHeight - inputRef?.current?.offsetTop))
    },[])

    const handleOpenMenu = React.useCallback((menu,event) => {
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

    const linkClick=(href,as)=>(e)=>{
        e.preventDefault();
        router.push(href,(as||href));
        handleCloseMenu();
    }

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

    const handleFileChange = React.useCallback((e)=>{
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
        if(interval===null) {
            interval=setInterval(()=>{
                idle++;
                if(idle>2) {
                    socket?.emit('send stop typing',{from:user?.id,to:users?.user?.id});
                    clearInterval(interval);
                    interval=null;
                    idle=0;
                }
            },1000)
        }
        if(e?.keyCode==13 && !e?.shiftKey && !isMobile) {
            if(input?.message?.match(/\S/) !== null){
                e.preventDefault();
                handleSubmit();
            }
        } else {
            idle=0;
            socket?.emit('send typing',{from:user?.id,to:users?.user?.id});
        }
    },[socket,user,users,input.message,handleSubmit])

    const handleDeleteMsg=React.useCallback((forc,dis)=>{
        setDisabled(dis)
        const force=Boolean(forc)||false;
        del(`/v1/messages/${users?.id}/${dialog?.id}${force ? '?force=true' : ''}`).then(()=>{
            setDisabled(null)
            const a=data;
            a.splice(dialog?.index,1);
            if(a?.length === 0) setLastId(0);
            setData(a);
            if(force) setTimeout(()=>socket?.emit('delete message',{id:dialog?.id,room:users?.id,from:user?.id,to:users?.user?.id}),100)
            setDialog(null)
        }).catch((err)=>{
            setDisabled(null)
            setNotif(err?.msg||"Something went wrong",true)
        })
    },[dialog,data,socket,del,user,users,setNotif])

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
        post(`/v1/messages/${users?.id}`,form,opt)
        .then(([res])=>{
            setDisabled(null)
            const con=document.getElementById('chat-detail');
            const date = getDayJs(res?.timestamp);
            const day = date.format("MMM DD, YYYY");
            const time = date.format("HH:mm");
            const a=data.concat([{...res,day,time}]);
            setData(a)
            setImage(null)
            setInput({message:''})
            setTimeout(()=>{
                con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'})
                socket?.emit("send message",res);
            },100);
            textRef?.current?.focus();
        }).catch((err)=>{
            textRef?.current?.focus();
            setDisabled(null)
        })
    }

    const handleCall=(type)=>()=>{
        if(canCall) {
            call(usersData,type)
        }
    }

    React.useEffect(()=>{
        if(initImage!==null) {
            if(initImage?.size>5242880) setNotif("Maximum file size is 5 MB!",true);
            if(initImage?.type?.match("image/*")) setImage(initImage);
            else setNotif("Only support images",true);
        }
    },[initImage])

    React.useEffect(()=>{
        oonline=online;
    },[online])

    React.useEffect(()=>{
        dataa=data;
    },[data])

    React.useEffect(()=>{
        badgee=badge;
    },[badge])

    React.useEffect(()=>{
        pindah=true;
        const onMessage=(html)=>{
            if(html?.from==users?.user?.id && html?.type=='messages') {
                //const con=document.getElementById('chat-detail')
                if(dataa?.length===0) setLastId(0)
                const date = getDayJs(html?.timestamp);
                const day = date.format("MMM DD, YYYY");
                const time = date.format("HH:mm");
                const b = dataa.concat([{...html,day,time}]);
                setData(b);
                setBadge(badgee + 1)
                setTimeout(()=>{
                    //con?.scrollBy({left:0,top:con?.scrollHeight,behavior:'smooth'})
                    socket?.emit("send read status",{
                        from:users?.user?.id,
                        to:user?.id,
                        id:html?.id,
                        room:html.room
                    })
                },100);
            }
        }
    
        const onReadMsg=(html)=>{
            if(html.from==user?.id && html.room==users?.id) {
                const index=dataa.findIndex(item=>item?.id==html?.id);
                let a=[...dataa];
                if(index !== -1) {
                    a[index]={
                        ...a[index],
                        read:true
                    }
                    setData(a);
                }
            }
        };
    
        const onDelivered=(html)=>{
            if(html.from==users?.user?.id&&html.room==users?.id) {
                const index=dataa.findIndex(item=>item?.id==html?.id);
                let a = [...dataa];
                if(index !== -1) {
                    a[index]={
                        ...a[index],
                        delivered:true
                    }
                    setData(a);
                }
            }
        };
    
        const onTyping=(html)=>{
            if(html.from==users?.user?.id) {
                setStatus("Typing...")
            }
        }
    
        const onStopTyping=(html)=>{
            if(html.from==users?.user?.id) {
                setStatus(oonline ? "Online" : "Offline")
            }
        }
    
        const onDeleteMsg=(html)=>{
            if(html.from===users?.user?.id){
                const index=dataa.findIndex(item=>item?.id==html?.id);
                let a=[...dataa];
                if(index) {
                    a[index]={
                        ...a[index],
                        remove:true,
                        message:"Deleted message"
                    }
                    setData(a);
                }
            }
        }
    
        const onInitChat=(html)=>{
            setOnline(html?.online)
            const status = html?.online ? "Online" : html?.last_online ? `Last online ${time_ago(html?.last_online)}` : "Offline"
            setStatus(status)
            if(html?.online) {
                setCanCall(html?.online)
                setUsersData(html)
            }
        }
    
        const onConnect=(html)=>{
            if(html.id==users?.user?.id) {
                socket?.emit('init chat',{to:users.user?.id});
            }
        }
    
        const onDisconnect=(html)=>{
            if(html?.id==users?.user?.id) {
                setOnline(false)
                setStatus("Offline")
                setCanCall(false)
                setUsersData({})
            }
        }
        if(socket) {
            if(users!==null && prevUser?.current?.user?.id !== users?.user?.id) {
                setCanCall(false)
                setUsersData({})
                setLoading(true)
                setData([])
                setReachEnd(false)
                setLastId(0)
                setImage(null)
                setInput({message:''});
                setBotPos(68)
                getMsg(0,false,false);
                setBadge(0)
                changeStatus(users?.user?.username,'read',true);
                socket?.emit('init chat',{to:users.user?.id});
            }
            socket.on('init chat', onInitChat)
            socket.on('typing',onTyping);
            socket.on('stop typing',onStopTyping);
            socket.on('read status',onReadMsg);
            socket.on('delivered',onDelivered);
            socket.on('message',onMessage);
            socket.on('user connect',onConnect);
            socket.on('user disconnect',onDisconnect);
            socket.on('delete message',onDeleteMsg);
        }
        
        return ()=>{
            prevUser.current = users;
            if(socket) {
                socket.off('init chat', onInitChat)
                socket.off('typing',onTyping);
                socket.off('stop typing',onStopTyping);
                socket.off('read status',onReadMsg);
                socket.off('delivered',onDelivered);
                socket.off('message',onMessage);
                socket.off('user connect',onConnect)
                socket.off('user disconnect',onDisconnect)
                socket.off('delete message',onDeleteMsg);
            }
        }
    },[users,socket])

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
                                <Avatar className={classes.avatar} alt={users?.user?.name}>
                                    <Image width={40} height={40} webp src={`${users?.user?.picture}&size=40&watermark=no`} alt={users?.user?.name} style={{width:40}} />
                                </Avatar>
                            ) : (
                                <Avatar className={classes.avatar} alt={users?.user?.name}>{users?.user?.name}</Avatar>
                            )}
                            <Typography noWrap variant='h6' component='h6' style={{flex:1}}>
                                {users?.user?.name}
                                <Typography noWrap variant='caption' component='p' style={{padding:'2px 6px 2px 0'}}>
                                    <span className={clx(classes.onlineStatus,online ? classes.online : classes.offline)}></span>
                                    {status}
                                </Typography>
                            </Typography>
                            <IconButton className={classes.headerIcon} onClick={e=>handleOpenMenu('menu',e)} size="large">
                                <MoreVert />
                            </IconButton>
                            <Menu
                                anchorReference="anchorPosition"
                                anchorPosition={
                                    anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                }
                                open={openMenu === 'menu'}
                                onClose={handleCloseMenu}
                            >
                                <MenuItem onClick={linkClick('/user/[...user]',`/user/${users?.user?.username}`)}><ListItemIcon><AccountCircle /></ListItemIcon> View Profile</MenuItem>
                                {user?.admin && (
                                    <>
                                    <MenuItem disabled={!canCall} onClick={handleCall('video')}><ListItemIcon><Videocam /></ListItemIcon> Video Call</MenuItem>
                                    <MenuItem disabled={!canCall} onClick={handleCall('audio')}><ListItemIcon><CallIcon /></ListItemIcon> Voice Call</MenuItem>
                                    </>
                                )}
                            </Menu>
                        </Toolbar>
                    </AppBar>
                    {notif!==null && (
                        <div className={classes.notifSlide}>
                            <div className={classes.notif}>
                                <div><Typography>{notif?.split("\n").map((item,key)=><React.Fragment key={key}>{item}<br/></React.Fragment>)}</Typography></div>
                                <IconButton onClick={()=>setNotiff(null)} size="large">
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </div>
                    )}
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
                        {data?.length > 0 ? data?.map((dt,i)=>{
                            return (
                                <React.Fragment key={`fragment-msg-${dt?.id}`}>
                                    {dt?.day !== data?.[i-1]?.day && (
                                        <li className={classes.date} key={`date-${dt?.id}`}>
                                            <span>{dt?.day}</span>
                                        </li>
                                    )}
                                    <li id={`msg-${dt?.id}`} key={`msg-${dt?.id}`} className={clx(dt?.from==user?.id ? classes.right : classes.left)}>
                                        <div className={classes.chat}>
                                            <div className={classes.chatP}>
                                                <div onContextMenu={(e)=>dt?.remove ? null : handleOpenMenu(`right-menu-${dt?.id}`,e)} className={`${classes.chatSpan} noselect`}>
                                                    {dt?.remove ? (
                                                        <p style={{margin:'.2rem'}}><i>{dt?.message}</i></p>
                                                    ) : (
                                                        <>
                                                            {dt?.image !==null && (
                                                                <Image fancybox src={`${dt?.image}&size=200`} dataSrc={`${dt?.image}&watermark=no`} webp style={{maxWidth:200,maxHeight:200,marginBottom:5}} alt={dt?.message} />
                                                            )}
                                                            <p style={{margin:'0 .2rem'}} dangerouslySetInnerHTML={{__html:dt?.message?.replace(/\n/g,"<br />")}}></p>
                                                        </>
                                                    )}
                                                    <div className={classes.info}>
                                                        {dt?.from==user?.id && !dt?.remove ? dt?.delivered ? dt?.read ? <DoneAll className={classes.read} /> : <DoneAll /> : <Done /> : null}
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
                                            <MenuItem key={1} onClick={()=>setDialog({...dt,index:i})}><ListItemIcon><DeleteIcon /></ListItemIcon> Delete</MenuItem>
                                        </Menu>
                                    </li>
                                </React.Fragment>
                            )
                        }) : null}
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
                        <div key={'0'} style={{height:'100%',position:'relative',flex:1}}>
                            <TextareaAutosize ref={textRef} minRows={1} maxRows={4} placeholder='Type a message' className={clx(classes.input)} value={input?.message} onChange={handleChange} onKeyDown={handleKeyPress}  disabled={disabled==='send'} />
                        </div>
                        <div key={'1'} title="Send">
                            <IconButton size='small' onClick={handleSubmit} disabled={disabled==='send'} className={clx(disabled==='send' && classes.disabled)}>
                                <span className={classes.iconLabel}>
                                    <SendIcon />
                                </span>
                            </IconButton>
                        </div>
                    </Paper>
                </>
            )}
            <Dialog
                open={dialog!==null}
                scroll='body'
                TransitionProps={{
                    onEnter: handleCloseMenu
                }}>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent dividers>
                    <Typography>Delete `{dialog?.message}`</Typography>
                </DialogContent>
                <DialogActions className='grid-items'>
                    <Button outlined onClick={()=>setDialog(null)} disabled={disabled!==null}>Cancel</Button>
                    <Button color='primary' onClick={()=>handleDeleteMsg(false,'delete_me')} disabled={disabled!==null} isloading={disabled==='delete_me'}>Delete for me</Button>
                    {dialog?.from == user?.id && <Button color='secondary' onClick={()=>handleDeleteMsg(true,'delete_all')} disabled={disabled!==null} isloading={disabled==='delete_all'}>Delete for all</Button>}
                </DialogActions>
            </Dialog>
        </div>
    );
}
const ChatDetail = connect(state=>({user:state.user}))(withStyles(ChatDetailComp,styleDetail));

/**
 * Chat List Components
 */
const ChatListComponent=({chatLoading,classes,selected,list,onClick,onSearch,getData,user})=>{
    const [dialog,setDialog]=React.useState(false)
    const [inputUsername,setInputUsername]=React.useState("")
    const [openUsername,setOpenUsername]=React.useState(false)
    const [loadingUsername,setLoadingUsername]=React.useState(false);
    const [option,setOption]=React.useState(['']);
    const [search,setSearch]=React.useState("")
    const {get} = useAPI()
    const [reachEnd,setReachEnd] = React.useState(false);
    const [page,setPage] = React.useState(1);

    const handleSearch=React.useCallback((e)=>{
        setSearch(e.target.value)
        onSearch(e.target.value)
    },[onSearch])

    const handleUsernameChange=React.useCallback((event, newValue) => {
        if(newValue) {
            setInputUsername(newValue)
            onClick(newValue);
            closeDialog()
        }
    },[closeDialog,onClick])

    const closeDialog=React.useCallback(()=>{
        setDialog(false)
        setOpenUsername(false)
        setInputUsername("")
    },[])

    const handleInputChange=(e,value,reason)=>{
        if(reason==="input") {
            const filter=option.filter(item=>item.toLowerCase().indexOf(value.toLowerCase()) > -1);
            if(filter?.length === 0){
                setLoadingUsername(true)
                get(`/v1/user/list?q=${encodeURIComponent(value)}`,{error_notif:false,success_notif:false})
                .then(([res])=>{
                    let b=option;
                    res?.filter(r=>r != user?.user_login)?.forEach((rs)=>{
                        if(option.indexOf(rs)===-1) b=b.concat(rs)
                    })
                    setOption(b);
                }).catch((err)=>{
                    
                }).finally(()=>setLoadingUsername(false))
            }
        }
    }

    React.useEffect(() => {
        if(openUsername && option.length<=1) {
            setLoadingUsername(true)
            get(`/v1/user/list`,{error_notif:false,success_notif:false})
            .then(([res])=>{
                const opt = res.filter(r=>r != user?.user_login)
                setOption(opt);
            }).catch((err)=>{
                
            }).finally(()=>setLoadingUsername(false))
        }
    }, [openUsername,option,get,user]);

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
        <>
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
                            <input className={classes.input} placeholder="Search Contact" value={search} onChange={handleSearch} />
                            {search?.length > 0 && <IconButton
                                className={classes.closeSearch}
                                onClick={()=>{setSearch(""),onSearch("")}}
                                size="large"><CloseIcon /></IconButton>}
                        </div>
                    </div>
                </div>
                <div key={1} id='chat-list-component' className={classes.list}>
                    <List>
                        {list.map((dt)=>(
                            <ListItem button key={`chatlist-${dt?.id}`} className={clx(dt?.user?.username == selected ? classes.selected : classes.listItem)} onClick={()=>onClick(dt?.user?.username)}
                            {...(!dt?.read ? {secondaryAction:(<span className={clx(classes.read)}></span>)} : {})}
                            >
                                <ListItemAvatar>
                                    {dt?.user?.picture!==null ? (
                                        <Avatar alt={dt?.user?.name}>
                                            <Image width={40} height={40} webp src={`${dt?.user?.picture}&size=40&watermark=no`} alt={dt?.user?.name} style={{width:40}} />
                                        </Avatar>
                                    ) : (
                                        <Avatar alt={dt?.user?.name}>{dt?.user?.name}</Avatar>
                                    )}
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography variant='body1'>{dt?.user?.name}</Typography>}
                                    secondary={<Typography variant='body2'>{`@${dt?.user?.username}`}</Typography>}
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
                <div className={classes.new}>
                    <Button outlined onClick={()=>setDialog(true)} icon='add'>
                        <Typography>New</Typography>
                    </Button>
                </div>
            </Drawer>
            <Dialog open={dialog} maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>New Messages</DialogTitle>
                <DialogContent dividers>
                    <div style={{textAlign:'center'}}>
                        <Autocomplete
                            open={openUsername}
                            value={inputUsername}
                            onChange={handleUsernameChange}
                            onInputChange={handleInputChange}
                            id="usernameInput"
                            freeSolo
                            clearOnBlur
                            //renderOption={(option) => option}
                            isOptionEqualToValue={(option, value) => {
                                if(typeof value==='string') return option===value;
                            }}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                            }}
                            options={option}
                            loading={loadingUsername || option.length===0 && openUsername}
                            onOpen={() => {
                                setOpenUsername(true);
                            }}
                            onClose={() => {
                                setOpenUsername(false);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Username"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                        <React.Fragment>
                                            {loadingUsername ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button outlined onClick={closeDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
const ChatList = connect(state=>({user:state.user}))(withStyles(ChatListComponent,styleList));

/**
 * Root Chat Components
 */
const Messages=({classes,err,toggleDrawer,dispatch})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query
    const socket=useSocket();
    const [selected,setSelected]=React.useState(slug ? slug?.[0] : null)
    const [search,setSearch]=React.useState(null);
    const [data,setData]=React.useState([]);
    const [isDrop,setIsDrop]=React.useState(false);
    const [image,setImage]=React.useState(null);
    const [title,setTitle] = React.useState("Messages");
    const {get,post} = useAPI()
    const [sudahHome,setSudahHome]=React.useState(false);
    const [chatLoading,setChatLoading]=React.useState(false)

    const handleClickList=React.useCallback((username)=>{
        router.push('/messages/[[...slug]]',`/messages/${username}`,{shallow:true})
    },[])

    const changeStatus=React.useCallback((username,status,newstatus)=>{
        const i = data.findIndex(d=>d?.user?.username == username);
        if(i > -1 && data?.[i]) {
            let a = [...data];
            a[i]={
                ...a[i],
                [status]:newstatus
            }
            setData(a)
        }
    },[data])

    const handleSearch=React.useCallback((value)=>{
        if(data.length > 0 && value.length > 0) {
            const filter = data.filter(item=>{
                return item?.user?.username?.toLowerCase().indexOf(value.toLowerCase()) > -1
                || item?.user?.name?.toLowerCase().indexOf(value.toLowerCase()) > -1
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

    const getData=React.useCallback(async(page)=>{
        setChatLoading(true)
        try {
            const [res] = await get(`/v1/messages/room?page=${page||1}`);
            const a = data;
            setData(a.concat(res?.data));
            setChatLoading(false)
            return res;
        } catch(e) {
            setChatLoading(false)
            return null;
        }
    },[get])

    const newRoom=React.useCallback(()=>{
        post(`/v1/messages/room`,{username:slug?.[0]}).then(([res])=>{
            const a = data;
            a.unshift(res);
            setData(a);
            setSelected(slug?.[0])
        }).catch(err=>{
            
        })
    },[slug,data,post])

    React.useEffect(()=>{
        if(slug && data.length > 0) {
            const filter = data.find(item=>{
                return item?.user?.username?.toLowerCase() == slug?.[0]?.toLowerCase()
            })
            if(filter) {
                setSelected(filter?.user?.username)
                setTitle(`${filter?.user?.name} - Messages`);
            } else {
                newRoom()
                setTitle("Messages")
            }
        }
        else {
            setSelected(null)
        }
        if(typeof slug==='undefined') setSudahHome(true)
    },[slug,data])

    React.useEffect(()=>{
        getData(1);

        /*router.beforePopState(({as,options})=>{
            if(as === "/messages") {
                return false;
            }
            return true;
        })*/

        if(!isMobile) {
            setTimeout(()=>dispatch({type:'TOGGLE_DRAWER',payload:false}),500)
        }
        return ()=>{
            if(!isMobile) dispatch({type:'TOGGLE_DRAWER',payload:true})
        }
    },[])

    // MARK CHATLIST UNREAD
    React.useEffect(()=>{
        const onMessage=(html)=>{
            if(html?.type=='messages') {
                const i = data.findIndex(d=>d?.user?.id == html?.from && d?.user?.username != selected);

                if(i > -1) {
                    let a = [...data];
                    a[i] = {
                        ...a[i],
                        read:false
                    }
                    const b = arrayMove(a,i,0);
                    setData(b);
                }
            }
        }
        if(socket) socket.on('message',onMessage);
        return ()=>{
            if(socket) socket.off('message',onMessage);
        }
    },[socket,data,selected])

    const users=React.useMemo(()=>{
        if(selected!==null && data.length > 0) {
            const filter = data.find(d=>d?.user?.username == selected);
            if(filter) return filter;
        }
        return null;
    },[selected,data])

    return(
        <Header title={title} canonical={slug ? `/messages/${slug?.[0]}` : '/messages'}  full noIndex active='messages' subactive={slug ? `messages_detail` : ''}>
            <div className={clx(classes.root,toggleDrawer ? classes.rootWidth : classes.rootUnWidth)}
            onDragEnter={handleDrag(true)}>
                <div className={clx(classes.root,classes.image,toggleDrawer ? classes.rootWidth : classes.rootUnWidth,isDrop && classes.show,'fadeIn')}
                onDragEnter={handleDrag(true)}
                onDragOver={(e)=>e.preventDefault()}
                onDragLeave={handleDrag(false)}
                onDrop={handleOnDrop}>
                    <Typography variant='h4' component='h4'>Drop your images now</Typography>
                </div>
                <ChatList chatLoading={chatLoading} list={search!==null ? search : data} selected={selected} onClick={handleClickList} onSearch={handleSearch} getData={getData} />
                <ChatDetail socket={socket} homeReady={sudahHome} selected={data.length > 0 ? selected : null} initImage={image} users={users} changeStatus={changeStatus} />
            </div>
        </Header>
    )
}

export default connect(state=>({toggleDrawer:state.toggleDrawer}))(withStyles(Messages,styles))