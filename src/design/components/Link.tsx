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

/**
import {styled} from '@mui/material/styles'
import NextLink from 'next/link'
import { ComponentProps, useMemo } from 'react';
import { A } from './Dom';

const LinkStyled = styled(NextLink)<{disabled?:boolean}>(({disabled,theme})=>({
    ...(disabled ? {
        pointerEvents:"none",
        color: theme.palette.text.disabled,
        '& p, & span, & svg':{
            color: theme.palette.text.disabled,
        }
    } : {})
}))

type LinkProps = ComponentProps<typeof LinkStyled> & ({
    forceBlank?: boolean
})

export default function Link({href:hrefProps,children,forceBlank,...props}: LinkProps): JSX.Element {
    const {href,internal} = useMemo(()=>{
        if(typeof hrefProps !== 'string') return {href:hrefProps,internal:true};
        
        if(!/^\//.test(hrefProps)) {
            if(!/^https?\:\/\/portalnesia\.com/.test(hrefProps)) return {href:hrefProps,internal:false}
            else return {href:hrefProps.replace(/^https?\:\/\/portalnesia\.com/,''),internal:true}
        }
        return {href:hrefProps,internal:true}
    },[hrefProps])
    
    if(!internal && typeof href === "string") return <A href={href} rel="nofollow noopener noreferrer" {...props}>{children}</A>
    else {
        return (
            <LinkStyled href={href} {...props}>
                {children}
            </LinkStyled>
        )
    }
}
 */