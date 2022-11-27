import React from "react";
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Image from "@comp/Image";
import NativeTypography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Link from "./Link";
import Tooltip from "@mui/material/Tooltip";

export interface CustomCardProps {
    title: string
    link: string
    image?: string 
    children?: React.ReactElement  
}

export const EllipsisTypography = styled(NativeTypography)(()=>({
    textOverflow:'ellipsis',
    display:'-webkit-box!important',
    overflow:'hidden',
    WebkitBoxOrient:'vertical',
    WebkitLineClamp:2
}))

export default function CustomCard({title,link,image,children}: CustomCardProps) {

    return (
        <Card sx={{width:'100%',height:'100%'}}>
            <Link href={link} legacyBehavior passHref>
                <CardActionArea component='a' className="no-underline" sx={{width:'100%',height:'100%'}}>
                    {image && (
                        <Image src={image} alt={title} sx={{width:'100%'}} />
                    )}
                    <CardContent sx={{p:2}}>
                        <Tooltip title={title}><EllipsisTypography>{title}</EllipsisTypography></Tooltip>
                        {children}
                    </CardContent>
                </CardActionArea>
            </Link>
        </Card>
    )
}