import React from 'react'
import type {SxProps,Theme} from '@mui/material'
import FabOri from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import {styled} from '@mui/material/styles'
import Iconify from './Iconify'

const Fab = styled(FabOri)(({theme})=>({
    position: 'fixed',
    right:theme.spacing(3),
    bottom:theme.spacing(3),
}))

export interface BackToTopProps {
  sx?: SxProps<Theme>
  enabled?: boolean,
  color?: "error" | "inherit" | "default" | "primary" | "secondary" | "success" | "info" | "warning"
}

/**
 * 
 * Custom Back To Top Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function BackToTop({sx,enabled=true,color='secondary'}: BackToTopProps) {
  const [open,setOpen] = React.useState(false);

  const onToTop = React.useCallback(()=>{
    window.scrollTo({top:0,behavior:'smooth'})
  },[])

  React.useEffect(()=>{
    function onScroll() {
      if(enabled) {
        const scroll = document?.documentElement?.scrollTop || document.body.scrollTop;
        if(scroll > 300) {
          setOpen(true);
          return;
        }
      }
      setOpen(false);
    }

    window.addEventListener('scroll',onScroll);

    return ()=>window.removeEventListener('scroll',onScroll)
  },[enabled])

  return (
    <Zoom
      in={open}
    >
      <Fab size='small' color={color} sx={sx} onClick={onToTop}>
        <Iconify icon='akar-icons:chevron-up' sx={{width:24,height:24}} />
      </Fab>
    </Zoom>
  )
}