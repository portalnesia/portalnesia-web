import { useRef, useState, useEffect, useCallback } from 'react';
// material
// components
import Avatar from '@design/components/Avatar';
import MenuPopover from '@design/components/MenuPopover';
import { useDispatch, useSelector } from '@redux/store'
import { State } from '@type/redux';
import Image from '@comp/Image'
import { accountUrl, portalUrl } from '@utils/main';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButtonActive from '@comp/IconButtonActive';
import { Circular } from '@design/components/Loading';
import { IMe } from '@model/user';
import useSWR from '@design/hooks/swr';
import Link from '@design/components/Link';
import MenuItem from '@mui/material/MenuItem';
import Iconify from '@design/components/Iconify';
import { useRouter } from 'next/router';

type IMenu = {
    label: string
    icon: string
    blank?: boolean
    /**
     * Link or function arguments
     */
    href?: string
}

const MENU_OPTIONS = (user?: IMe | null): IMenu[] => ([
    ...(user ? [{
        label: "Setting",
        icon: 'carbon:settings',
        href: accountUrl(`?utm_source=portalnesia+web&utm_medium=header`)
    }, {
        label: "Profile",
        icon: 'gg:profile',
        href: `/user/${user?.username}?utm_source=portalnesia+web&utm_medium=header`
    }, {
        label: "Likes",
        icon: 'material-symbols:favorite-outline-rounded',
        href: `/likes?utm_source=portalnesia+web&utm_medium=header`
    }] : []),
    {
        label: "Contact",
        icon: 'material-symbols:perm-contact-calendar',
        href: `/contact?utm_source=portalnesia+web&utm_medium=header`
    },
    {
        label: "Support",
        icon: 'mdi:customer-service',
        href: `/support?utm_source=portalnesia+web&utm_medium=header`
    },
]);

export default function AccountPopover() {
    const router = useRouter();
    const pathname = router.pathname;
    const { user: userRedux, appToken } = useSelector<Pick<State, 'user' | 'appToken'>>(s => ({ user: s.user, appToken: s.appToken }));
    const [user, setUser] = useState<State['user']>(userRedux);
    const dispatch = useDispatch();
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const { data, mutate } = useSWR<IMe | null>(userRedux === undefined ? `/v2/user` : null, {
        revalidateOnFocus: false,
        revalidateOnMount: false,
    });

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);
    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleFeedback = useCallback(() => {
        handleClose();
        dispatch({ type: "CUSTOM", payload: { report: { type: "feedback" } } })
    }, [dispatch, handleClose])

    const handleKeyboard = useCallback(() => {
        handleClose();
        dispatch({ type: "CUSTOM", payload: { hotkeys: { disabled: false, dialog: 'keyboard' } } })
    }, [dispatch, handleClose])

    useEffect(() => {
        if (userRedux === undefined && appToken) {
            if (data !== undefined) {
                setUser(data);
                dispatch({ type: "CUSTOM", payload: { user: data } });
            }
            else mutate();
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [data, appToken]);

    return (
        <>
            <IconButtonActive
                disabled={user === undefined}
                ref={anchorRef}
                open={open}
                onClick={handleOpen}
            >
                {user === undefined ? (
                    <Circular size={25} />
                ) : (
                    <Avatar alt="Profiles" sx={{ width: 44, height: 44 }}>
                        {user && user?.picture ? (
                            <Image src={`${user?.picture}&size=44&watermark=no`} webp alt={user?.name} />
                        ) : undefined}
                    </Avatar>
                )}
            </IconButtonActive>

            <MenuPopover
                open={open}
                onClose={handleClose}
                anchorEl={anchorRef.current}
                sx={{ width: 220 }}
                disableScrollLock
            >
                <Box py={1}>
                    <Box sx={{ pb: 1.5, px: 2.5 }}>
                        <Typography variant="subtitle1" noWrap>
                            {user ? user?.name : "Guest"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                            {user ? `@${user?.username}` : '@portalnesia'}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {!pathname.startsWith("/dashboard") && user ? (
                        <Link key={'dashboard'} href={"/dashboard?utm_source=portalnesia+web&utm_medium=header"} passHref legacyBehavior>
                            <MenuItem component='a' onClick={handleClose} sx={{ typography: 'body2', py: 1, px: 2.5 }}>
                                <Iconify icon={"material-symbols:dashboard-rounded"} sx={{ mr: 2, width: 24, height: 24 }} />
                                Dashboard
                            </MenuItem>
                        </Link>
                    ) : null}

                    {MENU_OPTIONS(user).map(m => {
                        if (m.href) {
                            return (
                                <Link key={m.label} href={m.href} passHref legacyBehavior>
                                    <MenuItem component='a' className='no-blank no-underline' {...(m.blank ? { target: "_blank", rel: "nofollow noopener noreferrer" } : {})} onClick={handleClose} sx={{ typography: 'body2', py: 1, px: 2.5 }}>
                                        <Iconify icon={m.icon} sx={{ mr: 2, width: 24, height: 24 }} />
                                        {m.label}
                                    </MenuItem>
                                </Link>
                            )
                        }
                        return null;
                    })}

                    <MenuItem key='feedback' component='div' onClick={handleFeedback} sx={{ typography: 'body2', py: 1, px: 2.5 }}>
                        <Iconify icon={"ic:outline-feedback"} sx={{ mr: 2, width: 24, height: 24 }} />
                        Send Feedback
                    </MenuItem>

                    <MenuItem key='navigation' component='div' onClick={handleKeyboard} sx={{ typography: 'body2', py: 1, px: 2.5 }}>
                        <Iconify icon={"material-symbols:keyboard-alt"} sx={{ mr: 2, width: 24, height: 24 }} />
                        Navigation
                    </MenuItem>

                    <Box sx={{ p: 2, pt: 1.5 }}>
                        {user ? (
                            <Button href={accountUrl(`logout?redirect=${encodeURIComponent(portalUrl(router.asPath))}&utm_source=portalnesia+web&utm_medium=header`)} fullWidth color="inherit" variant="outlined">
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button href={accountUrl(`login?redirect=${encodeURIComponent(portalUrl(router.asPath))}&utm_source=portalnesia+web&utm_medium=header`)} fullWidth color="inherit" variant="outlined">
                                    Login / Register
                                </Button>
                            </>
                        )}

                    </Box>
                </Box>
            </MenuPopover>
        </>
    );
}