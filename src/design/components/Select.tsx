import type {TextFieldProps} from '@mui/material'
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {isMobile} from 'react-device-detect'

export interface SelectItemProps {
    value: string|number;
    children: string|number;
    disabled?: boolean
    selected?: boolean
}

export default function Select(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      select
      {...(isMobile ? {
        SelectProps:{...props?.SelectProps,native:true}
      } : {})}
    />
  )
}

export function SelectItem(props: SelectItemProps) {
  if(isMobile) {
    return <option {...props} />
  } else {
    return <MenuItem {...props} />
  }
}