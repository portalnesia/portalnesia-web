import React from 'react'
import type {DialogActionsProps as Props,Theme} from '@mui/material'
import Dialogg from '@mui/material/DialogActions'
import useMediaQuery from '@mui/material/useMediaQuery'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

export interface DialogActionsProps extends Props {
  fixed?: boolean
}

/**
 * 
 * Custom Dialog Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function DialogActions({fixed,children,...rest}: DialogActionsProps) {
  const sm = useMediaQuery((t: Theme)=>t.breakpoints.down('sm'));

  const isFixed = React.useMemo(()=>{
    if(typeof fixed === "boolean") {
      return fixed;
    }
    return sm;
  },[sm,fixed])

  if(!isFixed) return <Dialogg {...rest}>{children}</Dialogg>
  return (
    <Box position={'fixed'} bottom={0} left={0} width='100%' padding={2} sx={{backgroundColor:"background.paper",...rest?.sx}} >
      <Stack direction={'row'} spacing={2} justifyContent='flex-end'>
        {children}
      </Stack>
    </Box>
  );
}