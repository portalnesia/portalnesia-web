import Button from "@comp/Button";
import IconButtonActive from "@comp/IconButtonActive";
import Image from "@comp/Image";
import Pages from "@comp/Pages";
import MenuPopover from "@design/components/MenuPopover";
import NavbarChat from "@design/components/chat/Navbar";
import { INavbarChat } from "@design/components/chat/NavSection";
import SidebarChat from "@design/components/chat/Sidebar";
import { Circular } from "@design/components/Loading";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import { useSWRPagination } from "@design/hooks/swr";
import useResponsive from "@design/hooks/useResponsive";
import { DRAWER_WIDTH, NAVBAR_HEIGHT } from "@layout/navbar.config";
import type { ISupportRoom, IMessages } from "@model/message";
import { AddAPhoto, Close, MoreVert, NoPhotography, Send } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Portal from "@mui/material/Portal";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import wrapper, { BackendError, useSelector } from "@redux/store";
import type { IPages } from "@type/general";
import type { State } from "@type/redux";
import { accountUrl, getDayJs, portalUrl } from "@utils/main";
import Router, { useRouter } from "next/router";
import React from "react";
import SWRPages from "@comp/SWRPages";
import { BoxPagination } from "@design/components/Pagination";
import { Markdown } from "@design/components/Parser";
import { copyTextBrowser } from "@portalnesia/utils";
import useNotification from "@design/components/Notification";
import Textarea from "@design/components/Textarea";
import IconButton from "@mui/material/IconButton";
import submitForm from "@utils/submit-form";
import { alpha } from '@mui/system/colorManipulator';
import { isMobile } from "react-device-detect";
import type { KeyedMutator } from "swr";
import { EllipsisTypography } from "@design/components/Card";
import dynamic from "next/dynamic";
import Label from "@design/components/Label";

const MenuItem = dynamic(() => import("@mui/material/MenuItem"));
const Dialog = dynamic(() => import("@design/components/Dialog"));
const Scrollbar = dynamic(() => import("@design/components/Scrollbar"));
const Table = dynamic(() => import("@mui/material/Table"));
const TableBody = dynamic(() => import("@mui/material/TableBody"));
const TableRow = dynamic(() => import("@mui/material/TableRow"));
const TableCell = dynamic(() => import("@mui/material/TableCell"));

type ISupportPage = {
    support?: ISupportRoom
}

export const getServerSideProps = wrapper<ISupportPage>(async ({ redirect, resolvedUrl, session, params, fetchAPI }) => {
    const support_id = params?.slug?.[0];
    if (support_id) {
        if (typeof support_id !== 'string') return redirect();

        try {
            const support: ISupportRoom = await fetchAPI<ISupportRoom>(`/v2/support/${support_id}/check`);
            if (!session && typeof support.userid !== 'undefined') return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));

            return {
                props: {
                    data: {
                        support
                    }
                }
            }
        } catch (e) {
            if (e instanceof BackendError) {
                if (e?.status === 404) return redirect();
            }
            throw e;
        }
    } else {
        if (!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
        return {
            props: {
                data: {}
            }
        }
    }
})

function getLabel(status: string) {
    const color = status === 'close' ? 'error' : status === 'answered' ? 'primary' : 'default'
    return <Label variant='filled' color={color}>{status}</Label>
}

