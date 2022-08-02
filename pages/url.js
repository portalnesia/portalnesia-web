import React from 'react';
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import Search from 'portal/components/Search'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {connect} from 'react-redux';
import PaperBlock from 'portal/components/PaperBlock'
import {useNotif} from 'portal/components/Notification'
import Skeleton from 'portal/components/Skeleton'
import {AdsBanner1} from 'portal/components/Ads'
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr'
import { Pagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Recaptcha from 'portal/components/ReCaptcha'
import {
    Grid,
    Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
    Hidden,
    Icon
} from '@mui/material'
import dynamic from 'next/dynamic'

const Backdrop=dynamic(()=>import('portal/components/Backdrop'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableHead=dynamic(()=>import('@mui/material/TableHead'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export const getServerSideProps = wrapper()

const useURL=(url)=>{
    return useSWR(url)
}

const MyURL=()=>{
    const router=useRouter();
    const [dialog,setDialog]=React.useState(null);
    const [backdrop,setBackdrop]=React.useState(false);
    const [search,setSearch]=React.useState("");
    const [totalPage,setTotalPage]=React.useState(1);
    const {del} = useAPI()
    const {data,error,mutate} = useURL(`/v1/url-shortener?page=${Number(router.query.page || 1)}${router.query.q ? `&q=${router.query.q}` : ''}`)
    React.useEffect(()=>{
        if(data) {
            if(data?.data?.length > 0) setTotalPage(data.total_page)
            else setTotalPage(1)
        }
    },[data])
    
    const openDialog=(type,dt,i)=>e=>{
        const dd={
            ...dt,
            index:i,
            type:type
        }
        setDialog(dd);
    }
    const closeDialog=()=>{
        setDialog(null)
    }

    const handlerRemove=(id,i)=>{
        setBackdrop(true);
        setDialog(null)
        del(`/v1/url-shortener/${id}`)
        .then(()=>{
            setBackdrop(false);
            const newData=[...data?.data];
            newData.splice(i,1);
            mutate({
                ...data,
                data:newData
            })
        }).catch(()=>{
            setBackdrop(false);
        })
    }

    const handlePagination = (event, value) => {
        const {...otherQuery}=router.query;
        router.push({
            pathname:'/url',
            query:{
                ...otherQuery,
                page:value
            }
        },search.length ? `/url?q=${encodeURIComponent(search)}&page=${value}` : `/url?page=${value}`,{shallow:true})
    };



    const handleChangeSearch=(e)=>{
        setSearch(e.target.value);
    }

    const removeSearch=()=>{
        if(search.length > 0) {
            setSearch("");
            router.push({
                pathname:'/url',
                query:{
                    page:1
                }
            },`/url?page=1`,{shallow:true})
        }
    }

    const handleSearch=(e)=>{
        e.preventDefault();
        if(search.length > 0) {
            router.push({
                pathname:'/url',
                query:{
                    page:1,
                    q:encodeURIComponent(search)
                }
            },`/url?q=${encodeURIComponent(search)}&page=1`,{shallow:true})
        } else {
            router.push({
                pathname:'/url',
                query:{
                    page:1
                }
            },`/url?page=1`,{shallow:true})
        }
    }

    const downloadQR=()=>{
        window?.open(`${process.env.CONTENT_URL}/download_qr/url/${dialog?.custom}?token=${dialog?.token_qr}`)
        closeDialog();
    }

    return (
        <PaperBlock linkColor style={{overflowX:'auto'}} title="My URL" noPadding whiteBg footer={
            <Pagination style={{margin:'10px auto'}} color='primary' count={totalPage} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
        }
        action={
            <>
                <Hidden smDown>
                    <Search onchange={handleChangeSearch} onsubmit={handleSearch} onremove={removeSearch} remove autosize value={search} />
                </Hidden>
                <Hidden smUp>
                    <Search onchange={handleChangeSearch} onsubmit={handleSearch} onremove={removeSearch} remove value={search} />
                </Hidden>
            </>
        }
        >
            {!data && !error ? (
                <Skeleton type='table' number={8} />
            ) : (
                <div style={{overflowX:'auto'}}>
                    <Table aria-label="URL table">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Short URL</TableCell>
                                <TableCell>Long URL</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Click</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {error ? (
                                <TableRow>
                                    <TableCell align="center" colSpan={6}>{error}</TableCell>
                                </TableRow>
                            ) : !data && !error && data?.data?.length===0 ? (
                                <TableRow>
                                    <TableCell align="center" colSpan={6}>No data</TableCell>
                                </TableRow>
                            ) : data?.data?.map((link,i)=>(
                                <TableRow key={`row-${link.custom}`}>
                                    <TableCell>{(((router.query.page||1)-1)*10)+i+1}</TableCell>
                                    <TableCell><a className="underline" href={link?.short_url} target="_blank"><b>{link.short_url}</b></a></TableCell>
                                    <TableCell>{link?.long_url}</TableCell>
                                    <TableCell>{link?.created?.format}</TableCell>
                                    <TableCell align="right">{link?.click}</TableCell>
                                    <TableCell align="right">
                                        <div style={{display:'flex',justifyContent:'space-evenly'}}>
                                            <IconButton
                                                edge="end"
                                                aria-label="qr_code"
                                                onClick={openDialog('qr',link,i)}
                                                size="large">
                                                <Icon>qr_code_2</Icon>
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={openDialog('delete',link,i)}
                                                size="large">
                                                <DeleteIcon />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle id='dialog title'>{dialog?.type==='qr' ? 'QR Code' : 'Are you sure?'}</DialogTitle>
                {dialog !== null && dialog?.type==='qr' ? (
                    <DialogContent dividers>
                        <Image src={`${process.env.CONTENT_URL}/qr/url/${dialog?.custom}`} style={{width:'100%'}} alt={`${dialog?.custom}'s QR Code`} />
                    </DialogContent>
                ) : null}
                {dialog !== null && (
                    <DialogActions>
                        {dialog?.type==='qr' ? (
                            <>
                                <Button onClick={downloadQR} icon='download'>Download</Button>
                                <Button color='secondary' onClick={closeDialog}>Cancel</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={()=>handlerRemove(dialog?.id,dialog?.index)}>Yes</Button>
                                <Button color='secondary' onClick={closeDialog}>No</Button>
                            </>
                        )}
                    </DialogActions>
                )}
            </Dialog>
            <Backdrop open={backdrop} />
        </PaperBlock>
    );
}

const URL=({user,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [value,setValue]=React.useState({url:"",custom:""});
    const {setNotif}=useNotif()
    const [loading,setLoading]=React.useState(false);
    const [result,setResult]=React.useState(null);
    const {post} = useAPI()
    const {mutate} = useURL(user!==null ? `/v1/url-shortener?page=${Number(router.query.page || 1)}${router.query.q ? `&q=${router.query.q}` : ''}` : null)
    const captchaRef = React.useRef(null)

    const handleInputChange=(name,val)=>{
        if(name==='custom' && user === null) {
            return;
        } else {
            setValue({
                ...value,
                [name]:val
            })
        }
    }
    const handleCustomFocus=(e)=>{
        if(user === null) e.preventDefault(),e.target.blur(),setNotif("Only for registered users",true);
        else return;
    }

    const downloadQR=(custom,token)=>e=>{
        e.preventDefault();
        window?.open(`${process.env.CONTENT_URL}/download_qr/url/${custom}?token=${token}`)
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        setResult(null);
        setLoading(true);
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/url-shortener`,{...value,recaptcha},{},{success_notif:false}))
        .then(([res])=>{
            setLoading(false)
            if(user!==null) mutate()
            setValue({url:"",custom:""})
            setResult(res);
            router.replace({
                pathname:'/url',
                query:{
                    page:1
                }
            },`/url?page=1`,{shallow:true})
        }).catch((err)=>{
            setLoading(false)
        })
    }
    return(
        <Header navTitle="URL Shortener" iklan canonical='/url' active='url' title='URL Shortener' desc='Portalnesia URL Shortener, create your URL now'>
            <Grid container>
                <Grid item xs={12}>
                    <PaperBlock linkColor title='URL Shortener' whiteBg>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                {result !== null  && (
                                    <Grid item xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <Typography variant='body1'>Short URL: <a className="underline" target="_blank" href={result.short_url}>{result.short_url}</a></Typography>
                                                <Typography variant='body1'>Long URL: {result.long_url}</Typography>
                                                <Typography variant='body1'><a className="underline" href='#' onClick={downloadQR(result?.custom,result?.token_qr)}><strong>DOWNLOAD QR CODE</strong></a></Typography>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Image blured fancybox src={`${process.env.CONTENT_URL}/qr/url/${result.custom}`} alt={`Qr Code`} style={{width:'100%',maxWidth:150,float:'right'}} dataFancybox={`Generated ${result?.custom}`} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        variant='outlined'
                                        label="URL"
                                        value={value.url}
                                        fullWidth
                                        onChange={event=>handleInputChange('url',event.target.value)}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Custom"
                                        variant='outlined'
                                        value={value.custom}
                                        fullWidth
                                        onChange={event=>handleInputChange('custom',event.target.value)}
                                        onClick={handleCustomFocus}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <AdsBanner1 />
                                    <div style={{textAlign:'center'}}>
                                        <Button type='submit' disabled={loading} loading={loading} icon='submit'>Submit</Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </form>
                    </PaperBlock>
                </Grid>
                {user !== null && (
                    <Grid item xs={12}>
                        <MyURL />
                    </Grid>
                )}
                <Recaptcha ref ={captchaRef} />
            </Grid>
        </Header>
    )
}

export default connect(state=>({user:state.user}))(URL);