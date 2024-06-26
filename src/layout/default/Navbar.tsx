import Logo, { LogoProps } from "@comp/Logo";
import { Div, Form } from "@design/components/Dom";
import Iconify from "@design/components/Iconify";
import Link from "@design/components/Link";
import AccountPopover from "@layout/AccountPopover";
import { NAVBAR_HEIGHT, navbarMenu, INavbarChild } from "@layout/navbar.config";
import ThemePopover from "@layout/ThemePopover";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Grid from "@mui/material/Grid";
import Hidden from "@mui/material/Hidden";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Router, { useRouter } from "next/router";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CustomListItemText, NavbarPopover } from "@layout/NavbarPopover";
import Fade from "@mui/material/Fade";
import IconButtonActive from "@comp/IconButtonActive";
import { alpha } from '@mui/system/colorManipulator';
import Typography from "@mui/material/Typography";
import MenuPopover from "@design/components/MenuPopover";
import useResponsive from "@design/hooks/useResponsive";
import dynamic from "next/dynamic";
import Portal from "@mui/material/Portal";
import IconButton from "@mui/material/IconButton";
import { ArrowBack } from "@mui/icons-material";
import { useMousetrap } from "@hooks/hotkeys";
import { portalUrl } from "@utils/main";
import Notification from "@layout/notification/Notification";

const HtmlMdDown = dynamic(() => import('@design/components/TableContent').then(m => m.HtmlMdDown), { ssr: false })

const RootStyle = styled(AppBar, { shouldForwardProp: prop => prop !== "scrolled" })<{ scrolled?: boolean }>(({ theme, scrolled }) => ({
    top: 0,
    backgroundColor: theme.palette.background.paper,
    ...(scrolled ? {} : { boxShadow: "none" }),
    transition: theme.transitions.create(['top', 'box-shadow'])
}));

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    height: NAVBAR_HEIGHT,
    [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(0, 5)
    },
}));

const MenuDesktop = styled(ButtonBase, {
    shouldForwardProp: (prop: string) => !['component', 'active', 'childActive'].includes(prop)
})<{ component?: string, active?: boolean, childActive?: boolean }>(({ theme, active, childActive }) => ({
    color: theme.palette.text.primary,
    width: 80,
    height: 50,
    borderRadius: 5,
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    },
    ...(active ? {
        '& svg': {
            color: theme.palette.customColor.linkIcon
        }
    } : {}),
    ...(childActive && {
        '&:before': {
            zIndex: 1,
            content: "''",
            width: '100%',
            height: '100%',
            borderRadius: 5,
            position: 'absolute',
            backgroundColor: alpha(theme.palette.customColor.linkIcon, 0.22)
        }
    })
}))

interface NavbarMenuDesktopProps {
    data: (typeof navbarMenu)[number]
}

function MenuChild({ data }: { data: INavbarChild }) {
    const { name, link, desc } = data;
    return (
        <Link key={name} href={link} legacyBehavior passHref>
            <MenuDesktop title={desc || name} component='a' sx={{ p: 2, width: '100%', height: '100%', borderRadius: 2 }} className='no-underline'>
                <CustomListItemText primary={name} secondary={desc} />
            </MenuDesktop>
        </Link>
    )
}

