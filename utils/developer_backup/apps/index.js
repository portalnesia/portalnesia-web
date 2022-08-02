import React from 'react'
import Header from 'portal/components/developer/Header'
import Image from 'portal/components/Image'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import Skeleton from 'portal/components/Skeleton'
import {useNotif} from 'portal/components/Notification'
import db from 'portal/utils/db'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import { Pagination } from '@mui/material';
import Link from 'next/link'
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import useSWR from 'portal/utils/swr'
import {
    Grid,
    List,ListItemSecondaryAction,ListItem,ListItemText,
    ListItemAvatar,Avatar,
    Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogTitle,
    TextField,
    DialogContent
} from '@mui/material'

export const getServerSideProps = wrapper('login')

const styles=theme=>({
    secondaryAction:{
        paddingRight:96
    },
    scrollBar:{
        '& textarea':{
            cursor:'auto',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.7em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                    borderRadius:4
                },
            }
        }
    },
})

const defaultInput = {name:'',description:''}
const MyApp=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [dialog,setDialog]=React.useState(null);
    const [loading,setLoading]=React.useState(false)
    const {setNotif}=useNotif()
    const {post} = useAPI()
    const {data,error,mutate}=useSWR(`/v1/developer/apps?page=${(router.query.page || 1)}`)
    const [input,setInput]=React.useState(defaultInput)
    const [dialogNew,setDialogNew]=React.useState(false)

    const handleEdit=(name,value)=>{
        setInput({...input,[name]:value})
    }

    const openDialog=(dt,i)=>{
        const dd={
            ...dt,
            index:i,
        }
        setDialog(dd);
    }
    const closeDialog=()=>{
        setDialog(null)
    }

    const handlerRemove=(token,i)=>{
        /*setLoading(true);
        post(`${process.env.API}/developer/delete`,{token:token})
        .then((res)=>{
            setNotif(res.msg,Boolean(res.error))
            if(!res.error) {
                let newData=[...data?.apps];
                newData.splice(i,1);
                mutate({
                    ...data,
                    apps:newData
                })
                setDialog(null);
            }
        }).catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true);
        })
        .finally(()=>setLoading(false))*/
    }

    const handlePagination = (event, value) => {
        router.push({
            pathname:'/developer/apps',
            query:{
                page:value
            }
        },`/developer/apps?page=${value}`,{shallow:true})
    };

    const handleNew=(e)=>{
        if(e && e.preventDefault) e.preventDefault()
        /*setLoading(true)
        PNpost(`${process.env.API}/developer/new`,input)
        .then((res)=>{
            setNotif(res?.msg,Boolean(res?.error))
            if(!res.error) {
                const a = [{
                    id:res.id,
                    name:input.name,
                    token:res.token,
                    icon:`${process.env.CONTENT_URL}/img/profile?size=200&watermark=no&image=${encodeURI('notfound.png')}`
                }]
                const b = a.concat((data.apps||[]))
                mutate({
                    ...data,
                    apps:b
                })
                setDialogNew(false);
            }
        })
        .catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
        .finally(()=>setLoading(false))*/
    }

    return (
        <Header title='My Apps' desc='My Application' active='apps' canonical='/developer/apps' noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock title="My Apps" noPadding whiteBg footer={
                        <Pagination color='primary' count={Number(data?.total_page||1)} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }
                    action={
                        <Button color='secondary' variant='contained' onClick={()=>setDialogNew(true)}>Create Apps</Button>
                    }>
                        {!data && !error ? (
                            <Skeleton type='list' number={3} />
                        ) : error || data?.error ? (
                            <center><Typography variant="h5">Failed load data</Typography></center>
                        ) : data?.apps?.length ===0 ? (
                            <center><Typography variant="h5">No data</Typography></center>
                        ) : (
                            <List>
                                {data?.apps.map((dt,i)=>(
                                    <ListItem key={i} divider classes={{secondaryAction:classes.secondaryAction}}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <Image webp src={`${dt.icon}&size=40&watermark=no`} style={{width:40}} alt={dt.name} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography>{dt.name}</Typography>}
                                        />
                                        <ListItemSecondaryAction>
                                            <Link href={`/developer/apps/${dt.id}`} passHref>
                                                <IconButton component='a' edge="end" aria-label="edit" size="large">
                                                    <CreateIcon />
                                                </IconButton>
                                            </Link>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={()=>openDialog(dt,i)}
                                                size="large">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List> 
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
            <Dialog open={dialog!==null} aria-labelledby='dialog'  maxWidth='xs' fullWidth scroll='body'>
                <DialogTitle>Are You Sure?</DialogTitle>
                <DialogContent dividers>
                <Typography>{`Delete "${dialog?.name}"`}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading} onClick={closeDialog}>Cancel</Button>
                    <Button disabled={loading} isloading={loading} onClick={()=>handlerRemove(dialog?.token,dialog?.index)} color='secondary'>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogNew}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInput(defaultInput)
                }}>
                <form onSubmit={handleNew}>
                    <DialogTitle>Create Apps</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} justifyContent='center'>
                            <Grid item xs={12}>
                                <TextField
                                    label='App Name'
                                    value={input.name}
                                    onChange={(e)=>handleEdit('name',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='App Description'
                                    value={input.description||""}
                                    onChange={(e)=>handleEdit('description',e.target.value)}
                                    InputProps={{
                                        className:classes.scrollBar
                                    }}
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={5}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={loading} onClick={()=>setDialogNew(false)} outlined>Cancel</Button>
                        <Button disabled={loading} type='submit' isloading={loading}>Create</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Header>
    );
}

export default withStyles(MyApp,styles)