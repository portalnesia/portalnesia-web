import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import Avatar from 'portal/components/Avatar'
import Recaptcha from 'portal/components/ReCaptcha'
import useAPI from 'portal/utils/api'
import {useMousetrap} from 'portal/utils/useKeys'
import {slugFormat as Kslug} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import { Pagination } from '@mui/material';
import Link from 'next/link'
import useSWR from 'portal/utils/swr'
import {
    Grid,
    List,ListItem,ListItemText,
    ListItemAvatar,
    Typography,
    TextField,
} from '@mui/material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Image=dynamic(()=>import('portal/components/Image'),{ssr:false})
const Browser=dynamic(()=>import('portal/components/Browser'))

export const getServerSideProps = wrapper('login')

const styles=(theme)=>({
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
const defaultInput={name:'',description:null,slug:'',logo:null,address:null,slogan:null}
const Toko=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {post}=useAPI();
    const [dialog,setDialog]=React.useState(false)
    const [input,setInput]=React.useState(defaultInput)
    const {data,error,mutate}=useSWR(`/v1/toko?page=${router?.query?.page||1}`)
    const [loadingg,setLoadingg]=React.useState(false)
    const [browser,setBrowser] = React.useState(false);
    const captchaRef = React.useRef();

    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        setDialog(true)
    },false)

    const handleEdit=React.useCallback((name,value)=>{
        setInput(prev=>({...prev,[name]:value,...(name === 'name' ? {slug:Kslug(value)} : {})}))
    },[setInput])

    const handleSelectedImage=React.useCallback((dt)=>{
        handleEdit('logo',staticUrl(`img/url?image=${encodeURIComponent(dt.url)}`))
    },[handleEdit])

    const handlePagination = React.useCallback((event, value) => {
        router.push({
            pathname:'/toko',
            query:{
                page:value
            }
        },`/toko?page=${value}`,{shallow:true})
    },[]);

    const handleSubmit=React.useCallback((e)=>{
        if(e?.preventDefault) e.preventDefault()
        setLoadingg(true)
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/toko`,{...input,recaptcha}))
        .then(()=>{
            mutate()
            setDialog(false)
        })
        .catch((err)=>{
            
        })
        .finally(()=>setLoadingg(false))
    },[input,post])

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    return (
        <Header title='My Toko' canonical='/toko' noIndex active="toko">
            <Grid container justifyContent="center">
                <Grid items xs={12}>
                    <PaperBlock title="My Toko" noPadding whiteBg divider={false} footer={
                        <Pagination color='primary' count={Number(data?.total_page||1)} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }
                    action={
                        <Button color='secondary' onClick={()=>setDialog(true)} icon='add'>Create Toko</Button>
                    }>
                        {!data && !error ? (
                            <Skeleton type='list' number={3} image />
                        ) : error ? (
                            <center><Typography variant="h5">{error}</Typography></center>
                        ) : data?.data?.length ===0 ? (
                            <center><Typography variant="h5">No data</Typography></center>
                        ) : (
                            <List>
                                {data?.data.map((dt,i)=>(
                                    <Link key={i} href={`/toko/${dt?.slug}`} passHref><ListItem divider button alignItems="flex-start" component="a">
                                        <ListItemAvatar>
                                            <Avatar>
                                                {dt?.logo !== null ? (
                                                    <Image webp src={`${dt?.logo}&size=40&watermark=no`} style={{width:40}} alt={dt.name} />
                                                ) : dt?.name}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography>{dt.name}</Typography>}
                                            secondary={
                                                <React.Fragment>
                                                    {dt.description != null && <Typography variant='body2'>{dt.description}</Typography>}
                                                    {dt.address != null && <Typography variant='body2'>{dt.address}</Typography> }
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem></Link>
                                ))}
                            </List>
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
            <Dialog
                open={dialog}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInput(defaultInput)
                }}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Create Toko</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} justifyContent='center'>
                            <Grid item xs={12}>
                                <TextField
                                    label='Toko Name'
                                    value={input.name}
                                    onChange={(e)=>handleEdit('name',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    disabled={loadingg}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Toko Slogan'
                                    value={input.slogan||""}
                                    onChange={(e)=>handleEdit('slogan',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    disabled={loadingg}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Slug'
                                    value={input.slug||""}
                                    onChange={(e)=>handleEdit('slug',Kslug(e.target.value?.toLowerCase()))}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    helperText={`${process.env.URL}/toko/${input?.slug}`}
                                    disabled={loadingg}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Toko Description'
                                    value={input.description||""}
                                    onChange={(e)=>handleEdit('description',e.target.value)}
                                    InputProps={{
                                        className:classes.scrollBar
                                    }}
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={3}
                                    disabled={loadingg}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Toko Address'
                                    value={input.address||""}
                                    onChange={(e)=>handleEdit('address',e.target.value)}
                                    InputProps={{
                                        className:classes.scrollBar
                                    }}
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={3}
                                    disabled={loadingg}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    {input?.logo !== null ? (
                                        <Image src={`${input?.logo}&size=100`} dataSrc={input?.logo} fancybox webp />
                                    ) : <Typography>No logo</Typography>}
                                </div>
                                <div style={{marginTop:15}}>
                                    <div className='flex-header'>
                                        <Button disabled={loadingg} outlined onClick={openFileManager}>Add</Button>
                                        <Button disabled={loadingg} variant='outlined' color="secondary" onClick={()=>handleEdit("logo",null)}>Remove</Button>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={loadingg} onClick={()=>{!loadingg && setDialog(false)}} outlined>Cancel</Button>
                        <Button disabled={loadingg} type='submit' loading={loadingg} icon='add'>Create</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
        </Header>
    );
}

export default withStyles(Toko,styles)