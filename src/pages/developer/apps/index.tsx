import Pages from "@comp/Pages";
import wrapper from "@redux/store";
import { staticUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import { BoxPagination, usePagination } from "@design/components/Pagination";
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
import { AppsPagination } from "@model/developer";
import DeveloperLayout from "@layout/developer";

const TextField = dynamic(()=>import("@mui/material/TextField"));
const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));

export const getServerSideProps = wrapper(async({redirect,params,session})=>{
    if(!session || !session.user.isAdmin('developer')) return redirect();

    return {
        props:{
            data:{}
        }
    }
})

export default function DeveloperAppsIndex() {
    const [page,setPage] = usePagination(true);
    const {data,error,mutate} = useSWR<PaginationResponse<AppsPagination>>(`/v2/developer/apps?page=${page}`);
    const confirmRef = React.useRef<ConfirmationDialog>(null)
    const [delTwibbon,setDelete] = React.useState<AppsPagination>();
    const [backdrop,setBackdrop] = React.useState(false);
    const [input,setInput] = React.useState<{name:string,description:string}>({name:"",description:""});
    const [loading,setLoading] = React.useState(false);
    const [dialog,setDialog] = React.useState(false);
    const captchaRef = React.useRef<Recaptcha>(null)
    const setNotif = useNotification();
    const {del,post} = useAPI();

    const handleChange=React.useCallback((name:keyof typeof input)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setInput({...input,[name]:e.target.value})
    },[input])

    const handleDialog = React.useCallback(()=>{
        if(loading) return;
        setDialog(!dialog);
    },[dialog,loading])

    const handleDelete = React.useCallback((apps: AppsPagination)=>async()=>{
        try {
            setDelete(apps)
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setBackdrop(true);

            await del(`/v2/developer/apps/${apps.id}`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setBackdrop(false)
        }
    },[del,setNotif,mutate])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true);

            const recaptcha = await captchaRef.current?.execute();
            await post(`/v2/developer/apps`,{...input,recaptcha});
            
            setDialog(false);
            mutate();
            setInput({name:"",description:""});
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false)
        }
    }),[post,setNotif,input])

    useMousetrap(['+','shift+='],()=>{
        setDialog(true)
    },false)
    
    return (
        <Pages title="My Apps - Developer" canonical={`/developer/apps`} noIndex>
            <DeveloperLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>My Apps</Typography>
                        <Button tooltip="New Apps (+)"icon='add' onClick={handleDialog}>New</Button>
                    </Stack>
                </Box>

                <Box>
                    <SWRPages loading={!data&&!error} error={error}>
                        <List>
                            {(data && data?.data?.length > 0) ? data?.data?.map(d=>(
                                <ListItem key={d.name}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Image src={d.icon ? d.icon : staticUrl("notfound.png")} alt={d.name} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={d.name}
                                    />
                                    <ListItemSecondaryAction>
                                        <Link href={`/developer/apps/${d.id}`} passHref legacyBehavior>
                                            <Tooltip title="Edit">
                                                <IconButton aria-label="Edit">
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                        </Link>
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
                    </SWRPages>
                </Box>
            </DeveloperLayout>
            <ConfirmationDialog ref={confirmRef} body={delTwibbon ? (
                <Typography>Delete apps <Span sx={{color:'customColor.link'}}>{delTwibbon.name}</Span>?</Typography>
            ) : undefined} />
            <Backdrop open={backdrop} />
            <Recaptcha ref={captchaRef} />
            <Dialog open={dialog} handleClose={handleDialog} title={`New Apps`}>
                <form onSubmit={handleSubmit}>
                    <Stack alignItems='flex-start' spacing={1}>
                        <TextField
                            label="Title"
                            value={input.name}
                            onChange={handleChange('name')}
                            required
                            fullWidth
                            autoFocus
                            disabled={loading}
                        />
                        <Textarea
                            label="Description"
                            value={input.description}
                            onChange={handleChange('description')}
                            fullWidth
                            disabled={loading}
                            multiline
                            rows={10}
                        />
                    </Stack>
                    <DialogActions sx={{mt:2}}>
                        <Button type='submit' disabled={loading} loading={loading} icon='submit'>Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Pages>
    )
}