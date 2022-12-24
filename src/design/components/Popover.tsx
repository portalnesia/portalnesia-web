import React from 'react'
import MenuPopover,{MenuPopoverProps} from './MenuPopover'
import Iconify from './Iconify'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export interface PopoverProps extends Partial<MenuPopoverProps> {
    /**
     * Icon of button
     * 
     * @example ic:outline-help-outline
     */
    icon: string
}

/**
 * 
 * Popover Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Popover=(props: PopoverProps)=>{
    const {icon,children,onClose,open:op,anchorEl:_,paperSx,...rest} = props
    const anchorRef = React.useRef(null)
    const [open,setOpen] = React.useState(op||false);

    const handlePopOver: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(()=>{
        setOpen(true)
    },[])

    const closePopOver=React.useCallback(()=>{
        setOpen(false)
        if(onClose) onClose();
    },[onClose])

    return (
        <React.Fragment>
            <IconButton ref={anchorRef} onClick={handlePopOver}>
                <Iconify icon={icon} />
            </IconButton>
            <MenuPopover
                open={open}
                onClose={closePopOver}
                anchorEl={anchorRef.current}
                paperSx={{
                    maxWidth:{xs:200,md:400},
                    ...paperSx
                }}
                {...rest}
            >
                <Box padding={1.5}>
                    {typeof children === 'string' ? (
                        <Typography>{children}</Typography>
                    ) : children}
                </Box>
            </MenuPopover>
        </React.Fragment>
    );
}

export default Popover