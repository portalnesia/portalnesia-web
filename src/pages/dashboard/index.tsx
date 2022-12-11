import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import Router from "next/router";
import { BoxPagination } from "@design/components/Pagination";

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    return {
        props:{
            data:{}
        }
    }
})

export default function DashIndex() {
    const [todo] = React.useState(false);

    React.useEffect(()=>{
        Router.replace("/dashboard/chord");
    },[])
    return (
        <Pages title="Dashboard" canonical={`/dashboard`} noIndex>
            <DashboardLayout>
                {todo && (
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>Dashboard</Typography>
                    </Box>
                )}
                <BoxPagination loading />
            </DashboardLayout>
        </Pages>
    )
}