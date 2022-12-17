import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import SWRPages from "@comp/SWRPages";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Delete, Edit } from "@mui/icons-material";
import Button from "@comp/Button";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";
import { TwibbonDetail } from "@model/twibbon";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@design/components/Avatar";
import Image from "@comp/Image";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItem from "@mui/material/ListItem";
import submitForm from "@utils/submit-form";
import Recaptcha from "@design/components/Recaptcha";
import Textarea from "@design/components/Textarea"
import { useMousetrap } from "@hooks/hotkeys";
import Router from "next/router";
import Breadcrumbs from "@comp/Breadcrumbs";

const FormGroup = dynamic(()=>import("@mui/material/FormGroup"));
const FormControlLabel = dynamic(()=>import("@mui/material/FormControlLabel"));
const Switch = dynamic(()=>import("@mui/material/Switch"));
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

export default function TwibbonDashIndex() {
    const [page,setPage] = usePagination(true);
    const {data,error,mutate} = useSWR<PaginationResponse<TwibbonDetail>>(`/v2/twibbon/dashboard?page=${page}`);
    const confirmRef = React.useRef<ConfirmationDialog>(null)
    const [delTwibbon,setDelete] = React.useState<TwibbonDetail>();
    const [backdrop,setBackdrop] = React.useState(false);
    const [input,setInput] = React.useState<{title:string,description:string,publish:boolean}>({title:"",description:"",publish:false});
    const [loading,setLoading] = React.useState(false);
    const [dialog,setDialog] = React.useState<TwibbonDetail>();
    const captchaRef = React.useRef<Recaptcha>(null)
    const setNotif = useNotification();
    const {del,put} = useAPI();

    const handleDelete = React.useCallback((twibbon: TwibbonDetail)=>async()=>{
        try {
            setDelete(twibbon)
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setBackdrop(true);
            await del(`/v2/twibbon/${twibbon.slug}`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setBackdrop(false)
        }
    },[setNotif,del,mutate])

    const handleEdit = React.useCallback(submitForm(async()=>{
        try {
            if(!dialog) return;
            setLoading(true);
            const recaptcha = await captchaRef.current?.execute();
            await put(`/v2/twibbon/${dialog.slug}`,{...input,recaptcha});
            mutate();
            setDialog(undefined)
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false)
        }
    }),[put,setNotif,mutate,input,dialog])

    const handleChange=React.useCallback(<K extends keyof typeof input,V = (typeof input)[K]>(name:K,val:V)=>{
        setInput({...input,[name]:val})
    },[input])

    const handleDialog = React.useCallback((twibbon?: TwibbonDetail)=>()=>{
        if(twibbon) {
            setInput({title:twibbon.title,description:twibbon.description||"",publish:twibbon.publish})
            setDialog(twibbon);
        } else {
            setDialog(undefined)
        }
    },[dialog])

    useMousetrap(['+','shift+='],()=>{
        Router.push(`/dashboard/twibbon/new`);
    },false)
    
    return (
        <Pages title="Twibbon - Dashboard" canonical={`/dashboard/twibbon`} noIndex>
            <DashboardLayout>
                <Breadcrumbs title="Twibbon" routes={[{
                    label:"Dashboard",
                    link:"/dashboard"
                }]} />
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Twibbon</Typography>
                        <Link href={`/dashboard/twibbon/new`} passHref legacyBehavior><Button tooltip="New Twibbon (+)" component='a' icon='add'>New</Button></Link>
                    </Stack>
                </Box>

                <Box>
                    <SWRPages loading={!data&&!error} error={error}>
                        <List>
                            {(data && data?.data?.length > 0) ? data?.data?.map(d=>(
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Image src={d.image} alt={d.title} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Stack alignItems='flex-start'>
                                                <Link href={d.link}>
                                                    <Typography sx={{color:'customColor.link'}}>{d.title}</Typography>
                                                </Link>
                                            </Stack>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Edit">
                                            <IconButton aria-label="Edit" onClick={handleDialog(d)}>
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton aria-label="Delete" onClick={handleDelete(d)}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )) : (
                                <BoxPagination>
                                    <Typography>No data</Typography>
                                </BoxPagination>
                            )}
                        </List>
                        <Box mt={3}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page||0} />
                        </Box>
                    </SWRPages>
                </Box>
            </DashboardLayout>
            <ConfirmationDialog ref={confirmRef} body={delTwibbon ? (
                <Typography>Delete twibbon <Span sx={{color:'customColor.link'}}>{delTwibbon.title}</Span>?</Typography>
            ) : undefined} />
            <Backdrop open={backdrop} />
            <Recaptcha ref={captchaRef} />
            <Dialog open={dialog!==undefined} handleClose={handleDialog()} title={`Edit Twibbon`}>
                <form onSubmit={handleEdit}>
                    <Stack alignItems='flex-start' spacing={1}>
                        <TextField
                            label="Title"
                            value={input.title}
                            onChange={e=>handleChange('title',e.target.value)}
                            required
                            fullWidth
                            disabled={loading}
                        />
                        <Textarea
                            label="Description"
                            value={input.description}
                            onChange={e=>handleChange('description',e.target.value)}
                            fullWidth
                            disabled={loading}
                            multiline
                            rows={10}
                        />
                        <FormGroup>
                            <FormControlLabel control={
                                <Switch disabled={loading} checked={input.publish} onChange={e=>handleChange('publish',e.target.checked)} color="primary" />
                            }
                            label="Publish" />
                        </FormGroup>
                    </Stack>
                    <DialogActions sx={{mt:2}}>
                        <Button type='submit' disabled={loading} loading={loading} icon='save'>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Pages>
    )
}