import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import { useSWRPagination } from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import { PaginationResponse } from "@design/hooks/api";
import SWRPages from "@comp/SWRPages";
import dynamic from "next/dynamic";
import { UserPagination } from "@model/user";
import PaperBlock from "@design/components/PaperBlock";

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
    const {data,error,size,setSize,isLoadingMore} = useSWRPagination<PaginationResponse<AdminLogData>>(`/v2/admin/logs`);

    const logs = React.useMemo(()=>{
        return data?.data?.map(dt=>{
            const data = Object.entries(dt?.data).filter(d=>['boolean','number','object','string'].includes(typeof d[1])).map(([key,d])=>({
                [key]: typeof d === 'object' && Array.isArray(d) ? d.join(",") : String(d)
            }))
            return {
                ...dt,
                data
            }
        })
    },[data])

    return (
        <Pages title="Admin Logs" canonical="/admin/logs">
            <DashboardLayout adminPage>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Logs</Typography>
                    </Stack>
                </Box>

                <SWRPages loading={!logs&&!error} error={error}>
                    {logs && logs.length > 0 ? (
                        <Stack alignItems='flex-start' spacing={4} width='100%'>
                            {logs.map((d,i)=>(
                                <PaperBlock key={`${d.title}-${i}`} title={`${d.user.username}: ${d.title}`} collapse={false} sx={{width:'100%'}}>
                                    
                                </PaperBlock>
                            ))}
                        </Stack>
                    ) : (
                        <BoxPagination>
                            <Typography>No data</Typography>
                        </BoxPagination>
                    )}
                </SWRPages>
            </DashboardLayout>
        </Pages>
    )
}