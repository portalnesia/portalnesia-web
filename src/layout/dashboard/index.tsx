import { DRAWER_WIDTH, NAVBAR_HEIGHT } from '@layout/navbar.config';
import Alert, { AlertProps } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';
import config from '@src/config';
import React, { useMemo } from 'react';
import DashboardNavbar from './Navbar';
import DashboardSidebar from './Sidebar';

export type DashboardLayoutProps = {
    children: React.ReactNode
    withoutContainer?:boolean
    adminPage?: boolean
}

const RootStyle = styled('div')({
    display: 'flex',
    minHeight: '100%'
  });

export default function DashboardLayout({children,withoutContainer,adminPage}:DashboardLayoutProps) {
    const [open, setOpen] = React.useState(false);
    const [cookieMsg, setCookieMsg] = React.useState<({ severity: AlertProps['severity'], msg: string }) | undefined>(undefined);
    const [showCookieMsg, setShowCookieMsg] = React.useState(false);

    const title = useMemo(()=>{
        return adminPage ? "Admin" : "Dashboard"
    },[adminPage])

    const handleCloseCookieNotification = React.useCallback(() => {
        setShowCookieMsg(false);
    }, [])
    
    return (
        <RootStyle>
            <DashboardNavbar onOpenSidebar={() => setOpen(true)} />
            <DashboardSidebar title={title} adminPage={adminPage} subtitle={config.title} isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
            <Container maxWidth={false} sx={{pt:`${NAVBAR_HEIGHT+24}px`,...(withoutContainer ? {px:'0 !important'} : {px:3,pb:10}),position:'relative'}}>
                <Fade in={showCookieMsg && typeof cookieMsg !== "undefined"} unmountOnExit>
                    <Box mb={2} width="100%">
                        <Alert onClose={handleCloseCookieNotification} variant='filled' severity={cookieMsg?.severity || "error"}>{cookieMsg?.msg || ""}</Alert>
                    </Box>
                </Fade>

                <Box>
                    {children}
                </Box>
            </Container>
        </RootStyle>
    )
}