import React from 'react'
import { ContentCommentType, IComment,ICommentReply,IReply } from '@model/comment'
import Box, { BoxProps } from '@mui/material/Box'
import submitForm from '@utils/submit-form'
import PaperBlock from '@design/components/PaperBlock'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Textarea from '@design/components/Textarea'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import { Delete, KeyboardArrowDown, MoreVert, Send } from '@mui/icons-material'
import { Circular } from '@design/components/Loading'
import { useSelector } from '@redux/store'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from '@design/components/Link'
import { Span } from '@design/components/Dom'
import useAPI, { ApiError, PaginationResponse } from '@design/hooks/api'
import Recaptcha from '@design/components/Recaptcha'
import ConfirmationDialog from '@design/components/ConfirmationDialog'
import useNotification from '@design/components/Notification'
import Divider from '@mui/material/Divider'
import { BoxPagination } from '@design/components/Pagination'
import { useSWRPagination } from '@design/hooks/swr'
import SWRPages from './SWRPages'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@design/components/Avatar'
import Image from './Image'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import MenuPopover from '@design/components/MenuPopover'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import dynamic from 'next/dynamic'
import { truncate } from '@portalnesia/utils'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'
import { isMobile } from 'react-device-detect'
import Portal from '@mui/material/Portal'
import { getDayJs } from '@utils/main'
import Button from './Button'

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));

export interface CommentProps {
    /**
     * ID Number
     */
    posId:number
    type:ContentCommentType
    /**
     * Comment ID for notification
     */
    comment_id?: number
    collapse?: boolean
}

type DeleteFunc = (id: Pick<ICommentReply,'id'|'comment'>,isReply?: boolean) => Promise<void>
type SubmitFunc = (data: {message: string,name?:string,email?:string,reply_to?:number}) => Promise<void>

export default function Comment({type,posId,comment_id,collapse}: CommentProps) {
    const {post,del} = useAPI();
    const captchaRef = React.useRef<Recaptcha>(null);
    const confirmRef = React.useRef<ConfirmationDialog>(null);
    const setNotif = useNotification();
    const {data,error,mutate,size,setSize,isLoadingMore} = useSWRPagination<PaginationResponse<IComment>>(`/v2/comments/${type}/${posId}?per_page=5${comment_id ? `&id=${comment_id}` : ''}`)
    const [loading,setLoading] = React.useState(false);
    const [delComment,setDelComment] = React.useState<Pick<ICommentReply,'id'|'comment'>>()

    const onSubmitComment = React.useCallback((data: {message: string,name?:string,email?:string,reply_to?:number})=>{
        return new Promise<void>(async(res,rej)=>{
            try {
                const recaptcha = await captchaRef.current?.execute();
                const body = {
                    ...data,
                    recaptcha
                }
                await post<IComment>(`/v2/comments/${type}/${posId}`,body,{},{success_notif:false});
                mutate()
                res();
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true)
                rej();
            }
        })
    },[type,posId,setNotif,post,mutate])

    const handleDelete = React.useCallback((data: Pick<ICommentReply,'id'|'comment'>,isReply?:boolean)=>{
        return new Promise<void>(async(res,rej)=>{
            try {
                setDelComment(data);
                const confirm = await confirmRef.current?.show();
                if(!confirm) return;
    
                setLoading(true)
                await del(`/v2/comments/${type}/${posId}/${data.id}`,{success_notif:false});
                if(!isReply) mutate()
                res();
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true)
            } finally {
                setLoading(false)
                rej();
            }
        })
    },[type,posId,del,setNotif,mutate])

    return (
        <PaperBlock title="Comments" content={{sx:{p:0,pb:'0!important'}}} collapse={collapse}>
            <CommentForm handleSubmit={onSubmitComment} />
            <Divider sx={{mt:2}} />
            <CommentTree data={data} error={error} onDelete={handleDelete} type={type} posId={posId} comment_id={comment_id} onSubmit={onSubmitComment} />
            
            <Box width='100%'>
                {data?.can_load && (
                    <Box my={2} px={2} width='100%'>
                        {isLoadingMore ? <BoxPagination loading maxHeight={55} /> : (
                            <Button size='large' outlined color='inherit' sx={{width:'100%'}} onClick={()=>setSize(size+1)}>Load more</Button>
                        )}
                    </Box>
                )}
            </Box>

            <Backdrop open={loading} />
            <ConfirmationDialog ref={confirmRef} body={delComment ? (
                <Typography>Delete comment <Span sx={{color:'customColor.link'}}>{truncate(delComment.comment,50)}</Span>?</Typography>
            ) : undefined} />
            <Recaptcha ref={captchaRef} />
        </PaperBlock>
    )
}

type CommentFormProps = TextFieldProps & {
    handleSubmit: SubmitFunc
    wrapper?: BoxProps
}

