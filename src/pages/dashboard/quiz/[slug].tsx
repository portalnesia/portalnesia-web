import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper, { BackendError } from "@redux/store";
import { accountUrl, href, portalUrl, shortUrl, staticUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import { BlogDetail } from "@model/pages";
import { Div, Span } from "@design/components/Dom";
import { Close, Visibility } from "@mui/icons-material";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import { CopyPartial, IPages } from "@type/general";
import Router, { useRouter } from "next/router";
import Recaptcha from "@design/components/Recaptcha";
import { useBeforeUnload, useMousetrap } from "@hooks/hotkeys";
import submitForm from "@utils/submit-form";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { copyTextBrowser, parseURL, slugFormat, ucwords } from "@portalnesia/utils";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import type ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import dynamic from "next/dynamic";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import {arrayMove, SortableContainer,SortableElement,SortableHandle} from 'react-sortable-hoc'
import IconButton from "@mui/material/IconButton";
import type { QuizDetailEditable, QuizResponsePagination } from "@model/quiz";
import { DragHandle, SortContainer } from "@comp/Sort";
import Tooltip from "@mui/material/Tooltip";
import ButtonBase from "@mui/material/ButtonBase";
import useTablePagination from "@design/hooks/TablePagination";
import useSWR from "@design/hooks/swr";
import { BoxPagination } from "@design/components/Pagination";
import Popover from "@design/components/Popover";
import LocalStorage from "@utils/local-storage";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { TableSWRPages } from "@comp/SWRPages";
import Link from "@design/components/Link";
import TablePagination from "@mui/material/TablePagination";
import Breadcrumbs from "@comp/Breadcrumbs";

const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));

