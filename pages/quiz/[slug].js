import React from 'react'
import Sidebar from 'portal/components/Sidebar'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import PaperBlock from 'portal/components/PaperBlock'
import ProfileWidget from 'portal/components/ProfileWidget'
import {AdsRect,AdsBanner1} from 'portal/components/Ads'
import {CombineAction} from 'portal/components/Action'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import {useRouter} from 'next/router'
import Link from 'next/link'
import {connect} from 'react-redux';
import {useNotif} from 'portal/components/Notification'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import LocalStorage from 'portal/utils/local-storeage'
import db from 'portal/utils/db'
import useAPI from 'portal/utils/api'
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import {Hidden,Grid,Typography,TextField,FormControl,RadioGroup,FormControlLabel,Radio,Dialog,DialogActions,DialogContent,DialogTitle,
    CircularProgress,Table,TableHead,TableBody,TableCell,TableRow,LinearProgress,Box} from '@mui/material'
import { Pagination } from '@mui/material';
import {withStyles} from 'portal/components/styles';
import * as gtag from 'portal/utils/gtag'

export const getServerSideProps = wrapper(async({pn:data,req,res,params})=>{
    const slug=params.slug;
    const kuis = await db.kata(`SELECT judul,id,unik,terbit,public,userid FROM klekle_kuis WHERE unik=? AND BINARY(unik) = BINARY(?) AND block='0' LIMIT 1`,[slug,slug]);
    if(!kuis) {
        return db.redirect();
    }
    if(data.user===null || data?.user?.id != kuis[0].userid) {
        if(Boolean(kuis[0].terbit)===false) {
            return db.redirect();
        }
    }
    const meta={title:kuis[0].judul,id_number:kuis[0].id,public:Boolean(kuis[0].public),image:`${process.env.CONTENT_URL}/ogimage/quiz/${kuis[0].unik}`}
    return {props:{meta:meta}}
})

const styles=(theme)=>({
    linkColor:{
        '& a':{
          color:theme.palette.primary.link
        },
    },
})

const LinearProgressWithLabel=React.memo(({value,ques,total})=>(
    <Box display="flex" alignItems="center" justifyContent='space-between' mb={2}>
        <Box width="100%" mr={1}>
            <LinearProgress variant="determinate" value={Number(value)} />
        </Box>
        <Box minWidth={60} textAlign='right'>
            <Typography variant="body2" color="textSecondary">{ques} / {total}</Typography>
        </Box>
    </Box>
))

const CustomSidebar=React.memo(({classes,posid,loading,users,slug,handleCopy})=>(
    <Grid item xs={12} lg={4}>
        <Sidebar id='cardContent'>
            {loading ? (
                <PaperBlock>
                    <div style={{margin:'20px 0',textAlign:'center'}}>
                        <CircularProgress thickness={5} size={50}/>
                    </div>
                </PaperBlock>
            ) : (
                <ProfileWidget dataSrc={users?.picture} src={`${users?.picture}&size=200&watermark=no`} 
                    alt={users?.name}
                    title={
                        <div className={classes.linkColor}>
                            <center>
                                <Typography key='quiz' variant="body2" component='p'>Quiz by</Typography>
                                <Typography key='name' component='h2'><Link href='/user/[...slug]' as={`/user/${users?.username}`}><a>{users?.name}</a></Link></Typography>
                            </center>
                        </div>
                    }>
                        
                        <TextField
                            onClick={()=>handleCopy(`${process.env.URL}/quiz/${slug}`)}
                            value={`${process.env.URL}/quiz/${slug}`}
                            variant='outlined'
                            fullWidth
                            disabled
                            rows={2}
                            inputProps={{style:{cursor:'pointer'}}}
                        />
                        <CombineAction
                            list={{
                                share:{
                                    campaign:'quiz',
                                    posId:posid
                                },
                                report:true
                            }}
                        />
                </ProfileWidget>
            )} 
        </Sidebar>
    </Grid>
))

