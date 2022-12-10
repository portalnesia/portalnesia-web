import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    return {
        props:{
            data:{}
        }
    }
})

export default function QuizDashIndex() {

    return (
        <Pages title="Quiz - Dashboard" canonical={`/dashboard/quiz`} noIndex>
            <DashboardLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Quiz</Typography>
                </Box>


            </DashboardLayout>
        </Pages>
    )
}