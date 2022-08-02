import React from 'react'
import {Header,Button,PaperBlock,Skeleton} from 'portal/components'
import {useRouter} from 'next/router'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import Link from 'next/link'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import {useNotif,useAPI,useMousetrap,useSWR} from 'portal/utils'
import { Pagination } from '@mui/material';
import {Table,TableHead,TableBody,TableCell,TableRow,IconButton,TextField} from '@mui/material'
import {Delete,Create} from '@mui/icons-material';
import Recaptcha from 'portal/components/ReCaptcha'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper('login')

const Quiz=({err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter()
    const {page}=router.query
    const {post,del}=useAPI()
    const {setNotif}=useNotif()
    const [input,setInput]=React.useState({title:''})
    const [dialog,setDialog]=React.useState(null)
    const [disable,setDisable]=React.useState(false)
    const {data,error,mutate} = useSWR(`/v1/quiz?page=${page||1}`)
    const captchaRef=React.useRef(null)

    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        openDialog('new',{},null)
    },false)

    const handlePagination = React.useCallback((event, value) => {
        router.push({
            pathname:'/quiz',
            query:{
                page:value
            }
        },`/quiz?page=${value}`,{shallow:true})
    },[]);

    const openDialog=React.useCallback((type,dt,index)=>{
        const aa={
            ...dt,
            index:index,
            type:type
        }
        setDialog(aa)
    },[])

    const handleDelete=React.useCallback((id,index)=>{
        setDisable(true)
        del(`/v1/quiz/${id}`).then(()=>{
            const aa=data.data;
            aa.splice(index,1)
            mutate({
                ...data,
                data:aa
            })
            setDialog(null)
        }).catch(err=>{
            
        }).finally(()=>{
            setDisable(false)
        })
    },[del,data,mutate])

    const handleAdd=React.useCallback((e)=>{
        e.preventDefault()
        setDisable(true)
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/quiz`,{...input,recaptcha}))
        .then(()=>{
            mutate();
            setDialog(null)
            setInput({title:''})
        }).catch(()=>{
            
        }).finally(()=>{
            setDisable(false)
        })
    },[post,input,mutate])

    return (
        <Header title='Quiz' active='quiz' subactive='' canonical='/quiz'>
            <Breadcrumbs title={"Quiz"} />
            <PaperBlock title='My Quiz' noPadding divider={false} linkColor whiteBg
            footer={
                <Pagination style={{margin:'10px auto'}} color='primary' count={data ? data?.total_page : 1} page={Number(page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
            }
            action={
                <div><Button tooltip='+' color='secondary' onClick={()=>openDialog('new',{},null)} icon='add'>New</Button></div>
            }
            >
                {!data && !error ? (
                    <Skeleton type='table' number={8} />
                ) : (
                    <div style={{overflowX:'auto'}}>
                        <Table aria-label="Quiz table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Response</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {data && !error && data?.data?.length ? 
                                data?.data?.map((dt,i)=>(
                                    <TableRow key={i}>
                                        <TableCell>{Number((((page||1)-1)*15)+i+1)}</TableCell>
                                        <TableCell><Link href='/quiz/[slug]' as={`/quiz/${dt?.id}`} passHref><a>{dt?.title}</a></Link></TableCell>
                                        <TableCell>{dt?.publish ? 'Published' : 'Draft'}</TableCell>
                                        <TableCell>{dt?.total_response||'-'}</TableCell>
                                        <TableCell align='right'>
                                            <div style={{display:'flex',justifyContent:'space-evenly'}}>
                                                <IconButton
                                                    key='edit'
                                                    edge="end"
                                                    aria-label="edit"
                                                    className="no-format"
                                                    onClick={()=>router.push('/quiz/edit/[slug]',`/quiz/edit/${dt?.id}`)}
                                                    size="large">
                                                    <Create />
                                                </IconButton>
                                                <IconButton
                                                    key='delete'
                                                    edge="end"
                                                    aria-label="delete"
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
                                        <TableCell align="center" colSpan={6}>{error}</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow key='no-data'>
                                        <TableCell align="center" colSpan={6}>No data</TableCell>
                                    </TableRow>
                                )
                            }
                            </TableBody>
                        </Table>
                    </div>
                )}
            </PaperBlock>
            <Dialog open={dialog!==null && dialog?.type==='delete'} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent dividers>Delete `{dialog?.title}`?</DialogContent>
                <DialogActions>
                    <Button color='secondary' disabled={disable} onClick={()=>setDialog(null)}>Cancel</Button>
                    <Button disabled={disable} icon='delete' loading={disable} onClick={()=>handleDelete(dialog?.id,dialog?.index)}>Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialog!==null && dialog?.type==='new'} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <form onSubmit={handleAdd}>
                    <DialogTitle>New Quiz</DialogTitle>
                    <DialogContent dividers>
                        <TextField
                            autoFocus
                            label='Title'
                            variant='outlined'
                            fullWidth
                            value={input?.title}
                            onChange={(e)=>setInput({...input,title:e.target.value})}
                            required
                            error={input?.title?.length===0}
                            helperText={input?.title?.length===0 ? 'Required':''}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={disable} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                        <Button disabled={disable} loading={disable} type='submit' icon='submit'>Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
        </Header>
    );
}

export default Quiz