import React from 'react'
import type {DialogContentProps as Props,Theme} from '@mui/material'
import Dialogg from '@mui/material/DialogContent'
import useMediaQuery from '@mui/material/useMediaQuery'

export interface DialogActionsProps extends Props {
  fixed?: boolean
}

/**
 * 
 * Custom Dialog Content Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function DialogContent({fixed,sx,children,...rest}: DialogActionsProps) {
  const sm = useMediaQuery((t: Theme)=>t.breakpoints.down('sm'));

  const isFixed = React.useMemo(()=>{
    if(typeof fixed === "boolean") {
      return fixed;
    }
    return sm;
  },[sm,fixed])

  if(!isFixed) return <Dialogg {...rest}>{children}</Dialogg>
  return (
    <Dialogg sx={{...sx,...(isFixed ? {mb:6} : {})}}>
        {children}
    </Dialogg>
  );
}