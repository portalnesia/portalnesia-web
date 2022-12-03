import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import { ApiError, PaginationResponse } from "@design/hooks/api";
import { getDayJs, staticUrl } from "@utils/main";
import { isURL, parseURL, truncate } from "@portalnesia/utils";
import Button from "@comp/Button";
import { useSelector } from "@redux/store";
import TextField from "@mui/material/TextField";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import TableCell from "@mui/material/TableCell";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Scrollbar from "@design/components/Scrollbar";
import Stack from "@mui/material/Stack";
import Search from "@design/components/Search";
import useResponsive from "@design/hooks/useResponsive";
import { Circular } from "@design/components/Loading";
import useTablePagination from "@design/hooks/TablePagination";
import { UrlPagination } from "@model/url";
import { Span } from "@design/components/Dom";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import IconButton from "@mui/material/IconButton";
import { Delete, QrCode2 } from "@mui/icons-material";
import dynamic from "next/dynamic";
import TablePagination from "@mui/material/TablePagination";
import Router, { useRouter } from "next/router";
import Tooltip from "@mui/material/Tooltip";
import Recaptcha from "@design/components/Recaptcha";
import type { KeyedMutator } from "swr";
import Image from "@comp/Image";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"))

export default function UrlPages() {
    const user = useSelector(s=>s.user);
    const [input,setInput] = React.useState({url:'',custom:''});
    const [loading,setLoading] = React.useState(false);
    const setNotif = useNotification();
    const {post} = useAPI();
    const [result,setResult] = React.useState<UrlPagination>();
    const mutate = React.useRef<KeyedMutator<PaginationResponse<UrlPagination>>>();
    const captchaRef = React.useRef<Recaptcha>(null)

    const isError = React.useMemo(()=>{
        return input.url.length > 0 && !isURL(input.url);
    },[input])

    const onChange = React.useCallback((key: 'url'|'custom')=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setInput({
            ...input,
            [key]:e.target.value
        })
    },[input])

    const onFocus = React.useCallback((e: React.MouseEvent<HTMLDivElement>)=>{
        if(!user) {
            e.preventDefault();
            // @ts-ignore
            e.target?.blur();
            setNotif("Only for registered users",true);
        }
    },[setNotif,user])

    const handleSubmit=React.useCallback(async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setResult(undefined);
        try {
            setLoading(true);
            const recaptcha = await captchaRef.current?.execute();
            const result = await post<UrlPagination>(`/v2/url-shortener`,{...input,recaptcha});
            if(mutate.current) mutate.current();
            setInput({url:'',custom:''});
            setResult(result);
        } catch(e) {
            if(e instanceof ApiError) {
                setNotif(e.message,true)
            }
        } finally {
            setLoading(false)
        }
    },[setNotif,post,input])

    const downloadQR=React.useCallback((data: UrlPagination)=>(e: React.MouseEvent<HTMLAnchorElement>)=>{
        e.preventDefault();
        window?.open(staticUrl(`download_qr/url/${data.custom}?token=${data.download_token}`))
    },[])

    return (
        <Pages title="URL Shortener">
            <DefaultLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>URL Shortener</Typography>
                </Box>

                {result && (
                    <Box mb={5}>
                        <Grid container spacing={4} justifyContent={{xs:'center',md:'space-between'}}>
                            <Grid item xs={12} md={8}>
                                <Typography variant='body1'>Short URL: <a className="underline" target="_blank" href={result.short_url}><Span sx={{color:'customColor.link'}}>{result.short_url}</Span></a></Typography>
                                <Typography variant='body1'>Long URL: {result.long_url}</Typography>
                                <Typography variant='body1'><a className="underline" href='#' onClick={downloadQR(result)}><Span sx={{fontWeight:'bold'}}>DOWNLOAD QR CODE</Span></a></Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Image fancybox src={staticUrl(result.custom)} alt={`Qr Code`} sx={{maxWidth:150,width:'100%'}} dataFancybox={`Generated ${result.custom}`} />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                label="URL"
                                value={input.url}
                                onChange={onChange('url')}
                                disabled={loading}
                                error={isError}
                                helperText={isError ? "Input must be an URL" : undefined}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Custom"
                                value={input.custom}
                                onChange={onChange('custom')}
                                disabled={loading}
                                onClick={onFocus}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button disabled={isError||loading} loading={loading} type='submit' icon='submit'>Submit</Button>
                        </Grid>
                    </Grid>
                </form>

                {user && (
                    <UrlLibrary getMutate={data=>{mutate.current = data}} />
                )}
            </DefaultLayout>
            <Recaptcha ref={captchaRef} />
        </Pages>
    )
}

type UrlLibraryProps = {
    getMutate?(mutate: KeyedMutator<PaginationResponse<UrlPagination>>): void
}

function UrlLibrary({getMutate}: UrlLibraryProps) {
    const router = useRouter();
    const q = router.query?.q
    const [query,setQuery] = React.useState(typeof Router.query?.q === 'string' ? decodeURIComponent(Router.query?.q) : "");
    const is500 = useResponsive('up',500)
    const [loading,setLoading] = React.useState(false);
    const setNotif = useNotification();
    const {page,rowsPerPage,...paginationProps} = useTablePagination(true)
    const [dialog,setDialog] = React.useState<UrlPagination>();
    const [showQr,setShowQr] = React.useState(false);
    const {del} = useAPI();
    const {data,error,mutate} = useSWR<PaginationResponse<UrlPagination>>(`/v2/url-shortener?page=${page}&per_page=${rowsPerPage}${typeof q === 'string' && q.length > 0 ? `&q=${q}` : ''}`)
    const confirmRef = React.useRef<ConfirmationDialog>(null);

    const onQueryRemove = React.useCallback(()=>{
        setQuery("")
        Router.push({pathname:'/url',query:{page:1}},'/url?page=1',{shallow:true,scroll:true})
    },[])
    const onQueryChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setQuery(e.target.value);
    },[])
    const onQuerySubmit = React.useCallback(()=>{
        Router.push({pathname:'/url',query:{page:1,q:query}},`/url?page=1&q=${encodeURIComponent(query)}`,{shallow:true,scroll:true})
    },[query])

    const handleDelete=React.useCallback((data: UrlPagination)=>async()=>{
        try {
            setDialog({...data,short_url:parseURL(data.short_url)});
            const confirmed = await confirmRef.current?.show();
            if(!confirmed) return;
            
            setLoading(true);
            await del(`/v2/url-shortener/${data.id}`);
            mutate();
        } catch(e) {
            if(e instanceof ApiError) {
                setNotif(e.message,true)
            }
        } finally {
            setLoading(false)
        }
    },[setNotif,del,mutate])

    React.useEffect(()=>{
        if(getMutate) getMutate(mutate);
    },[getMutate,mutate])

    const openQRCode=React.useCallback((data:UrlPagination)=>()=>{
        setDialog(data);
        setTimeout(()=>setShowQr(true),200);
    },[]);

    const downloadQR=React.useCallback((data: UrlPagination)=>()=>{
        window?.open(staticUrl(`download_qr/url/${data.custom}?token=${data.download_token}`))
    },[])

    return (
        <Box mt={10}>
            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
            <Stack direction={'row'} justifyContent='space-between' alignItems='center' spacing={2}>
                <Typography variant='h4' component='h1'>My URL</Typography>
                <Search value={query} onchange={onQueryChange} onremove={onQueryRemove} onsubmit={onQuerySubmit} autosize={is500} remove />
            </Stack>
            </Box>
            <Scrollbar>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Short URL</TableCell>
                            <TableCell>Long URL</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Click</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!data&&!error ? (
                            <TableRow key='loading'>
                                <TableCell colSpan={6} align='center'>
                                    <Box display='flex' minHeight={200} width="100%"><Circular /></Box>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow key='error'>
                                <TableCell colSpan={6} align='center'>{error?.message||"Something went wrong"}</TableCell>
                            </TableRow>
                        ) : data && data?.data.length > 0 ? data?.data.map((d,i)=>(
                            <TableRow key={`data-${d.custom}`}>
                                <TableCell>{((page-1)*10)+i+1}</TableCell>
                                <TableCell><a className="underline" href={d?.short_url} target="_blank"><Span sx={{fontWeight:'bold',color:'customColor.link'}}>{parseURL(d.short_url)}</Span></a></TableCell>
                                <TableCell>{truncate(isURL(d?.long_url) ? parseURL(d?.long_url) : d?.long_url,50)}</TableCell>
                                <TableCell>{getDayJs(d.created).pn_format('minimal')}</TableCell>
                                <TableCell align="right">{d?.click}</TableCell>
                                <TableCell align="right">
                                    <Stack direction='row' alignItems='center'>
                                        <Tooltip title={`QR Code`}>
                                            <IconButton edge="end"aria-label="QR Code"onClick={openQRCode(d)} size="large">
                                                <QrCode2 />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={`Delete`}>
                                            <IconButton edge="end"aria-label="delete"onClick={handleDelete(d)} size="large">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow key='no-data'>
                                <TableCell colSpan={6} align='center'>No data</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination page={page-1} rowsPerPage={rowsPerPage} count={data?.total||0} {...paginationProps} />
            
            <ConfirmationDialog ref={confirmRef} body={`Delete url ${dialog?.short_url}?`} />
            <Backdrop open={loading} loading />

            <Dialog open={showQr} handleClose={()=>setShowQr(false)} title='QR Code' maxWidth='sm' fullScreen={false}
                actions={!dialog ? undefined : (
                    <Button  icon='download' onClick={downloadQR(dialog)}>Download</Button>
                )}
            >
                {dialog && (
                    <Image src={staticUrl(`qr/url/${dialog?.custom}`)} sx={{width:'100%'}} alt={`${dialog?.custom}'s QR Code`} />
                )}
            </Dialog>
        </Box>
    )
}