function NavbarMenuDesktop({ data }: NavbarMenuDesktopProps) {
    const router = useRouter();
    const anchorRef = useRef(null);
    const { name, child, link, tooltip, icon, iconActive } = data;
    const pathname = router.pathname
    const isActive = useMemo(() => {
        const pathUrl = new URL(pathname, portalUrl());
        const linkUrl = new URL(link, portalUrl());
        const a = (linkUrl.pathname === '/' ? linkUrl.pathname === pathUrl.pathname : new RegExp((linkUrl.pathname || '/'), 'i').test(pathUrl.pathname || '/'))
        return a;
    }, [pathname, link]);
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => {
        setOpen(e => !e);
    }, [setOpen]);

    useEffect(() => {
        function routerEvent() {
            setOpen(false);
        }
        router.events.on('routeChangeStart', routerEvent);
        return () => {
            router.events.off('routeChangeStart', routerEvent)
        }
    }, [router])

    if (child) {
        return (
            <>
                <Tooltip title={tooltip || name}>
                    <MenuDesktop ref={anchorRef} className='no-underline' sx={{ px: 2, width: { xs: 80, md: 70, lg: 80 } }} childActive={open} onClick={handleOpen}>
                        {icon && <Iconify icon={open && iconActive ? iconActive : icon} sx={{ width: { xs: 35, md: 25, lg: 35 }, height: { xs: 35, md: 25, lg: 35 }, ...(open ? { color: 'customColor.linkIcon' } : {}) }} />}
                    </MenuDesktop>
                </Tooltip>
                <MenuPopover arrow={false} transformOrigin={undefined} open={open} onClose={handleOpen} anchorEl={anchorRef.current} paperSx={{ py: 1, px: 2, pb: 2, width: '60%', minWidth: 800 }} disableScrollLock>
                    <Typography variant='h5' sx={{ mb: 2 }}>{name}</Typography>

                    <Grid container spacing={1} alignItems='flex-start'>
                        <Grid item xs={6} sx={{ height: '100%' }}>
                            <Box bgcolor='background.default' p={2} borderRadius={2} height='100%'>
                                {child.filter((_, i) => i % 2 === 0).map(c => (
                                    <MenuChild key={c.name} data={c} />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={6} sx={{ height: '100%' }}>
                            <Box bgcolor='background.default' p={2} borderRadius={2} height='100%'>
                                {child.filter((_, i) => i % 2 !== 0).map(c => (
                                    <MenuChild key={c.name} data={c} />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>


                </MenuPopover>
            </>
        );
    }

    return (
        <Div sx={{ height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link href={link} passHref legacyBehavior>
                <Tooltip title={tooltip || name}>
                    <MenuDesktop className='no-underline' active={isActive} component='a' sx={{ px: 2, width: { xs: 80, md: 70, lg: 80 } }}>
                        {icon && <Iconify icon={isActive && iconActive ? iconActive : icon} sx={{ width: { xs: 35, md: 25, lg: 35 }, height: { xs: 35, md: 25, lg: 35 } }} />}
                    </MenuDesktop>
                </Tooltip>
            </Link>
            <Box {...(isActive ? {} : { display: 'none' })} width='100%' height={4} position='absolute' sx={{ backgroundColor: 'customColor.linkIcon' }} bottom={0} left={0} />
        </Div>

    )
}

const InputSearch = styled(InputBase, { shouldForwardProp: prop => prop !== 'active' })<{ active?: boolean }>(({ theme, active }) => ({
    width: '100%',
    borderRadius: 16,
    backgroundColor: theme.palette.customColor.search,
    border: `1px solid ${theme.palette.customColor.search}`,
    '&:hover': {
        border: `1px solid ${theme.palette.divider}`,
    },
    '&:active': {
        border: `1px solid ${theme.palette.customColor.linkIcon} !important`,
    },
    ...active ? {
        border: `1px solid ${theme.palette.customColor.linkIcon} !important`,
    } : {},
}))
function Search() {
    const router = useRouter();
    const query = router.query?.q
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [focus, setFocus] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const ref2 = useRef<HTMLInputElement>(null);
    const xs = useResponsive('only', 'xs');
    const md = useResponsive('only', 'md')

    useEffect(() => {
        if (typeof query === "string" && Router.pathname === "/search") setQ(decodeURIComponent(query))
    }, [query])

    const handleSearch = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(false);
        router.push({ pathname: `/search`, query: { q } }, `/search?q=${encodeURIComponent(q)}`);
    }, [router, q])

    const openSearch = useCallback(() => {
        if (xs || md) {
            setOpen(true)
            setTimeout(() => {
                ref.current?.focus()
            }, 100)
        } else {
            setTimeout(() => {
                ref2.current?.focus()
            }, 100)
        }
    }, [xs, md])

    useMousetrap("/", openSearch);

    return (
        <>
            <Hidden only={['md', 'xs']}>
                <Form sx={{ flexGrow: { lg: 1, sm: 1, xl: 1, md: 0, xs: 0 }, ml: '8px!important' }} onSubmit={handleSearch}>
                    <InputSearch
                        sx={{ px: 2, py: 0.5, borderRadius: 1.8 }}
                        id='search-input-home'
                        active={focus}
                        value={q}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search..."
                        inputProps={{ 'aria-label': 'Search' }}
                        inputRef={ref2}
                    />
                </Form>
            </Hidden>
            <Hidden only={['lg', 'sm', 'xl']}>
                <Tooltip title="Search"><IconButtonActive open={open} onClick={openSearch}>
                    <Iconify icon='material-symbols:search' sx={{ width: 25, height: 25 }} />
                </IconButtonActive></Tooltip>

                <Portal>
                    <Fade in={open}>
                        <Form sx={{ flexGrow: { lg: 1, sm: 1, xl: 1, md: 0, xs: 0 } }} onSubmit={handleSearch}>
                            <Stack direction='row' spacing={2} position='fixed' bgcolor='background.paper' px={2} py={1} width='100%' left={0} top={0} zIndex={1102}>
                                <IconButton onClick={() => setOpen(false)}>
                                    <ArrowBack />
                                </IconButton>
                                <InputSearch
                                    sx={{ px: 2, py: 1 }}
                                    active={focus}
                                    id='search-input-home'
                                    value={q}
                                    onFocus={() => setFocus(true)}
                                    onBlur={() => setFocus(false)}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search..."
                                    inputProps={{ 'aria-label': 'Search' }}
                                    inputRef={ref} />
                            </Stack>
                        </Form>
                    </Fade>
                </Portal>
            </Hidden>
        </>
    )
}

export interface NavbarProps {
    logo?: LogoProps
    tableContent?: any
}

export default function DefaultNavbar({ logo, tableContent }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const smDown = useResponsive('down', 'md');

    const dataTableContent = useMemo(() => {
        if (smDown && tableContent) return tableContent
        return undefined;
    }, [smDown, tableContent]);

    useEffect(() => {
        function onScroll() {
            const scroll = document?.documentElement?.scrollTop || document.body.scrollTop;
            if (scroll > 30) {
                setScrolled(true)
            } else {
                setScrolled(false)
            }
        }
        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, [])

    return (
        <RootStyle scrolled={scrolled} elevation={3} position='sticky'>
            <ToolbarStyle>
                <Grid container spacing={2} sx={{ height: 80 }}>
                    <Grid item xs={6} lg={3}>
                        <Stack direction="row" alignItems="center" justifyContent='flex-start' spacing={1.5} height='100%'>
                            <Box sx={{ pr: 1, display: 'inline-flex' }}>
                                <Logo href="/?utm_source=portalnesia+web&utm_medium=header" svg={{ size: 40 }} {...logo} />
                            </Box>
                            <Hidden only={['md', 'xs']}>
                                <Search />
                            </Hidden>
                            <Hidden only={['xs', 'sm', 'lg', 'xl']}>
                                {navbarMenu.map(m => (
                                    <NavbarMenuDesktop data={m} key={m.name} />
                                ))}
                            </Hidden>
                        </Stack>
                    </Grid>
                    <Hidden lgDown>
                        <Grid item xs={6} lg={6}>
                            <Stack direction="row" alignItems="center" justifyContent='center' mx={2} height='100%'>
                                {navbarMenu.map(m => (
                                    <NavbarMenuDesktop data={m} key={m.name} />
                                ))}
                            </Stack>
                        </Grid>
                    </Hidden>
                    <Grid item xs={6} lg={3}>
                        <Stack direction="row" alignItems="center" justifyContent='flex-end' spacing={1.5} height='100%'>
                            <Hidden only={['sm', 'lg', 'xl']}>
                                <Search />
                            </Hidden>

                            <Hidden mdUp>
                                <NavbarPopover />
                            </Hidden>

                            <Notification />
                            <ThemePopover />
                            <AccountPopover />
                        </Stack>
                    </Grid>
                </Grid>
            </ToolbarStyle>
            {dataTableContent && (
                <HtmlMdDown data={dataTableContent} />
            )}
        </RootStyle>
    )
}