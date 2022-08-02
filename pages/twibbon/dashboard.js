import React from 'react'
import Header from 'portal/components/Header'
import Image from 'portal/components/Image'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import Skeleton from 'portal/components/Skeleton'
import {useNotif} from 'portal/components/Notification'
import Button from 'portal/components/Button'
import {styled} from '@mui/material/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import db from 'portal/utils/db'
import {Grid,Typography,List,ListItemSecondaryAction,ListItem as ListItemMui, ListItemAvatar,ListItemText,Avatar,IconButton,TextField,FormControlLabel,FormGroup,Switch} from '@mui/material'
import { Pagination } from '@mui/material';
import Link from 'next/link'
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import useSWR from 'portal/utils/swr'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper("login")

const ListItem = styled(ListItemMui)(({theme})=>({
    '& .MuiListItem-container':{
        '& :hover':{
            '& .MuiListItem-root':{
                backgroundColor:`${theme.palette.action.hover} !important`
            }
        }
    },
    '& .MuiListItem-secondaryAction':{
        paddingRight:'96px !important'
    }
}))

const MyTwibbon=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [formLoading,setFormLoading]=React.useState(false)
    const [delLoading,setDelLoading]=React.useState(false)
    const [totalPage,setTotalPage]=React.useState(1);
    const [dialog,setDialog]=React.useState(null);
    const [dialogValue,setDialogValue]=React.useState(null);
    const {setNotif}=useNotif()
    const {put,del} = useAPI()
    const {data,error,mutate}=useSWR(`/v1/twibbon/dashboard?page=${(router.query.page || 1)}`)

    React.useEffect(()=>{
        if(data) {
            if(data?.twibbon?.length > 0) setTotalPage(data.total_page)
            else setTotalPage(1)
        }
    },[data])

    const handlePagination = (event, value) => {
        router.push({
            pathname:'/twibbon/dashboard',
            query:{
                page:value
            }
        },`/twibbon/dashboard?page=${value}`,{shallow:true})
    };
    const openDialog=(type,dt,i)=>{
        if(type==='edit') {
            setDialogValue({
                title:dt.title,
                description:dt.description,
                publish:Boolean(dt.publish)
            })
        }
        const dd={
            ...dt,
            index:i,
            type:type
        }
        setDialog(dd);
    }
    const closeDialog=()=>{
        setDialog(null)
        setDialogValue(null);
    }

    const handleEdit=()=>{
        if(dialogValue?.title?.match(/\S/) !==null) {
            setFormLoading(true)
            put(`/v1/twibbon/${dialog?.slug}`,dialogValue).then(()=>{
                setFormLoading(false);
                const i = dialog?.index;
                let aaa=[...data.data]
                aaa[i]={
                    ...aaa[i],
                    title:dialogValue.title,
                    description:dialogValue.description,
                    publish:dialogValue.publish
                }
                mutate({
                    ...data,
                    data:aaa
                })
            }).catch((err)=>{
                setFormLoading(false);
            })
        } else {
            setNotif(err?.msg||'Title cannot be empty',true);
        }
    }

    const handlerRemove=(slug,i)=>{
        setDelLoading(true);
        del(`/v1/twibbon/${slug}`)
        .then(()=>{
            setDelLoading(false);
            let newData=[...data.data];
            newData.splice(i,1);
            mutate({
                ...data,
                data:newData
            })
            setDialog(null)
        }).catch(()=>{
            setDelLoading(false);
        })
    }
    
    return (
        <Header title='My Twibbon' desc='My Twibbon' active='twibbon' subactive='twibbon_dashboard' canonical='/twibbon/dashboard' noIndex>
            <PaperBlock whiteBg
            title='My Twibbon' 
            noPadding
            footer={
                <Pagination color='primary' count={totalPage} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
            }
            action={
                <div><Link href='/twibbon/new'><a><Button color='secondary' icon='add'>New</Button></a></Link></div>
            }>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Breadcrumbs routes={[{label:"Twibbon",href:"/twibbon"}]} title="Dashboard" />
                        {!data && !error ? (
                            <Skeleton type='list' number={8} image />
                        ) : error  ? (
                            <Typography variant="h5">{error}</Typography>
                        ) : data?.data?.length > 0 ? (
                            <List>
                                {data?.data?.map((t,i)=>(
                                    <ListItem key={`twibbon-${i.toString()}`} divider>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <Image width={40} height={40} src={`${t.image}&size=40`} style={{width:40}} alt={t.title} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Link href='/twibbon/[slug]' as={`/twibbon/${t.slug}`}><a><Typography variant="body1">{t.title}</Typography></a></Link>}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                onClick={()=>openDialog('edit',t,i)}
                                                size="large">
                                                <CreateIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={()=>openDialog('delete',t,i)}
                                                size="large">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">No data.</Typography>
                            </div>
                        )}
                    </Grid>
                </Grid>
                <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth='md' fullWidth={dialog?.type==='edit'} scroll='body'>
                    <DialogTitle id='dialog title'>{dialog?.type === 'edit' ? 'Edit '+dialog?.title : dialog?.type === 'delete' ? 'Are you sure?' : ''}</DialogTitle>
                    {dialog?.type==='edit' && (
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Title'
                                        autoFocus
                                        fullWidth
                                        required
                                        value={dialogValue?.title}
                                        onChange={(e)=>setDialogValue({...dialogValue,title:e.target.value})}
                                        variant='outlined'
                                        disabled={formLoading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Description'
                                        rows={5}
                                        maxRows={20}
                                        fullWidth
                                        value={dialogValue?.description}
                                        onChange={(e)=>setDialogValue({...dialogValue,description:e.target.value})}
                                        variant='outlined'
                                        multiline
                                        disabled={formLoading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel control={
                                            <Switch disabled={formLoading} checked={dialogValue.publish} onChange={event=>setDialogValue({...dialogValue,publish:event.target.checked})} color="primary" />
                                        }
                                        label="Publish" />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    )}
                    <DialogActions>
                        {dialog?.type==='edit' ? (
                            <>
                                <Button color='secondary' disabled={formLoading} onClick={closeDialog}>Cancel</Button>
                                <Button onClick={handleEdit} disabled={formLoading} loading={formLoading} icon='save'>Save</Button>
                            </>
                        ) : dialog?.type === 'delete' ? (
                            <>
                                <Button color="secondary" onClick={()=>handlerRemove(dialog?.slug,dialog?.index)} disabled={delLoading} loading={delLoading} icon='delete'>Yes</Button>
                                <Button onClick={closeDialog} disabled={delLoading}>No</Button>
                            </>
                        ) : null}
                        
                    </DialogActions>
                </Dialog>
            </PaperBlock>
        </Header>
    );
}

export default MyTwibbon