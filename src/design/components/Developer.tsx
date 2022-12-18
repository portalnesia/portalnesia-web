import { DRAWER_WIDTH, INavbar } from '@layout/navbar.config';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import React from 'react';
import Scrollbar from './Scrollbar';
import Stack from '@mui/material/Stack';
import Logo from '@comp/Logo';
import Portal from '@mui/material/Portal';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import { Code } from '@mui/icons-material';
import NavSection from '@layout/dashboard/NavSection';
import { useDeveloperMenu } from '@hooks/developer';
import Router from 'next/router';
import { portalUrl } from '@utils/main';

export interface DeveloperProps {
    children: React.ReactNode
}

export default function Developer({children}: DeveloperProps) {
    const [open,setOpen] = React.useState(false);
    const menu = useDeveloperMenu();

    const isActive = React.useCallback((path: INavbar) => {
        const pathUrl = new URL(Router.asPath,portalUrl());
        
        if(path.child) {
            return path.child.find(child=>{
                const childPath =new URL((child.link),portalUrl());
                return pathUrl.pathname === childPath.pathname
            }) !== undefined;
        }
        
        const linkUrl = new URL((path.link),portalUrl());
        return linkUrl.pathname === pathUrl.pathname
    },[]);

    return (
        <Box>
            <Drawer
                open={open}
                onClose={()=>setOpen(false)}
                PaperProps={{
                    sx: { width: DRAWER_WIDTH,pb:5 }
                }}
            >
                <Scrollbar
                    sx={{
                        height: 1,
                        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
                    }}
                >
                    <Stack px={2.5} py={3} direction='row'>
                        <Logo href='/' svg={{size:35}} />
                    </Stack>

                    <NavSection navConfig={menu} onClick={()=>setOpen(false)} isActive={isActive} />
                </Scrollbar>
            </Drawer>
            {children}
            <Portal>
                <Tooltip title="Developer Menu">
                    <Fab size='medium' aria-label="Chord Tools" sx={{position:'fixed',right:16,bottom:16+48+8}} onClick={()=>setOpen(true)}>
                        <Code />
                    </Fab>
                </Tooltip>
            </Portal>
        </Box>
    )
}