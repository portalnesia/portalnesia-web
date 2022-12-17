import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import useTablePagination from "@design/hooks/TablePagination";
import { TableSWRPages } from "@comp/SWRPages";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Label from "@design/components/Label";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Delete, Edit } from "@mui/icons-material";
import TablePagination from "@mui/material/TablePagination";
import Button from "@comp/Button";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";
import { QuizPagination } from "@model/quiz";
import submitForm from "@utils/submit-form";
import Recaptcha from "@design/components/Recaptcha";
import { useMousetrap } from "@hooks/hotkeys";
import Breadcrumbs from "@comp/Breadcrumbs";

const TextField = dynamic(()=>import("@mui/material/TextField"));
const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    return {
        props:{
            data:{}
        }
    }
})

export default function QuizDashIndex() {
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true,10);
    const {data,error,mutate} = useSWR<PaginationResponse<QuizPagination>>(`/v2/quiz?page=${page}&per_page=${rowsPerPage}`);
    const confirmRef = React.useRef<ConfirmationDialog>(null)
    const [delQuiz,setDelete] = React.useState<QuizPagination>();
    const [loading,setLoading] = React.useState(false);
    const setNotif = useNotification();
    const {del,post} = useAPI();
    const [title,setTitle] = React.useState("");
    const [dialog,setDialog] = React.useState(false);
    const captchaRef = React.useRef<Recaptcha>(null);

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage]);

    const handleDelete = React.useCallback((quiz: QuizPagination)=>async()=>{
        try {
            setDelete(quiz)
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setLoading(true);
            await del(`/v2/quiz/${quiz.id}`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false)
        }
    },[setNotif,del,mutate])

    const handleNew = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            const recaptcha = await captchaRef.current?.execute();
            await post(`/v2/quiz`,{title,recaptcha})
            setDialog(false)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false)
        }
    }),[post,setNotif,mutate,title])

    useMousetrap(['+','shift+='],()=>{
        setTitle("");
        setDialog(true);
    },false)

    return (
        <Pages title="Quiz - Dashboard" canonical={`/dashboard/quiz`} noIndex>
            <DashboardLayout>
                <Breadcrumbs title="Quiz" routes={[{
                    label:"Dashboard",
                    link:"/dashboard"
                }]} />
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Quiz</Typography>
                        <Button tooltip="New Quiz (+)" icon='add' onClick={()=>{setTitle(""),setDialog(true)}}>New</Button>
                    </Stack>
                </Box>

                <Box>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Response</TableCell>
                                    <TableCell align='right'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableSWRPages loading={!data&&!error} error={error} colSpan={5}>
                                    {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                                        <TableRow key={d.id}>
                                            <TableCell>{getNumber(i)}</TableCell>
                                            <TableCell><Link href={`/quiz/${d.id}`}><Span sx={{color:'customColor.link'}}>{d.title}</Span></Link></TableCell>
                                            <TableCell><Label color={d.publish ? 'secondary':'default'} variant='filled'>{d.publish ? "Published" : "Draft"}</Label></TableCell>
                                            <TableCell>{d?.total_response||'-'}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                    <Link href={`/dashboard/quiz/${d.id}`} passHref legacyBehavior>
                                                        <Tooltip title="Edit">
                                                            <IconButton aria-label="Edit" component='a'>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Link>
                                                    <Tooltip title="Delete">
                                                        <IconButton aria-label="Delete" onClick={handleDelete(d)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <BoxPagination>
                                                    <Typography>No data</Typography>
                                                </BoxPagination>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableSWRPages>
                            </TableBody>
                        </Table>
                    </Scrollbar>
                    <TablePagination page={page-1} rowsPerPage={rowsPerPage} count={data?.total||0} {...tablePagination} />
                </Box>
            </DashboardLayout>
            <ConfirmationDialog ref={confirmRef} body={delQuiz ? (
                <Typography>Delete quiz <Span sx={{color:'customColor.link'}}>{delQuiz.title}</Span>?</Typography>
            ) : undefined} />
            <Dialog open={dialog} handleClose={()=>setDialog(false)} title="New Quiz">
                <form onSubmit={handleNew}>
                    <Stack alignItems='flex-start' spacing={1}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={e=>setTitle(e.target.value)}
                            required
                            fullWidth
                            disabled={loading}
                            autoFocus
                        />
                    </Stack>
                    <DialogActions sx={{mt:2}}>
                        <Button type='submit' disabled={loading} loading={loading} icon='submit'>Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
            <Backdrop open={loading} />
        </Pages>
    )
}