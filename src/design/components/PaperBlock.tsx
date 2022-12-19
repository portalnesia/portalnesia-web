import { KeyboardArrowDown } from "@mui/icons-material";
import Box,{ BoxProps } from "@mui/material/Box";
import Card,{CardProps} from "@mui/material/Card";
import CardContent,{CardContentProps} from "@mui/material/CardContent";
import CardHeader,{CardHeaderProps} from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Stack,{StackProps} from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

export interface PaperblockProps extends CardProps {
    title?: string
    header?: StackProps
    content?:CardContentProps
    children?: React.ReactNode
    footer?: React.ReactNode
    collapse?: boolean
}

export default function PaperBlock({header,title,content,children,footer,collapse,...rest}: PaperblockProps) {
    const [show,setShow] = useState(typeof collapse !== 'undefined' ? collapse : true);

    return (
        <Card sx={{p:0,...rest?.sx}} {...rest}>
            {title && (
                <Box p={2} {...show ? {borderBottom:t=>`2px solid ${t.palette.divider}`,mb:2} : {}}>
                    <Stack direction='row' spacing={1} {...header}>
                        <Box flexGrow={1}><Typography variant='h5'>{title}</Typography></Box>
                        {typeof collapse !== 'undefined' && (
                            <IconButton onClick={()=>setShow(!show)}>
                                <KeyboardArrowDown sx={{transform: show ? 'rotate(180deg)' : 'rotate(0deg)',transition:t=>t.transitions.create('transform',{duration:t.transitions.duration.shortest})}} />
                            </IconButton>
                        )}
                    </Stack>
                </Box>
            )}
            <Collapse in={show}>
                <Box>
                    <CardContent {...content} sx={{...content?.sx,pt:0}}>
                        {children}
                    </CardContent>
                    {footer && (
                        <Box borderTop={theme=>`2px solid ${theme.palette.divider}`} p={2}>
                            {footer}
                        </Box>
                    )}
                </Box>
            </Collapse>
            
        </Card>
    )
}