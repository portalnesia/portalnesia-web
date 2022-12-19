import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { QuizDetail, QuizResponsePagination } from "@model/quiz";
import wrapper, { BackendError, useSelector } from "@redux/store";
import { IPages } from "@type/general";
import { portalUrl, staticUrl } from "@utils/main";
import Router,{ useRouter } from "next/router";
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import dynamic from "next/dynamic";
import Typography from '@mui/material/Typography'
import SWRPages, { TableSWRPages } from "@comp/SWRPages";
import Sidebar from "@design/components/Sidebar";
import ProfileWidget from "@design/components/ProfileWidget";
import { Div, Span } from "@design/components/Dom";
import Link from "@design/components/Link";
import Hidden from "@mui/material/Hidden";
import Stack from "@mui/material/Stack";
import TextField from '@mui/material/TextField'
import { copyTextBrowser } from "@portalnesia/utils";
import useNotification from "@design/components/Notification";
import { ReportAction, ShareAction } from "@comp/Action";
import submitForm from "@utils/submit-form";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import useTablePagination from "@design/hooks/TablePagination";
import LocalStorage from "@utils/local-storage";
import { getAnalytics, logEvent } from "@utils/firebase";
import { LinearProgress } from "@design/components/Backdrop";
import Button from "@comp/Button";
import Scrollbar from "@design/components/Scrollbar";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { Circular } from "@design/components/Loading";
import TablePagination from "@mui/material/TablePagination";
import FormControl from "@mui/material/FormControl";

const Dialog = dynamic(()=>import("@design/components/Dialog"))
const FormControlLabel = dynamic(()=>import("@mui/material/FormControlLabel"));
const RadioGroup = dynamic(()=>import("@mui/material/RadioGroup"));
const Radio = dynamic(()=>import("@mui/material/Radio"));

export const getServerSideProps = wrapper<Pick<QuizDetail,'id_number'|'id'|'title'>>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const data: QuizDetail = await fetchAPI<QuizDetail>(`/v2/quiz/${slug}`);
        
        return {
            props:{
                data:{
                    id:data?.id,
                    id_number:data?.id_number,
                    title:data?.title
                },
                meta:{
                    title: data?.title,
                    image:staticUrl(`ogimage/quiz/${data.id}`)
                }
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
    
})

