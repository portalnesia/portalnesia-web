import HotKeys from "@comp/HotKeys";
import { useHotKeys } from "@hooks/hotkeys";
import { NAVBAR_HEIGHT } from "@layout/navbar.config";
import type { AlertProps } from "@mui/material/Alert";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container, { ContainerProps } from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import { getCookieMsg, removeCookieMsg } from "@utils/cookie";
import React from "react";
import Footer from "./Footer";
import DefaultNavbar, { NavbarProps } from "./Navbar";

export type DefaultLayoutProps = {
    children: React.ReactNode
    maxWidth?: ContainerProps['maxWidth']
    navbar?: NavbarProps
    withoutContainer?:boolean
}

export default function DefaultLayout({children,maxWidth,navbar,withoutContainer}: DefaultLayoutProps) {
    const [cookieMsg, setCookieMsg] = React.useState<({ severity: AlertProps['severity'], msg: string }) | undefined>(undefined);
    const [showCookieMsg, setShowCookieMsg] = React.useState(false);
    const {atasKeyMap,bawahKeyMap,keysDialog,setKeysDialog} = useHotKeys(true)

    const handleCloseCookieNotification = React.useCallback(() => {
        setShowCookieMsg(false);
    }, [])

    React.useEffect(() => {
        const cookie = getCookieMsg();
        if (cookie) {
            setCookieMsg(cookie);
            setShowCookieMsg(true)
        }
        removeCookieMsg();
    }, [])

    return (
        <>
            <DefaultNavbar {...navbar} />
            <Container maxWidth={maxWidth} sx={{...(withoutContainer ? {p:'0 !important'} : {py:{xs:3,md:4,lg:5}}),position:'relative',minHeight:`calc(99vh - ${NAVBAR_HEIGHT}px)`}}>
                <Fade in={showCookieMsg && typeof cookieMsg !== "undefined"} unmountOnExit>
                    <Box mb={2} width="100%">
                        <Alert onClose={handleCloseCookieNotification} variant='filled' severity={cookieMsg?.severity || "error"}>{cookieMsg?.msg || ""}</Alert>
                    </Box>
                </Fade>
                <Box width="100%">
                    {children}
                </Box>
            </Container>
            <Footer />
            <HotKeys atasKeymap={atasKeyMap} bawahKeymap={bawahKeyMap} open={keysDialog==='keyboard'} onClose={setKeysDialog(undefined)} />
        </>
    )
}