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
 * Source Code: [Github](https://github.com/portalnesia/portalnesia-design/blob/main/src/components/Iconify.tsx)
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function Iconify({ icon, sx, ...other }: IconifyProps) {
  return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
}