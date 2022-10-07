import React from 'react'
import {IconButton,IconButtonProps} from '@mui/material'
import {useSnackbar} from 'notistack'
//import {Close} from '@mui/icons-material'
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic'

const Close = dynamic(()=>import('@mui/icons-material/Close'),{ssr:false})

export type OptionSnack={
    content?:(key: string|number,message: string|React.ReactNode)=>React.ReactNode,
    action?:(key: string|number)=>React.ReactNode,
    autoHideDuration?: number|null
}
export type VariantOption= 'default' | 'error' | 'success' | 'warning' | 'info' | boolean

const CustomIconBtn = styled(IconButton,{shouldForwardProp:prop=>prop!=="variant"})<IconButtonProps & ({variant:VariantOption})>(({variant,theme})=>({
    ...(typeof variant === 'boolean' ? {
        '& svg':{
            color:'#FFF'
        }
    } : {
        '& svg':{
            color:theme.custom.dasar
        }
    })
}))



export const useNotif=()=>{
    const {enqueueSnackbar,closeSnackbar}=useSnackbar();
    const setNotif=React.useCallback((msg: string|React.ReactNode,variant: VariantOption,option?: OptionSnack)=>{
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

    return {setNotif:setNotif}
}

export default useNotif;