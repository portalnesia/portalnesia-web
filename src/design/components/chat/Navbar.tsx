import { alpha } from '@mui/system/colorManipulator';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { NAVBAR_HEIGHT, DRAWER_WIDTH } from '@layout/navbar.config';
import ThemePopover from '@layout/ThemePopover';
import AccountPopover from '@layout/AccountPopover';
import Notification from '@layout/notification/Notification';
import Logo from '@comp/Logo';
import Typography from '@mui/material/Typography';
import Link from '../Link';
import { ReactElement, ReactNode } from 'react';

const RootStyle = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
    backgroundColor: alpha(theme.palette.background.default, 0.72)
}));
  
const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    height: NAVBAR_HEIGHT,
}));

export interface DashboardNavbarProps {
  title?: string|false
  children?: ReactElement
};

export default function NavbarChat({title="Portalnesia",children}: DashboardNavbarProps) {
    return (
      <RootStyle sx={{width:'100vw'}}>
        <ToolbarStyle>
          <Stack height={NAVBAR_HEIGHT} px={2} spacing={2} justifyContent='center' direction='row'>
            <Box>
              <Logo href='/' sx={{mt:1.5}} svg={{size:35}} />
            </Box>
            {typeof title === 'string' && <Link href="/"><Typography variant='h5'>{title}</Typography></Link>}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
  
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
            {children}
            <Notification />
            <ThemePopover />
            <AccountPopover />
          </Stack>
        </ToolbarStyle>
      </RootStyle>
    );
}