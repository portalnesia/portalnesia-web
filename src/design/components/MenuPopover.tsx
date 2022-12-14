import React from 'react'
import type { PopoverProps } from '@mui/material';
import { styled, SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import Popover from '@mui/material/Popover';

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
}

/**
 * 
 * Custom MenuPopover Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function MenuPopover({ children, paperSx,arrow=true, ...other }: MenuPopoverProps) {
  return (
    <Popover
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