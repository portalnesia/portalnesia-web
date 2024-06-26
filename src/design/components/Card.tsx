import React from "react";
import Card, { CardProps } from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Image from "@comp/Image";
import NativeTypography from "@mui/material/Typography";
import { styled, SxProps, Theme } from "@mui/material/styles";
import Link from "./Link";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { staticUrl } from "@utils/main";

export interface CustomCardProps extends CardProps {
    title: string
    link: string
    image?: string | null
    image_query?: string;
    children?: React.ReactElement | React.ReactElement[]
    ellipsis?: number
    sx?: SxProps<Theme>
    lazy?: boolean;
}

export const EllipsisTypography = styled(NativeTypography, {
    shouldForwardProp: prop => prop !== 'ellipsis'
})<{ ellipsis?: number }>(({ ellipsis = 2 }) => ({
    textOverflow: 'ellipsis',
    display: '-webkit-box!important',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: ellipsis
}))

const CustomBox = styled('div', {
    shouldForwardProp: (prop: string) => !['childrenCard'].includes(prop)
})<{ childrenCard?: React.ReactNode, ellipsis?: number }>(({ theme, childrenCard, ellipsis = 2 }) => ({
    position: 'relative',
    ...(childrenCard ? {
        minHeight: (ellipsis * (15 * 1.5)) + 25
    } : {})
}))

export default function CustomCard({ title, link, image, children, ellipsis, sx, image_query, lazy = true, ...rest }: CustomCardProps) {

    return (
        <Card sx={{ width: '100%', height: '100%', ...sx }} {...rest}>
            <Link href={link} legacyBehavior passHref>
                <CardActionArea component='a' className="no-underline" sx={{ width: '100%', height: '100%' }}>
                    {image !== undefined && (
                        <Image webp lazy={lazy} src={`${image === null ? staticUrl(`/img/content?image=${encodeURIComponent('notfound.png')}`) : image}${image_query}`} alt={title} sx={{ width: '100%' }} />
                    )}
                    <CardContent sx={{ p: 2 }}>
                        <CustomBox childrenCard={children} ellipsis={ellipsis}>
                            <Tooltip title={title}><EllipsisTypography ellipsis={ellipsis}>{title}</EllipsisTypography></Tooltip>
                            {children && (
                                <Box position='absolute' bottom={0} width='100%'>
                                    {children}
                                </Box>
                            )}
                        </CustomBox>
                    </CardContent>
                </CardActionArea>
            </Link>
        </Card>
    )
}