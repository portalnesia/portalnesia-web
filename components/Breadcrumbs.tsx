
import {memo} from 'react'
import {Breadcrumbs as BC,Link as MuiLink,Typography,BreadcrumbsProps as BCProps} from '@mui/material'
import {styled} from '@mui/material/styles'
import Link from 'next/link'


type BroadcrumbsRoutes = {
    label: string,
    href?: string,
    as?: string
}

export interface BroadcrumbsProps  {
    routes?: BroadcrumbsRoutes[];
    title: string;
    sx?: BCProps['sx']
}

const Div = styled('div')(({theme})=>({
    [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
    },
    marginBottom:theme.spacing(3)
}))

function BreadcrumbsComp(props: BroadcrumbsProps) {
    const {title,routes,sx} = props
    return (
        <Div sx={sx}>
            <BC aria-label='breadcrumbs'>
                <Link key={`breadcrumbs-home`} href={'/'} passHref>
                    <MuiLink underline='hover' color='inherit'><Typography style={{margin:'0 !important',fontSize:14}}>Portalnesia</Typography></MuiLink>
                </Link>
                {routes ? routes.map((r,i)=>{
                    if(r.href) {
                        return (
                            <Link key={`breadcrumbs-${i}`} href={r.href} as={r.as} passHref>
                                <MuiLink underline='hover' color='inherit'><Typography style={{margin:'0 !important',fontSize:14}}>{r.label}</Typography></MuiLink>
                            </Link>
                        )
                    }
                    return <Typography key={`breadcrumbs-${i}`} style={{margin:'0 !important',fontSize:14}}>{r.label}</Typography>
                }) : null}
                <Typography key={`breadcrumbs-currentpage`} sx={{color:'text.primary'}} style={{margin:'0 !important',fontSize:14}}>{title}</Typography>
            </BC>
        </Div>
    )
}

/**
 * 
 * Breadcrumbs Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Breadcrumbs = memo(BreadcrumbsComp);
export default Breadcrumbs;