function CommentForm({handleSubmit,wrapper,placeholder="Add comments..."}: CommentFormProps) {
    const user = useSelector(s=>s.user);
    const [unLogin,setUnlogin] = React.useState({name:"",email:""})
    const [input,setInput] = React.useState("");
    const [loading,setLoading] = React.useState(false);
    const ref = React.useRef<HTMLTextAreaElement>(null)

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const onSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            await handleSubmit({message:input,...(!user ? {...unLogin} : {})})
            setInput("");
            setLoading(false)
        } catch(e) {
            setLoading(false)
            setTimeout(()=>ref.current?.focus(),100);
        }
    }),[handleSubmit,input,unLogin,user])

    const handleKeyPress=React.useCallback((e: React.KeyboardEvent<HTMLDivElement>)=>{
        if(e?.keyCode==13 && !e?.shiftKey && !isMobile) {
            if(input?.match(/\S/) !== null){
                e.preventDefault();
                onSubmit();
            }
        }
    },[input,onSubmit])

    return (
        <Box sx={{px:2,...wrapper?.sx}} {...wrapper}>
            <form onSubmit={onSubmit}>
                <Grid container spacing={1}>
                    {!user ? (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Name"
                                    value={unLogin.name}
                                    onChange={e=>setUnlogin({...unLogin,name:e.target.value})}
                                    required
                                    fullWidth
                                    disabled={loading}
                                    autoComplete='name'
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Email"
                                    value={unLogin.email}
                                    onChange={e=>setUnlogin({...unLogin,email:e.target.value})}
                                    required
                                    fullWidth
                                    disabled={loading}
                                    autoComplete='email'
                                    type="email"
                                />
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <Typography>Comment as <Link href={`/user/${user.username}`}><Span sx={{color:'customColor.link'}}>{user.name}</Span></Link></Typography>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Box position="relative">
                            <Textarea
                                value={input}
                                onChange={e=>setInput(e.target.value)}
                                multiline
                                minRows={2}
                                maxRows={5}
                                fullWidth
                                placeholder={placeholder}
                                required
                                disabled={loading}
                                inputRef={ref}
                                onKeyDown={handleKeyPress}
                                InputProps={{
                                    sx:{
                                        pr:7
                                    }
                                }}
                            />
                            <IconButton sx={{position:'absolute',right:10,top:10}} color='primary' disabled={loading} type='submit'>
                                {loading ? <Circular size={24} thickness={7} /> : <Send />}
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    )
}
type CommentTreeProps = CommentProps & {
    data?:PaginationResponse<IComment>
    error?:any
    onDelete?: DeleteFunc
    onSubmit: SubmitFunc
}
function CommentTree({data,error,...rest}: CommentTreeProps) {
    
    return (
        <Box>
            <SWRPages loading={!data && !error} error={error}>
                {data && data?.data?.length > 0 ? (
                    <List sx={{pb:0,"& .comment":{":last-of-type":{borderBottom:'unset'}}}}>
                        {data?.data?.map(d=>(
                            <CommentSection data={d} key={`comment-${d.id}`} {...rest} />
                        ))}
                    </List>
                ) : (
                    <BoxPagination>
                        <Typography>There are no comments yet.</Typography>
                        <Typography>Comment now!</Typography>
                    </BoxPagination>
                )}
            </SWRPages>
        </Box>
    )
}

type CommentSectionProps = CommentProps & {
    data: IComment
    onDelete?: DeleteFunc
    onSubmit: SubmitFunc
}
function CommentSection({data,onDelete,type,posId,comment_id,onSubmit}: CommentSectionProps) {
    const anchorEl = React.useRef<HTMLButtonElement>(null);
    const [open,setOpen] = React.useState(false);
    const [showReplies,setShowReplies] = React.useState(false)
    const {data:replies,error,mutate,size,setSize,isLoadingMore} = useSWRPagination<IReply>(showReplies ? `/v2/comments/${type}/${posId}/${data.id}${comment_id ? `?id=${comment_id}` : ''}` : null,data?.replies ? {fallbackData:[data?.replies]} : undefined);

    const handleDelete = React.useCallback(()=>{
        setOpen(false)
        try {
            if(onDelete) onDelete(data)
        } catch {}
    },[onDelete,data])

    const handleDeleteReply = React.useCallback(async(data: Pick<ICommentReply,'id'|'comment'>)=>{
        try {
            if(onDelete) {
                await onDelete(data,true)
                mutate();
            }
        } catch{}
    },[onDelete,mutate]);

    const handleReplies = React.useCallback((dataArgs: {message: string,name?:string,email?:string})=>{
        return new Promise<void>(async(res,rej)=>{
            try {
                await onSubmit({...dataArgs,reply_to:data.id});
                mutate();
                res()
            } catch {
                rej();
            }
        })
    },[data,onSubmit,mutate])

    React.useEffect(()=>{
        if(data.replies) {
            setShowReplies(true);
        }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[])

    return (
        <Box className='comment' borderBottom={t=>`1px solid ${t.palette.divider}`} position='relative'>
            <ListItem sx={{alignItems:"flex-start"}}>
                <ListItemAvatar>
                    <Avatar>
                        {data.user?.picture ? <Image src={`${data.user.picture}&watermark=no&size=40`} alt={data.user.name} /> : data.user.name }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        data.user?.username ? (
                            <Stack alignItems='flex-start'><Link href={`/user/${data.user.username}`}><Typography gutterBottom sx={{fontSize:16}}>{data?.user?.name}</Typography></Link></Stack>
                        ) : <Typography gutterBottom sx={{fontSize:16}}>{data?.user?.name}</Typography>
                    }
                    secondary={
                        <>
                            <Typography>{data.comment}</Typography>
                            <Typography variant='caption' sx={{color:'text.disabled'}}>{getDayJs(data.timestamp).time_ago().format}</Typography>
                        </>
                    }
                />
                <ListItemSecondaryAction>
                    {(data.can_deleted) && (
                        <Tooltip title="Options">
                            <IconButton ref={anchorEl} onClick={()=>setOpen(true)}>
                                <MoreVert />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={showReplies ? "Hide replies" : "Show replies"}>
                        <IconButton onClick={()=>setShowReplies(!showReplies)}>
                            <KeyboardArrowDown sx={{transform: showReplies ? 'rotate(180deg)' : 'rotate(0deg)',transition:t=>t.transitions.create('transform',{duration:t.transitions.duration.shortest})}} />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={showReplies} unmountOnExit>
                <Box ml={7}>
                    <Box position='absolute' left={35} top={60} height="calc(100% - 80px)">
                        <Divider orientation='vertical' sx={{bgcolor:'primary.main'}} />
                    </Box>
                    <CommentForm handleSubmit={handleReplies} placeholder="Add replies..." />
                    <SWRPages loading={!replies && !error} error={error}>
                        {replies && replies?.data?.length > 0 ? (
                            <List sx={{"& .replies":{":last-of-type":{borderBottom:'unset'}}}}>
                                {replies?.data?.map(d=>(
                                    <RepliesSection data={d} key={`replies-${data.id}-${d.id}`} onDelete={handleDeleteReply} />
                                ))}
                            </List>
                        ) : (
                            <BoxPagination>
                                <Typography>There are no replies yet.</Typography>
                                <Typography>Comment now!</Typography>
                            </BoxPagination>
                        )}

                        <Box width='100%'>
                            {replies?.can_load && (
                                <Box my={2} px={2} width='100%'>
                                    {isLoadingMore ? <BoxPagination loading maxHeight={55} /> : (
                                        <Button size='large' outlined color='inherit' sx={{width:'100%'}} onClick={()=>setSize(size+1)}>Load more</Button>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </SWRPages>
                </Box>
            </Collapse>
            <Portal>
                <MenuPopover
                    open={open}
                    onClose={()=>setOpen(false)}
                    anchorEl={anchorEl.current}
                    paperSx={{ width: 220 }}
                >
                    <Box py={1}>
                        <MenuItem>
                            <ListItemIcon><Delete /></ListItemIcon>
                            <ListItemText onClick={handleDelete}>Delete</ListItemText>
                        </MenuItem>
                    </Box>
                </MenuPopover>
            </Portal>
        </Box>
    )
}

type RepliesSectionProps = {
    onDelete?: DeleteFunc
    data: IReply['data'][number]
}

function RepliesSection({data,onDelete}: RepliesSectionProps) {
    const anchorEl = React.useRef<HTMLButtonElement>(null);
    const [open,setOpen] = React.useState(false);

    const handleDelete = React.useCallback(()=>{
        setOpen(false)
        if(onDelete) onDelete(data)
    },[onDelete,data])

    return (
        <>
            <ListItem className='replies' sx={{alignItems:"flex-start"}} divider>
                <ListItemAvatar>
                    <Avatar>
                        {data.user?.picture ? <Image src={`${data.user.picture}&watermark=no&size=40`} alt={data.user.name} /> : data.user.name }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        data.user?.username ? (
                            <Stack alignItems='flex-start'><Link href={`/user/${data.user.username}`}><Typography gutterBottom sx={{fontSize:16}}>{data?.user?.name}</Typography></Link></Stack>
                        ) : <Typography gutterBottom sx={{fontSize:16}}>{data?.user?.name}</Typography>
                    }
                    secondary={
                        <>
                            <Typography>{data.comment}</Typography>
                            <Typography variant='caption' sx={{color:'text.disabled'}}>{getDayJs(data.timestamp).time_ago().format}</Typography>
                        </>
                    }
                />
                {(data.can_deleted) && (
                    <>
                        <ListItemSecondaryAction>
                            <IconButton ref={anchorEl} onClick={()=>setOpen(true)}>
                                <MoreVert />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </>
                )}
            </ListItem>
            <Portal>
                <MenuPopover
                    open={open}
                    onClose={()=>setOpen(false)}
                    anchorEl={anchorEl.current}
                    paperSx={{ width: 220 }}
                >
                    <Box py={1}>
                        <MenuItem>
                            <ListItemIcon><Delete /></ListItemIcon>
                            <ListItemText onClick={handleDelete}>Delete</ListItemText>
                        </MenuItem>
                    </Box>
                </MenuPopover>
            </Portal>
        </>
        
    )
}