export const getServerSideProps = wrapper<QuizDetailEditable>(async({redirect,session,params,resolvedUrl,fetchAPI})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const data: QuizDetailEditable = await fetchAPI<QuizDetailEditable>(`/v2/quiz/${slug}/edit`);
        return {
            props:{
                data,
                meta:{
                    title:"Edit Quiz"
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

type RemoveSortFunc = (type: string, i: number) => (e?: React.MouseEvent<HTMLButtonElement>) => void
type SortChoiseProps = {
    value: string
    sortIndex: number
    handleRemoveSort: RemoveSortFunc
    onChange:(index: number)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => void
    autoFocus?: boolean
}
const SortChoise = SortableElement<SortChoiseProps>(({value,sortIndex,handleRemoveSort,onChange,autoFocus}: SortChoiseProps)=>(
    <Stack direction='row' px={1} py={1} spacing={1} bgcolor="background.paper" sx={{
        zIndex:2000
    }}>
        <DragHandle />
        <Box width="100%" flexGrow={1}>
            <TextField
                autoFocus={autoFocus}
                value={value}
                onChange={onChange(sortIndex)}
                variant='outlined'
                fullWidth
            />
        </Box>
        <IconButton
            style={{marginLeft:10,padding:5}}
            onClick={handleRemoveSort('choise',sortIndex)}
            size="large"
        >
            <Close />
        </IconButton>
    </Stack>
))

type SortQuestionProps = {
    isPublished: boolean
    value: string
    sortIndex: number
    handleRemoveSort: RemoveSortFunc
    openDialog: RemoveSortFunc
}

const SortQuestion = SortableElement<SortQuestionProps>(({isPublished,value,sortIndex,handleRemoveSort,openDialog}: SortQuestionProps)=>{
    if(!isPublished) {
        return (
            <ButtonBase sx={{
                zIndex:2000,
                padding:'0 5px',
                boxSizing:'border-box',
                display:"flex",
                width:"100%",
                alignItems:"center",
                bgcolor:"background.default",
                height:60,
                py:2.5,
                px:2,
                borderBottom:t=>`1px solid ${t.palette.divider}`,
                ':hover':{
                    bgcolor:'action.hover'
                }
            }} onClick={openDialog('edit',sortIndex)}>
                <DragHandle />
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                    <Typography variant='body2'>{sortIndex+1}. {value}</Typography>
                    <IconButton
                        style={{padding:5}}
                        onClick={handleRemoveSort('question',sortIndex)}
                        size="large"><Close /></IconButton>
                </div>
            </ButtonBase>
        );
    } else {
        return (
            <Div sx={{
                zIndex:2000,
                padding:'0 5px',
                boxSizing:'border-box',
                display:"flex",
                width:"100%",
                alignItems:"center",
                bgcolor:"background.default",
                height:60,
                py:2.5,
                px:2,
                borderBottom:t=>`1px solid ${t.palette.divider}`
            }}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                    <Typography variant='body2'>{sortIndex+1}. {value}</Typography>
                </div>
            </Div>
        )
    }
})

export default function EditQuizPage({data,meta}: IPages<QuizDetailEditable>) {
    const [loading,setLoading]=React.useState(false)
    const [question,setQuestion]=React.useState<string[]>(data.question)
    const [choise,setChoise]=React.useState<string[][]>(data.choise)
    const [answer,setAnswer]=React.useState<string[]>(data.answer)
    const [dialog,setDialog]=React.useState<{type:string,index:number}|{type:string,title:string,msg:string}>()
    const [input,setInput]=React.useState<{question: string,answer:string}>({question:'',answer:""})
    const [chois,setChois]=React.useState(['']);
    const [other,setOther]=React.useState({title:data.title,publish:data.publish,public:data.public,self_answer:data.self_answer})
    const [isPublished,setIsPublished]=React.useState(data.publish)
    const {page,rowsPerPage,onPageChange,...pagination} = useTablePagination(1,10)
    const {data: response,error:errResponse} = useSWR<PaginationResponse<QuizResponsePagination>>(`/v2/quiz/${data.id}/response?page=${page}&per_page=${rowsPerPage}`)
    const captchaRef = React.useRef<Recaptcha>(null);
    const {put} = useAPI();
    const setNotif = useNotification();

    const onAddChoise=React.useCallback((e?: React.MouseEvent<HTMLButtonElement>)=>{
        if(e && e.preventDefault) e.preventDefault();
        if(dialog && (dialog?.type==='add'||dialog?.type==='edit')) {
            let a=[...chois]
            a.push('')
            setChois(a)
        } 
    },[dialog,chois])

    const handleRemoveSort=React.useCallback((type: string,i: number)=>(e?: React.MouseEvent<HTMLButtonElement>)=>{
        if(e && e.stopPropagation) e.stopPropagation();
        if(type==='choise') {
            let aaa=[...chois];
            aaa.splice(i,1);
            setChois(aaa)
        } else {
            let ch=[...choise],ans=[...answer],qu=[...question];
            ch.splice(i,1)
            ans.splice(i,1)
            qu.splice(i,1)
            setQuestion(qu)
            setAnswer(ans)
            setChoise(ch)
        }
    },[chois,answer,question,choise])

    const changeChoise=React.useCallback((i: number)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        let a=[...chois]
        a[i]=e.target.value
        setChois(a)
    },[chois])

    const openDialog=React.useCallback((type: string,index: number)=>(e?:React.MouseEvent<HTMLButtonElement>)=>{
        const aa={
            type:type,
            index:index
        }
        if(!loading){
            if(type==='response') {
                setDialog(aa)
            } else {
                if(!isPublished) {
                    if(type==='edit') {
                        setInput({question:question[index],answer:answer[index]})
                        setChois(choise[index])
                        setDialog(aa)
                    } else {
                        setInput({question:'',answer:''})
                        setChois(['']);
                        setDialog(aa)
                    }
                } else {
                    setNotif("Your quiz has already been published, so you can't edit the questions",true)
                }
            }     
        }

    },[loading,isPublished,question,answer,choise,setNotif])

    const onSortEnd=React.useCallback((type: string)=>({oldIndex,newIndex}: {oldIndex: number,newIndex: number})=>{
        if(type==='choise') {
            setChois(arrayMove(chois,oldIndex,newIndex))
        } else {
            setQuestion(arrayMove(question,oldIndex,newIndex))
            setChoise(arrayMove(choise,oldIndex,newIndex))
            setAnswer(arrayMove(answer,oldIndex,newIndex))
        }
    },[question,choise,chois,answer])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handlerAddQuestion=React.useCallback(submitForm(()=>{
        if(chois.length===0) setNotif('Choises cannot be empty',true);
        else if(chois.length < 2) setNotif('Must more than 1 choise',true)
        else {
            let salah=false;
            firstLoop:
            for(let i=0;i<chois.length;i++) {
                if(chois[i].length===0){
                    setNotif('Choises cannot be empty',true);
                    salah=true;
                    break;
                }
                for(let j=i+1;j<chois.length;j++) {
                    if(chois[i] === chois[j]) {
                        console.log(i,j)
                        console.log(chois[i],chois[j])
                        setNotif('There are more than 1 available choices with the same characters. The words is case sensitive',true)
                        salah=true;
                        break firstLoop;
                    }
                }
            }
            if(!salah) {
                if(chois.indexOf(input.answer)===-1) setNotif('There is no answer from the available choices. The words is case sensitive',true)
                else {
                    if(dialog && 'index' in dialog) {
                        let qu=[...question]
                        let ch=[...choise]
                        let ans=[...answer]
                        if(dialog?.type==='add') {
                            qu.push(input.question)
                            ans.push(input.answer)
                            ch.push(chois)
                            setQuestion(qu)
                            setAnswer(ans)
                            setChoise(ch)
                            setDialog(undefined)
                        } else {
                            qu[dialog?.index]=input.question
                            ans[dialog?.index]=input.answer
                            ch[dialog?.index]=chois
                            setQuestion(qu)
                            setAnswer(ans)
                            setChoise(ch)
                            setDialog(undefined)
                        }
                    }
                }
            }
        }
    }),[chois,choise,question,answer,input,dialog,setNotif])

    const handlePublish=React.useCallback((type: string)=>(e?: React.ChangeEvent<HTMLInputElement>)=>{
        if(type==='yes') {
            setOther({...other,publish:true})
            setDialog(undefined)
        } else if(e) {
            if(e.target.checked) {
                setDialog({
                    type:'announce',
                    title:'Are You Sure?',
                    msg:'You wont be able to edit this after published!'
                })
            } else {
                setOther({...other,publish:e.target.checked})
            }
        }
    },[other])

    const onResponseOpen=React.useCallback(()=>{
        if(page!==1) onPageChange({},1)
    },[onPageChange,page])

    const handleSave=React.useCallback(async()=>{
        if(other.title.length === 0) setNotif('Title cannot be empty',true)
        else {
            try {
                setLoading(true)
                const klq = LocalStorage.get('klq','array');
                const klqu = LocalStorage.get('klqu');
                const klqq = LocalStorage.get('klqq');
                const send={
                    ...other,
                    question,
                    answer,
                    choise,
                    klq,
                    klqu,
                    klqq
                }
                const recaptcha = await captchaRef.current?.execute();
                const res = await put<{setting?:Record<string,any>}>(`/v2/quiz/${data.id}`,{...send,recaptcha})
                setIsPublished(other.publish)
                if(typeof res?.setting === 'object') {
                    const setting = res?.setting;
                    Object.keys(setting).map(s=>{
                        if(setting?.[s]) LocalStorage.set(s,setting?.[s]);
                    })
                }
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true)
            } finally {
                setLoading(false);
            }
        }
    },[other,question,answer,choise,put,data,setNotif])

    useMousetrap('shift+enter',(e)=>{
        onAddChoise()
    },true)
    useMousetrap('shift+q',()=>{
        console.log("Q")
        openDialog('add',0)()
    })
    useMousetrap('shift+r',()=>{
        openDialog('response',0)()
    })
    useMousetrap(['ctrl+s','meta+s'],()=>{
        handleSave()
    },true)

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage])

    return (
        <Pages title={meta?.title} canonical={`/dashboard/quiz/${data?.id}`} noIndex>
            <DashboardLayout>
             <Breadcrumbs title={"Edit Quiz"} routes={[{
                    label:"Dashboard",
                    link:"/dashboard"
                },{
                    label:"Quiz",
                    link:"/dashboard/quiz"
                }]} />
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Edit Quiz</Typography>
                        <Button tooltip="Add question (Shift + Q)" icon='add' onClick={openDialog('add',0)}>Add question</Button>
                    </Stack>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <Stack id='card-content' alignItems='flex-start' spacing={3}>
                            <TextField
                                label='Title'
                                value={other.title}
                                variant='outlined'
                                fullWidth
                                required
                                disabled={loading||isPublished}
                                onChange={(e)=>setOther({...other,title:e.target.value})}
                                {...(isPublished ? {
                                    InputProps:{readOnly:true}
                                } : {})}
                            />
                            {question?.length > 0 ? (
                                <Div sx={{
                                    width:'100%',
                                    '.helper':{
                                        boxShadow:t=>`0 0 8px ${t.palette.action.active}`,
                                    }
                                }}>
                                    <SortContainer onSortEnd={onSortEnd('question')} useDragHandle helperClass="helper">
                                        {question?.map((dt,i)=>(
                                            <SortQuestion key={`ques-${i.toString()}`} isPublished={isPublished} sortIndex={i} index={i} value={dt} handleRemoveSort={handleRemoveSort} openDialog={openDialog} />
                                        ))}
                                    </SortContainer>
                                </Div>
                            ) : !loading && question?.length === 0 ? (
                                <BoxPagination>
                                    <Typography variant='h6'>No question</Typography>
                                </BoxPagination>
                            ) : null}
                        </Stack>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <Sidebar id='card-content' minimalScreen="lg">
                            <PaperBlock title="Options" content={{sx:{p:0}}}>
                                <Stack alignItems='flex-start' spacing={3}>
                                    <Stack px={2} width='100%' alignItems='flex-start' spacing={2}>
                                        <TextField
                                            label='Quiz Public URL'
                                            onClick={()=>copyTextBrowser(portalUrl(`/quiz/${data.id}`)).then(()=>setNotif('URL copied','default'))}
                                            value={portalUrl(`/quiz/${data.id}`)}
                                            fullWidth
                                            InputProps={{readOnly:true}}
                                            inputProps={{style:{cursor:'pointer'}}}
                                        />

                                        <TextField
                                            label='Short URL'
                                            onClick={()=>copyTextBrowser(shortUrl(`?q=${data.id_number}`)).then(()=>setNotif('URL copied','default'))}
                                            value={shortUrl(`?q=${data.id_number}`)}
                                            fullWidth
                                            InputProps={{readOnly:true}}
                                            inputProps={{style:{cursor:'pointer'}}}
                                        />
                                    </Stack>

                                    <Divider sx={{width:'100%'}} />

                                    <Stack px={2} width='100%' alignItems='flex-start'>
                                        <FormGroup key='share'>
                                            <FormControlLabel
                                                control={
                                                    <Switch disabled={loading} checked={other.public} onChange={e => setOther({ ...other, public: e.target.checked })} color="primary" />
                                                }
                                                label={
                                                    <Stack direction='row' spacing={1}>
                                                        <Typography>Share Quiz Result</Typography>
                                                        <Popover icon='ic:outline-help-outline'>
                                                            Quiz results will be visible to the public
                                                        </Popover>
                                                    </Stack>
                                                }
                                            />
                                        </FormGroup>
                                        <FormGroup key='self_answer'>
                                            <FormControlLabel
                                                control={
                                                    <Switch disabled={loading} checked={other.self_answer} onChange={e=>setOther({...other,self_answer:e.target.checked})} color="primary" />
                                                }
                                                label={
                                                    <Stack direction='row' spacing={1}>
                                                        <Typography>Can Answer Quiz</Typography>
                                                        <Popover icon='ic:outline-help-outline'>
                                                            <Typography paragraph>By default, your answers to your own quiz will not be saved.</Typography>
                                                            <Typography>Check this option if you want to answer your own quiz.</Typography>
                                                        </Popover>
                                                    </Stack>
                                                }
                                            />
                                        </FormGroup>
                                        <FormGroup key={'publish'}>
                                            <FormControlLabel control={
                                                <Switch disabled={loading||isPublished} checked={other.publish} onChange={handlePublish('open')} color="primary" />
                                            }
                                            label="Publish" />
                                        </FormGroup>
                                    </Stack>

                                    <Divider sx={{width:'100%'}} />

                                    <Stack px={2} direction='row' spacing={2} justifyContent='space-between' width="100%">
                                        <Button tooltip='Ctrl + S' disabled={loading} loading={loading} sx={{width:'100%'}} icon='save' onClick={handleSave}>Save</Button>
                                        {isPublished && <Button outlined color='inherit' tooltip='Shift + R' disabled={loading} sx={{width:'100%'}} onClick={()=>openDialog('response',0)}>Response</Button>}
                                    </Stack>
                                </Stack>
                            </PaperBlock>
                        </Sidebar>
                    </Grid>
                </Grid>
            </DashboardLayout>
            <Dialog open={dialog!==undefined && !loading && (dialog?.type==='add' || dialog?.type==='edit')} handleClose={()=>setDialog(undefined)}
                title={dialog?.type === 'edit' ? "Edit Question" : "Add Question"}
            >
                <form onSubmit={handlerAddQuestion}>
                    <Stack alignItems='flex-start' spacing={2}>
                        <TextField
                            autoFocus
                            label='Question'
                            value={input.question}
                            onChange={(e)=>setInput({...input,question:e.target.value})}
                            fullWidth
                            required
                        />
                        <TextField
                            label='Answer'
                            value={input.answer}
                            onChange={(e)=>setInput({...input,answer:e.target.value})}
                            variant='outlined'
                            fullWidth
                            required
                        />
                        <Div sx={{
                            width:'100%',
                            '.helper':{
                                boxShadow:t=>`0 0 8px ${t.palette.action.active}`,
                            }
                        }}>
                            <Typography gutterBottom>Choises</Typography>
                            <SortContainer onSortEnd={onSortEnd('choise')} useDragHandle helperClass="helper">
                                {chois?.map((dt,i)=>(
                                    <SortChoise key={`ques-${i.toString()}`} sortIndex={i} index={i} value={dt} handleRemoveSort={handleRemoveSort} onChange={changeChoise} autoFocus={i===(chois.length-1)} />
                                ))}
                            </SortContainer>
                        </Div>
                    </Stack>
                    <DialogActions sx={{mt:2}}>
                        <Button tooltip='Shift + Enter' disabled={loading} outlined color='inherit' onClick={onAddChoise} icon='add'>Add choises</Button>
                        <Button tooltip='Enter' disabled={loading} type='submit' icon='save'>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog loading={loading} open={dialog!==null && !loading && dialog?.type==='announce'}  title={dialog && 'title' in dialog ? dialog.title : ""} maxWidth="xs" fullScreen={false}
                titleWithClose={false}
                actions={
                    <>
                        <Button color='error' onClick={()=>setDialog(undefined)}>Cancel</Button>
                        <Button onClick={()=>handlePublish('yes')()}>Yes</Button>
                    </>
                }
            >
                {dialog && 'msg' in dialog ? <Typography>{dialog?.msg}</Typography> : null}
            </Dialog>

            <Dialog open={dialog!==null && !loading && dialog?.type==='response'} title="Quiz Response" handleClose={()=>setDialog(undefined)}
                TransitionProps={{
                    onEnter: onResponseOpen
                }}
            >
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
                                            <Link href={`/quiz/${data?.id}/response/${d.id}`} passHref><Span sx={{color:'customColor.link'}}>{d?.name}</Span></Link>
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
                <TablePagination page={page-1} rowsPerPage={rowsPerPage} onPageChange={onPageChange} count={response?.total||0} {...pagination} />
            </Dialog>
        </Pages>
    )
}