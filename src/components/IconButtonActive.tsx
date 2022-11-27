import IconButton,{IconButtonProps} from "@mui/material/IconButton";
import { alpha } from '@mui/system/colorManipulator';
import { forwardRef } from "react";

export interface IconButtonActiveProps extends IconButtonProps {
    open?: boolean   
}

const IconButtonActive = forwardRef<HTMLButtonElement,IconButtonActiveProps>(({open,children,sx,...props},ref)=>{
    return (
        <IconButton
            ref={ref}
            sx={{
                padding: 0,
                width: 44,
                height: 44,
                ...sx,
                ...(open && {
                    '&:before': {
                    zIndex: 1,
                    content: "''",
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    position: 'absolute',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.22)
                    }
                })
            }}
            {...props}
        >
            {children}
        </IconButton>
    )
})
export default IconButtonActive