import React from 'react'
import { Icon } from '@iconify/react';
import type { BoxProps } from '@mui/material';
import {ReactElement} from 'react'
import Box from '@mui/material/Box';
// ----------------------------------------------------------------------


export interface IconifyProps extends BoxProps {
  icon: ReactElement|string
}

/**
 * 
 * Custom Iconify Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function Iconify({ icon, sx,width=24,height=24,...other }: IconifyProps) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} width={width} height={height} {...other} />;
}