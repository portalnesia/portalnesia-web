import {styled} from '@mui/material/styles'
import NextLink from 'next/link'

const Link = styled(NextLink)<{disabled?:boolean}>(({disabled,theme})=>({
    ...(disabled ? {
        pointerEvents:"none",
        color: theme.palette.text.disabled,
        '& p, & span, & svg':{
            color: theme.palette.text.disabled,
        }
    } : {})
}))

export default Link;