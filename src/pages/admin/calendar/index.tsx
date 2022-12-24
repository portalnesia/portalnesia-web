import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
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
import Router, { useRouter } from "next/router";
import Breadcrumbs from "@comp/Breadcrumbs";
import Grid from "@mui/material/Grid";
import { CalendarDetail,SAPTAWARA,PANCAWARA,WUKU } from "@model/calendar";
import { getDayJs } from "@utils/main";
import { ucwords } from "@portalnesia/utils";
import Iconify from "@design/components/Iconify";
import MenuPopover from "@design/components/MenuPopover";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import submitForm from "@utils/submit-form";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Select, { SelectItem } from "@design/components/Select";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import Recaptcha from "@design/components/Recaptcha";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session || !session.user.isAdmin("event")) return redirect(); 
    return {
        props:{
            data:{}
        }
    }
})

export default function CalendarAdminIndex() {
    const router = useRouter();
    const filter = router.query?.filter;
    const isBali = React.useMemo(()=>filter === "bali",[filter]);
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true,10);
    const orderRef = React.useRef(null);
    const {post,del} = useAPI();
    const setNotif = useNotification();
    const [dOrder,setDOrder] = React.useState(false);
    const [dialog,setDialog] = React.useState(false);
    const [kalenderBali,setKalenderBali] = React.useState(false);
    const [date,setDate] = React.useState<Dayjs|null>(null);
    const confirmRef = React.useRef<ConfirmationDialog>(null)
    const [delCalendar,setDelete] = React.useState<CalendarDetail>();
    // [Zero index,One index,One index]
    const [dateBali,setDateBali] = React.useState<[number,number,number]>([0,1,1]);
    const [loading,setLoading] = React.useState<'post'|'del'>();
    const captchaRef = React.useRef<Recaptcha>(null);

    const {data,error,mutate} = useSWR<PaginationResponse<CalendarDetail>>(`/v2/calendar?page=${page}&per_page=${rowsPerPage}${isBali ? `&filter=bali` : ''}`);

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage]);

    const getDate = React.useCallback((dt: CalendarDetail)=>{
        if(dt.date_bali) {
            const split = dt.date_bali.split("-").map(s=>Number.parseInt(s));
            return `${ucwords(SAPTAWARA?.[split[0]]||"")} ${ucwords(PANCAWARA?.[split[1]-1]||"")} ${ucwords(WUKU?.[split[2]-1]||"")}`
        } else {
            return getDayJs(dt.date).pn_format("fulldate")
        }
    },[])

    const handleOrder=React.useCallback((bali: boolean)=>()=>{
        setDOrder(false);
        Router.push(`/admin/calendar${bali ? '?filter=bali' : ''}`,undefined,{shallow:true});
    },[])

    const handleReset = React.useCallback(()=>{
        setDate(null)
        setDateBali([0,1,1])
        setKalenderBali(false);
    },[]);

    const handleOpenDialog = React.useCallback(()=>{
        handleReset();
        setDialog(true);
    },[handleReset])

    const handleCloseDialog = React.useCallback(()=>{
        setDialog(false);
    },[])

    const handleKalenderChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        if(e?.target?.value === "bali") {
            setKalenderBali(true)
        } else {
            setKalenderBali(false);
        }
    },[])

    const handleKalenderBaliChange = React.useCallback((type: 'saptawara'|'pancawara'|'wuku')=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        const value = Number.parseInt(e.target.value);
        if(Number.isNaN(value)) return;
        const bali: [number,number,number] = [...dateBali];
        if(type === 'saptawara') bali[0] = value;
        else if(type === "pancawara") bali[1] = value;
        else if(type === "wuku") bali[2] = value;
        setDateBali(bali);
    },[dateBali])

    const handleDelete = React.useCallback((calendar: CalendarDetail)=>async()=>{
        try {
            setDelete(calendar)
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setLoading('del');
            await del(`/v2/calendar/${calendar.id}`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(undefined);
        }
    },[setNotif,del,mutate])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading("post");
            let data: Record<string,any> = {};
            if(kalenderBali) {
                data.bali = true;
                data.date_bali = {
                    saptawara: dateBali[0],
                    pancawara: dateBali[1],
                    wuku: dateBali[2]
                }
            } else {
                if(!date) return setNotif("Invalid date",true);
                data.date = date.toDate();
            }
            const recaptcha = captchaRef.current?.execute();
            data.recaptcha = recaptcha;

            await post(`/v2/calendar`,data);
            handleCloseDialog();
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(undefined);
        }
    }),[kalenderBali,date,dateBali,post,setNotif,mutate,handleCloseDialog])

    return (
        <Pages title="Calendar" noIndex canonical="/admin/calendar">
            <DashboardLayout adminPage>
            <Breadcrumbs title="Blog" routes={[{
                    label:"Admin",
                    link:"/admin"
                }]} />
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Calendar</Typography>
                        
                        <Stack direction='row' spacing={1}>
                            <Button disabled={!data&&!error} ref={orderRef} color='inherit' text onClick={()=>setDOrder(true)} endIcon={<Iconify icon='fe:list-order' />}>{"Filter"}</Button>
                            <Button onClick={handleOpenDialog}>New</Button>
                        </Stack>
                    </Stack>
                </Box>

                <Box>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Text</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align='right'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableSWRPages loading={!data&&!error} error={error} colSpan={5}>
                                    {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                                        <TableRow key={`calendar-${d.id}`}>
                                            <TableCell>{getNumber(i)}</TableCell>
                                            <TableCell>{d.text}</TableCell>
                                            <TableCell>{getDate(d)}</TableCell>
                                            <TableCell>
                                                <Grid container spacing={1}>
                                                    <Grid key={`label-publish`} item xs="auto" zeroMinWidth>
                                                        <Label color={d.publish ? 'secondary':'default'} variant='filled'>{d.publish ? "Published" : "Draft"}</Label>
                                                    </Grid>
                                                    <Grid key={`label-publish`} item xs="auto" zeroMinWidth>
                                                        <Label color={'primary'} variant='filled'>{d.public ? "Public" : "Non Public"}</Label>
                                                    </Grid>
                                                    <Grid key={`label-publish`} item xs="auto" zeroMinWidth>
                                                        <Label color={'error'} variant='filled'>{d.group ? "Group" : "Non Group"}</Label>
                                                    </Grid>
                                                </Grid>
                                            
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                    <Link href={`/admin/calendar/${d.id}`} passHref legacyBehavior>
                                                        <Tooltip title="Edit"><IconButton aria-label="Edit" component='a'>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Link>
                                                    <Tooltip title="Edit">
                                                        <IconButton aria-label="Edit" onClick={handleDelete(d)}>
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
                        <TablePagination page={page-1} rowsPerPage={rowsPerPage} count={data?.total||0} {...tablePagination} />
                    </Scrollbar>
                </Box>
            </DashboardLayout>

            <Dialog open={dialog} handleClose={handleCloseDialog} title="New Calendar">
                <form onSubmit={handleSubmit}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Select onChange={handleKalenderChange} value={kalenderBali ? "bali" : "general"} fullWidth select disabled={loading!==undefined}>
                                    <SelectItem value="general">Kalender Masehi</SelectItem>
                                    <SelectItem value="bali">Kalender Bali</SelectItem>
                                </Select>
                            </Grid>

                            <Grid item xs={12}>
                                {kalenderBali ? (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} lg={4}>
                                            <Select value={dateBali[0]} onChange={handleKalenderBaliChange('saptawara')} fullWidth select disabled={loading!==undefined}>
                                                {SAPTAWARA.map((s,i)=>(
                                                    <SelectItem key={s} value={i}>{s}</SelectItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                        <Grid item xs={12} lg={4}>
                                            <Select value={dateBali[1]} onChange={handleKalenderBaliChange('pancawara')} fullWidth select disabled={loading!==undefined}>
                                                {PANCAWARA.map((s,i)=>(
                                                    <SelectItem key={s} value={i+1}>{s}</SelectItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                        <Grid item xs={12} lg={4}>
                                            <Select value={dateBali[2]} onChange={handleKalenderBaliChange('wuku')} fullWidth select disabled={loading!==undefined}>
                                                {WUKU.map((s,i)=>(
                                                    <SelectItem key={s} value={i+1}>{ucwords(s)}</SelectItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <DatePicker
                                        inputFormat='DD MMM YYYY'
                                        value={date}
                                        onChange={e=>e && setDate(e)}
                                        disablePast
                                        disabled={loading!==undefined}
                                        renderInput={params=><TextField required fullWidth {...params} />}
                                        disableMaskedInput
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                    <DialogActions sx={{mt:2}}>
                        <Button type='submit' disabled={loading==="post"} loading={loading==="post"} icon='save'>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
            <ConfirmationDialog ref={confirmRef} body={delCalendar ? (
                <Typography>Delete calendar <Span sx={{color:'customColor.link'}}>{delCalendar.text}</Span>?</Typography>
            ) : undefined} />
            <Backdrop open={loading==="del"} />
            <MenuPopover disableDrawer open={dOrder} onClose={()=>setDOrder(false)} anchorEl={orderRef.current} paperSx={{width:150}}>
                <Box py={1}>
                    <MenuItem key={'public'} sx={{ color: 'text.secondary',py:1 }} onClick={handleOrder(false)} selected={!isBali}>
                        <ListItemText primary={"General"} />
                    </MenuItem>
                    <MenuItem key={'bali'} sx={{ color: 'text.secondary',py:1 }} onClick={handleOrder(true)} selected={isBali}>
                        <ListItemText primary={"Bali"} />
                    </MenuItem>
                </Box>
            </MenuPopover>
        </Pages>
    )
}