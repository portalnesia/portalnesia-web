import React, { useCallback, useEffect, useState,MouseEvent, ComponentProps, useMemo } from 'react'
import List from '@mui/material/List'
import NativeAccordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ASummary } from '@design/components/TableContent'
import { ListItemIconStyle, ListItemStyle, NavItem } from '@layout/dashboard/NavSection'
import Portal from '@mui/material/Portal'
import Link from '@design/components/Link'
import { styled, SxProps, Theme, useTheme } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Router from 'next/router';
import { INavbar } from '@layout/navbar.config';

export interface SubnavProps {
    items: INavbar[]
    linkProps?: Partial<ComponentProps<typeof Link>>
    onExpand?: (expand: boolean)=>void
    rootSx?: SxProps<Theme>
    active(path: INavbar): boolean
    title: string
}

const Accordion=styled(NativeAccordion)(()=>({
    '&::before':{
        content:'none'
    }
}))

const CustomTabs = styled(Tabs)(()=>({
    '& .MuiTabs-indicator':{
        height:4
    }
}))
const CustomBox = styled(Box,{shouldForwardProp:prop=>prop!=='scrolled'})<{scrolled?:boolean}>(({scrolled,theme})=>({
    backgroundColor:theme.palette.background.paper,
    height:48,
    position:'fixed',
    top:64,
    left:0,
    zIndex:1101,
    width:'100%',
    borderBottom:`1px solid ${theme.palette.divider}`
}))

export function SubnavMobile({items:content,linkProps,active}: SubnavProps) {
    const [scrolled,setScrolled] = useState(false);

    const value = useMemo(()=>{
        const index = content.findIndex(c=>active(c));
        return index;
    },[active,content])

    const onChange = useCallback((_: any,value: number)=>{
        const selected = content?.[value];
        if(selected) {
            Router.push(selected.link,undefined,{shallow:linkProps?.shallow,scroll:linkProps?.scroll});
        }
    },[content,linkProps?.shallow,linkProps?.scroll])

    useEffect(()=>{
        function onScroll() {
          const scroll = document?.documentElement?.scrollTop || document.body.scrollTop;
          if(scroll > 30) {
            setScrolled(true)
          } else {
            setScrolled(false)
          }
        }
        window.addEventListener('scroll',onScroll);
    
        return ()=>window.removeEventListener('scroll',onScroll);
    },[])

    return (
        <Portal>
            <CustomBox scrolled={scrolled}>
                <CustomTabs variant='scrollable' value={value} onChange={onChange}>
                    {content.map(c=>(
                        <Tab key={c.name} label={c.name} />
                    ))}
                </CustomTabs>
            </CustomBox>
        </Portal>
    )
}

export function BackupSubnavMobile({title,items:content,onExpand,linkProps,rootSx,active}: SubnavProps) {
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
                                <Link key={dt.name} href={dt.link} passHref legacyBehavior {...linkProps}>
                                    <ListItemStyle
                                        component='a'
                                        disableGutters
                                        onClick={handleClick}
                                        sx={{
                                          ...(active(dt) && activeRootStyle),
                                          ...rootSx
                                        }}
                                        
                                    >
                                        {dt.icon && <ListItemIconStyle>{dt.icon}</ListItemIconStyle>}
                                        <ListItemText disableTypography primary={dt.name} />
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
                    <NavItem key={n.name} item={n} {...rest} />
                ))}
            </List>
        </Box>
    )
}