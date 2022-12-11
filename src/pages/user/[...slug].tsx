import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { BlogPagination } from "@model/pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { adddesc, ucwords } from "@portalnesia/utils";
import wrapper, { BackendError, useSelector } from "@redux/store";
import { IPages } from "@type/general";
import Router, { useRouter } from "next/router";
import React from "react";
import { accountUrl, getDayJs, href, staticUrl } from "@utils/main";
import type { IMe, UserDetail } from "@model/user";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@design/components/Link";
import { styled } from "@mui/material/styles";
import Image from "@comp/Image";
import Avatar from "@design/components/Avatar";
import Button from "@comp/Button";
import Stack from "@mui/material/Stack";
import { Span } from "@design/components/Dom";
import Iconify from "@design/components/Iconify";
import Tooltip from "@mui/material/Tooltip";
import { BoxPagination, usePagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import type { ChordPagination } from "@model/chord";
import type { TwibbonPagination } from "@model/twibbon";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";
import IconButton from "@mui/material/IconButton";
import { AccountCircle, Check, Clear, MoreVert, QrCode2 } from "@mui/icons-material";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import ButtonBase from "@mui/material/ButtonBase";
import { QuizPagination } from "@model/quiz";
import { CustomTab, CustomTabs } from "@design/components/Tab";

const MenuPopover = dynamic(()=>import("@design/components/MenuPopover"));
const ListItemIcon = dynamic(()=>import("@mui/material/ListItemIcon"));
const Card = dynamic(()=>import("@mui/material/Card"));
const CardActions = dynamic(()=>import("@mui/material/CardActions"));
const CardContent = dynamic(()=>import("@mui/material/CardContent"));
const CardHeader = dynamic(()=>import("@mui/material/CardHeader"));
const Dialog = dynamic(()=>import('@design/components/Dialog'))
const Backdrop = dynamic(()=>import('@design/components/Backdrop'));
const CustomCard = dynamic(()=>import("@design/components/Card"));
const Pagination = dynamic(()=>import("@mui/material/Pagination"));

type IData = UserDetail & ({
    chord: ChordPagination[]
    twibbon: TwibbonPagination[]
    blog: BlogPagination[]
    // quiz
})
export const getServerSideProps = wrapper<IData>(async({params,fetchAPI,redirect,session})=>{
    const username = params?.slug?.[0];
    const action = params?.slug?.[1];
    if(typeof username !== 'string') return redirect();

    if(typeof action === "string" && !['blog','chord','followers','following','friend-request','quiz','twibbon'].includes(action)) return redirect();

    try {
        const user: IData = await fetchAPI<IData>(`/v2/user/${username}`);
        const isMe = Boolean(session && user?.id === session?.user?.id);
        if(action === 'friend-request' && (!isMe || !session?.user?.private)) return redirect();

        const desc = adddesc(user.about);
        const image = user.picture ? staticUrl(`img/content?image=${encodeURIComponent(user.picture)}`) : undefined;
        let title: string = "";
        if(typeof action === 'string') {
            if(action === 'friend-request') title = 'Friend Requests - ';
            else {
                title = `${ucwords(action)} - `;
            }
        }
        title += `${user.name} (@${user.username})`;

        return {
            props:{
                data:user,
                meta:{
                    title,
                    desc,
                    image
                }
            }
        }

    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})

const tabArr = [{
    label:"Overview",
    link:""
},{
    label:"Chord",
    link:"/chord"
},{
    label:"Blog",
    link:"/blog"
},{
    label:"Quiz",
    link:"/quiz"
},{
    label:"Twibbon",
    link:"/twibbon"
}]

// TODO - QUIZ
export default function UserPages({data:userData,meta}: IPages<IData>) {
    const router = useRouter();
    const username = router?.query?.slug?.[0];
    const action = router?.query?.slug?.[1];
    const user = useSelector(s=>s.user);
    const {data,mutate} = useSWR<IData>(`/v2/user/${username}`,{fallbackData:userData});
    const isMe = React.useMemo(()=>Boolean(user && data && user?.id === data?.id),[user,data]);
    const tabValue = React.useMemo(()=>{
        if(typeof action !== 'string') return 0;
        if(action === 'friend-request') return tabArr.length
        const index = tabArr.findIndex(c=>c.link.indexOf(action) > 0);
        return index;
    },[action])

    const title = React.useMemo(()=>{
        let title: string = "";
        if(typeof action === 'string') {
            if(action === 'friend-request') title = 'Friend Requests - ';
            else {
                title = `${ucwords(action)} - `;
            }
        }
        title += `${data?.name} (@${data?.username})`;
        return title;
    },[data,action]);

    const [loading,setLoading] = React.useState(false)
    const [showQr,setShowQr] = React.useState(false)
    const setNotif = useNotification();
    const {post,del} = useAPI()

    const handleFollow = React.useCallback(async()=>{
        if(!user) {
            setNotif(`Login to continue!`,true);
            setTimeout(()=>{
                window.location.href=accountUrl(`/login?redirect=${encodeURIComponent(href(Router.asPath))}`)
            },1000)
        } else {
            try {
                setLoading(true)
                if(data?.isFollowing || data?.isFollowPending) {
                    await del(`/v2/user/${user?.username}/following/${data?.username}`)
                } else {
                    await post(`/v2/user/${user?.username}/following/${data?.username}`,{})
                }
                mutate();
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true);
            } finally {
                setLoading(false)
            }
        }
    },[data,user,post,setNotif,del])

    const downloadQR=React.useCallback(()=>{
        window?.open(staticUrl(`/download_qr/user/${data?.username}?token=${data?.token_qr}`))
        setShowQr(false)
    },[data])

    return (
        <Pages title={title} desc={meta?.desc} image={meta?.image} canonical={`/user/${username}`}>
            <DefaultLayout maxWidth={false} withoutContainer>
                <Box sx={{py:2}} position='relative'>
                    <Box maxWidth={{xs:'unset',lg:1200}} mx='auto'>
                        <Grid container>
                            <Grid item xs={12} md={4}>
                                <Box display={{xs:'none',md:'block'}} position='absolute' top={0} left={0} width='100%' height={57} borderBottom={theme=>`1px solid ${theme.palette.divider}`} />
                            
                                <Box display='flex' justifyContent={{md:"center",xs:'flex-start'}} px={{xs:2,md:3}}>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={{vertical:"bottom",horizontal:"right"}}
                                        badgeContent={
                                            <Tooltip title="QR Code">
                                                <ButtonBase sx={{borderRadius:'50%',bgcolor:'background.paper'}} onClick={()=>setShowQr(true)}>
                                                    <Avatar
                                                        alt={`${data?.name}'s QR Code`}
                                                        sx={{
                                                            width:47,
                                                            height:47,
                                                            cursor:'pointer',
                                                            color:'customColor.link',
                                                            bgcolor:'background.paper',
                                                            ":hover":{
                                                                bgcolor:'action.hover'
                                                            }
                                                        }}
                                                    ><QrCode2 sx={{width:30,height:30}} /></Avatar>
                                                </ButtonBase>
                                            </Tooltip>
                                        }
                                    >
                                        <Avatar sx={{width:{xs:100,md:200,lg:250},height:{xs:100,md:200,lg:250},fontSize:{xs:25,md:50}}}>
                                            {!isMe && data?.private && !data?.isFollowing ? data?.name : data?.picture ? <Image src={`${data?.picture}&size=300&watermark=no`} dataSrc={`${data?.picture}&watermark=no`} fancybox={!data?.private || (data?.private && data?.isFollowing)} dataFancybox="profile" alt={data?.username} /> : data?.name}
                                        </Avatar>
                                    </Badge>
                                </Box>
                                <Box px={{xs:2,md:3}} mt={2} mb={5}>
                                    <Box mb={2}>
                                        <Stack direction='row' spacing={1}>
                                            <Typography variant='h4' component='h4'>{data?.name}</Typography>
                                            {data?.verify && (
                                                <Tooltip title="Verified">
                                                    <Box pt={1}>
                                                        <Iconify icon='material-symbols:verified-rounded' color="customColor.link" />
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                        <Typography sx={{color:'text.disabled'}}>{data?.username}</Typography>
                                    </Box>
                                    <Stack direction='column' alignItems='flex-start' pr={2} mb={2} spacing={1}>
                                        {data?.birthday && (
                                            <Stack direction='row' spacing={1}>
                                                <Iconify icon='fa-solid:birthday-cake' />
                                                <Typography>{getDayJs(data?.birthday).pn_format('fulldate')}</Typography>
                                            </Stack>
                                        )}
                                        {data?.facebook && (
                                            <a href={data?.facebook?.url} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='uil:facebook' />
                                                    <Typography>{data?.facebook?.label}</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                        {data?.twitter && (
                                            <a href={href(data?.twitter?.url)} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='mdi:twitter' />
                                                    <Typography>{data?.twitter?.label}</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                        {data?.telegram && (
                                            <a href={data?.telegram?.url} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='ic:sharp-telegram' />
                                                    <Typography>{data?.telegram?.label}</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                        {data?.website && (
                                            <a href={data?.website?.url} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='ph:globe' />
                                                    <Typography>{data?.website?.label}</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                    </Stack>
                                    <Box mb={2}>
                                        {isMe ? (
                                            <Button sx={{width:'100%'}} outlined color='inherit' component="a" href={accountUrl('account')}>Edit profile</Button>
                                        ) : (
                                            <Button sx={{width:'100%'}} outlined color='inherit' disabled={loading} loading={loading} onClick={handleFollow}>{data?.isFollowing || data?.isFollowPending ? `Unfollow` : 'Follow'}</Button>
                                        )}
                                        
                                    </Box>
                                    <Box>
                                        <Stack direction='row' spacing={1}>
                                            <Link href={`/user/${data?.username}/followers`} shallow scroll sx={{":hover":{color:'customColor.link'}}}><Span>{`${data?.follower_count} followers`}</Span></Link>
                                            <Span>·</Span>
                                            <Link href={`/user/${data?.username}/following`} shallow scroll sx={{":hover":{color:'customColor.link'}}}><Span>{`${data?.following_count} following`}</Span></Link>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={8} sx={{position:'relative'}}>
                                <Box id='user-content'>
                                    <Box borderBottom={theme=>`1px solid ${theme.palette.divider}`}>
                                        <CustomTabs variant='scrollable' value={tabValue > -1 ? tabValue : undefined} sx={{px:1}}>
                                            {tabArr.map(t=>(
                                                <Link key={t.label} href={`/user/${username}${t.link}`} passHref legacyBehavior shallow scroll><CustomTab sx={{py:1}} label={t.label} component='a' /></Link>
                                            ))}
                                            {(isMe && data?.private) && (
                                                <Link key={"Friend Request"} href={`/user/${username}/friend-request`} passHref legacyBehavior shallow scroll><CustomTab sx={{py:1}} label='Friend Request' component='a' /></Link>
                                            )}
                                        </CustomTabs>
                                    </Box>
                                    <Box mt={3} px={{xs:2,md:3}} mb={5}>
                                        {(!isMe && data?.private && !data?.isFollowing) ? (
                                            <BoxPagination minHeight={300}>
                                                <Typography variant="h5">This account is private</Typography>
                                                <Typography>Follow @{data.username} to see this account</Typography>
                                                {data?.isFollowPending && (
                                                    <>
                                                        <Typography variant="h5" sx={{mt:5}}>Your following status is pending</Typography>
                                                    </>
                                                )}
                                            </BoxPagination>
                                        ) : action === "followers" || action === "following" || action === "friend-request" ? (
                                            <FollowPage user={user} type={action} data={data} mutate={mutate} />
                                        ) : tabValue === 0 ? (
                                            <OverviewPages data={data} user={user} />
                                        ) : tabValue === 1 ? (
                                            <ChordPages data={data} />
                                        ) : tabValue === 2 ? (
                                            <BlogPages data={data} />
                                        ) : tabValue === 3 ? (
                                            <QuizPages data={data} />
                                        ) : tabValue === 4 ? (
                                            <TwibbonPages data={data} />
                                        ) : null}
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </DefaultLayout>
            <Dialog open={showQr} handleClose={()=>setShowQr(false)} title="QR Code" maxWidth='sm'
                actions={
                    <Button onClick={downloadQR} icon='download'>Download</Button>
                }
            >
                <Image src={staticUrl(`/qr/user/${data?.username}`)} sx={{width:'100%'}} alt={`${data?.name}'s QR Code`} />
            </Dialog>
        </Pages>
    )
}
type SubcomProps = {
    user?: IMe|null
    data?: IData
}
const CardOutline = styled(Card)(({theme})=>({
    backgroundColor:theme.palette.background.default
}))

function OverviewPages({data}: SubcomProps) {
    return (
        <Stack alignItems='flex-start' width='100%' spacing={5}>
            {data?.about && data?.about?.length > 0 ? (
                <CardOutline variant='outlined' elevation={0} sx={{width:'100%'}}>
                    <CardContent>
                        {data?.about?.split("\n")?.map(t=>(
                            <Typography key={t}>{t}</Typography>
                        ))}
                    </CardContent>
                </CardOutline>
            ) : null}

            <Box key='chord' width='100%'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={1} width='100%'>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h6'>{`Chord by ${data?.name}`}</Typography>
                        {data && data?.chord?.length > 0 && <Link href={`/user/${data?.username}/chord`} passHref legacyBehavior shallow scroll><Button text color='inherit' component='a'>More</Button></Link>}
                    </Stack>
                </Box>
                <Grid container spacing={2}>
                    {(data?.chord?.length||0) > 0 ? data?.chord?.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={`${d.artist} - ${d.title}`} />
                        </Grid>
                    )) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Box key='blog' width='100%'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={1} width='100%'>
                 <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h6'>{`Blog by ${data?.name}`}</Typography>
                        {data && data?.blog?.length > 0 && <Link href={`/user/${data?.username}/blog`} passHref legacyBehavior shallow scroll><Button text color='inherit' component='a'>More</Button></Link>}
                    </Stack>
                </Box>
                <Grid container spacing={2}>
                    {(data?.blog?.length||0) > 0 ? data?.blog?.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} />
                        </Grid>
                    )) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                </Grid>
            </Box>

            <Box key='twibbon' width='100%'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={1} width='100%'>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h6'>{`Twibbon by ${data?.name}`}</Typography>
                        {data && data?.twibbon?.length > 0 && <Link href={`/user/${data?.username}/twibbon`} passHref legacyBehavior shallow scroll><Button text color='inherit' component='a'>More</Button></Link>}
                    </Stack>
                </Box>
                <Grid container spacing={2}>
                    {(data?.twibbon?.length||0) > 0 ? data?.twibbon?.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} ellipsis={1} />
                        </Grid>
                    )) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Stack>
    )
}

function ChordPages({data:user}: SubcomProps){
    const [page,setPage] = usePagination(1);
    const {data,error} = useSWR<PaginationResponse<ChordPagination>>(user ? `/v2/user/${user?.username}/chord?page=${page}` : null);
    return (
        <Box>
            <SWRPages loading={!data&&!error} error={error}>
                <Grid container spacing={2}>
                    {data && data?.data?.length > 0 ? (data.data.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={`${d.artist} - ${d.title}`} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
        </Box>
    )
}

function BlogPages({data:user}: SubcomProps){
    const [page,setPage] = usePagination(1);
    const {data,error} = useSWR<PaginationResponse<BlogPagination>>(user ? `/v2/user/${user?.username}/blog?page=${page}` : null);
    return (
        <Box>
            <SWRPages loading={!data&&!error} error={error}>
                <Grid container spacing={2}>
                    {data && data?.data?.length > 0 ? (data.data.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
        </Box>
    )
}

function QuizPages({data:user}: SubcomProps){
    const [page,setPage] = usePagination(1);
    const {data,error} = useSWR<PaginationResponse<QuizPagination>>(user ? `/v2/user/${user?.username}/quiz?page=${page}` : null);
    return (
        <Box>
            <SWRPages loading={!data&&!error} error={error}>
                <Grid container spacing={2}>
                    {data && data?.data?.length > 0 ? (data.data.map(d=>(
                        <Grid key={d.id} item xs={12}>
                            <CustomCard link={href(d.link)} title={d.title} sx={{bgcolor:'background.default'}} variant='outlined' />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
        </Box>
    )
}

function TwibbonPages({data:user}: SubcomProps){
    const [page,setPage] = usePagination(1);
    const {data,error} = useSWR<PaginationResponse<TwibbonPagination>>(user ? `/v2/user/${user?.username}/twibbon?page=${page}` : null);
    return (
        <Box>
            <SWRPages loading={!data&&!error} error={error}>
                <Grid container spacing={2}>
                    {data && data?.data?.length > 0 ? (data.data.map(d=>(
                        <Grid key={d.slug} item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} ellipsis={1} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
        </Box>
    )
}

type IFollowResult = {
    isFollowPending: boolean;
    isFollower: boolean;
    isFollowing: boolean;
    id: number;
    name: string;
    username: string;
    picture: string | null;
    verify: boolean;
}
type IPendingFollowResult = {
    token: string;
    id: number;
    name: string;
    username: string;
    picture: string | null;
    verify: boolean;
}
type IFollowData = IFollowResult | IPendingFollowResult;

function FollowPage({user,data:dataUser,type,mutate:userMutate}: SubcomProps & ({type:'followers'|'following'|'friend-request',mutate:()=>void})) {
    const [page,setPage] = usePagination(1);
    const {data,error,mutate} = useSWR<PaginationResponse<IFollowData>>(dataUser ? `/v2/user/${dataUser?.username}/${type}?page=${page}&per_page=12` : null);

    const [loading,setLoading] = React.useState(false)
    const setNotif = useNotification();
    const {post,del} = useAPI()

    const handleFollow = React.useCallback((data: IFollowResult)=>async()=>{
        if(!user) {
            setNotif(`Login to continue!`,true);
            setTimeout(()=>{
                window.location.href=accountUrl(`/login?redirect=${encodeURIComponent(href(Router.asPath))}`)
            },1000)
        } else {
            try {
                setLoading(true)
                if(data?.isFollowing || data?.isFollowPending) {
                    await del(`/v2/user/${user?.username}/following/${data?.username}`)
                } else {
                    await post(`/v2/user/${user?.username}/following/${data?.username}`,{})
                }
                mutate();
                userMutate();
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true);
            } finally {
                setLoading(false)
            }
        }
    },[user,post,setNotif,del,mutate,userMutate])

    const handlePending=React.useCallback((data: IPendingFollowResult,isAccept: boolean)=>async()=>{
        if(!user) {
            setNotif(`Login to continue!`,true);
            setTimeout(()=>{
                window.location.href=accountUrl(`/login?redirect=${encodeURIComponent(href(Router.asPath))}`)
            },1000)
        } else {
            try {
                setLoading(true)
                if(!isAccept) {
                    await del(`/v2/user/${user?.username}/followers/pending/${data?.token}`)
                } else {
                    await post(`/v2/user/${user?.username}/followers/pending/${data?.token}`,{})
                }
                mutate();
                userMutate();
            } catch(e) {
                if(e instanceof ApiError) setNotif(e.message,true);
            } finally {
                setLoading(false)
            }
        }
    },[user,post,setNotif,mutate,del,userMutate])

    return (
        <Box>
            <SWRPages loading={!data&&!error} error={error}>
                <Grid container spacing={2}>
                    {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                        <Grid key={d.username} item xs={12} sm={6}>
                            <Card>
                                <CardHeader
                                    sx={{
                                        p:2
                                    }}
                                    title={d.name}
                                    subheader={`@${d.username}`}
                                    avatar={
                                        <Avatar aria-label={`${d.name}'s Photo Profile`}>
                                            {d.picture ? <Image src={`${d.picture}&size=40&watermark=no`} alt={`@${d.username}`} /> : d?.name}
                                        </Avatar>
                                    }
                                    action={
                                        <MenuButton user={user} data={d} onFollow={handleFollow} disabled={loading} />
                                    }
                                />
                                {'token' in d && (
                                    <CardActions>
                                        <Button sx={{width:'100%'}} endIcon={<Check />} onClick={handlePending(d,true)}>Accept</Button>
                                        <Button sx={{width:'100%'}} color='error' endIcon={<Clear />} onClick={handlePending(d,false)}>Decline</Button>
                                    </CardActions>
                                )}
                            </Card>
                        </Grid>
                    )) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
            <Backdrop open={loading} />
        </Box>
    )
}

type MenuButtonProps = {
    user: IMe|null|undefined
    data: IFollowResult | IPendingFollowResult;
    disabled?: boolean
    onFollow: (data: IFollowResult) => () => void
}
function MenuButton({data,disabled,onFollow,user}: MenuButtonProps) {
    const [open,setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleMenu = React.useCallback((open: boolean)=>()=>{
        setOpen(open);
    },[])

    const handleFollow = React.useCallback((data: IFollowResult)=>()=>{
        setOpen(false);
        onFollow(data)()
    },[onFollow])

    return (
        <>
            <IconButton
                disabled={disabled}
                onClick={handleMenu(true)}
                ref={anchorRef}
            >
                <MoreVert />
            </IconButton>
            <MenuPopover
                open={open}
                onClose={handleMenu(false)}
                anchorEl={anchorRef.current}
            >
                <Box sx={{ my: 1.5}}>
                    <Link href={`/user/${data.username}`} passHref legacyBehavior><MenuItem component='a' onClick={handleMenu(false)}><ListItemIcon><AccountCircle/></ListItemIcon> View Profile</MenuItem></Link>
                    {('isFollowing' in data && user && user.id !== data.id) && (
                        <>
                            <MenuItem onClick={handleFollow(data)}>
                                {data?.isFollowing || data?.isFollowPending ? (
                                    <ListItemIcon><Clear /></ListItemIcon>
                                ) : (
                                    <ListItemIcon><Check /></ListItemIcon>
                                )}
                                {data?.isFollowing || data?.isFollowPending ? "Unfollow" : "Follow"}
                            </MenuItem>
                        </>
                    )}
                </Box>
            </MenuPopover>
        </>
    )
}