const QuizDetail=({classes,meta,user,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {question,slug}=router.query
    const {setNotif}=useNotif();
    const {get,post}=useAPI();
    const [data,setData]=React.useState(null)
    const [ques,setQues]=React.useState(null)
    const [respon,setRespon]=React.useState([])
    const [pageRespon,setPageRespon]=React.useState(1)
    const [totalRespon,setTotalRespon]=React.useState(1)
    const [loadingRespon,setLoadingRespon]=React.useState(false)
    const [chois,setChois]=React.useState([])
    const [loading,setLoading]=React.useState(false)
    const [disable,setDisable]=React.useState(false)
    const [dialog,setDialog]=React.useState(null)
    const [input,setInput]=React.useState("");

    const handleCopy=React.useCallback((text)=>{
        Kcopy(text).then(()=>setNotif("URL copied",false))
    },[])

    const handleRedirect=React.useCallback((qu)=>{
        setLoading(true)
        setDisable(true)
        const pa={
            pathname:'/quiz/[slug]',
            query:{
                slug:slug
            }
        }
        if(qu!==0) pa.query.question=qu;
        router.replace(pa,`/quiz/${slug}${qu!==0 ? `?question=${qu}` : ''}`,{shallow:true})
    },[slug])

    const postData=React.useCallback((dt={},qu,func)=>{
        setDisable(true)
        const klq = LocalStorage.get('klq','array');
        const klqu = LocalStorage.get('klqu');
        const klqq = LocalStorage.get('klqq');
        const data = {
            ...dt,
            klq,
            klqu,
            klqq
        }
        post(`/v1/quiz/${slug}${typeof qu !== 'undefined' ? `/${qu}` : ''}`,data,{},{success_notif:false}).then(([res])=>{
            setDisable(false)
            if(typeof func ==='function') func()
            if(typeof res.question !== 'undefined') setQues(res.question)
            if(typeof res.choise !== 'undefined') setChois(res.choise)
            if(typeof res?.setting === 'object') {
                const setting = res?.setting;
                Object.keys(setting).map(s=>{
                    if(setting?.[s]) LocalStorage.set(s,setting?.[s]);
                })
            }
            if(typeof res.announce !== 'undefined') {
                const aa={
                    redirect:res.redirect,
                    announce:res.announce,
                    btn:(res.redirect===1 ? "Start" : "OK")
                }
                setDialog(aa)
            } else if(typeof res.redirect !== 'undefined') handleRedirect(res.redirect)
        }).catch(()=>{
            setDisable(false)
        })
    },[post,slug,handleRedirect])

    const handleStart=React.useCallback((e)=>{
        e.preventDefault()
        postData({name:input},undefined,()=>{
            setData((prev)=>({
                ...prev,
                my_name:input
            }))
        })
    },[postData,input,setData])

    const handleAnswer=React.useCallback((e)=>{
        e.preventDefault()
        if(input?.length<1) setNotif("You have not given an answer",true)
        else postData({answer:input},question)
    },[input,postData,question])

    const getData=React.useCallback(()=>{
        setLoading(true);
        const query = {
            klq:LocalStorage.get('klq','array'),
            klqu:LocalStorage.get('klqu'),
            klqq:LocalStorage.get('klqq')
        }
        post(`/v1/quiz/answer/${slug}`,query,{},{success_notif:false}).then(([res])=>{
            setLoading(false)
            setData(res)
            if(res?.my_name!==null) setInput(res.my_name)
        }).catch(err=>{
            setLoading(false)
        })
    },[post,slug])

    const getRespon=React.useCallback((pg)=>{
        setLoadingRespon(true)
        get(`/v1/quiz/${slug}/response?page=${pg}`).then(([res])=>{
            setLoadingRespon(false)
            setRespon(res.data)
            setTotalRespon(res.total_page)
        }).catch(err=>{
            setLoadingRespon(false)
        })
    },[get])

    const handlePagination = React.useCallback((event, value) => {
        setPageRespon(value);
    },[]);

    React.useEffect(()=>{
        setInput("");
        setDialog(null)
        setLoading(false)
        setDisable(false)
        if(typeof question==='undefined') {
            setPageRespon(1)
            if(data===null) {
                getData()
            } else {
                setInput(data?.my_name)
            }
            gtag.event({
                action:'select_content',
                content_type:'quiz',
                item_id:meta.id_number
            })
        }
    },[router.query])

    React.useEffect(()=>{
        if(meta.public) getRespon(pageRespon)
    },[pageRespon])

    React.useEffect(()=>{
        if(question) router.replace('/quiz/[slug]',`/quiz/${slug}`,{shallow:true});
    },[])

    const valueLinear=React.useMemo(()=>Math.round(question*100/data?.total_question),[question,data?.total_question])

    return (
        <Header iklan title={`${meta.title} - Quiz`} canonical={`/quiz/${slug}`} active='quiz' subactive='quiz_detail' image={meta.image}>
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12}>
                    <Breadcrumbs routes={[{label:"Quiz",href:"/quiz"}]} title={meta.title} />
                </Grid>
                {question ? (
                    <Grid item xs={12}>
                        <form onSubmit={handleAnswer}>
                            <PaperBlock title={`Hai, ${data?.my_name}`} whiteBg
                            footer={
                                <div style={{textAlign:'right'}}><Button type='submit' disabled={loading||disable} loading={disable} icon='submit'>{question == data?.total_question ? "Send" : "Next"}</Button></div>
                            }
                            header={
                                <CombineAction
                                    list={{
                                        share:{
                                            campaign:'quiz',
                                            posId:data?.id_number
                                        },
                                        report:true
                                    }}
                                />
                            }
                            >
                                <AdsBanner1 />
                                <LinearProgressWithLabel value={valueLinear} ques={question} total={data?.total_question} />
                                <Typography gutterBottom>{question}. {ques}</Typography>
                                <FormControl required component='fieldset'>
                                    <RadioGroup required value={input} onChange={(e)=>setInput(e.target.value)}>
                                        {chois?.map((dt,i)=>(
                                            <FormControlLabel key={i} disabled={disable} value={dt} control={<Radio />} label={dt} />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <AdsRect />
                            </PaperBlock>
                        </form>
                    </Grid>
                ) : (
                    <>
                        <Hidden key={0} lgUp>
                            <CustomSidebar classes={classes} loading={loading} users={data?.user} slug={slug} handleCopy={handleCopy} posid={data?.id_number} />
                        </Hidden>
                        <Grid item xs={12} lg={8}>
                            <div id='cardContent'>
                                <form onSubmit={handleStart}>
                                    <PaperBlock title={meta.title} whiteBg
                                    footer={
                                        <div className='flex-header'>
                                            <Button key={1} outlined onClick={()=>router.push('/quiz')}>Create My Quiz</Button>
                                            {data!==null && <Button key={0} disabled={loading||disable||data?.is_answered && data?.progress==data?.total_question} loading={disable} type='submit' icon='submit'>{data?.is_answered && data?.progress!=data?.total_question ? 'Resume' : 'Start'}</Button>}
                                        </div>
                                    }
                                    >
                                        {loading ? (
                                            <div style={{margin:'20px 0',textAlign:'center'}}>
                                                <CircularProgress thickness={5} size={50}/>
                                            </div>
                                        ) : (
                                            <div>
                                                <LinearProgress variant="determinate" value={Math.round((data?.progress*100)/data?.total_question)} />
                                                <Typography variant='caption' gutterBottom>{`Total question: ${data?.total_question}`}</Typography>
                                                <div style={{marginTop:20}}>
                                                    <TextField
                                                        label="Name"
                                                        fullWidth
                                                        required
                                                        value={input}
                                                        onChange={(e)=>setInput(e.target.value)}
                                                        variant='outlined'
                                                        disabled={data?.is_answered}
                                                    />
                                                </div>
                                                <AdsRect />
                                            </div>
                                        )}
                                    </PaperBlock>
                                </form>
                                {!loading && data?.public && (
                                    <PaperBlock title='Response' noPadding whiteBg
                                    footer={
                                        <Pagination style={{margin:'10px auto'}} color='primary' count={Number(totalRespon)} page={Number(pageRespon)} boundaryCount={3} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                                    }
                                    >
                                        <div style={{overflowX:'auto'}} className={classes.linkColor}>
                                            <Table aria-label="Quiz Response">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>#</TableCell>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell align="right">Score</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {loadingRespon ? (
                                                        <TableRow key='loading'>
                                                            <TableCell align="center" colSpan={3}><CircularProgress thickness={5} size={50}/></TableCell>
                                                        </TableRow>
                                                    ) : respon?.length ? 
                                                        respon?.map((dt,i)=>(
                                                            <TableRow key={i}>
                                                                <TableCell>{`${Number(((pageRespon-1)*20)+i+1)}.`}</TableCell>
                                                                <TableCell>
                                                                    {user?.id == data?.user?.id ? (
                                                                        <Link href='/quiz/response/[slug]' as={`/quiz/response/${dt?.id}`} passHref><a>{dt?.name}</a></Link>
                                                                    ) : dt?.name}
                                                                </TableCell>
                                                                <TableCell align='right'>{dt?.score}</TableCell>
                                                            </TableRow>
                                                        ))
                                                        : (
                                                            <TableRow key='no-data'>
                                                                <TableCell align="center" colSpan={3}>No response</TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </PaperBlock>
                                )}
                            </div>
                        </Grid>
                        <Hidden lgDown key={1}>
                            <CustomSidebar classes={classes} loading={loading} users={data?.user} slug={slug} handleCopy={handleCopy} posid={data?.id_number} />
                        </Hidden>
                    </>
                )}
            </Grid>
            <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>Information</DialogTitle>
                <DialogContent dividers>
                    {dialog?.announce.split("\n").map((dt,i)=>(
                        <Typography key={i}>{dt}</Typography>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>handleRedirect(dialog?.redirect)}>{dialog?.btn}</Button>
                </DialogActions>
            </Dialog>
        </Header>
    );
}

export default connect(state=>({user:state.user}))(withStyles(QuizDetail,styles))