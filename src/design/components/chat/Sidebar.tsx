import { styled } from '@mui/material/styles';
import { forwardRef, ReactNode } from 'react';
import Link from '@design/components/Link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import config from '@src/config';
import { version } from '@src/version';
import { DRAWER_WIDTH, NAVBAR_HEIGHT } from '@layout/navbar.config';
import Scrollbar from '@design/components/Scrollbar';
import Logo from '@comp/Logo';
import NavSection, { INavbarChat } from './NavSection';
import { FooterChild, FooterMenu, FooterRoot, MenuItem } from '@layout/default/Footer';
import { generalFooter } from '@layout/footer.config';
import Stack from '@mui/material/Stack';
import { LinkProps } from 'next/link';
import Hidden from '@mui/material/Hidden';
import Typography from '@mui/material/Typography';

const RootStyle = styled('div')(({ theme }) => ({
  flexShrink: 0
}));
  
const AccountStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    borderRadius: Number(theme.shape.borderRadius) * 1.5,
    backgroundColor: theme.palette.grey[500_12]
}));

export interface DashboardSidebarProps {
  navbar: INavbarChat[]
  onScroll?(e: Event): void
  active(item: INavbarChat): boolean
  linkProps?: Partial<LinkProps>
  children?: ReactNode
  title?: string|false
};

const SidebarChat = forwardRef<HTMLDivElement,DashboardSidebarProps>(({ navbar,onScroll,active,linkProps,children,title="Portalnesia" },ref)=>{

    return (
      <RootStyle ref={ref} sx={{width: {xs:'100%',md:200,lg:DRAWER_WIDTH}}}>
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: {xs:'100%',md:200,lg:DRAWER_WIDTH},
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
              height:{md:'100%',xs:`calc(100% - ${NAVBAR_HEIGHT+24}px)`},
              top:{xs:NAVBAR_HEIGHT+24,md:0},
              zIndex:1101
            },
            square:true
          }}
        >
          <Scrollbar
            sx={{
              height: 1,
              '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
            }}
            onScroll={onScroll}
          >
          <Stack alignItems='flex-start' height='100%' width='100%'>
            <Hidden mdDown>
              <Stack height={NAVBAR_HEIGHT} px={2} spacing={2} justifyContent='center' direction='row'>
                <Box>
                  <Logo href='/' svg={{size:35}} />
                </Box>
                {typeof title === 'string' && <Link href="/"><Typography variant='h5' sx={{pb:1.5}}>{title}</Typography></Link>}
              </Stack>
            </Hidden>
        
            <NavSection indexPath='/support' navConfig={navbar} active={active} linkProps={linkProps} />
            
            {children}

            <Box sx={{ flexGrow: 1 }} />
        
            <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
                <FooterRoot>
                    <FooterMenu>
                        {generalFooter.map((f)=>(
                            <MenuItem home={false} key={f.name} data={f} />
                        ))}
                    </FooterMenu>
                </FooterRoot>
                <FooterRoot>
                    <FooterMenu>
                        <FooterChild>
                            <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
                                <Link href='/'  property="dct:title" rel="cc:attributionURL">{config.title}</Link> © {(new Date().getFullYear())}
                            </span>
                        </FooterChild>
                        <FooterChild><span>{`v${version}`}</span></FooterChild>
                    </FooterMenu>
                </FooterRoot>
              </Box>
          </Stack>
          </Scrollbar>
        </Drawer>
      </RootStyle>
    );
})
export default SidebarChat;