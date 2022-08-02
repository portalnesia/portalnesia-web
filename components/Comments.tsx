import React,{useState,useEffect,useRef} from 'react'
import {useDispatch,useSelector as useReduxSelector,TypedUseSelectorHook} from 'react-redux'
import Link from 'next/link'
import {PaperBlock,PaperBlockProps,Image,Button,ReCaptcha,ReCaptchaClass,Avatar} from 'portal/components'
import {dataUserType} from 'portal/types'
import {useAPI,useNotif,ResponseData} from 'portal/utils'
import {copyTextBrowser as Kcopy, truncate as Ktruncate} from '@portalnesia/utils'
import { Theme } from '@mui/material/styles';
import {makeStyles} from 'portal/components/styles';
import {IconButton,CircularProgress,Tooltip,List,ListItem,ListItemAvatar,ListItemText,ListItemIcon,Typography,ListItemSecondaryAction,
Menu,MenuItem,TextareaAutosize,Grid,TextField,Divider,Dialog,DialogTitle,DialogActions,DialogContent} from '@mui/material'
import {Autorenew,MoreVert,ExpandLess,ExpandMore,Send as SendIcon,Close as CloseIcon,Reply as ReplyIcon,Delete,FileCopy,ReportProblem} from '@mui/icons-material'
import {time_ago} from 'portal/utils/Main'
import Slidedown from 'react-slidedown'
import clx from 'classnames'
import {isMobile} from 'react-device-detect'

type RootState={
    user: dataUserType,
}

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector
const useStyles = makeStyles<void,'divList'>()((theme,_,classes) => {
    return {
        root:{

        },
        tooltip:{fontSize:14},
        secondaryAction:{
            paddingRight:96
        },
        secondaryActionChild:{
            paddingRight:56
        },
        child:{
            borderLeft:`solid 4px ${theme.palette.primary.main}`,
            marginLeft:34,
        },
        inputContainer:{
            display:'flex',
            //minHeight:55,
            maxHeight:275,
            alignItems:'center',
            background:theme.palette.background.default,
            bottom:16,
            //position:'relative',
            padding:10,
        },
        disabled:{
            background:theme.palette.action.disabled
        },
        iconWhite:{
            '& svg':{
                color:"#ffffff"
            }
        },
        input:{
            width:'100%',
            height:'100%',
            margin:0,
            padding:`2px 20px 2px 2px`,
            boxSizing:'border-box',
            resize:'none',
            border:'none',
            boxShadow:'none !important',
            color:theme.palette.text.primary,
            outline:'none !important',
            background:'transparent',
            cursor:'auto',
            fontFamily:'"Inter var",Inter,-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Fira Sans,sans-serif',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.4em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.palette.primary.main,
                    borderRadius:4
                },
            },
            /*'&::placeholder':{
                color:theme.palette.grey[400]
            },*/
        },
        reply:{
            background:theme.palette.secondary.main,
            color:"#ffffff",
            width:'100%',
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            paddingLeft:10,
            '& p':{
                textOverflow:'ellipsis',
                overflow:'hidden',
            }
        },
        border:{
            position:'absolute',
            borderLeft:`solid 4px ${theme.palette.primary.main}`,
            left:34,
            top:21,
            transitionProperty:'height',
            transitionDuration:'.5s'
        },
        borderChild:{
            position:'absolute',
            borderTop:`solid 4px ${theme.palette.primary.main}`,
            left:0,
            top:37,
            height:4,
            width:35
        },
        list:{
            [`& .${classes.divList}:last-child`]:{
                paddingBottom:'unset',
                marginBottom:'unset',
                borderBottom: 'unset'
            }
        },
        divList:{
            paddingBottom:10,
            marginBottom:10,
            borderBottom: `solid 1px ${theme.palette.divider}`
        },
        listItem:{
            alignItems:'unset'
        },
        delay:{
            transitionDelay:'.4s'
        },
        delayy:{
            transitionDelay:'.3s !important'
        },
        buttonProgress: {
            color: `${theme.palette.secondary.main} !important`,
            '& svg':{
                color: `${theme.palette.secondary.main} !important`,
            },
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
            zIndex:5
        },
    }
});

