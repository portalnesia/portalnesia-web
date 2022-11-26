import {useCallback} from 'react'
import type {IconButtonProps} from '@mui/material'
import {useSnackbar} from 'notistack'
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic'
import IconButton from '@mui/material/IconButton';

const Close = dynamic(()=>import('@mui/icons-material/Close'),{ssr:false})

export type OptionSnack={
    content?:(key: string|number,message: string|React.ReactNode)=>React.ReactNode,
    action?:(key: string|number)=>React.ReactNode,
    autoHideDuration?: number|null
}
export type VariantOption= 'default' | 'error' | 'success' | 'warning' | 'info' | boolean

const CustomIconBtn = styled(IconButton,{shouldForwardProp:prop=>prop!=="variant"})<IconButtonProps & ({variant:VariantOption})>(({variant})=>({
    ...(typeof variant === 'boolean' ? {
        '& svg':{
            color:'#FFF'
        }
    } : {})
}))

export default function useNotification() {
    const {enqueueSnackbar,closeSnackbar}=useSnackbar();

    const setNotif=useCallback((msg: string|React.ReactNode,variant: VariantOption,option?: OptionSnack)=>{
        option=option||{};
        if(typeof option?.content === 'undefined') {
            option={
                ...option,
                action:(key)=>(
                    <CustomIconBtn
                        variant={variant}
                        onClick={()=>closeSnackbar(key)}
                        size="large">
                        <Close />
                    </CustomIconBtn>
                )
            }
        }
        const vari=typeof variant === 'string' ? variant : (variant===true ? 'error' : 'success');
        enqueueSnackbar(msg,{variant:vari,...option})
    },[enqueueSnackbar,closeSnackbar])
  
    return setNotif;
}