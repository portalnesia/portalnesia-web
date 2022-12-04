import React, { useCallback, useEffect, useState,MouseEvent, ComponentProps, useMemo } from 'react'
import List from '@mui/material/List'
import NativeAccordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ASummary } from '@design/components/TableContent'
import { INavItems, ListItemIconStyle, ListItemStyle, NavItem } from '@layout/dashboard/NavSection'
import Portal from '@mui/material/Portal'
import Link from '@design/components/Link'
import { styled, SxProps, Theme, useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface SubnavProps {
    items: INavItems[]
    linkProps?: Partial<ComponentProps<typeof Link>>
    onExpand?: (expand: boolean)=>void
    rootSx?: SxProps<Theme>
    active(path?: string): boolean
    title: string
}

const Accordion=styled(NativeAccordion)(()=>({
    '&::before':{
        content:'none'
    }
}))

export function SubnavMobile({title,items:content,onExpand,linkProps,rootSx,active}: SubnavProps) {
    const theme = useTheme();
    const [expand,setExpand] = useState(false);

    const handleChange=useCallback(()=>{
        setExpand(e=>!e);
    },[setExpand])

    useEffect(()=>{
        if(expand) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
        if(onExpand) onExpand(expand);
    },[expand,onExpand])

    const handleClick=useCallback((e: MouseEvent<HTMLDivElement>)=>{
        setExpand(false);
    },[])

    const activeRootStyle = useMemo(()=>({
        color: 'primary.main',
        fontWeight: 'fontWeightMedium',
        bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        '&:before': { display: 'block' }
    }),[theme]);

    return (
        <Portal>
            <Accordion sx={{position:'fixed',top:64,left:0,zIndex:1101,width:'100%'}} disableGutters square expanded={expand} onChange={handleChange}>
                <ASummary expandIcon={<ExpandMoreIcon />}>{title}</ASummary>
                <AccordionDetails sx={{overflow:'auto',pb:5,height:'calc(100vh - 64px - 40px)'}}>
                    <div>
                        <List component="ol" sx={{listStyle:'numeric',listStylePosition:'inside'}}>
                            {content.map((dt,i)=>(
                                <Link href={dt.path} passHref legacyBehavior {...linkProps}>
                                    <ListItemStyle
                                        component='a'
                                        disableGutters
                                        onClick={handleClick}
                                        sx={{
                                          ...(active(dt.path) && activeRootStyle),
                                          ...rootSx
                                        }}
                                        {...(dt.new_tab ? {target:'_blank'} : {})}
                                        
                                    >
                                        {dt.icon && <ListItemIconStyle>{dt.icon}</ListItemIconStyle>}
                                        <ListItemText disableTypography primary={dt.title} />
                                    </ListItemStyle>
                                </Link>
                            ))}
                        </List>
                    </div>
                </AccordionDetails>
            </Accordion>
        </Portal>
    )
}

export function Subnav({title,items:content,onExpand:_a,...rest}: SubnavProps) {

    return (
        <Box>
            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={0.5}>
                <Typography variant='h6' component='h1'>{title}</Typography>
            </Box>
            <List disablePadding>
                {content.map(n=>(
                    <NavItem key={n.title} item={n} {...rest} />
                ))}
            </List>
        </Box>
    )
}