type CommentsType='chord'|'news'|'thread'|'blog';
type ErrorResult={
    msg: string
}
type UserResult={
    id: number|null,
    username: string|null,
    name: string,
    picture: string|null
}
type ReplyResult={
    comment: string,
    id: number,
    login: boolean,
    timestamp: number,
    block: boolean,
    can_deleted: boolean
    user: UserResult,
    content:{
        id: number,
        posid: number|string,
        link: string,
        type:CommentsType,
        userid: number
    }
}
interface DataResult extends ReplyResult{
    reply: {
        page: number,
        can_load: boolean,
        total: number,
        data: Array<ReplyResult>
    }
}
interface SuccessResult{
    page: number,
    can_load: boolean,
    total: number,
    data: Array<DataResult>
}
interface SuccessReplyResult{
    page: number,
    can_load: boolean,
    total: number,
    data: Array<ReplyResult>
}

export interface CommentsProps extends PaperBlockProps{
    /**
     * Type of content
     */
    type: CommentsType,
    /**
     * ID of content
     */
    posId: number,
    comment_id?: number
}

type ReplyValueType={
    id: number,
    parent?: number,
    username: string,
    message: string
}|null

type LoginType={
    name: string,
    email: string
}

type SendType={
    message: string,
    type: CommentsType,
    reply_to?: number,
    parent?: number,
    posid: number,
    posurl: string,
    name?: string,
    email?: string,
    recaptcha?: string
}

type PostSuccess<T> = ResponseData<T>

