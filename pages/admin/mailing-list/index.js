import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import {wrapper} from 'portal/redux/store';
import useAPI from 'portal/utils/api'
import useSWR from 'portal/utils/swr'
import {useRouter} from 'next/router'
import {Grid,Typography,Table,TableHead,TableBody,TableCell,TableRow,Pagination,IconButton} from '@mui/material'
import {Delete,Create} from '@mui/icons-material';
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper('admin');

export default function MailingListAdmin({err}) {
    if(err) return <ErrorPage statusCode={err} />
    const {del} = useAPI();
    const router = useRouter();
    const [dialog,setDialog]=React.useState(null)
    const {data,error,mutate} = useSWR(`/v1/admin/mailing?page=${router?.query?.page||1}`)
    const [loading,setLoading] = React.useState(false)

    const handlePagination = React.useCallback((event, value) => {
        router.push({
            pathname:'/admin/mailing-list',
            query:{
                page:value
            }
        },`/admin/mailing-list?page=${value}`,{shallow:true})
    },[]);

    const openDialog=React.useCallback((type,dt,index)=>{
        const aa={
            ...dt,
            index:index,
            type:type
        }
        setDialog(aa)
    },[])

    const handleDelete=React.useCallback((id,i)=>async()=>{
        setLoading(true);

        try {
            await del(`/v1/admin/mailing/${id}`,{success_notif:true});
            let newData=[...data?.data];
            newData.splice(i,1);
            setLoading(false)
            setLoading(null)
            mutate({
                ...data,
                data:newData
            })
        } catch {
            setLoading(false)
        }
    },[del,data,mutate])

    return (
        <Header title="Mailing List" canonical={`/admin/mailing-list`} noIndex active='admin' subactive='admin_milis_index'>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                    <PaperBlock title="Mailing List" whiteBg
                    footer={
                        <Pagination disabled={loading} style={{margin:'10px auto'}} color='primary' count={data ? data?.total_page : 1} page={Number(router?.query?.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }>
                        {!data && !error ? (
                            <Skeleton type='table' number={8} />
                        ) : (
                            <div style={{overflowX:'auto'}}>
                                <Table aria-label="Mailing list table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Subject</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data && !error && data?.data?.length ? 
                                            data?.data?.map((dt,i)=>(
                                                <TableRow key={i}>
                                                    <TableCell>{Number((((router?.query?.page||1)-1)*15)+i+1)}</TableCell>
                                                    <TableCell>{dt?.name}</TableCell>
                                                    <TableCell>{dt?.subject}</TableCell>
                                                    <TableCell>{dt?.sended && dt?.sended_to === null ? "Sended" : dt?.sended_to !== null ? "Queued" : "Draft"}</TableCell>
                                                    <TableCell align='right'>
                                                        <div style={{display:'flex',justifyContent:'space-evenly'}}>
                                                            <IconButton
                                                                key='edit'
                                                                edge="end"
                                                                aria-label="edit"
                                                                className="no-format"
                                                                disabled={loading}
                                                                onClick={()=>router.push('/admin/mailing-list/[...slug]',`/admin/mailing-list/edit/${dt?.id}`)}
                                                                size="large">
                                                                <Create />
                                                            </IconButton>
                                                            <IconButton
                                                                key='delete'
                                                                edge="end"
                                                                aria-label="delete"
                                                                disabled={loading}
                                                                onClick={()=>openDialog('delete',dt,i)}
                                                                size="large">
                                                                <Delete />
                                                            </IconButton>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                            : error ? (
                                                <TableRow key='no-data'>
                                                    <TableCell align="center" colSpan={5}>{error}</TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow key='no-data'>
                                                    <TableCell align="center" colSpan={5}>No data</TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
            <Dialog open={dialog!==null} aria-labelledby='dialog'>
                <DialogTitle id='dialog title'>Are you sure?</DialogTitle>
                <DialogContent dividers>
                    <Typography>{`Delete mailing list \`${dialog?.name}\``}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" disabled={loading} loading={loading} onClick={handleDelete(dialog?.id,dialog?.index)}>Yes</Button>
                    <Button outlined disabled={loading} onClick={()=>setDialog(null)}>No</Button>
                </DialogActions>
            </Dialog>
        </Header>
    )
}