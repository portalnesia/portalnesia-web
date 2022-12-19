import Link from '@design/components/Link';
import Box,{ BoxProps } from '@mui/material/Box';
import NativeBread,{BreadcrumbsProps as NativeBreadcrumbsProps} from '@mui/material/Breadcrumbs'
import Typography from '@mui/material/Typography';
import config from '@src/config';
import { href } from '@utils/main';

type BroadcrumbsRoutes = {
    label: string,
    link?: string,
    as?: string
}

export interface BreadcrumbsProps extends NativeBreadcrumbsProps {
    routes?: BroadcrumbsRoutes[];
    title: string;
    wrapper?: BoxProps
}

/**
 * 
 * Breadcrumbs Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export default function Breadcrumbs({routes,title,wrapper,...props}: BreadcrumbsProps) {

    return (
        <Box sx={{mb:5,...wrapper?.sx}} {...wrapper}>
            <NativeBread aria-label='breadcrumbs' {...props}>
                <Link href='/'><Typography>{config.title}</Typography></Link>
                {routes ? routes.map(r=>{
                    if(r.link) {
                        return (
                            <Link key={r.label} href={href(r.link)}><Typography>{r.label}</Typography></Link>
                        )
                    }
                    return <Typography key={r.label}>{r.label}</Typography>
                }) : null}
                <Typography key={'title-breadcrumbs'}>{title}</Typography>
            </NativeBread>
        </Box>
    )
}