export default function SupportPage({ data: { support: supportServer } }: IPages<ISupportPage>) {
    const router = useRouter();
    const { ready, user } = useSelector(s => ({ user: s.user, ready: s.appToken !== undefined }))
    const slug = router.query?.slug;
    const mdDown = useResponsive('down', 'md');
    const anchorRef = React.useRef(null);
    const [img, setImg] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState(() => supportServer ? `${supportServer.subject} - Support` : 'Support');
    const { data: supports, size, isLoadingMore, setSize, mutate } = useSWRPagination<PaginationResponse<ISupportRoom>>(`/v2/support`);
    const [dataChat, setDataChat] = React.useState(supportServer);
    const is432 = useResponsive('down', 432);
    const setNotif = useNotification();
    const { put } = useAPI();
    const [dialog, setDialog] = React.useState(false)

    const navbar = React.useMemo(() => {
        if (!supports) return [];
        return supports.data.map(s => {
            return {
                primary: <EllipsisTypography ellipsis={1} sx={{ mb: 0.5 }}>{s.subject}</EllipsisTypography>,
                secondary: getLabel(s.status),
                avatar: s.user?.picture ? <Image src={`${s.user.picture}&watermark=no&size=40`} alt={s.ticket.name} /> : s.ticket.name,
                link: `/support/${s.id}`
            }
        })
    }, [supports])

    const isActive = React.useCallback((item: INavbarChat) => {
        const linkUrl = new URL(Router.asPath, portalUrl())
        const itemUrl = new URL(item.link, portalUrl());

        return new RegExp((itemUrl.pathname || '/'), 'i').test(linkUrl.pathname || '/')
    }, [])

    const selected = React.useMemo(() => {
        if (supports) return supports?.data?.find(s => s.id === slug?.[0])
        else if (supportServer) return supportServer;
        return undefined;
    }, [supports, slug, supportServer])

    const handleLoadmore = React.useCallback(() => {
        setSize(size + 1);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [size]);

    React.useEffect(() => {
        if (selected) setTitle(`${selected.subject} - Support`);
        else {
            setTitle("Support");
            setOpen(false);
        }
        if (selected) {
            setDataChat(selected)
        }
    }, [selected])

    const handleOpenOptions = React.useCallback(() => {
        setOpen(true);
    }, []);

    const handleRemoveImage = React.useCallback(() => {
        setImg(null);
    }, [])

    const handleCloseSupport = React.useCallback(async () => {
        if (!selected) return;
        try {
            await put(`/v2/support/${selected.id}`, {}, undefined, { success_notif: false });
            setNotif("This ticket is closed. You may reply to this ticket to reopen it.", false);
            mutate();
        } catch (e) {
            if (e instanceof ApiError) setNotif(e.message, true)
        }
    }, [put, setNotif, mutate, selected])

    const handleCloseOptions = React.useCallback((value?: 'detail' | 'close') => () => {
        if (value) {
            if (value === 'close') handleCloseSupport();
            if (value === 'detail') setDialog(true)
        }
        setOpen(false);
    }, [handleCloseSupport]);

    return (
        <Pages title={title} noIndex withoutShowTop canonical={`/support${typeof slug?.[0] === 'string' ? `/${slug?.[0]}` : ''}`}>
            {ready && (
                <Box display={{ xs: 'block', md: 'flex' }} minHeight='100%'>
                    <NavbarChat title={is432 ? false : "Support"}>
                        {selected && (
                            <>
                                <Fade in={img !== null}>
                                    <Tooltip title="Remove image">
                                        <IconButtonActive onClick={handleRemoveImage}>
                                            <NoPhotography />
                                        </IconButtonActive>
                                    </Tooltip>
                                </Fade>
                                <Tooltip title="Support Options">
                                    <IconButtonActive ref={anchorRef} open={open} onClick={handleOpenOptions}>
                                        <MoreVert />
                                    </IconButtonActive>
                                </Tooltip>
                            </>
                        )}
                    </NavbarChat>
                    <Slide in={(selected === undefined && mdDown) || !mdDown} direction='right'>
                        <SidebarChat title={is432 ? false : "Support"} active={isActive} navbar={navbar} linkProps={{ shallow: true }}>
                            <Stack alignItems='center' justifyContent='center' width="100%" px={2} mt={4}>
                                {isLoadingMore ? (
                                    <Circular />
                                ) : (supports && supports.can_load) ? (
                                    <Button outlined color='inherit' sx={{ width: '100%' }} onClick={handleLoadmore}>Load more</Button>
                                ) : null}
                            </Stack>
                        </SidebarChat>
                    </Slide>
                    <Container maxWidth={false} sx={{ pt: `${NAVBAR_HEIGHT}px`, pl: '0!important', pr: '0!important', pb: '0!important', position: 'relative' }}>
                        <Box>
                            <Fade in={!selected} {...mdDown ? { timeout: { enter: 2000 } } : {}}>
                                <Stack position='absolute' justifyContent='center' height={`calc(100vh - ${NAVBAR_HEIGHT + 48 + 58}px)`} width='95%'>
                                    <Typography>Please select a support messages to start messaging</Typography>
                                </Stack>
                            </Fade>
                            <Fade in={Boolean(selected)} onExited={() => setDataChat(undefined)}>
                                <Box position='relative'>
                                    {dataChat && <ChatComp mutateRoom={mutate} img={img} setImg={setImg} selected={dataChat} user={user} />}
                                </Box>
                            </Fade>
                        </Box>
                    </Container>
                </Box>
            )}
            <Portal>
                <MenuPopover open={open} onClose={handleCloseOptions()} anchorEl={anchorRef.current}>
                    <Box sx={{ py: 1 }}>
                        <MenuItem
                            key={'detail'}
                            onClick={handleCloseOptions('detail')}
                            sx={{ py: 1, px: 2.5, mb: '0!important' }}
                        >
                            Support Detail
                        </MenuItem>
                        <MenuItem
                            key={'close'}
                            disabled={selected?.status === 'close'}
                            onClick={handleCloseOptions('close')}
                            sx={{ py: 1, px: 2.5, mb: '0!important' }}
                        >
                            Close
                        </MenuItem>
                    </Box>
                </MenuPopover>
            </Portal>
            <Dialog open={dialog && selected !== undefined} handleClose={() => setDialog(false)} title="Support Detail">
                <Scrollbar>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Subject</TableCell>
                                <TableCell>{selected?.subject}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>{selected?.ticket?.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Email</TableCell>
                                <TableCell>{selected?.ticket?.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{getLabel(selected?.status || "")}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Scrollbar>
            </Dialog>
        </Pages>
    )
}

type ChatCompProps = {
    selected: ISupportRoom
    user: State['user']
    img: string | null
    setImg(img: string | null): void
    mutateRoom: KeyedMutator<any>
}
function ChatComp({ selected, img, setImg, mutateRoom }: ChatCompProps) {
    const { data, error, size, setSize, mutate, isLoadingMore, isLoading } = useSWRPagination<PaginationResponse<IMessages>>(`/v2/support/${selected.id_number}`)
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const fileRef = React.useRef<File>();
    const inputEl = React.useRef<HTMLInputElement>(null);
    const inputMessageEl = React.useRef<HTMLTextAreaElement>(null);
    const [hover, setHover] = React.useState(false)
    const { post } = useAPI();
    const savedSelected = React.useRef<ISupportRoom>();
    const [showClose, setShowClose] = React.useState(false);

    const setNotif = useNotification();

    const handleLoadmore = React.useCallback(() => {
        setSize(size + 1);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [size]);

    React.useEffect(() => {
        if (selected.id !== savedSelected.current?.id) {
            savedSelected.current = selected;
            setMessage("");
        }
        if (selected.status === 'close') setShowClose(true);
        else setShowClose(false)
    }, [selected])

    React.useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ left: 0, top: document.body.scrollHeight })
        }, 1000);
    }, [isLoading, selected])

    React.useEffect(() => {
        if (img === null) fileRef.current = undefined;
    }, [img]);

    const handleImageChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>) => {
        const file = 'dataTransfer' in e ? e?.dataTransfer?.files?.[0] : e?.target?.files?.[0]
        if (file) {
            if (file.size > 5242880) setNotif("Maximum file size is 5 MB!", true);
            if (file.type.match("image/*")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (typeof e.target?.result === 'string') {
                        setImg(e.target.result)
                        fileRef.current = file;
                    }
                };
                reader.readAsDataURL(file);
            }
            else setNotif("Only support images", true);
        }
        if (inputEl.current) inputEl.current.value = '';
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [setNotif])

    const handleDrag = React.useCallback((enter: boolean) => (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        if (loading) return;
        if (enter) {
            setHover(true)
        } else {
            setHover(false)
        }
    }, [loading])

    const handleMessageChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }, [])

    const handleDrop = React.useCallback((e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHover(false);
        if (loading) return;
        handleImageChange(e);
    }, [loading, handleImageChange])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleSend = React.useCallback(submitForm(async () => {
        try {
            if (!fileRef.current && message?.match(/\S/) === null) return setNotif("Messages cannot be empty", true);
            setLoading(true);
            const form = new FormData();
            form.append('message', message);
            if (fileRef.current) form.append('image', fileRef.current, fileRef.current.name);

            await post<IMessages>(`/v2/support/${selected.id}`, form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }, { success_notif: false });
            mutate();
            setMessage("");
            setImg(null)
            fileRef.current = undefined;
            if (selected.status !== 'customer reply') mutateRoom()
            setTimeout(() => {
                window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' })
                setLoading(false)
            }, 500)
        } catch (e) {
            if (e instanceof ApiError) setNotif(e.message, true);
            setLoading(false)
            setTimeout(() => inputMessageEl.current?.focus(), 500);
        }
    }), [message, setNotif, post, mutate, selected, mutateRoom])

    const handleKeyPress = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e?.shiftKey && !isMobile) {
            if (/\S+/.test(message)) {
                e.preventDefault();
                handleSend();
            }
        }
    }, [message, handleSend])

    return (
        <>
            <Fade in={showClose}>
                <Box zIndex={1} position='sticky' left={0} top={NAVBAR_HEIGHT} width='100%'>
                    <Stack direction='row' bgcolor='error.main' px={2} py={1}>
                        <Box flexGrow={1}><Typography>This ticket is closed. You may reply to this ticket to reopen it.</Typography></Box>
                        <IconButton onClick={() => setShowClose(false)}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>
            </Fade>
            <Box position='relative' height='100%'
                onDragEnter={handleDrag(true)}
            >
                <Box minHeight={`calc(100vh - ${NAVBAR_HEIGHT + 1}px)`} sx={{ overflowY: 'auto' }}>
                    <SWRPages loading={!data && !error}>
                        {data && data?.data?.length > 0 ? (
                            <Stack data-test="ul" py={2} px={{ xs: 2, lg: 4 }} direction='column-reverse' alignItems='unset' sx={{
                                "& > div": {
                                    mb: 3,
                                    ":first-of-type": {
                                        mb: 0
                                    },
                                    position: 'relative'
                                }
                            }}>
                                {data?.data?.map((d, i) => (
                                    <MessageComp key={`messages-${d.id}`} data={d} prev={data?.data?.[i - 1]} />
                                ))}
                                {!data.can_load ? (
                                    <Box key='reach-end' textAlign='center'>
                                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>No more messages</Typography>
                                    </Box>
                                ) : (
                                    <Box key='load-more' textAlign='center'>
                                        <Button outlined color='inherit' onClick={handleLoadmore}>Load more</Button>
                                    </Box>
                                )}
                                {isLoadingMore && (
                                    <BoxPagination loading minHeight={55} />
                                )}
                            </Stack>
                        ) : (
                            <BoxPagination>
                                <Typography>No messages</Typography>
                            </BoxPagination>
                        )}
                    </SWRPages>
                </Box>
                <Fade in={hover}>
                    <Stack justifyContent='center' position='fixed' top={0} left={{ xs: 0, md: 100, lg: DRAWER_WIDTH / 2 }} width='100%' height='100%' bgcolor={alpha('#000000', 0.6)}
                        onDragLeave={handleDrag(false)}
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                    >
                        <Typography variant='h4' sx={{ color: '#fff' }}>Drop your images now</Typography>
                    </Stack>
                </Fade>
                <Fade in={img !== null}>
                    <Stack justifyContent='center' position='fixed' top={NAVBAR_HEIGHT} left={{ xs: 0, md: 100, lg: DRAWER_WIDTH / 2 }} width='100%' height='calc(100% - 80px)' bgcolor={alpha('#000000', 0.6)}>
                        {img && <Image src={img} sx={{ maxWidth: 400, objectFit: 'contain' }} alt='Uploaded image' />}
                    </Stack>
                </Fade>
            </Box>
            <Box zIndex={1} position='sticky' left={0} bottom={0} width='100%'>
                <form onSubmit={handleSend}>
                    <Box p={2} bgcolor='background.default' position='relative'>
                        <input ref={inputEl} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} disabled={loading} />
                        <Textarea
                            value={message}
                            placeholder={img ? "Enter caption..." : "Type a message..."}
                            onChange={handleMessageChange}
                            onDrop={handleDrop}
                            fullWidth
                            disabled={loading}
                            inputRef={inputMessageEl}
                            multiline
                            minRows={1}
                            maxRows={3}
                            onKeyDown={handleKeyPress}
                            required
                            InputProps={{
                                sx: {
                                    pr: 7
                                }
                            }}
                        />
                        <Stack sx={{ position: 'absolute', right: 20, top: 25 }} direction='row' spacing={1}>
                            <Fade in={img === null && message.length === 0}>
                                <Tooltip title="Add image">
                                    <IconButton disabled={loading} onClick={() => inputEl.current?.click()}>
                                        <AddAPhoto />
                                    </IconButton>
                                </Tooltip>
                            </Fade>
                            <Tooltip title="Send (Enter)">
                                <IconButton color='primary' disabled={loading} type='submit'>
                                    {loading ? <Circular size={24} thickness={7} /> : <Send />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </form>
            </Box>
        </>
    )
}

