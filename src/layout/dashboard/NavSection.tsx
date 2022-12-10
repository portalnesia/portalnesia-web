import { useState,useCallback,useMemo } from 'react';
import {useRouter} from 'next/router'
import Link, { LinkProps } from 'next/link'
import { useTheme, styled, SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import Iconify from '@design/components/Iconify';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import Box, { BoxProps } from '@mui/material/Box';
import { INavbar } from '@layout/navbar.config';
import { portalUrl } from '@utils/main';

// ----------------------------------------------------------------------

export const ListItemStyle = styled(ListItemButton)<{target?: string,href?:string}>(
  ({ theme }) => ({
    ...theme.typography.body2,
    height: 48,
    position: 'relative',
    textTransform: 'capitalize',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(2.5),
    color: theme.palette.text.secondary,
    '&:before': {
      top: 0,
      right: 0,
      width: 3,
      bottom: 0,
      content: "''",
      display: 'none',
      position: 'absolute',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      backgroundColor: theme.palette.primary.main
    }
  })
);

export const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

// ----------------------------------------------------------------------

export interface NavItemProps {
  item: INavbar,
  active(path?: string): boolean
  linkProps?: Partial<LinkProps>
  rootSx?: SxProps<Theme>
};

export function NavItem({ item, active,linkProps,rootSx }: NavItemProps) {
  const theme = useTheme();
  const isActiveRoot = active(item.link);
  const { name, link, icon, child,desc } = item;
  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  },[setOpen]);

  const activeRootStyle = useMemo(()=>({
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:before': { display: 'block' }
  }),[theme]);

  const activeSubStyle = useMemo(()=>({
    color: 'text.primary',
    fontWeight: 'fontWeightMedium'
  }),[]);

  if (child) {
    return (
      <>
        <ListItemStyle
          disableGutters
          onClick={handleOpen}
          sx={{
            ...(isActiveRoot && activeRootStyle),
            ...rootSx
          }}
        >
          {icon && <ListItemIconStyle>{icon}</ListItemIconStyle>}
          <ListItemText disableTypography primary={name} />
          {desc && desc}
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            sx={{ width: 16, height: 16, ml: 1 }}
          />
        </ListItemStyle>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {child.map((item) => {
              const { name, link } = item;
              const isActiveSub = active(link);

              return (
                <Link key={item.link} href={link} passHref legacyBehavior {...linkProps}>
                  <ListItemStyle
                    component='a'
                    disableGutters
                    key={name}
                    sx={{
                      ...(isActiveSub && activeSubStyle)
                    }}
                  >
                    <ListItemIconStyle>
                      <Box
                        component="span"
                        sx={{
                          width: 4,
                          height: 4,
                          display: 'flex',
                          borderRadius: '50%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'text.disabled',
                          transition: (theme) => theme.transitions.create('transform'),
                          ...(isActiveSub && {
                            transform: 'scale(2)',
                            bgcolor: 'primary.main'
                          })
                        }}
                      />
                    </ListItemIconStyle>
                    <ListItemText disableTypography primary={name} />
                  </ListItemStyle>
                </Link>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <Link href={link} passHref legacyBehavior {...linkProps}>
      <ListItemStyle
        component='a'
        disableGutters
        sx={{
          ...(isActiveRoot && activeRootStyle),
          ...rootSx
        }}
      >
        {icon && <ListItemIconStyle><Iconify icon={icon} /></ListItemIconStyle>}
        <ListItemText disableTypography primary={name} />
        {desc && desc}
      </ListItemStyle>
    </Link>
  );
}

export interface NavConfigProps extends BoxProps {
  navConfig: INavbar[]
  indexPath?: string
};

export default function NavSection({ navConfig,indexPath, ...other }: NavConfigProps) {
  const router = useRouter();
  const pathname = router.pathname

  const match = useCallback((path?: string) => {
    const pathUrl = new URL(pathname,portalUrl());
    const linkUrl = new URL((path||"/"),portalUrl());
    const a = (linkUrl.pathname === (indexPath||'/') ? linkUrl.pathname === pathUrl.pathname : new RegExp((linkUrl.pathname||'/'),'i').test(pathUrl.pathname||'/'))
    return a;
  },[pathname,indexPath]);

  return (
    <Box {...other}>
      <List disablePadding>
        {navConfig.map((item) => (
          <NavItem key={item.name} item={item} active={match} />
        ))}
      </List>
    </Box>
  );
}