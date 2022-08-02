import React, { useState, useEffect } from 'react';
import Header from 'portal/components/Header'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import {withStyles} from 'portal/components/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import db from 'portal/utils/db'
import { Pagination } from '@mui/material';
import Link from 'next/link'
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import {useMousetrap} from 'portal/utils/useKeys'
import useSWR from 'portal/utils/swr'
import Button from 'portal/components/Button'
import {
    Grid,
    Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableFooter,
    TableRow
} from '@mui/material'
import dynamic from 'next/dynamic';

const Backdrop = dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl})=>{
    if(data.user === null) {
        return {
            redirect: {
                destination:`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`,
                permanent:false   
            }
        }
    }
    return {props:{}}
})

const styles=theme=>({
    action:{
        display:'flex',
        justifyContent:'flex-end',
        '& a':{
            color:`${theme.custom.dasarIcon}!important`,
        },
    }
})

const useBlog = (url)=>{
    return useSWR(url)
}

const MyBlog=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [dialog,setDialog]=useState(null);
    const [backdrop,setBackdrop]=useState(false);
    const {del} = useAPI()
    const [totalPage,setTotalPage]=useState(1);
    const {data,error,mutate}=useBlog(`/v1/blog/dashboard?page=${(router?.query?.page || 1)}`)

    React.useEffect(()=>{
        if(data) {
            if(data?.data?.length > 0) setTotalPage(data.total_page)
            else setTotalPage(1)
        }
    },[data])

    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        router.push('/blog/dashboard/[...slug]','/blog/dashboard/new');
    },false)
    
    const openDialog=(dt,i)=>{
        const dd={
            ...dt,
            index:i
        }
        setDialog(dd);
    }
    const closeDialog=()=>{
        setDialog(null)
    }

    const handlerRemove=(slug,i)=>{
        setBackdrop(true);
        setDialog(null)
        del(`/v1/blog/${slug}`,{success_notif:true})
        .then(([res])=>{
            setBackdrop(false);
            if(!res.error) {
                let newData=[...res];
                newData.splice(i,1);
                mutate({
                    ...data,
                    data:newData
                })
            }
        }).catch(err=>{
            setBackdrop(false);
        })
    }

    const handlePagination = (event, value) => {
        router.push({
            pathname:'/blog/dashboard',
            query:{
                page:value
            }
        },`/blog/dashboard?page=${value}`,{shallow:true})
    };

    return (
        <Header active='blog' subactive='blog_dashboard' title='My Blog' canonical='/blog/dashboard' onIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock linkColor style={{overflowX:'auto'}} title="My Blog" noPadding whiteBg
                    footer={
                        <Pagination color='primary' count={totalPage} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    }
                    action={
                        <div><Link href='/blog/dashboard/[...slug]' as={`/blog/dashboard/new`}><a><Button color='secondary'>New</Button></a></Link></div>
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
                                            <TableCell>Title</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {error  ? (
                                            <TableRow>
                                                <TableCell align="center" colSpan={5}>{typeof error === 'string' ? error : typeof error?.message === 'string' ? error.message : "Failed to load data"}</TableCell>
                                            </TableRow>
                                        ) : data?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell align="center" colSpan={5}>No data</TableCell>
                                            </TableRow>
                                        ) : data?.data?.map((c,i)=>(
                                            <TableRow key={`row-${c.id}`}>
                                                <TableCell>{(((router?.query?.page||1)-1)*10)+i+1}</TableCell>
                                                <TableCell><Link href='/blog/[slug]' as={`/blog/${c.slug}`}><a>{c.title}</a></Link></TableCell>
                                                <TableCell>{c.category}</TableCell>
                                                <TableCell>{c?.publish ? "Published" : "Draft"}</TableCell>
                                                <TableCell align="right">
                                                    <div className={classes.action}>
                                                        <Link href='/blog/dashboard/[...slug]' as={`/blog/dashboard/edit/${c.slug}`}><IconButton
                                                            style={{marginRight:10}}
                                                            edge="end"
                                                            aria-label="edit"
                                                            className='no-format'
                                                            component='a'
                                                            size="large">
                                                            <CreateIcon />
                                                        </IconButton></Link>
                                                        <IconButton edge="end" aria-label="delete" onClick={()=>openDialog(c,i)} size="large">
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
                        
                        <Dialog open={dialog!==null} aria-labelledby='dialog'>
                            <DialogTitle id='dialog title'>Are you sure?</DialogTitle>
                            <DialogActions>
                                <Button color="secondary" onClick={()=>handlerRemove(dialog?.slug,dialog?.index)}>Yes</Button>
                                <Button outlined onClick={closeDialog}>No</Button>
                            </DialogActions>
                        </Dialog>
                        <Backdrop open={backdrop} />
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    );
}

export default withStyles(MyBlog,styles)