type MessageCompProps = {
    data: IMessages
    prev?: IMessages
}
function MessageComp({ data: d, prev }: MessageCompProps) {
    const anchorRef = React.useRef();
    const [open, setOpen] = React.useState(false);
    const dayjs = getDayJs(d.timestamp);
    const setNotif = useNotification();

    const handleOpenOptions = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setOpen(true);
    }, []);

    const handleCloseOptions = React.useCallback((value?: 'copy') => () => {
        if (value === 'copy') {
            if (d.message) {
                copyTextBrowser(d.message).then(() => {
                    setNotif("Text copied", 'default')
                })
            }
        }
        setOpen(false);
    }, [d, setNotif]);

    return (
        <React.Fragment key={`message-${d.id}`}>
            <Box data-test="li" sx={{
                display: 'block',
                ...(d.from !== 1 ? {
                    flexDirection: 'row-reverse'
                } : {

                })
            }}>
                <Box data-test='chat' key='messages' sx={{
                    flex: 1,
                    ...(d.from !== 1 ? {
                        display: 'flex',
                        justifyContent: 'flex-end'
                    } : {})
                }}>
                    <Box data-test='chatP' sx={{
                        position: 'relative',
                        mb: 1,
                        ...(d.from === 1 ? {
                            mr: '15%',
                            ":first-of-type": {
                                "::after": {
                                    top: 0,
                                    left: -11,
                                    content: '""',
                                    position: 'absolute',
                                    borderBottom: '17px solid transparent',
                                    borderRight: t => `12px solid ${t.palette.background.paper}`
                                },
                                "& .chatSpan": {
                                    borderTopLeftRadius: 0
                                }
                            }
                        } : {
                            ml: '15%',
                            ":first-of-type": {
                                "::after": {
                                    top: 0,
                                    right: -11,
                                    content: '""',
                                    position: 'absolute',
                                    borderBottom: '17px solid transparent',
                                    borderLeft: t => `12px solid ${t.palette.primary.darker}`
                                },
                                "& .chatSpan": {
                                    borderTopRightRadius: 0
                                }
                            }
                        })
                    }}>
                        <Box data-test='chatSpan' className='chatSpan' sx={{
                            userSelect: 'none',
                            cursor: 'pointer',
                            minWidth: 150,
                            display: 'inline-block',
                            p: 1,
                            px: 2,
                            borderRadius: 1,
                            wordBreak: 'break-word',
                            ...(d.from === 1 ? {
                                bgcolor: 'background.paper',
                            } : {
                                bgcolor: 'primary.darker',
                                color: '#fff'
                            })
                        }}
                            ref={anchorRef}
                            onContextMenu={handleOpenOptions}
                        >
                            {d?.image && (
                                <Image fancybox dataFancybox="chat" src={`${d.image}&size=200`} dataSrc={`${d.image}&watermark=no`} webp sx={{ maxWidth: 200, maxHeight: 200, mb: 1 }} alt={d.message || undefined} />
                            )}
                            <Markdown sx={{ mb: 1 }} source={d.message || ""} skipHtml />

                            <Box data-test='info' sx={{
                                display: 'flex',
                                alignItems: 'center',
                                "& svg": {
                                    mr: '.25rem',
                                    fontSize: 13
                                },
                                "& .read": {
                                    color: '#33b6f0 !important',
                                },
                                color: 'text.disabled'
                            }}>
                                <Typography variant='caption' sx={{ color: 'text.disabled' }}>{dayjs.pn_format('time')}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            {(typeof prev !== 'undefined' && dayjs.isSame(prev?.timestamp, 'day')) && (
                <Box key='time' textAlign='center'>
                    <Typography variant='caption' sx={{ color: 'text.disabled' }}>{dayjs.pn_format("fulldate")}</Typography>
                </Box>
            )}
            <Portal>
                <MenuPopover open={open} onClose={handleCloseOptions()} anchorEl={anchorRef.current}>
                    <Box sx={{ py: 1 }}>
                        <MenuItem
                            key={'copy'}
                            onClick={handleCloseOptions('copy')}
                            sx={{ py: 1, px: 2.5, mb: '0!important' }}
                        >
                            Copy
                        </MenuItem>
                    </Box>
                </MenuPopover>
            </Portal>
        </React.Fragment>
    )
}