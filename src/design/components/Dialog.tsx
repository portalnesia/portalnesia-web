import React, { useMemo } from 'react'
import type {DialogProps as Props } from '@mui/material'
import Dialogg from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import {useTheme} from '@mui/material/styles'
import { Close } from '@mui/icons-material'
import { Div } from './Dom'
import type { DialogContentProps } from './DialogContent'
import type { DialogActionsProps } from './DialogActions'
import dynamic from 'next/dynamic'
import useResponsive from '@design/hooks/useResponsive'

const DialogActions = dynamic(()=>import('./DialogActions'))
const DialogContent = dynamic(()=>import('./DialogContent'))

export interface DialogProps extends Props {
  handleClose?(): void
  loading?: boolean
  title?: string
  titleWithClose?:boolean
  /**
   * DialogContent props without children
   */
  content?: Partial<DialogContentProps>
  /**
   * DialogActions children
   */
  actions?: DialogActionsProps['children']
  sticky?:boolean
}

/**
 * 
 * Custom Dialog Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function Dialog({handleClose,loading,onClose:_,fullScreen,maxWidth="sm",children,title,titleWithClose=true,content,actions,sticky=true,...other}: DialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark"
    const sm = useResponsive('down','sm')

    const onClose = React.useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
        if(reason === 'escapeKeyDown' && handleClose && !loading) handleClose();
    },[handleClose,loading])

    const isFullscreen = useMemo(()=>{
      return typeof fullScreen === "boolean" ? fullScreen : sm
    },[fullScreen,sm])

    return (
      <Dialogg {...(isDark  ? {PaperProps:{elevation:0}} : {})} fullScreen={isFullscreen} onClose={onClose} fullWidth maxWidth={maxWidth} scroll='body' {...other}>
        {title && (
          <Div {...sticky ? {sx:{position:'sticky',top:0,width:'100%',backgroundColor:'background.paper',zIndex:1}} : {}}>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant='h5'>{title}</Typography>
                {titleWithClose && (
                  <Tooltip title={`Close (Esc)`}>
                    <IconButton disabled={loading} onClick={()=>onClose({},'escapeKeyDown')}>
                      <Close />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </DialogTitle>
          </Div>
        )}
        <DialogContent fixed={isFullscreen} sx={{mb:isFullscreen && actions ? 6 : 0}} {...content}>
          {children}
        </DialogContent>
        {actions && (
          <DialogActions fixed={isFullscreen}>
            {actions}
          </DialogActions>
        )}
      </Dialogg>
    )
}