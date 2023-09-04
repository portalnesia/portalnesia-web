import SimpleBarReact from 'simplebar-react';
// material
import { styled,SxProps,Theme } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import {isMobile as nativeIsMobile} from 'react-device-detect'
import {ReactNode, useEffect, useRef, useState} from 'react'
// ----------------------------------------------------------------------
import 'simplebar-react/dist/simplebar.min.css'

const RootStyle = styled('div')({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden'
});

const SimpleBarStyle = styled(SimpleBarReact)(({ theme }) => ({
  maxHeight: '100%',
  maxWidth: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: alpha(theme.palette.grey[600], 0.48)
    },
    '&.simplebar-visible:before': {
      opacity: 1
    }
  },
  '& .simplebar-track.simplebar-vertical': {
    width: 10
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 6
  },
  '& .simplebar-mask': {
    zIndex: 'inherit'
  }
}));

// ----------------------------------------------------------------------

export interface ScrollbarProps extends SimpleBarReact.Props {
  children: ReactNode,
  sx?: SxProps<Theme>
  onScroll?(e: Event): void
}

export default function Scrollbar({ children, sx,onScroll, ...other }: ScrollbarProps) {
  const [isMobile,setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(()=>{
    const ref = scrollRef.current;
    if(onScroll) {
      ref?.addEventListener('scroll',onScroll)
    }

    return ()=>{
      if(onScroll) {
        ref?.removeEventListener('scroll',onScroll)
      }
    }
  },[onScroll])

  useEffect(()=>{
    setIsMobile(nativeIsMobile);
  },[])

  if (isMobile) {
    return (
      <Box ref={scrollRef} sx={{ overflowX: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <RootStyle>
      <SimpleBarStyle id='scrollbar' timeout={500} clickOnTrack={false} sx={sx} {...other} scrollableNodeProps={{ref:scrollRef}}>
        {children}
      </SimpleBarStyle>
    </RootStyle>
  );
}