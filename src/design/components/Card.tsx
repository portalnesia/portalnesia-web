import React from "react";
import Card,{CardProps} from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Image from "@comp/Image";
import NativeTypography from "@mui/material/Typography";
import { styled, SxProps, Theme } from "@mui/material/styles";
import Link from "./Link";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

export interface CustomCardProps extends CardProps {
    title: string
    link: string
    image?: string 
    children?: React.ReactElement|React.ReactElement[] 
    ellipsis?:number
    sx?: SxProps<Theme>
}

export const EllipsisTypography = styled(NativeTypography,{
    shouldForwardProp:prop=>prop!=='ellipsis'
})<{ellipsis?:number}>(({ellipsis=2})=>({
    textOverflow:'ellipsis',
    display:'-webkit-box!important',
    overflow:'hidden',
    WebkitBoxOrient:'vertical',
    WebkitLineClamp:ellipsis
}))

export default function CustomCard({title,link,image,children,ellipsis,sx,...rest}: CustomCardProps) {

    return (
        <Card sx={{width:'100%',height:'100%',...sx}} {...rest}>
            <Link href={link} legacyBehavior passHref>
                <CardActionArea component='a' className="no-underline" sx={{width:'100%',height:'100%'}}>
                    {image && (
                        <Image webp src={image} alt={title} sx={{width:'100%'}} />
                    )}
                    <CardContent sx={{p:2,position:'relative'}}>
                        <Tooltip title={title}><EllipsisTypography ellipsis={ellipsis}>{title}</EllipsisTypography></Tooltip>
                        {children && <Box mt={1}>
                            {children}
                        </Box>}
                    </CardContent>
                </CardActionArea>
            </Link>
        </Card>
    )
}