/**
 * 
 * Comments Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Comments = (props: CommentsProps)=>{
    const {type,posId,title,toggle,initialShow,comment_id,...other}= props;
    const ttitle=title||'Comments';
    const ttoggle=toggle||true;
    const initialSh=initialShow||true;
    const com_id=comment_id||0;

    const {post,get}=useAPI()
    const {setNotif}=useNotif()
    const {classes}=useStyles();
    const connect=useSelector(state=>({user:state.user}))
    const {user}=connect
    const [reachEnd,setReachEnd]=useState<boolean>(false)
    const [loading,setLoading]=useState<string|number|null>('global')
    const [data,setData]=useState<Array<DataResult>>([]);
    const [loadingCom,setLoadingCom]=useState<string|number|null>(null)
    const [expand,setExpand]=useState<string|number|null>(null)
    const textRef=useRef<HTMLTextAreaElement | null>(null)
    const captchaRef=(useRef<ReCaptchaClass>() as React.RefObject<ReCaptchaClass>) 
    const [value,setValue]=useState("")
    const [reply,setReply]=useState<ReplyValueType>(null)
    const [unLogin,setUnlogin]=useState<LoginType>({name:'',email:''});
    const [page,setPage]=useState(1);

    const getComment=async(page: number=1)=>{
        setLoading('global')
        try {
            const [dt] = await get<SuccessResult>(`/v1/comments/${type}/${posId}?page=${page}${com_id ? `&id=${com_id}` : ''}`);
            setReachEnd(dt?.can_load ? false : true);
            const a: Array<DataResult> = data;
            const b = dt.data.concat(a)
            setPage(dt.page);
            setData(b);
        } catch {
        } finally {
            setLoading(null)
        }
    }

    useEffect(()=>{
        getComment();
    },[])

    const getReplies=async(comment_id: number,page: number=2)=>{
        setLoading(`comment-${comment_id}`)
        try {
            const [dt] = await get<SuccessReplyResult>(`/v1/comments/${type}/${posId}/${comment_id}?page=${page}${com_id ? `&id=${com_id}` : ''}`);
            const index=data.findIndex(item=>item?.id===comment_id);
            if(index !== -1) {
                const rep=data[index].reply.data
                const b = rep;
                const d = dt?.data.concat(b)
                let a=[...data];
                a[index]={
                    ...a[index],
                    reply:{
                        page:dt.page,
                        can_load:dt.can_load,
                        total: dt.total,
                        data:d
                    }
                }
                setData(a);
            }
        } catch {
        } finally {
            setLoading(null)
        }
    }

    const handleKeyPress=(e: React.KeyboardEvent<HTMLTextAreaElement>)=>{
        if(e?.keyCode==13 && !e?.shiftKey && !isMobile) {
            if(value?.match(/\S/) !== null){
                e.preventDefault();
                handleSubmit();
            }
        }
    }

    const handleReply=(params: ReplyValueType)=>{
        if(user===null) setNotif("Login to reply a comment",true)
        else {
            setTimeout(()=>textRef?.current?.focus(),500)
            setReply(params)
        }
    }

    const handleSubmit=()=>{
        if(value?.match(/\S/) === null) {
            setNotif("Comment cannot be empty",true);
        } else if(user===null && (unLogin.name.length === 0 || unLogin.email.length === 0)) {
            setNotif("Name and email cannot be empty",true);
        } else {
            const urll=window.location.href;
            const posurl: string=urll.match(/\?/g) ? urll.split("?")[0] : urll;
            const send: SendType={
                message: value,
                type: type,
                posid: posId,
                posurl: posurl
            }
            if(reply!==null){
                send.reply_to=reply.id;
                if(typeof reply.parent !== 'undefined') send.parent=reply?.parent
            }
            if(user===null){
                send.name= unLogin?.name;
                send.email=  unLogin?.email;
            }
            setLoading('send')
            if(reply===null) processComment(send)
            else processReply(send)
        }
    }

    const processComment=async(send: SendType)=>{
        captchaRef?.current?.execute()
        .then(recaptcha=>{
            return {
                ...send,
                recaptcha:recaptcha
            }
        }).then(dataInput=>{
            return post<DataResult>(`/v1/comments/${type}/${posId}`,dataInput)
        }).then(([res])=>{
            setValue("")
            setReply(null)
            const a=data
            const b = a.concat([res]);
            setData(b);
        }).catch(err=>{
            textRef?.current?.focus()
        }).finally(()=>{
            setLoading(null)
        })
    }

    const processReply=(send: SendType)=>{
        captchaRef?.current?.execute()
        .then(recaptcha=>{
            return {
                ...send,
                recaptcha:recaptcha
            }
        }).then(dtInput=>{
            return post<ReplyResult>(`/v1/comments/${type}/${posId}`,dtInput)
        }).then(([res])=>{
            const id=reply!==null ? (typeof reply.parent !== 'undefined' ? reply.parent : reply.id) : 0;
            const index=data.findIndex(item=>item?.id===id);
            if(index!==-1) {
                let c=[...data];
                const rep=data[index].reply.data
                const a: ReplyResult[]=rep;
                const b = a.concat([res]);
                c[index]={
                    ...c[index],
                    reply:{
                        ...c[index].reply,
                        total:c[index].reply.total+1,
                        data:b
                    }
                }
                setData(c)
                setValue("")
                setReply(null)
            }
        }).catch(err=>{
            textRef?.current?.focus()
        }).finally(()=>{
            setLoading(null)
        })
    }

    const handleDelete=(params: OnDeleteType)=>{
        if(params.type==='reply' && typeof params.parentId !== 'undefined') {
            const aa = params.parentId||0
            const ind=data.findIndex(item=>item?.id===aa);
            let b = data[ind].reply.data
            if(b.length > 0) {
                const index=b.findIndex(item=>item?.id===params.id);
                if(index!==-1) {
                    let a=[...data];
                    if(b.length===1) b=[];
                    else b.splice(index,1);
                    a[ind]={
                        ...a[ind],
                        reply:{
                            ...a[ind].reply,
                            total: a[ind].reply.total-1,
                            data:b
                        }
                    }
                    setData(a)
                }
            }
        } else {
            const index=data.findIndex(item=>item?.id===params.id);
            if(index!==-1) {
                let a = [...data];
                a.splice(index,1)
                setData(a)
            }
            
        }
    }

    return (
        <PaperBlock title={ttitle} toggle={ttoggle} initialShow={initialSh} linkColor noPadding noMarginFooter divider={false}
        enableSlideDown
        footer={
            <form onSubmit={(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault(),handleSubmit()}}>
                <div key={0} style={{margin:'10px 0'}}><Divider /></div>
                <div key={1}>
                    {user===null ? (
                        <Grid container spacing={2} justifyContent='center'>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    value={unLogin?.name||''}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>setUnlogin({...unLogin,name:e.target.value})}
                                    fullWidth
                                    variant='outlined'
                                    label='Name'
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    value={unLogin?.email||''}
                                    type='email'
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>setUnlogin({...unLogin,email:e.target.value})}
                                    fullWidth
                                    variant='outlined'
                                    label='Email'
                                    required
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <div key={0} style={{padding:'0 10px'}}><Typography>Commented as <Link href='/user/[...slug]' as={`/user/${user?.user_login}`} passHref><a>{user?.user_login}</a></Link></Typography></div>
                    )}
                </div>
                <div key={2} style={{margin:'10px 0'}}><Divider /></div>
                <Slidedown>
                    {reply!==null && (
                        <div className={classes.reply}>
                            <Typography variant='caption'>@{reply.username}: {Ktruncate(reply.message,100)}</Typography>
                            <IconButton className={classes.iconWhite} onClick={()=>setReply(null)} size="large">
                                <CloseIcon />
                            </IconButton>
                        </div>
                    )}
                </Slidedown>
                <div key={3} className={clx(classes.inputContainer,loading==='send' && classes.disabled)}>
                    <div key={0} style={{height:'100%',position:'relative',flex:1}}>
                        <TextareaAutosize ref={textRef} required minRows={2} maxRows={4} placeholder='Type a comment' className={clx(classes.input)}  disabled={loading!==null}
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        />
                    </div>
                    <div key={1} title="Send">
                        <IconButton color='primary' size='small' disabled={loading==='send'} className={clx(loading==='send' && classes.disabled)} type='submit'>
                            <SendIcon />
                            {loading==='send' && <CircularProgress size={24} thickness={7} className={classes.buttonProgress} />}
                        </IconButton>
                    </div>
                </div>
            </form>
        }
        {...other}
        >
            {loading==='global' ? (
                <div style={{margin:'10px 0',textAlign:'center'}}>
                    <CircularProgress thickness={5} size={40}/>
                </div>
            ) : !reachEnd ? (
                <div style={{textAlign:'center'}}>
                    <Tooltip title='Load more' className={classes.tooltip} enterTouchDelay={100}>
                        <IconButton disabled={loading!==null} onClick={()=>getComment(page+1)} size="large">
                            <Autorenew />
                        </IconButton>
                    </Tooltip>
                </div>
            ) : null}

            {data?.length > 0 ? (
                <List component='div' className={classes.list}>
                    {data?.map((dt:DataResult,i:number)=>(
                        <Comment 
                            key={`comment-${i}`}
                            type='comment'
                            data={dt} 
                            content_type={type}
                            posid={posId}
                            isLoading={loadingCom===`comment-${i}`}
                            onLoading={()=>setLoadingCom(`comment-${i}`)}
                            onStopLoading={()=>setLoadingCom(null)}
                            isExpanded={expand===`comment-${i}`}
                            onExpand={()=>setExpand(expand===`comment-${i}` ? null : `comment-${i}`)}
                            onReply={handleReply}
                            anyReply={dt?.reply!==null}
                            onDelete={handleDelete}
                        >
                            <Slidedown className={clx(expand===`comment-${i}` && dt?.reply.data.length > 0 && classes.delayy)}>
                                {expand===`comment-${i}` && (
                                    <div style={{display:'block'}}>
                                        {loading===`comment-${dt?.id}` ? (
                                            <div className={classes.child}>
                                                <div style={{textAlign:'center'}}>
                                                    <CircularProgress thickness={5} size={40}/>
                                                </div>
                                            </div>
                                        ) : dt?.reply?.data.length < dt?.reply.total ? (
                                            <div className={classes.child}>
                                                <div style={{textAlign:'center'}}>
                                                    <Tooltip title='Load more' className={classes.tooltip} enterTouchDelay={100}>
                                                        <IconButton
                                                            disabled={loading!==null}
                                                            onClick={()=>getReplies(dt?.id,(dt?.reply.page+1))}
                                                            size="large">
                                                            <Autorenew />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ) : null}

                                        {dt?.reply.data.length > 0 ? (
                                            <div className={classes.child}>
                                                <List component='div' className={classes.list}>
                                                    {dt?.reply.data?.map((rep: ReplyResult,ii: number)=>(
                                                        <Comment 
                                                            key={`reply-${i}-${ii}`}
                                                            type='reply'
                                                            data={rep}
                                                            content_type={type}
                                                            posid={posId}
                                                            isLoading={loadingCom===`reply-${i}-${ii}`}
                                                            onLoading={()=>setLoadingCom(`reply-${i}-${ii}`)}
                                                            onStopLoading={()=>setLoadingCom(null)}
                                                            parentId={dt?.id}
                                                            onReply={handleReply}
                                                            anyReply={false}
                                                            onDelete={handleDelete}
                                                        />
                                                    ))}
                                                </List>
                                            </div>
                                        ) : (
                                            <div style={{margin:'20px 5',textAlign:'center'}}>
                                                <Typography key={0} color='textSecondary'>There are no replies yet.</Typography>
                                                <Typography key={1} color='textSecondary'>Comment now.</Typography>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Slidedown>
                        </Comment>
                    ))}
                </List>
            ) : loading===null ? (
                <div style={{margin:'20px 5',textAlign:'center'}}>
                    <Typography key={0} color='textSecondary'>There are no comments yet.</Typography>
                    <Typography key={1} color='textSecondary'>Comment now.</Typography>
                </div>
            ) : null}
            
            <ReCaptcha
                ref={captchaRef}
            />
        </PaperBlock>
    );
}

/*interface CommentTypess<T> {
    data: T
    parentId?: number
    children?: JSX.Element
    key: string|number
    onLoading:()=>void
    onStopLoading:()=>void
    onExpand?:()=>void
    isLoading: boolean
    isExpanded?: boolean
    type: 'comment'|'reply'
    onReply: (params: ReplyValueType)=>void
    anyReply: boolean
}

interface CommentTypes<T>(props: CommentTypess<T>) => JSX.Element*/

