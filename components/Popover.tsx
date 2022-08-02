import React from 'react'
import {Popover as PopoverMui,IconButton,Typography as Typo,PopoverProps as PopoverMuiProps} from '@mui/material'
import {styled} from '@mui/material/styles'

const Typography = styled(Typo)(({theme})=>({
    padding:theme.spacing(2),
    maxWidth:250,
    '& a':{
        color:theme.custom.link,
        cursor:'pointer'
    }
}))

export interface PopoverProps extends PopoverMuiProps {
    /**
     * Icon of button
     * 
     * @example <Help />
     */
    icon: React.ReactNode
}

/**
 * 
 * Popover Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const PopoverComponent=(props: PopoverProps)=>{
    const {icon,children,onClose,open,anchorPosition:_,anchorReference:__,...rest} = props
    const [anchorEl,setAnchorEl]=React.useState<(EventTarget & HTMLButtonElement)|null>(null)

    const handlePopOver: React.MouseEventHandler<HTMLButtonElement> = React.useCallback((event)=>{
        setAnchorEl(event.currentTarget);
    },[])

    const closePopOver=React.useCallback((event: {}, reason: "backdropClick" | "escapeKeyDown")=>{
        setAnchorEl(null)
        if(onClose) onClose(event,reason);
    },[onClose])

    return (
        <React.Fragment>
            <IconButton onClick={handlePopOver} size="large">
                {icon}
            </IconButton>
            <PopoverMui
                open={anchorEl !== null}
                onClose={closePopOver}
                anchorEl={
                    anchorEl !== null ? anchorEl : undefined
                }
                {...rest}
            >
                {typeof children === 'string' ? (
                    <Typography>{children}</Typography>
                ) : children}
            </PopoverMui>
        </React.Fragment>
    );
}

const Popover = React.memo(PopoverComponent);
export default Popover