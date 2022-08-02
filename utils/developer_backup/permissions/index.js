import React from "react";
import Header from 'portal/components/developer/Header'
import Button from 'portal/components/Button'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import {useNotif} from 'portal/components/Notification'
import db from 'portal/utils/db'
import {ucwords} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import { Pagination } from '@mui/material';
import Link from 'next/link'
import useSWR from 'portal/utils/swr'
import {
    Grid,
    Typography,
    IconButton,
    Table,TableHead,TableRow,TableCell,TableBody,
    Dialog,
    DialogActions,
    DialogTitle,
    TextField,
    DialogContent
} from '@mui/material'

export const getServerSideProps = wrapper('login')

const styles=theme=>({
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

const Scope=({err,classes})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [dialog,setDialog]=React.useState(null);
    const [loading,setLoading]=React.useState(false)
    const {setNotif}=useNotif()
    const {post} = useAPI()
    const {data,error,mutate}=useSWR(`/v1/developer/permissions?page=${(router.query.page || 1)}`)
    const [input,setInput]=React.useState("")

    const handlePagination = (event, value) => {
        router.push({
            pathname:'/developer/apps',
            query:{
                page:value
            }
        },`/developer/apps?page=${value}`,{shallow:true})
    };

    const handleRequest=(e)=>{
        if(e && e.preventDefault) e.preventDefault()
        /*setLoading(true)
        post(`/v1/developer/permissions/requests/new`,{description:input})
        .then((res)=>{
            setNotif(res?.msg,Boolean(res?.error))
            if(!res.error) {
                let scopes = [...data?.scopes];
                scopes[dialog.index]={
                    ...scopes[dialog.index],
                    pending:true
                }
                mutate({
                    ...data,
                    scopes:scopes
                })
                setDialog(null);
            }
        })
        .catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
        .finally(()=>setLoading(false))*/
    }

    return (
        <Header title='Permissions Index' active='permissions' subactive='all' canonical='/developer/permissions' noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock title="List Permissions" noPadding whiteBg footer={
                        <Pagination color='primary' count={Number(data?.total_page||1)} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }
                    action={
                        <Link href='/developer/permissions/my-permissions' passHref><Button color='secondary' component='a'>My Permissions</Button></Link>
                    }>
                        {!data && !error ? (
                            <Skeleton type='table' number={5} />
                        ) : error || data?.error ? (
                            <center><Typography variant="h5">Failed load data</Typography></center>
                        ) : (
                            <div style={{overflowX:'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Permissions</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.scopes.map((dt,i)=>(
                                            <TableRow key={i}>
                                                <TableCell><Typography>{dt?.scope}</Typography></TableCell>
                                                <TableCell><Typography>{dt?.description}</Typography></TableCell>
                                                <TableCell>{dt?.approved ? (dt?.pending ? "Pending Review" : "Approved") : (
                                                    <Button outlined onClick={()=>setDialog({...dt,index:i})}>Send Request</Button>
                                                )}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
            <Dialog
                open={dialog!==null}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInput("")
                }}>
                <form onSubmit={handleRequest}>
                    <DialogTitle>{`${ucwords(dialog?.scope)} Permission Request`}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} justifyContent='center'>
                            <Grid item xs={12}>
                                <TextField
                                    label='Permission Uses'
                                    value={input||""}
                                    onChange={(e)=>setInput(e.target.value)}
                                    InputProps={{
                                        className:classes.scrollBar
                                    }}
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={10}
                                    disabled={loading}
                                    required
                                    helperText={`Please provide a detailed description of how your app uses the "${dialog?.scope}" permission requested, how it adds value for a person using your app, and why it's necessary for app functionality.`}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={loading} onClick={()=>setDialog(null)} outlined>Cancel</Button>
                        <Button disabled={loading} type='submit' isloading={loading}>Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Header>
    );
}

export default withStyles(Scope,styles)