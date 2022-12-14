import Button from '@comp/Button';
import IconButtonActive from '@comp/IconButtonActive'
import Image from '@comp/Image';
import SWRPages from '@comp/SWRPages';
import Avatar from '@design/components/Avatar';
import Iconify from '@design/components/Iconify';
import Link from '@design/components/Link';
import MenuPopover from '@design/components/MenuPopover';
import { useNotificationSWR } from '@design/components/Notification';
import { BoxPagination } from '@design/components/Pagination';
import Scrollbar from '@design/components/Scrollbar';
import useResponsive from '@design/hooks/useResponsive';
import { INotifications } from '@model/message';
import { ArrowBack } from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Portal from '@mui/material/Portal';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useSelector } from '@redux/store';
import { getDayJs, href, portalUrl } from '@utils/main';
import { useCallback, useEffect, useRef, useState } from 'react'

export interface NotificationProps {
    
}

let alreadyMutate=false;
export default function Notification({}: NotificationProps) {
    const user = useSelector(s=>s.user);
    const smDown = useResponsive('down','sm')
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const {mutate,data,...swr} = useNotificationSWR();

    const handleOpen = useCallback(() => {
        setOpen(true);
    },[]);
    const handleClose = useCallback(() => {
        setOpen(false);
    },[]);

    useEffect(()=>{
        if(user) {
            if(!alreadyMutate) {
                alreadyMutate=true;
                mutate();
            }
        }
    }),[user]

    useEffect(()=>{
        if(smDown && open) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
    },[smDown,open])

    if(!user) return null;
    return (
        <>
            <Tooltip title="Notification">
                <IconButtonActive
                    ref={anchorRef}
                    open={open}
                    onClick={handleOpen}
                >
                    <Badge badgeContent={(data?.total_unread||0)} color="error" >
                        <Iconify icon="clarity:notification-solid" height={20} width={28} />
                    </Badge>
                </IconButtonActive>
            </Tooltip>
            <Portal>
                {!smDown ? (
                    <MenuPopover
                        open={open}
                        anchorEl={anchorRef.current}
                        onClose={handleClose}
                        paperSx={{width:500,maxWidth:'90%'}}
                    >
                        
                        <Box overflow={'hidden'}>
                            <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} p={2}>
                                <Typography variant='h6' component='h1'>Notifications</Typography>
                            </Box>
                            <Scrollbar sx={{maxHeight:'70vh'}}>
                                <Box py={1} maxHeight={"70vh"}>
                                    <NotificationSections data={data} mutate={mutate} {...swr} />
                                </Box>
                            </Scrollbar>
                        </Box>
                    
                    </MenuPopover>
                ) : (
                    <Fade in={open} unmountOnExit>
                        <Box zIndex={1110} bgcolor='background.paper' position='fixed' top={0} left={0} width="100%" overflow="auto" height="100%">
                            <Stack position='fixed' top={0} left={0} width='100%' bgcolor='background.paper' direction="row" spacing={2} borderBottom={theme=>`2px solid ${theme.palette.divider}`} p={2} height={63} zIndex={1}>
                                <IconButton onClick={handleClose}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography variant='h6' component='h1'>Notifications</Typography>
                            </Stack>
                            <Box pt={'85px'} pb={2}>
                                <NotificationSections data={data} mutate={mutate} {...swr} />
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Portal>
        </>
    )
}

type Data = ReturnType<typeof useNotificationSWR>
type SectionsProps = Data & ({

})

function NotificationSections({data,error,isLoadingMore,isLoading,size,setSize}: SectionsProps) {
    const getLink = useCallback((d: INotifications)=>{
        if(d.type === 'support') {
            return href(`/support/${d.id}?utm_source=portalnesia+web&utm_medium=notification+bar`)
        } else if(d.type === 'comment') {
            const url = new URL(d.content.link);
            url.searchParams.set('utm_source','portalnesia web');
            url.searchParams.set('utm_medium','notification bar')
            url.searchParams.set('ref','comment')
            url.searchParams.set('refid',`${d.id}`)
            return href(url.toString())
        } else if(d.type === "follow") {
            return href(`/user/${d.user.username}?utm_source=portalnesia+web&utm_medium=notification&ref=notification+bar&refid=${d.id}`)
        } else {
            return href(`/notification/portalnesia?utm_source=portalnesia+web&utm_medium=notification+bar`);
        }
    },[]);

    return (
        <SWRPages loading={!data && !error}>
            {data && data?.data?.length > 0 ? (
                <List>
                    {data?.data?.map(d=>(
                        <Link href={getLink(d)} passHref legacyBehavior>
                            <ListItemButton component='a' className='no-underline'>
                                <ListItemAvatar>
                                    <Avatar>
                                        {d?.user?.picture ? <Image src={`${d.user.picture}&size=40&watermark=no`} alt={d.user.name} /> : d?.user?.name}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText>
                                    <Typography>{d.message}</Typography>
                                    <Typography variant='caption' sx={{color:'text.disabled'}}>{getDayJs(d.timestamp).time_ago().format}</Typography>
                                </ListItemText>
                            </ListItemButton>
                        </Link>
                    ))}
                    {(data && data?.can_load) && (
                        <Box px={2} my={2}>
                            {isLoadingMore ? (
                                <BoxPagination loading minHeight={50} />
                            ) : (
                                <Button sx={{width:'100%'}} outlined color='inherit'>Load more</Button>
                            )}
                        </Box>
                    )}
                </List>
            ) : (
                <BoxPagination>
                    <Typography>No data</Typography>
                </BoxPagination>
            )}
        </SWRPages>
    )
}