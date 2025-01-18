/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import {useRef, useState, useEffect, useCallback} from 'react';
// material
// components
import Avatar from '@design/components/Avatar';
import MenuPopover from '@design/components/MenuPopover';
import {useDispatch, useSelector} from '@redux/store'
import {State} from '@type/redux';
import Image from '@comp/Image'
import {accountUrl, portalUrl} from '@utils/main';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButtonActive from '@comp/IconButtonActive';
import {Circular} from '@design/components/Loading';
import {IMe} from '@model/user';
import useSWR from '@design/hooks/swr';
import Link from '@design/components/Link';
import MenuItem from '@mui/material/MenuItem';
import Iconify from '@design/components/Iconify';
import {useRouter} from 'next/router';
import {SessionPagination} from "@model/session";
import useAPI, {ApiError} from "@design/hooks/api";
import {CallbackEvent} from '@utils/contextmenu';
import useNotification from "@design/components/Notification";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Ellipsis from "@comp/Ellipsis";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import IconButton from "@mui/material/IconButton";
import {Delete, Login as LoginIcon} from "@mui/icons-material";
import Backdrop from "@design/components/Backdrop";
import Stack from '@mui/material/Stack';
import {KeyboardArrowDown} from "@mui/icons-material";
import Collapse from '@mui/material/Collapse';
import List from "@mui/material/List";

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

let isLoadingDataSession = false;

function useSession(fallback?: SessionPagination[]) {
	const ready = useSelector<State['ready']>(s => s.ready);
	const {data, mutate, ...rest} = useSWR<SessionPagination[]>(`/v2/account/sessions`, {
		revalidateOnMount: false,
		fallbackData: fallback
	});

	useEffect(() => {
		// console.log({isLoadingDataSession, data: typeof data, ready})
		if (typeof data === "undefined" && !isLoadingDataSession && ready) {
			isLoadingDataSession = true;
			mutate();
		} else if (data?.length) {
			isLoadingDataSession = false;
		}
	}, [data, mutate, ready])

	return {
		data,
		mutate,
		...rest
	}
}

