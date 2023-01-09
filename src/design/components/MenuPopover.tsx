import React, { useCallback } from 'react'
import { PopoverProps } from '@mui/material';
import { styled, SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import Popover from '@mui/material/Popover';
import useResponsive from '@design/hooks/useResponsive';
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Box from '@mui/material/Box';
import { isIOS } from 'react-device-detect';

// ----------------------------------------------------------------------

const ArrowStyle = styled('span')(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    top: -7,
    zIndex: 1,
    width: 12,
    right: 20,
    height: 12,
    content: "''",
    position: 'absolute',
    borderRadius: '0 0 4px 0',
    transform: 'rotate(-135deg)',
    background: theme.palette.background.paper,
    borderRight: `solid 1px ${alpha(theme.palette.grey[500], 0.12)}`,
    borderBottom: `solid 1px ${alpha(theme.palette.grey[500], 0.12)}`
  }
}));

// ----------------------------------------------------------------------

export interface MenuPopoverProps extends PopoverProps {
  paperSx?: SxProps<Theme>
  arrow?:boolean
  onClose(): void
  disableDrawer?: boolean
}

/**
 * 
 * Custom MenuPopover Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function MenuPopover({ children, paperSx,sx,arrow=true,open,onClose,disableDrawer, ...other }: MenuPopoverProps) {
  const is400 = useResponsive('down','sm');

  if(is400 && !disableDrawer) {
    return (
      <SwipeableDrawer
        open={open}
        onClose={onClose}
        onOpen={()=>{}}
        disableSwipeToOpen
        anchor='bottom'
        disableDiscovery
        disableBackdropTransition={!isIOS}
        sx={{
          zIndex:1301,
          ...sx
        }}
        PaperProps={{
          sx:{
            borderTopLeftRadius:15,borderTopRightRadius:15,
            ...paperSx,
            width:'100%',
            maxWidth:'unset'
          }
        }}
      >
        <Box pb={1}>
          <Box width="100%" pt={1.5} pb={0.5} display="flex" alignItems="center" justifyContent="center">
            <Box width={100} height={10} borderRadius={2} bgcolor="action.focus" />
          </Box>
          <Box overflow="auto">
            {children}
          </Box>
        </Box>
      </SwipeableDrawer>
    )
  }

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          mt: 1.5,
          ml: 0.5,
          overflow: 'inherit',
          boxShadow: (theme) => theme.customShadows.z20,
          border: (theme) => `solid 1px ${theme.palette.grey[500_8]}`,
          width: 200,
          ...paperSx
        }
      }}
      {...other}
    >
      {arrow && <ArrowStyle className="arrow" />}

      {children}
    </Popover>
  );
}