type OnDeleteType={
    type: 'comment'|'reply',
    id: number,
    parentId?: number
}

type CommentType={
    data: DataResult|ReplyResult,
    parentId?: number,
    children?: JSX.Element,
    key: string|number,
    onLoading:()=>void,
    onStopLoading:()=>void,
    onExpand?:()=>void,
    isLoading: boolean,
    isExpanded?: boolean,
    type: 'comment'|'reply',
    onReply: (params: ReplyValueType)=>void,
    anyReply: boolean,
    onDelete: (params: OnDeleteType)=>void,
    content_type: CommentsType,
    posid: number|string
}
const Comment=({key,data:dt,children,isLoading,type,isExpanded,parentId,onExpand,onReply,anyReply,onDelete,content_type,posid}: CommentType)=>{
    const {setNotif}=useNotif()
    const {del}=useAPI()
    const {classes}=useStyles()
    const dispatch=useDispatch()
    const [anchorEl,setAnchorEl]=useState<Array<number>|null>(null)
    const [open,setOpen]=useState<string|number|null>(null)
    const [loading,setLoading]=useState(false)
    const [dialog,setDialog]=useState(false)
    const handleButton=(type: string|number)=>(event: React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
        setOpen(open===type ? null : type)
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    }
    const onClose=()=>{
        setOpen(null)
        setAnchorEl(null)
    }
    const handleMenu=(typ: string)=>()=>{
        onClose()
        if(typ==='copy' && dt?.comment!==null){
            Kcopy(dt?.comment).then(()=>setNotif('Text copied',false))
        } else if(typ==='delete' && dt?.can_deleted !==null) {
            setDialog(true)
        } else if(typ==='reply') {
            if(type==='reply' && typeof parentId==='undefined') return;
            const rep: ReplyValueType={id:dt?.id,username:dt?.user?.name,message:dt?.comment}
            if(type==='reply') rep.parent=parentId
            onReply(rep)
        } else if(typ==='report') {
            dispatch({type:"REPORT",payload:{type:'komentar',url:window.location.href,endpoint:dt?.id}})
        }
    }
    const handleDelete=()=>{
        setLoading(true)
        del(`/v1/comments/${content_type}/${posid}/${dt.id}`,{success_notif:true}).then((res: any)=>{
            setLoading(false)
            const params: OnDeleteType={
                type:type,
                id: dt?.id
            }
            if(type==='reply') params.parentId=parentId
            onDelete(params)
        }).catch((err: any)=>{
            setLoading(false)
        })
    }
    return (
        <div key={key} className={clx(type==='comment' && classes.divList)}>
            <ListItem component='div' key={key} classes={{root:classes.listItem,secondaryAction:type==='comment' ? classes.secondaryAction : classes.secondaryActionChild}}>
                {type==='comment' && anyReply ? (
                    <div className={clx(classes.border,!isExpanded && classes.delay)} style={{height:isExpanded===true?'calc(100% - 21px)' : 0}}></div>
                ) : type==='reply' ? (
                    <div className={classes.borderChild}></div>
                ) : null}
                <ListItemAvatar style={{top:10,position:'relative'}}>
                    <Avatar 
                        alt={dt?.user?.name!==null ? dt?.user?.name:""}
                        {...(dt?.user?.picture!==null ? {children:<Image width={40} height={40} dataSrc={dt?.user?.picture} src={`${dt?.user?.picture}&size=40&watermark=no`} fancybox dataFancybox={dt?.user?.name} webp alt={dt?.user?.name} style={{width:40}} />} : {children:dt?.user?.name})}
                    />
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography noWrap>{dt?.user?.username!==null ? <Link href='/user/[...slug]' as={`/user/${dt?.user?.username}`} passHref><a><strong>{dt?.user?.name}</strong></a></Link> : <strong>{dt?.user?.name}</strong>}</Typography>}
                    secondary={
                        <div className='noselect'>
                            <Typography variant='body1'>{dt?.comment.replace(/&amp;/g, "\&")}</Typography>
                            <Typography color='textSecondary' variant='caption'>{time_ago(dt?.timestamp)}</Typography>
                        </div>
                    }
                />
                <ListItemSecondaryAction>
                    <IconButton
                        key='option'
                        onClick={handleButton(key)}
                        disabled={loading&&isLoading}
                        size="large">
                        <MoreVert />
                    </IconButton>
                    {type==='comment' && (
                        <IconButton key='expand' onClick={onExpand} size="large">
                            {isExpanded===true ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    )}
                    <Menu
                        anchorReference="anchorPosition"
                        anchorPosition={
                            anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                        }
                        open={open===key}
                        onClose={onClose}
                    >
                        {type==='comment' || type==='reply' && typeof parentId!=='undefined' ? (
                            <MenuItem key={1} onClick={handleMenu('reply')}>
                                <ListItemIcon>
                                    <ReplyIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit" noWrap>
                                    Reply
                                </Typography>
                            </MenuItem>
                        ):null}
                        <MenuItem key={0} onClick={handleMenu('copy')}>
                            <ListItemIcon>
                                <FileCopy fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap>
                                Copy
                            </Typography>
                        </MenuItem>
                        {typeof dt?.can_deleted && (
                            <MenuItem key={2} onClick={handleMenu('delete')}>
                                <ListItemIcon>
                                    <Delete fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="inherit" noWrap>
                                    Delete
                                </Typography>
                            </MenuItem>
                        )}
                        <MenuItem key={3} onClick={handleMenu('report')}>
                            <ListItemIcon>
                                <ReportProblem fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="inherit" noWrap>
                                Report
                            </Typography>
                        </MenuItem>
                    </Menu>
                </ListItemSecondaryAction>
            </ListItem>
            {children}
            <Dialog open={dialog} onClose={()=>setDialog(false)}>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent dividers>
                    Delete `{dt?.comment}`?
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' disabled={loading} onClick={()=>setDialog(false)}>Cancel</Button>
                    <Button disabled={loading} loading={loading} onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Comments