export default function AccountPopover() {
	const router = useRouter();
	const pathname = router.pathname;
	const {user: userRedux, ready: readyRedux} = useSelector<Pick<State, 'user' | 'ready'>>(s => ({user: s.user, ready: s.ready}));
	const [user, setUser] = useState<State['user']>(userRedux);
	const [show, setShow] = useState(false);
	const dispatch = useDispatch();
	const anchorRef = useRef(null);
	const [open, setOpen] = useState(false);
	const {data, mutate} = useSWR<IMe | null>(userRedux === undefined ? `/v2/user` : null, {
		revalidateOnFocus: false,
		revalidateOnMount: false,
	});
	const {data: sessions} = useSession();

	const handleOpen = useCallback(() => {
		setOpen(true);
	}, []);
	const handleClose = useCallback(() => {
		setOpen(false);
	}, []);

	const handleFeedback = useCallback(() => {
		handleClose();
		dispatch({type: "CUSTOM", payload: {report: {type: "feedback"}}})
	}, [dispatch, handleClose])

	const handleKeyboard = useCallback(() => {
		handleClose();
		dispatch({type: "CUSTOM", payload: {hotkeys: {disabled: false, dialog: 'keyboard'}}})
	}, [dispatch, handleClose])

	const handleShowAccount = useCallback(() => {
		setShow(!show);
	}, [show])

	const handleViewAccount = useCallback(() => {
		const url = new URL(window.location.href);
		const chooser = new URL(`/account-chooser`, accountUrl());
		chooser.searchParams.set("redirect", url.toString())
		window.location.href = accountUrl(`/account-chooser?${chooser.searchParams.toString()}`)
	}, []);

	useEffect(() => {
		if (userRedux === undefined && readyRedux) {
			if (data !== undefined) {
				setUser(data);
				dispatch({type: "CUSTOM", payload: {user: data}});
			} else mutate();
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [data, readyRedux]);

	return (
		<>
			<IconButtonActive
				disabled={user === undefined}
				ref={anchorRef}
				open={open}
				onClick={handleOpen}
			>
				{user === undefined ? (
					<Circular size={25}/>
				) : (
					<Avatar alt="Profiles" sx={{width: 44, height: 44}}>
						{user && user?.picture ? (
							<Image src={`${user?.picture}&size=44&watermark=no`} webp alt={user?.name}/>
						) : undefined}
					</Avatar>
				)}
			</IconButtonActive>

			<MenuPopover
				open={open}
				onClose={handleClose}
				anchorEl={anchorRef.current}
				paperSx={{
					maxWidth: {xs: "100%", md: 300},
					minWidth: {xs: "100%", md: 300}
				}}
				disableScrollLock
			>
				<Box py={1}>
					<MenuItem sx={{py: 1, opacity: "1 !important"}} onClick={handleShowAccount} disabled={!sessions || (sessions?.length || 0) === 0} className="not-margin">
						<Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
							<Box width={"100%"}>
								<Typography variant="subtitle1" noWrap>
									{user ? user?.name : "Guest"}
								</Typography>
								<Typography variant="body2" sx={{color: 'text.secondary'}} noWrap>
									{user ? `@${user?.username}` : '@portalnesia'}
								</Typography>
							</Box>
							{sessions?.length &&
                                <KeyboardArrowDown sx={{transform: show ? 'rotate(180deg)' : 'rotate(0deg)', transition: t => t.transitions.create('transform', {duration: t.transitions.duration.shortest})}}/>}
						</Stack>
					</MenuItem>
					<Collapse in={show} unmountOnExit>
						{sessions?.length && (
							<List sx={{mx: 1}}>
								{sessions?.map?.((d, i) => (
									<SessionChild key={`data-${i}`} data={d} user={user}/>
								))}
								<ListItemButton sx={{borderRadius: 1.5, py: 1.5}} onClick={handleViewAccount}>
									<ListItemText
										primaryTypographyProps={{textAlign: "center"}}
										primary={"All Accounts"}
									/>
								</ListItemButton>
							</List>
						)}
					</Collapse>

					<Divider sx={{my: 1}}/>

					{!pathname.startsWith("/dashboard") && user ? (
						<Link key={'dashboard'} href={"/dashboard?utm_source=portalnesia+web&utm_medium=header"} passHref legacyBehavior>
							<MenuItem component='a' onClick={handleClose} sx={{typography: 'body2', py: 1, px: 2.5}}>
								<Iconify icon={"material-symbols:dashboard-rounded"} sx={{mr: 2, width: 24, height: 24}}/>
								Dashboard
							</MenuItem>
						</Link>
					) : null}

					{MENU_OPTIONS(user).map(m => {
						if (m.href) {
							return (
								<Link key={m.label} href={m.href} passHref legacyBehavior>
									<MenuItem component='a' className='no-blank no-underline' {...(m.blank ? {target: "_blank", rel: "nofollow noopener noreferrer"} : {})} onClick={handleClose} sx={{typography: 'body2', py: 1, px: 2.5}}>
										<Iconify icon={m.icon} sx={{mr: 2, width: 24, height: 24}}/>
										{m.label}
									</MenuItem>
								</Link>
							)
						}
						return null;
					})}

					<MenuItem key='feedback' component='div' onClick={handleFeedback} sx={{typography: 'body2', py: 1, px: 2.5}}>
						<Iconify icon={"ic:outline-feedback"} sx={{mr: 2, width: 24, height: 24}}/>
						Send Feedback
					</MenuItem>

					<MenuItem key='navigation' component='div' onClick={handleKeyboard} sx={{typography: 'body2', py: 1, px: 2.5}}>
						<Iconify icon={"material-symbols:keyboard-alt"} sx={{mr: 2, width: 24, height: 24}}/>
						Navigation
					</MenuItem>

					<Box sx={{p: 2, pt: 1.5}}>
						{user ? (
							<Button href={accountUrl(`logout?redirect=${encodeURIComponent(portalUrl(router.asPath))}&utm_source=portalnesia+web&utm_medium=header`)} fullWidth color="inherit" variant="outlined">
								Logout All Accounts
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

export type SessionChildProps = {
	data: SessionPagination;
	disabled?: boolean;
	user?: IMe | null;
}

function SessionChild({data, disabled, user}: SessionChildProps) {
	const avatarSize = 34;
	const setNotif = useNotification()
	const {post} = useAPI();
	const [loading, setLoading] = useState(false);

	const handleSelectAccount = useCallback(async (e: CallbackEvent<HTMLDivElement>) => {
		const accUrl = new URL(accountUrl("/account-chooser"))
		accUrl.searchParams.set("redirect", window.location.href);

		if (!data.active) {
			window.location.href = accUrl.toString();
		} else {
			if (data.id === user?.session_id) {
				window.location.reload();
			} else {
				setLoading(true);
				try {
					await post(`/v2/account/session`, {session_id: data.id}, undefined, {success_notif: false});
					window.location.reload();
				} catch (e) {
					if (e instanceof ApiError) {
						setNotif(e.message, true);
					}
					setLoading(false)
				}
			}
		}
	}, [post, setNotif, data, setLoading, user]);

	return (
		<>
			<ListItemButton component="div" sx={{borderRadius: 2, ...(!data.active ? {opacity: 0.5} : {})}} disabled={disabled} onClick={handleSelectAccount}>
				<ListItemAvatar>
					<Avatar alt="Profiles" sx={{width: avatarSize, height: avatarSize}}>
						{data.user && data?.user?.picture ? (
							<Image src={`${data?.user?.picture}&size=44&watermark=no`}
							       webp alt={data?.user?.name}/>
						) : undefined}
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					disableTypography
					sx={{pr: 7.5}}
					primary={
						<Ellipsis ellipsis={1}>{data.user?.name || "-"}</Ellipsis>
					}
					secondary={
						<Ellipsis variant={"caption"} ellipsis={1}>{data.user ? data.user.email : "-"}</Ellipsis>
					}
				/>
			</ListItemButton>
			<Divider sx={{mx: 2}}/>
			<Backdrop open={loading} loading unmountOnExit/>
		</>
	)
}