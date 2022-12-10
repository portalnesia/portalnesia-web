import Box,{ BoxProps } from "@mui/material/Box";
import Card,{CardProps} from "@mui/material/Card";
import CardContent,{CardContentProps} from "@mui/material/CardContent";
import CardHeader,{CardHeaderProps} from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import React from "react";

export interface PaperblockProps {
    title?: string
    header?: BoxProps
    content?:CardContentProps
    children?: React.ReactNode
    footer?: React.ReactNode
}

export default function PaperBlock({header,title,content,children,footer}: PaperblockProps) {
    

    return (
        <Card sx={{p:0}}>
            {title && (
                <Box {...header}>
                    <Typography variant='h5' sx={{pb:0.5,pt:2,px:2,mb:2,borderBottom:theme=>`2px solid ${theme.palette.divider}`}}>{title}</Typography>
                </Box>
            )}
            
            <CardContent {...content} sx={{...content?.sx,pt:0}}>
                {children}
            </CardContent>
            {footer && (
                <Box borderTop={theme=>`2px solid ${theme.palette.divider}`} p={2}>
                    {footer}
                </Box>
            )}
        </Card>
    )
}