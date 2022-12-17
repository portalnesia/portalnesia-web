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
import { portalUrl } from '@utils/main';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '../Avatar';

// ----------------------------------------------------------------------

export const ListItemStyle = styled(ListItemButton)<{target?: string,href?:string}>(
  ({ theme }) => ({
    ...theme.typography.body2,
    height: 65,
    width:'100%',
    position: 'relative',
    textTransform: 'capitalize',
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

// ----------------------------------------------------------------------

export type INavbarChat = {
  primary: React.ReactNode,
  link: string,
  secondary?: React.ReactNode
  avatar?: React.ReactNode
}

export interface NavItemProps {
  item: INavbarChat,
  active(item: INavbarChat): boolean
  linkProps?: Partial<LinkProps>
  rootSx?: SxProps<Theme>
};

export function NavItem({ item, active,linkProps,rootSx }: NavItemProps) {
  const theme = useTheme();
  const isActiveRoot = active(item);
  const { primary, link, secondary,avatar } = item;

  const activeRootStyle = useMemo(()=>({
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:before': { display: 'block' }
  }),[theme]);

  return (
    <Link href={link} passHref legacyBehavior {...linkProps}>
      <ListItemStyle
        component='a'
        disableGutters
        className='no-underline'
        sx={{
          pr:{xs:2.5,md:1,lg:2.5},
          pl:{xs:5,md:3},
          ...(isActiveRoot && activeRootStyle),
          ...rootSx
        }}
      >
        {avatar && (
          <ListItemAvatar>
            <Avatar>
              {avatar}
            </Avatar>
          </ListItemAvatar>
        )}
        <ListItemText primary={primary} secondary={secondary} />
      </ListItemStyle>
    </Link>
  );
}

export interface NavConfigProps extends BoxProps {
  navConfig: INavbarChat[]
  indexPath?: string
  active(item: INavbarChat): boolean
  linkProps?: Partial<LinkProps>
};

export default function NavSection({ navConfig,indexPath,active,linkProps, ...other }: NavConfigProps) {
  const router = useRouter();
  const pathname = router.pathname

  return (
    <Box width='100%' {...other}>
      <List disablePadding>
        {navConfig.map((item) => (
          <NavItem key={item.link} item={item} active={active} linkProps={linkProps} />
        ))}
      </List>
    </Box>
  );
}