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
import Fade from '@mui/material/Fade';
import ExpandMore from '@design/components/ExpandMore';
import ListItemText from '@mui/material/ListItemText';
import Link from '@design/components/Link';
import { useRouter } from 'next/router';

const Theme = [
  {
    value: 'auto',
    label: "Device Theme",
  },
  {
    value: 'light',
    label: "Light Theme"
  },
  {
    value: 'dark',
    label: "Dark Theme",
  }
];

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
            <Fade in={open}>
                <Box position='fixed' bgcolor='background.paper' m={0} ml={'0 !important'} px={2} py={1} pb={2} width='100%' left={0} top={63} height="calc(100vh - 63px)" overflow='auto'>
                    <Typography variant='h5' sx={{mb:2}}>Portalnesia Menu</Typography>

                    <Box bgcolor='background.default' p={2} borderRadius={2}>
                        <Grid container spacing={1}>
                            {navbarMenu.sort((a,b)=>a.child ? 1 : -1).map((m)=>{
                                if(m.child) {
                                    return m.child.map(c=>(
                                        <Grid key={`${m.name}-${c.name}`} item xs={12} sm={6}>
                                            <Link href={c.link} legacyBehavior passHref>
                                                <MenuButton component='a' sx={{p:2}} className='no-underline'>
                                                    <ListItemText primary={c.name} secondary={c.desc} />
                                                </MenuButton>
                                            </Link>
                                        </Grid>
                                    ))
                                }
                                return (
                                    <Grid key={m.name} item xs={12} sm={6}>
                                        <Link href={m.link} legacyBehavior passHref>
                                            <MenuButton component='a' sx={{p:2}} className='no-underline'>
                                                <ListItemText primary={m.name} secondary={m.desc} />
                                            </MenuButton>
                                        </Link>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Box>
                </Box>
            </Fade>
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