import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import { useSWRPagination } from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import SWRPages from "@comp/SWRPages";
import dynamic from "next/dynamic";
import { UserPagination } from "@model/user";
import PaperBlock from "@design/components/PaperBlock";
import Grid from "@mui/material/Grid";
import { clean } from "@portalnesia/utils";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import ConfirmationDialog from "@design/components/ConfirmationDialog";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session || !session.user.isAdmin(undefined,true)) return redirect(); 
    return {
        props:{
            data:{}
        }
    }
})

type AdminLogData = {
    user: Pick<UserPagination,'id'|'name'|'username'>
    title: string
    apiUrl: string
    method: string
    data: Record<string,any>
}

export default function LogAdminPage() {
    const {data,error,size,setSize,isLoadingMore,mutate} = useSWRPagination<PaginationResponse<AdminLogData>>(`/v2/admin/logs`);
    const {del} = useAPI();
    const setNotif = useNotification();
    const [loading,setLoading] = React.useState(false)
    const confirmRef = React.useRef<ConfirmationDialog>(null)

    const logs = React.useMemo(()=>{
        return data?.data?.map(dt=>{
            const data = Object.entries(dt?.data).filter(d=>['boolean','number','object','string'].includes(typeof d[1])).map(([key,d])=>({
                key:key,
                value: typeof d === 'object' && Array.isArray(d) ? d.join(",") : clean(String(d)).replace(/\&\S+\;/gim," ")
            }))
            return {
                ...dt,
                data
            }
        })
    },[data])

    const handleDelete = React.useCallback(async()=>{
        try {
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setLoading(true);
            await del(`/v2/admin/logs`)
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(false);
        }
    },[setNotif,del,mutate])

    return (
        <Pages title="Admin Logs" canonical="/admin/logs" noIndex>
            <DashboardLayout adminPage>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Logs</Typography>
                        <Button color="error" onClick={handleDelete}>Delete</Button>
                    </Stack>
                </Box>

                <SWRPages loading={!logs&&!error} error={error}>
                    {logs && logs.length > 0 ? (
                        <Stack alignItems='flex-start' spacing={4} width='100%'>
                            {logs.map((d,i)=>(
                                <PaperBlock key={`${d.title}-${i}`} title={`${d.user.username}: ${d.title}`} collapse={false} sx={{width:'100%'}}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant='caption'>API</Typography>
                                            <Typography>{d.apiUrl}</Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant='caption'>Method</Typography>
                                            <Typography>{d.method}</Typography>
                                        </Grid>
                                        <Grid item xs={12} mt={2}>
                                            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                                <Typography variant='h6'>User</Typography>
                                            </Box>
                                            <Grid container spacing={2}>
                                                {Object.entries(d.user).map(([key,value])=>(
                                                    <Grid key={key} item xs={12} lg={4}>
                                                        <Typography variant='caption'>{key}</Typography>
                                                        <Typography>{value}</Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12} mt={2}>
                                            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                                <Typography variant='h6'>Data</Typography>
                                            </Box>
                                            <Grid container spacing={2}>
                                                {d.data.map((dd)=>(
                                                    <Grid key={dd.key} item xs={12} lg={6}>
                                                        <Typography variant='caption'>{dd.key}</Typography>
                                                        <Typography>{dd.value}</Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </PaperBlock>
                            ))}
                            <Box width='100%'>
                                {data?.can_load && (
                                    <Box my={2} px={2} width='100%'>
                                        {isLoadingMore ? <BoxPagination loading maxHeight={55} /> : (
                                            <Button size='large' outlined color='inherit' sx={{width:'100%'}} onClick={()=>setSize(size+1)}>Load more</Button>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    ) : (
                        <BoxPagination>
                            <Typography>No data</Typography>
                        </BoxPagination>
                    )}
                </SWRPages>
            </DashboardLayout>
            <ConfirmationDialog ref={confirmRef} body={
                <Typography>Delete all logs?</Typography>
            } />
            <Backdrop open={loading} />
        </Pages>
    )
}