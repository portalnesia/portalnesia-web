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
import { IMe, UserDetail } from "@model/user";
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { BoxPagination, usePagination } from "@design/components/Pagination";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import { ChordPagination } from "@model/chord";
import CustomCard from "@design/components/Card";
import Pagination from "@mui/material/Pagination";
import { TwibbonPagination } from "@model/twibbon";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";

const Dialog = dynamic(()=>import('@design/components/Dialog'))

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

const CustomTab = styled(Tab)<{component?: string}>(({theme})=>({
    borderRadius:5,
    minHeight: 35,
    '&:hover':{
        backgroundColor: theme.palette.action.hover
    }
}))
const CustomTabs = styled(Tabs)(()=>({
    minHeight:40,
    height:40,
    '& .MuiTabScrollButton-root':{
        height:35
    },
    '& .MuiTabs-indicator':{
        height:3
    }
    /*position:'absolute',
    left:0,
    top:0,
    width:'100%'*/
}))

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
        return index > -1 ? index : 0;
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

    return (
        <Pages title={title} desc={meta?.desc} image={meta?.image} canonical={`/user/${username}`}>
            <DefaultLayout maxWidth={false} withoutContainer>
                <Box sx={{py:2}} position='relative'>
                    <Box maxWidth={{xs:'unset',lg:1200}} mx='auto'>
                        <Grid container>
                            <Grid item xs={12} md={4}>
                                <Box display={{xs:'none',md:'block'}} position='absolute' top={0} left={0} width='100%' height={57} borderBottom={theme=>`1px solid ${theme.palette.divider}`} />
                            
                                <Box display='flex' justifyContent={{md:"center",xs:'flex-start'}} px={{xs:2,md:3}}>
                                    <Avatar sx={{width:{xs:100,md:200,lg:250},height:{xs:100,md:200,lg:250},fontSize:{xs:25,md:50}}}>
                                        {!isMe && data?.private && !data?.isFollowing ? data?.name : data?.picture ? <Image src={`${data?.picture}&size=300&watermark=no`} dataSrc={`${data?.picture}&watermark=no`} fancybox={!data?.private || (data?.private && data?.isFollowing)} dataFancybox="profile" alt={data?.username} /> : data?.name}
                                    </Avatar>
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
                                                <Typography>{getDayJs(data?.birthday).format('DD MMMM')}</Typography>
                                            </Stack>
                                        )}
                                        {data?.facebook && (
                                            <a href={data?.facebook} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='uil:facebook' />
                                                    <Typography>Facebook</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                        {data?.twitter && (
                                            <a href={data?.twitter} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='mdi:twitter' />
                                                    <Typography>Twitter</Typography>
                                                </Stack>
                                            </a>
                                        )}
                                        {data?.telegram && (
                                            <a href={data?.telegram} target='_blank' className="no-blank">
                                                <Stack direction='row' spacing={1}>
                                                    <Iconify icon='ic:sharp-telegram' />
                                                    <Typography>Telegram</Typography>
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
                                        <CustomTabs variant='scrollable' value={tabValue} sx={{px:1}}>
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
                                        ) : tabValue === 0 ? (
                                            <OverviewPages data={data} user={user} />
                                        ) : tabValue === 1 ? (
                                            <ChordPages data={data} />
                                        ) : tabValue === 2 ? (
                                            <BlogPages data={data} />
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
                        <Grid item xs={12} sm={6} lg={4}>
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
                        <Grid item xs={12} sm={6} lg={4}>
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
                        <Grid item xs={12} sm={6} lg={4}>
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
                        <Grid item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={`${d.artist} - ${d.title}`} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data && data?.data?.length > 0) && (
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
                        <Grid item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data && data?.data?.length > 0) && (
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
                        <Grid item xs={12} sm={6} lg={4}>
                            <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`} ellipsis={1} />
                        </Grid>
                    ))) : (
                        <Grid key={'no-data'} item xs={12}>
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        </Grid>
                    )}
                    {(data && data?.data?.length > 0) && (
                        <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                            <Pagination page={page} onChange={setPage} count={data?.total_page} />
                        </Grid>
                    )}
                </Grid>
            </SWRPages>
        </Box>
    )
}