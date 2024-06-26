import { useCallback,useEffect,useState } from 'react';
// material
// components
import Iconify from '@design/components/Iconify';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import IconButtonActive from '@comp/IconButtonActive';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { navbarMenu } from './navbar.config';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import ListItemText from '@mui/material/ListItemText';
import Link from '@design/components/Link';
import { useRouter } from 'next/router';
import Portal from '@mui/material/Portal';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { ArrowBack } from '@mui/icons-material';
import { isIOS } from 'react-device-detect';

export const CustomListItemText = styled(ListItemText)(({theme})=>({
    '& .MuiListItemText-secondary':{
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:1,
        color: theme.palette.text.disabled,
        fontSize:13
    }
}))
export const CustomListItemTextMobile = styled(ListItemText)(({theme})=>({
    '& .MuiListItemText-secondary':{
        color: theme.palette.text.disabled,
        fontSize:13
    }
}))

export function NavbarPopover() {
    const router = useRouter()
    const [open,setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(e=>!e);
    },[setOpen]);

    useEffect(()=>{
        function routerEvent() {
            setOpen(false);
        }
        router.events.on('routeChangeStart',routerEvent);
        return ()=>{
            router.events.off('routeChangeStart',routerEvent)
        }
    },[router])

    useEffect(()=>{
        if (open) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
    },[open])

    return (
        <>
            <Tooltip title={"Menu"}>
                <IconButtonActive
                    open={open}
                    onClick={handleOpen}
                >
                <Iconify icon={'fe:app-menu'} height={25} width={30} />
                </IconButtonActive>
            </Tooltip>
            <Portal>
                <SwipeableDrawer
                    open={open}
                    onClose={handleOpen}
                    onOpen={()=>{}}
                    disableSwipeToOpen
                    PaperProps={{
                        sx: { width: '100%' }
                    }}
                    anchor="right"
                    disableBackdropTransition={!isIOS}
                    disableDiscovery
                >
                    <Box position='fixed' bgcolor='background.paper' m={0} ml={'0 !important'} pb={2} width='100%' left={0} top={0} overflow='auto' height='100%' zIndex={1103}>
                        <Stack position='fixed' top={0} left={0} width='100%' bgcolor='background.paper' direction="row" spacing={2} borderBottom={theme=>`2px solid ${theme.palette.divider}`} p={2} height={63} zIndex={1}>
                            <IconButton onClick={handleOpen}>
                                <ArrowBack />
                            </IconButton>
                            <Typography variant='h6' component='h1'>Portalnesia Menu</Typography>
                        </Stack>

                        <Box px={2} py={1} pt={'85px'}>
                            <Box bgcolor='background.default' p={2} borderRadius={2} overflow='auto'>
                                <Grid container spacing={1}>
                                    {navbarMenu.map((m)=>{
                                        if(m.child) {
                                            return m.child.map(c=>(
                                                <Grid key={`${m.name}-${c.name}`} item xs={12} sm={6}>
                                                    <Link href={c.link} legacyBehavior passHref>
                                                        <MenuButton component='a' sx={{p:2}} className='no-underline'>
                                                            <CustomListItemTextMobile primary={c.name} secondary={c.desc} />
                                                        </MenuButton>
                                                    </Link>
                                                </Grid>
                                            ))
                                        }
                                        return (
                                            <Grid key={m.name} item xs={12} sm={6}>
                                                <Link href={m.link} legacyBehavior passHref>
                                                    <MenuButton component='a' sx={{p:2}} className='no-underline'>
                                                        <CustomListItemTextMobile primary={m.name} secondary={m.desc} />
                                                    </MenuButton>
                                                </Link>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            </Box>
                        </Box>
                    </Box>
                </SwipeableDrawer>
            </Portal>
        </>
    )
}

const MenuButton = styled(ButtonBase,{
    shouldForwardProp:(prop:string)=>!['component','active'].includes(prop)
})<{component?:string}>(({theme})=>({
    width:'100%',
    borderRadius:10,
    justifyContent:'flex-start',
    '&:hover':{
        backgroundColor:theme.palette.action.hover
    },
}))