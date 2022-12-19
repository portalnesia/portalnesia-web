import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import type {CircularProgressProps} from '@mui/material'

/**
 * 
 * Custom Circular Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export function Circular(props: CircularProgressProps) {

  return (
    <Box display='flex' flexGrow='1' alignItems='center' justifyContent='center'>
      <CircularProgress size={50} {...props} />
    </Box>
  )
}