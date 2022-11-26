import React from 'react'
import type {IconButtonProps} from '@mui/material'
import {styled} from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

export interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

function InternalExpandMore(props: ExpandMoreProps) {
    const {expand,...rest}=props
    return <IconButton {...rest} />;
}

/**
 * 
 * Custom ExpandMore Components
 * 
 * Source Code: [Github](https://github.com/portalnesia/portalnesia-design/blob/main/src/components/ExpandMore.tsx)
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
const ExpandMore = styled(InternalExpandMore,{shouldForwardProp:prop=>prop!=="expand"})(({theme,expand})=>({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft:'auto',
  transition: theme.transitions.create('transform',{
    duration: theme.transitions.duration.shorter
  })
}))

export default ExpandMore;