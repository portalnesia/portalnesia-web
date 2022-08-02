import React from 'react'
import Header from 'portal/components/developer/Header'
import Image from 'portal/components/Image'
import PaperBlock from 'portal/components/PaperBlock'
import Avatar from 'portal/components/Avatar'
import Button from 'portal/components/Button'
import Skeleton from 'portal/components/Skeleton'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {makeStyles} from 'portal/components/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import Link from 'next/link'
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import useSWR from 'portal/utils/swr'
import Recaptcha from 'portal/components/ReCaptcha'
import {
    Grid,
    List,ListItemSecondaryAction,ListItem,ListItemText,
    ListItemAvatar,
    Typography,
    IconButton,
    TextField,
    Pagination
} from '@mui/material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper('admin');

const styles = makeStyles()((theme)=>({
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
}))

const defaultInput = {name:'',description:''}
export default function DevAppsIndex({err}){
  if(err) return <ErrorPage statusCode={err} />

  const {classes} = styles();
  const router=useRouter();
  const [dialog,setDialog]=React.useState(null);
  const [loading,setLoading]=React.useState(null);
  const {post,del} = useAPI();
  const {data,error,mutate}=useSWR(`/v1/developer/apps?page=${(router.query.page || 1)}`)
  const [input,setInput]=React.useState(defaultInput)
  const [dialogNew,setDialogNew]=React.useState(false)

  const captchaRef = React.useRef();

  const handleEdit=React.useCallback((name)=>(e)=>{
    setInput(prev=>({...prev,[name]:e?.target?.value}))
  },[setInput])

  const openDeleteDialog=React.useCallback((dt,i)=>()=>{
    const dd={
        ...dt,
        index:i,
    }
    setDialog(dd);
  },[])

  const closeDialog=React.useCallback(()=>{
    setDialog(null);
    setDialogNew(null)
  },[])

  const handlePagination = React.useCallback((event, value) => {
    router.push({
        pathname:'/developer/apps',
        query:{
            page:value
        }
    },`/developer/apps?page=${value}`,{shallow:true})
  },[]);

  const handleRemove = React.useCallback((dialog)=>async()=>{
    setLoading('delete')

    try {
      await del(`/v1/developer/apps/${dialog?.id}`);
      mutate();
      setDialog(null);
    } catch {}
    finally {
      setLoading(null);
    }
  },[del,data,mutate])

  const handleSubmit=React.useCallback(async(e)=>{
    if(e?.preventDefault) e?.preventDefault();
    setLoading('submit')
    try {
      const recaptcha = await captchaRef.current?.execute();
      await post('/v1/developer/apps',{...input,recaptcha});
      mutate();
      setInput(defaultInput);
      setDialogNew(false);
    } catch {

    } finally {
      setLoading(null);
    }
  },[input,post])

  return (
    <Header title='My Apps' desc='My Application' active='apps' canonical='/developer/apps' noIndex>
      <Grid container justifyContent='center'>
        <Grid item xs={12}>
          <PaperBlock title="My Apps" noPadding whiteBg footer={
            <Pagination color='primary' count={Number(data?.total_page||1)} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
          }
          action={
            <Button color='secondary' onClick={()=>setDialogNew(true)} icon='add'>Create Apps</Button>
          }>
            {!data && !error ? (
                <Skeleton type='list' number={3} />
            ) : error ? (
                <center><Typography variant="h5">{error}</Typography></center>
            ) : data?.data?.length === 0 ? (
                <center><Typography variant="h5">No apps</Typography></center>
            ) : (
              <List>
                {data?.data?.map((dt,i)=>(
                  <ListItem key={`apps-${i}`} divider classes={{secondaryAction:classes.secondaryAction}}>
                    <ListItemAvatar>
                      <Avatar>
                        {dt?.icon ? <Image src={`${dt.icon}&size=40&watermark=no`} style={{width:40}} alt={dt.name} /> : dt?.name}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography>{dt.name}</Typography>}
                    />
                    <ListItemSecondaryAction>
                      <Link href={`/developer/apps/${dt.id}`} passHref>
                        <IconButton title="Delete" component='a' edge="end" aria-label="edit" size="large">
                          <CreateIcon />
                        </IconButton>
                      </Link>
                      <IconButton
                        edge="end"
                        title="Delete"
                        aria-label="delete"
                        onClick={openDeleteDialog(dt,i)}
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
              <Button disabled={loading !== null} onClick={closeDialog}>Cancel</Button>
              <Button disabled={loading !== null} loading={loading==='delete'} onClick={handleRemove(dialog)} color='secondary' icon='delete'>Delete</Button>
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
          <form onSubmit={handleSubmit}>
            <DialogTitle>Create Apps</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12}>
                    <TextField
                      label='App Name'
                      value={input?.name||''}
                      onChange={handleEdit('name')}
                      variant='outlined'
                      fullWidth
                      required
                      autoFocus
                      disabled={loading !== null}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                      label='App Description'
                      value={input?.description||""}
                      onChange={handleEdit('description')}
                      InputProps={{
                          className:classes.scrollBar
                      }}
                      variant='outlined'
                      fullWidth
                      multiline
                      rows={5}
                      disabled={loading !== null}
                    />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button disabled={loading !== null} onClick={closeDialog} outlined>Cancel</Button>
              <Button disabled={loading !== null} type='submit' loading={loading==='submit'}>Create</Button>
            </DialogActions>
          </form>
        </Dialog>
        <Recaptcha ref={captchaRef} />
    </Header>
  )
}