type AnswerResponse = {
    redirect: number
    announce?: string
    question?: string
    choise?: string[]
    setting?: {
        klq: number[];
        klqu: Record<number, number>
        klqq: Record<number, number>
    }
}
let loadingCache = false;
export default function QuizDetailPage({data:dataServer,meta}: IPages<Pick<QuizDetail,'id_number'|'id'|'title'>>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const questionQuery = router.query?.question;
    const {user,appToken} = useSelector(s=>({user:s.user,appToken:s.appToken}));
    const {post}=useAPI();
    const setNotif = useNotification();
    const [data,setData]=React.useState<QuizDetail|null>(null)
    const [question,setQuestion]=React.useState<string|null>(null)
    const [choise,setChoise]=React.useState<string[]>([]);
    const [loading,setLoading]=React.useState(false)
    const [disable,setDisable]=React.useState(false)
    const [dialog,setDialog]=React.useState<{redirect:number,announce: string,button: string}|undefined>(undefined)
    const [input,setInput]=React.useState("");
    const {page:pageResponse,rowsPerPage,onPageChange,...responsePage} = useTablePagination(1,10);
    const {data:response,error:errResponse} = useSWR<PaginationResponse<QuizResponsePagination>>(data && data?.public ? `/v2/quiz/${data.id}/response?page=${pageResponse}&per_page=${rowsPerPage}` : null);
    const [ready,setReady] = React.useState(false)

    const handleRedirect = React.useCallback((question: number)=>()=>{
        //setLoading(true)
        //setDisable(true)
        Router.replace(`/quiz/${slug}${question!==0 ? `?question=${question}` : ''}`,undefined,{shallow:true,scroll:true});
    },[slug])

    const submitAnswer=React.useCallback(async(dt?: Record<string,any>,question?: string|null,callback?: ()=>void)=>{
        try {
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

            const res = await post<AnswerResponse>(`/v2/quiz/${slug}${question ? `/${question}`:''}`,data,undefined,{success_notif:false});
            
            setInput("");

            if(typeof res.question !== 'undefined') setQuestion(res.question)
            
            if(typeof res.choise !== 'undefined') setChoise(res.choise)
            
            if(typeof res?.setting === 'object') {
                const setting = res?.setting;
                Object.keys(setting).forEach((key)=>{
                    const s = key as keyof typeof setting
                    if(setting?.[s]) LocalStorage.set(s,setting?.[s]);
                })
            }

            if(typeof callback ==='function') callback()

            if(typeof res?.announce === 'string') {
                setDialog({
                    redirect:res.redirect,
                    announce:res.announce,
                    button:(res.redirect===1 ? "Start" : "OK")
                })
            } else if(typeof res.redirect !== 'undefined') handleRedirect(res.redirect)()
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setDisable(false)
        }
    },[slug,post,setNotif,handleRedirect])

    const initData = React.useCallback(async()=>{
        try {
            setLoading(true)
            const query = {
                klq:LocalStorage.get('klq','array'),
                klqu:LocalStorage.get('klqu'),
                klqq:LocalStorage.get('klqq')
            }
            const res = await post(`/v2/quiz/answer/${slug}`,query,undefined,{success_notif:false});
            setData(res);
            if(res?.my_name!==null) setInput(res.my_name)
            setReady(true);
        } catch(e) {
            //if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
            loadingCache = false;
        }
    },[post,slug])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleStart = React.useCallback(submitForm(()=>{
        if(!data) return;
        submitAnswer({name:input},undefined,()=>{
            setData({
                ...data,
                my_name:input
            })
        })
    }),[submitAnswer,input,data])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleAnswer=React.useCallback(submitForm(()=>{
        if(typeof questionQuery !== 'string') return;
        if(input?.length<1) setNotif("You have not given an answer",true)
        else submitAnswer({answer:input},questionQuery)
    }),[input,submitAnswer,questionQuery])

    React.useEffect(()=>{
        if(questionQuery) router.replace(`/quiz/${slug}`,undefined,{shallow:true});
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[])

    const valueLinear=React.useMemo(()=>{
        if(!data) return 0;
        if(typeof questionQuery === 'string') {
            const questionNumber = Number.parseInt(questionQuery)
            return Math.round(questionNumber*100/(data?.total_question||0))
        } else {
            return Math.round((data?.progress||0)/(data?.total_question||0))
        }
    },[questionQuery,data])

    const getNumber = React.useCallback((i:number)=>{
        return ((pageResponse-1)*rowsPerPage)+i+1
    },[pageResponse,rowsPerPage])

    React.useEffect(()=>{

        let timeout = setTimeout(()=>{
            const analytics = getAnalytics();
            logEvent(analytics,"select_content",{
                content_type:"quiz",
                item_id:`${dataServer.id_number}`
            })
        },5000)

        return ()=>{
            clearTimeout(timeout);
            loadingCache=false;
            setReady(false);
        }
    },[dataServer])

    React.useEffect(()=>{
        setDialog(undefined)
        setDisable(false)

        async function init() {
            try {
                if(appToken && typeof questionQuery==='undefined' && !loadingCache && !ready) {
                    loadingCache = true;
                    onPageChange({},0)
                    await initData()
                }
            } catch {}
        }
        init();
    },[questionQuery,ready,initData,onPageChange,appToken])

    return (
        <Pages title={meta?.title} desc={meta?.desc} canonical={`/quiz/${dataServer?.id}`} image={meta?.image}>
            <DefaultLayout>
                <SWRPages loading={loading} error={undefined}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>{data?.title||dataServer?.title}</Typography>
                    </Box>
                    
                    <Grid container spacing={4} justifyContent='center'>
                        <Hidden mdUp>
                            {(data && typeof questionQuery === 'undefined') ? (
                                <CustomSidebar data={data} />
                            ) : null}
                        </Hidden>
                        <Grid item {...(typeof questionQuery === 'string' ? {xs:12} : {xs:12,md:8})}>
                            <Box id='quiz-content'>
                                <Box>
                                    {typeof questionQuery === 'string' ? (
                                        <form onSubmit={handleAnswer}>
                                            <Stack direction='row' spacing={1} mb={5}>
                                                <LinearProgress sx={{flexGrow:1}} variant='determinate' value={valueLinear} />
                                                <Typography variant='body2'>{`${questionQuery||0} / ${data?.total_question||0}`}</Typography>
                                            </Stack>
                                            <Typography gutterBottom variant='h6'>{questionQuery}. {question}</Typography>
                                            <FormControl required component='fieldset'>
                                                <RadioGroup value={input} onChange={(e)=>setInput(e.target.value)}>
                                                    {choise?.map((dt)=>(
                                                        <FormControlLabel key={dt} disabled={disable} value={dt} control={<Radio />} label={dt} />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            
                                            <Divider sx={{my:5}} />

                                            <Stack direction='row' justifyContent='space-between'>
                                                <div />
                                                <Button type='submit' disabled={loading||disable} loading={disable} icon='submit'>{questionQuery === data?.total_question?.toString() ? "Send" : "Next"}</Button>
                                            </Stack>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleStart}>
                                            <LinearProgress variant='determinate' value={valueLinear} />
                                            <Typography sx={{mt:1}}>{`Total question: ${data?.total_question}`}</Typography>
                                            <Box mt={4}>
                                                <TextField
                                                    label="Name"
                                                    fullWidth
                                                    required
                                                    value={input}
                                                    onChange={(e)=>setInput(e.target.value)}
                                                    disabled={data?.is_answered}
                                                />
                                            </Box>
                                            <Stack mt={2} direction='row' spacing={1} justifyContent='space-between'>
                                                <Link href="/dashboard/quiz" passHref legacyBehavior><Button component="a" outlined color='inherit'>Create My Quiz</Button></Link>
                                                <Button icon='submit' type='submit' disabled={loading||disable||data?.is_answered && data?.progress===data?.total_question} loading={disable}>Start</Button>
                                            </Stack>
                                        </form>
                                    )}

                                    {(data?.public && typeof questionQuery === 'undefined') && (
                                        <Box mt={10}>
                                            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                                <Typography variant='h3' component='h1'>Response</Typography>
                                            </Box>

                                            <Scrollbar>
                                                <Table aria-label="Quiz Response">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>#</TableCell>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell align="right">Score</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        <TableSWRPages loading={!response&&!errResponse} error={errResponse} colSpan={3}>
                                                            {response && response?.data.length > 0 ? response?.data.map((d,i)=>(
                                                                <TableRow key={d.id}>
                                                                    <TableCell>{getNumber(i)}</TableCell>
                                                                    <TableCell>
                                                                        {user?.id === data?.user?.id ? (
                                                                            <Link href={`/quiz/${data?.id}/response/${d.id}`} passHref><Span sx={{color:'customColor.link'}}>{d?.name}</Span></Link>
                                                                        ) : d?.name}
                                                                    </TableCell>
                                                                    <TableCell align='right'>{d?.score}</TableCell>
                                                                </TableRow>
                                                            )) : (
                                                                <TableRow key='no-data'>
                                                                    <TableCell colSpan={3} align='center'>No data</TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableSWRPages>
                                                    </TableBody>
                                                </Table>
                                            </Scrollbar>
                                            <TablePagination page={pageResponse-1} rowsPerPage={rowsPerPage} onPageChange={onPageChange} count={response?.total||0} {...responsePage} />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Hidden mdDown>
                            {(data && typeof questionQuery === 'undefined') ? (
                                <CustomSidebar data={data} />
                            ) : null}
                        </Hidden>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
            <Dialog open={dialog!==undefined} title="Information" fullScreen={false} maxWidth="xs" titleWithClose={false}
                actions={
                    dialog && <Button onClick={handleRedirect(dialog?.redirect)}>{dialog?.button}</Button>
                }
            >
                {dialog && dialog?.announce.split("\n").map((dt)=>(
                    <Typography key={dt} gutterBottom>{dt}</Typography>
                ))}
            </Dialog>
        </Pages>
    )
}

type CustomSidebarProps = {
    data: QuizDetail

}
function CustomSidebar({data}: CustomSidebarProps) {
    const setNotif = useNotification();

    const handleCopy = React.useCallback(async()=>{
        await copyTextBrowser(portalUrl(`/quiz/${data.id}?utm_medium=copy+url&utm_campaign=quiz`))
        setNotif("URL Copied",'default');
    },[setNotif,data])

    return (
        <Grid item xs={12} md={4}>
            <Sidebar id='quiz-content'>
                <ProfileWidget src={data?.user?.picture} name={data?.user?.name} paperProps={{sx:{mb:5}}}
                    title={
                        <Stack>
                            <Typography key='quiz' variant="body2" component='p'>Quiz by</Typography>
                            <Div>
                                <Link href={`/user/${data?.user?.username}`} className='underline'><Typography variant='h4' component='p'>{data?.user?.name}</Typography></Link>
                            </Div>
                        </Stack>
                    }
                >
                    <Stack alignItems="flex-start" spacing={1}>
                        <TextField
                            value={portalUrl(`/quiz/${data.id}`)}
                            fullWidth
                            InputProps={{readOnly:true,sx:{cursor:"pointer"}}}
                            onClick={handleCopy}
                            sx={{cursor:"pointer"}}
                            inputProps={{style:{cursor:"pointer"}}}
                        />
                        <Stack direction='row' spacing={1} width='100%'>
                            <ReportAction buttonProps={{outlined:true,color:'inherit',sx:{width:'100%'}}} variant="button" report={{
                                type:"konten",
                                information:{
                                    konten:{
                                        type:"quiz",
                                        id:data.id_number
                                    }
                                }
                            }} />
                            <ShareAction campaign='quiz' posId={data?.id_number} variant="button" buttonProps={{outlined:true,color:'inherit',sx:{width:'100%'}}} />
                        </Stack>
                    </Stack>
                </ProfileWidget>
            </Sidebar>
        </Grid>
    )
}