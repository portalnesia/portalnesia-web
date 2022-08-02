import React from 'react'
import Header from 'portal/components/Header'
import Image from 'portal/components/Image'
import Avatar from 'portal/components/Avatar'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {connect} from 'react-redux';
import classNames from 'classnames';
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import {Markdown} from 'portal/components/Parser'
import {withStyles} from 'portal/components/styles';
import {styled} from '@mui/material/styles'
import {clean,toBlob,ucwords,adddesc} from '@portalnesia/utils'
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr';
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {isMobile} from 'react-device-detect'
import {ListItemIcon,Grid,Typography,Paper,IconButton,Menu,MenuItem,Tooltip,AppBar,Tabs,Tab,Divider,CircularProgress,Badge,Icon,
    Card,CardHeader,CardActionArea,CardContent, CardActions,TextField,Portal,SvgIcon} from '@mui/material'
import {
  LocalizationProvider,
  DatePicker,
} from '@mui/lab';
import AdapterDayJS from '@mui/lab/AdapterDayjs'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import SimpleMDE from 'portal/components/SimpleMDE'
import Link from 'next/link'
import {MoreVert as MoreVertIcon,MailOutline as MailOutlineIcon,AccountCircle as AccountCircleIcon,Edit as EditIcon,
    People as PeopleIcon,PeopleAlt as PeopleAltIcon,PermMedia as PermMediaIcon,Cake as CakeIcon,Autorenew,
    AddAPhoto as ImageIcon,GroupAdd as GroupAddIcon,Check as CheckIcon,Clear as ClearIcon,VerifiedUser,Facebook,Telegram,Twitter,Instagram,Delete} from '@mui/icons-material'
//import changePhotoProfile from 'portal/components/utils/ChangeProfile'
import Croppie from 'portal/components/Croppie'
import {useMousetrap,useBeforeUnload,useHotKeys} from 'portal/utils/useKeys'
import { SocialProfileJsonLd } from 'next-seo';
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import {marked} from 'marked'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Backdrop = dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper(async({pn,res,params})=>{
    const username=params.slug[0];
    if(params?.slug?.[1] && !['edit','followers','following','friend-request','media'].includes(params?.slug?.[1])) return db.redirect();

    const userData= await db.kata(`SELECT id,user_login,user_nama,gambar,biodata,verify,twitter,instagram FROM klekle_users WHERE user_login=? AND active='1' AND remove='0' AND suspend='0' LIMIT 1`,[username]);
    if(!userData) {
        return db.redirect();
    }
    const isMe=((pn.user?.user_login === userData[0].user_login)?true:false);

    if(params.slug[1] && params.slug[1]==='edit' && !isMe) {
        return db.redirect();
    }
    if(params.slug[1] && params.slug[1]==='friend-request' && !isMe && pn.user?.private === false) return db.redirect();
    
    const {biodata,gambar,user_nama,id,user_login,verify,instagram,twitter}=userData[0];
    const description=clean(marked.parse(biodata));
    const soc=[];
    const ig=instagram!==null && instagram?.length ? instagram : null;
    const tw=twitter!==null && twitter?.length ? twitter : null;
    if(ig!==null) soc.push(`https://instagram.com/${ig}`)
    if(tw!==null) soc.push(`https://twitter.com/${tw}`)
    const meta={
        id:id,
        image:gambar == null ? null : `${process.env.CONTENT_URL}/img/content?image=${encodeURIComponent(gambar)}`,
        title:params.slug[1] && params.slug[1]==='edit' ? 'Edit Profile' : (params.slug[1] && params.slug[1]==='friend-request' ? 'Friend Request' : `${user_nama} (@${user_login})${params.slug[1] ? ` - ${ucwords(params.slug[1])}` : ''}`),
        description:params.slug[1] && params.slug[1]==='edit' ? 'Edit Profile' : (params.slug[1] && params.slug[1]==='friend-request' ? 'Friend Request' : description),
        username:user_login,
        name:user_nama,
        verify:Boolean(verify),
        social:soc
    };
    if(params.slug[1]){
        switch(params.slug[1]){
            case 'followers':
                meta.title=`${user_nama}'s Followers`
                meta.description=`${user_nama}'s Followers`
                break;
            case 'following':
                meta.title=`${user_nama}'s Following`
                meta.description=`${user_nama}'s Following`
                break;
            case 'media':
                meta.title=`${user_nama}'s Media`
                meta.description=`${user_nama}'s Media`
                break;
        }
    }
    return {props:{meta:meta,slug:params.slug}}
})

const stylesHeader=theme=>({
    root:{
        width:'100%',
        height:360,
        display:'flex',
        overflow:'hidden',
        //boxShadow:'0px 4px 5px -2px rgba(0,0,0,0.2), 0px 7px 10px 1px rgba(0,0,0,0.14), 0px 2px 16px 1px rgba(0,0,0,0.12)',
        textAlign:'center',
        alignItems:'flex-end',
        borderRadius:2,
        backgroundSize:'cover',
        justifyContent:'center',
        backgroundColor:'#2196f3'
    },
    btnMore:{
        top:10,right:10,position:'absolute',
        color:theme.palette.common.white
    },
    container:{
        width:'100%',
        height:'100%',
        padding:'70px 24px 30px',
        //background:'rgba(236, 64, 122, 0.3)'
    },
    avatar:{
        border:theme.palette.common.white,
    },
    headerText:{
        color:theme.palette.common.white
    },
    title:{
        marginBottom:'1rem',
        lineHeight:1.2,
        fontSize:'1.25rem',
        fontWeight:500,
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        WebkitBoxOrient:'vertical',
        overflow:'hidden',
        WebkitLineClamp:2,
    },
    btnPrimary:{
        backgroundColor:theme.palette.primary.main
    },
    btnError:{
        backgroundColor:theme.palette.error.main,
        '&:hover':{
            backgroundColor:theme.palette.error.dark
        }
    },
    header:{
        marginTop:8,display:'flex',alignItems:'center',justifyContent:'center',
        '& svg':{
            color:'#fff'
        }
    }
})

const SmallAvatar = styled(Avatar)(({theme}) => ({
    '&.MuiAvatar-root': {
        width: '47px !important',
        height: '47px !important',
        cursor:'pointer !important',
        backgroundColor:`${theme.palette.background.paper} !important`,
        '&:hover':{
            background:`${theme.palette.grey[500]} !important`,
            '& span':{
                color: `${theme.palette.primary.main} !important`
            }
        },
        "& span":{
            color: `${theme.palette.text.primary} !important`,
            fontSize:'1.5em !important'
        }
    }
}))

const ProfilHeader=({classes,meta,user,editpage,onEditPicture,setBackdrop})=>{
    const router=useRouter();
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(false);
    const {post,del}=useAPI()
    const [dialog,setDialog]=React.useState(false);
    const [loading,setLoading]=React.useState(false)
    const {data,mutate}=useUser(meta.username);

    const {setNotif}=useNotif();

    const handleMenu = (event) => {
        setOpenMenu(true);
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setOpenMenu(false);
        setAnchorEl(null);
    };

    const handleFollow=async()=>{
        if(user===null) return setNotif("Login to continue",true);
        if(!loading ) {
            setLoading(true);
            try {
                if(data?.isFollowing || data?.isFolowPending) {
                    const [res] = await post(`/v1/user/${user?.user_login}/following/${data?.username}`);
                    mutate({
                        ...data,
                        isFollowing:res.following,
                        isFollowPending:res.pending
                    })
                } else {
                    const [res] = await del(`/v1/user/${user?.user_login}/following/${data?.username}`);
                    mutate({
                        ...data,
                        isFollowing:res.following,
                        isFollowPending:res.pending
                    })
                }
            } catch {

            } finally {
                setLoading(false)
            }
        }
    }

    const downloadQR=()=>{
        window?.open(`${process.env.CONTENT_URL}/download_qr/user/${meta.username}?token=${data?.token_qr}`)
        setDialog(false)
    }

    const editPhotoProfile=()=>{
        handleCloseMenu();
        onEditPicture()
    }

    const deletePhotoprofile=async()=>{
        handleCloseMenu();
        setBackdrop(true);
        try {
            if(process.env.NODE_ENV==='production') {
                await del(`/v1/user/${meta.username}`);
                window.location.reload();
            } else {
                console.log("DELETE USER PHOTO")
            }
        } catch {

        } finally {
            setBackdrop(false)
        }
    }

    const linkClick=(href,as)=>(e)=>{
        e.preventDefault();
        router.push(href,(as||href),{shallow:true});
        handleCloseMenu();
    }

    return (
        <div className={classes.root} style={{backgroundImage:`url("/material_bg.svg")`}}>
            {user?.user_login === meta.username && (
                <div className={classes.btnMore}>
                    <IconButton
                        aria-haspopup="true"
                        onClick={e=>handleMenu(e)}
                        color="inherit"
                        size="large">
                        <MoreVertIcon/>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={openMenu}
                        onClose={handleCloseMenu}
                    >
                        {editpage ? (
                            <div>
                                <MenuItem key='0' onClick={editPhotoProfile}><ListItemIcon><ImageIcon /></ListItemIcon> Edit Photo Profile</MenuItem>
                                <MenuItem key='1' onClick={deletePhotoprofile}><ListItemIcon><Delete /></ListItemIcon> Remove Photo Profile</MenuItem>
                                <MenuItem key='2' component='a' href={`/user/${user.user_login}`} onClick={linkClick('/user/[...slug]',`/user/${user.user_login}`)}><ListItemIcon><AccountCircleIcon /></ListItemIcon> View Profile</MenuItem>
                            </div>
                        ) : (
                            <div>
                                <MenuItem key='0' component='a' href={`/user/${user.user_login}/edit`} onClick={linkClick('/user/[...slug]',`/user/${user.user_login}/edit`)}><ListItemIcon><EditIcon /></ListItemIcon>Edit Profile</MenuItem>
                                {Boolean(user?.private) ? <MenuItem key='1' component='a' href={`/user/${user.user_login}/friend-request`} onClick={linkClick('/user/[...slug]',`/user/${user.user_login}/friend-request`)}><ListItemIcon><GroupAddIcon /></ListItemIcon> Friend Request</MenuItem> : null}
                            </div>
                        )}
                    </Menu>
                </div>
            )}
            <div className={classes.container}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                    badgeContent={<SmallAvatar alt={meta.username} onClick={()=>setDialog(true)}><Icon>qr_code_2</Icon></SmallAvatar>}
                >
                    <Avatar className={classes.avatar} alt={meta?.name} sx={{height:120,width:120}}>
                        {meta?.image!==null ? <Image fancybox dataSrc={meta?.image} src={`${meta?.image}&size=120&watermark=no`} width={120} height={120} alt={meta?.name} /> : meta?.name}
                    </Avatar>
                </Badge>
                <div className={classes.header}>
                    <Typography variant='h4' className={classes.headerText} style={{...(meta?.verify ? {marginRight:8} : {})}}>{meta.name}</Typography>
                    {meta?.verify && <Tooltip title="Verified"><VerifiedUser /></Tooltip>}
                </div>
                <Typography className={classes.headerText}>@{meta.username}</Typography>
                {user?.user_login !== meta.username && data && (
                    <div style={{display:'flex',justifyContent:'center',marginTop:15}}>
                        <Button tooltip={data?.isFollowing || data?.isFolowPending ? `Unfollow @${meta.username}` : `Follow @${meta.username}`} onClick={handleFollow} color={data?.isFollowing && !data?.isFollowPending ? 'secondary' : !data?.isFollowing && data?.isFollowPending ? 'grey' : 'primary'} sx={{mr:5}} disabled={loading} isloading={loading}>{data?.isFollowing && !data?.isFollowPending ? `Unfollow` : data?.isFollowPending ? `Pending` : `Follow`}</Button>
                        <Button tooltip={`Messages @${meta.username}`} color='grey' sx={{ml:5}} onClick={linkClick('/messages/[[...slug]]',`/messages/${meta.username}`)}><MailOutlineIcon/></Button>
                    </div>
                )}
                
                <Dialog open={dialog} maxWidth='sm' fullWidth scroll='body'>
                    <DialogTitle>QR Code</DialogTitle>
                    <DialogContent dividers>
                        <Image blured src={`${process.env.CONTENT_URL}/qr/user/${meta.username}`} style={{width:'100%'}} alt={`${meta.name}'s QR Code`} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={downloadQR} icon='download'>Download</Button>
                        <Button color='secondary' onClick={()=>setDialog(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

const ProfilHeaderStyles=withStyles(connect(state=>({user:state.user}))(ProfilHeader),stylesHeader);

const stylesPage=()=>({
    root:{
        padding:'1rem !important',
        boxShadow:'unset !important'
    },
    icon:{
        margin:'0 5px !important'
    },
    title:{
        marginBottom:'1rem',
        lineHeight:1.2,
        fontSize:'1.25rem',
        fontWeight:500,
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2,
    },
    section:{
        position:'absolute',
        bottom:0,
        left:0
    }
})

const useUser=(id)=>{
    const {data,error,mutate}=useSWR(`/v1/user/${id}`);
    return {
        data:data,
        isLoading:!data&&!error,
        error:error,
        mutate:mutate
    }
}

const About=({classes,meta,value})=>{
    const {data,isLoading,error}=useUser(meta.username);
    return (
        <div role='tabpanel' id={`tabpanel${value}`} aria-label={`tabpanel${value}`}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {isLoading ? (
                        <div style={{margin:'20px auto',textAlign:'center'}}>
                            <CircularProgress thickness={5} size={50}/>
                        </div>
                    ) : (
                        <Paper className={classes.root}>
                            { error ? (
                                <div style={{textAlign:'center'}}>
                                    <Typography variant="h5">{error}</Typography>
                                </div>
                            ) : (
                                <>
                                {data?.birthday && (
                                    <>
                                    <div style={{display:'flex',justifyContent:'center'}}>
                                        <CakeIcon className={classes.icon}/>
                                        <Typography>{dayjs.unix(data?.birthday).format("MMMM DD")}</Typography>
                                    </div>
                                    {data?.line || data?.twitter || data?.instagram || data?.facebook || data?.telegram ? (
                                        <Divider style={{margin:'1rem 0'}}/>
                                    ) : null}
                                    </>
                                )}
                                {data?.line || data?.twitter || data?.instagram || data?.facebook || data?.telegram ? (
                                    <>
                                    <div style={{display:'flex',justifyContent:'center'}}>
                                        {data?.instagram && (
                                            <a href={data?.instagram} target='_blank' rel='noopener noreferrer' className='not_blank'>
                                                <IconButton className={classes.icon} size="large">
                                                    <Instagram />
                                                </IconButton>
                                            </a>
                                        )}
                                        {data?.twitter && (
                                            <a href={data?.twitter} target='_blank' rel='noopener noreferrer' className='not_blank'>
                                                <IconButton className={classes.icon} size="large">
                                                    <Twitter />
                                                </IconButton>
                                            </a>
                                        )}
                                        {data?.facebook && (
                                            <a href={data?.facebook} target='_blank' rel='noopener noreferrer' className='not_blank'>
                                                <IconButton className={classes.icon} size="large">
                                                    <Facebook />
                                                </IconButton>
                                            </a>
                                        )}
                                        {data?.line && (
                                            <a href={data?.line} target='_blank' rel='noopener noreferrer' className='not_blank'>
                                                <IconButton className={classes.icon} size="large">
                                                    <SvgIcon viewBox='0 0 48 48' width='24' height='24'>
                                                        <path d="M25.12,44.521c-2.114,1.162-2.024-0.549-1.933-1.076c0.054-0.314,0.3-1.787,0.3-1.787c0.07-0.534,0.144-1.36-0.067-1.887 c-0.235-0.58-1.166-0.882-1.85-1.029C11.48,37.415,4.011,30.4,4.011,22.025c0-9.342,9.42-16.943,20.995-16.943S46,12.683,46,22.025 C46,32.517,34.872,39.159,25.12,44.521z M18.369,25.845c0-0.56-0.459-1.015-1.023-1.015h-2.856v-6.678 c0-0.56-0.459-1.015-1.023-1.015c-0.565,0-1.023,0.455-1.023,1.015v7.694c0,0.561,0.459,1.016,1.023,1.016h3.879 C17.91,26.863,18.369,26.406,18.369,25.845z M21.357,18.152c0-0.56-0.459-1.015-1.023-1.015c-0.565,0-1.023,0.455-1.023,1.015 v7.694c0,0.561,0.459,1.016,1.023,1.016c0.565,0,1.023-0.456,1.023-1.016V18.152z M30.697,18.152c0-0.56-0.459-1.015-1.023-1.015 c-0.565,0-1.025,0.455-1.025,1.015v4.761l-3.978-5.369c-0.192-0.254-0.499-0.406-0.818-0.406c-0.11,0-0.219,0.016-0.325,0.052 c-0.419,0.139-0.7,0.526-0.7,0.963v7.694c0,0.561,0.46,1.016,1.025,1.016c0.566,0,1.025-0.456,1.025-1.016v-4.759l3.976,5.369 c0.192,0.254,0.498,0.406,0.818,0.406c0.109,0,0.219-0.018,0.325-0.053c0.42-0.137,0.7-0.524,0.7-0.963V18.152z M36.975,20.984 h-2.856v-1.817h2.856c0.566,0,1.025-0.455,1.025-1.015c0-0.56-0.46-1.015-1.025-1.015h-3.879c-0.565,0-1.023,0.455-1.023,1.015 c0,0.001,0,0.001,0,0.003v3.842v0.001c0,0,0,0,0,0.001v3.845c0,0.561,0.46,1.016,1.023,1.016h3.879 c0.565,0,1.025-0.456,1.025-1.016c0-0.56-0.46-1.015-1.025-1.015h-2.856v-1.817h2.856c0.566,0,1.025-0.455,1.025-1.015 c0-0.561-0.46-1.016-1.025-1.016V20.984z"></path>
                                                    </SvgIcon>
                                                </IconButton>
                                            </a>
                                        )}
                                        {data?.telegram && (
                                            <a href={data?.telegram} target='_blank' rel='noopener noreferrer' className='not_blank'>
                                                <IconButton className={classes.icon} size="large">
                                                    <Telegram />
                                                </IconButton>
                                            </a>
                                        )}
                                    </div>
                                    {data?.about && <Divider style={{margin:'1rem 0'}}/>}
                                    </>
                                ) : null}
                                {data?.about && (
                                    <div style={{textAlign:'center'}}>
                                        <Markdown source={data?.about}/>
                                    </div>
                                )}
                                </>
                            )}
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </div>
    );
}

const AboutPage=withStyles(About,stylesPage);

const Follow=({classes,type,meta,user,value})=>{
    const router=useRouter();
    const {page,slug} = router.query
    const {post,get,del}=useAPI()
    const [data,setData] = React.useState([]);
    const [isLoading,setIsLoading]=React.useState(true);
    const [isReachEnd,setReacEnd]=React.useState(false);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [error,setError] = React.useState(false);
    
    //console.log(data,error);
    const [openMenu,setOpenMenu]=React.useState(null);
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [backdrop,setBackdrop]=React.useState(false)
    const {keyboard,feedback}=useHotKeys()

    const {setNotif}=useNotif();

    const handleMenu=index=>(event)=>{
        setOpenMenu(openMenu === index ? null : index);
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    }
    const handleClose = () => {
        setOpenMenu(null);
        setAnchorEl(null);
    };
    const handleFollow=(type,dt,index)=>async()=>{
        if(user===null) return setNotif("Login to continue",true);
        setBackdrop(true);
        try {
            let b = [...data]
            if(type == 'follow') {
                const [res] = await post(`/v1/user/${user?.user_login}/following/${dt?.username}`)
                b[index]={
                    ...b[index],
                    isFollowing:res.following,
                    isFollowPending:res.pending,
                }
            } else if(type =='unfollow') {
                const [res] = await del(`/v1/user/${user?.user_login}/following/${dt?.username}`);
                b[index]={
                    ...b[index],
                    isFollowing:res.following,
                    isFollowPending:res.pending,
                }
            }
            setData(b);
        } catch {
            
        } finally {
            setBackdrop(false);
        }
    }

    const linkClick=(href,as)=>(e)=>{
        e.preventDefault();
        handleClose()
        router.push(href,(as||href),{shallow:true});
    }

    const loadData=(pg,aaa)=>{
        setIsLoading(true);
        get(`/v1/user/${meta.username}/${type}?page=${pg}`).then(([res])=>{
            setReacEnd(!res.can_load);
            if(aaa) {
                setData(res?.data)
            } else {
                const a=data;
                const b=a.concat(res?.data);
                setData(b);
            }
        }).catch(()=>{
            setError(true);
        }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
    }

    React.useEffect(()=>{
        if(slug?.[1]===type && !feedback && !keyboard) {
            if(typeof page !== 'undefined') loadData(page)
            else if(typeof page === 'undefined') loadData(1,true)
        }
    },[router.query,type])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if((scrollTop + docHeight) > (scrollHeight-100)) {
                if(!isLoading && !isReachEnd && !feedback && !keyboard) {
                    setIsLoading(true);
                    const {page:pg,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.replace({
                        pathname:'/user/[...slug]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/user/${slug?.[0]}/${type}${pgg ? '?page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage!==1) {
            setIsLoadingFP(true);
            get(`/v1/user/${meta.username}/${type}?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res.data;
                const b=a.concat(data);
                setData(b);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    return (
        <div role='tabpanel' id={`tabpanel${value}`} aria-label={`tabpanel${value}`}>
            <Grid container spacing={2}>
                {firstPage!==1 ?
                    isLoadingFP ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <IconButton onClick={handleFirstPage} size="large">
                                    <Autorenew />
                                </IconButton>
                                <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                            </div>
                        </Grid>
                    )
                : null}

                {error ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <Typography variant="h5">Failed load data</Typography>
                        </Paper>
                    </Grid>
                ) : data?.length === 0 && !isLoading ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">There is no {type}</Typography>
                            </div>
                        </Paper>
                    </Grid>
                ) : data?.map((u,i)=>(
                    <Grid key={i.toString()} item xs={12} sm={6} lg={4}>
                        <Card elevation={0}>
                            <CardHeader
                                avatar={
                                    <Avatar aria-label={`${u.name}'s Photo Profile`}>
                                        {u.picture===null ? u.name : <Image width={40} height={40} src={`${u.picture}&size=40&watermark=no`}/> }
                                    </Avatar>
                                }
                                title={u.name}
                                subheader={`@${u.username}`}
                                action={
                                    <>
                                    <IconButton aria-label='settings' onClick={handleMenu(i)} size="large">
                                        <MoreVertIcon/>
                                    </IconButton>
                                    <Menu
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                        }
                                        open={openMenu===i && !backdrop}
                                        onClose={handleClose}
                                    >
                                        <MenuItem onClick={linkClick('/user/[...slug]',u.username)}><ListItemIcon><AccountCircleIcon /></ListItemIcon> View Profile</MenuItem>
                                        {user?.id == u?.id ? null : (
                                            <>
                                                {u.isFollowing && !u.isFollowPending ? <MenuItem onClick={handleFollow('unfollow',u,i)}><ListItemIcon><ClearIcon /></ListItemIcon> Unfollow</MenuItem> : <MenuItem onClick={handleFollow('follow',u,i)}><ListItemIcon><CheckIcon /></ListItemIcon> Follow</MenuItem>}
                                                <MenuItem onClick={linkClick('/messages/[[...slug]]',`/messages/${u.username}`)}><ListItemIcon><MailOutlineIcon /></ListItemIcon> Messages</MenuItem>
                                            </>
                                        )}
                                    </Menu>
                                    </>
                                }
                            />
                        </Card>
                    </Grid>
                ))}
                {isReachEnd && (
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="body2">You've reach the bottom of pages</Typography>
                        </div>
                    </Grid>
                )}
                {isLoading && (
                    <Grid item xs={12}>
                        { data.length > 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        ) : <Skeleton type='grid' number={8} />}
                    </Grid>
                )}
            </Grid>
            <Backdrop open={backdrop} />
        </div>
    );
}
const FollowPage=withStyles(connect(state=>({user:state.user}))(Follow),stylesPage);

const FriendRe=({classes,meta})=>{
    const router = useRouter();
    const {page,slug} = router.query
    const [data,setData] = React.useState([]);
    const [isLoading,setIsLoading]=React.useState(true);
    const [isReachEnd,setReacEnd]=React.useState(false);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [error,setError] = React.useState(false);

    const {keyboard,feedback}=useHotKeys()
    //const {data,error,mutate}=useSWR(`${process.env.API}/user/${meta.username}/friend-request`,fetchGet)
    const [loading,setLoading]=React.useState({});
    const {setNotif}=useNotif();
    const {post,get,del}=useAPI()


    const handleClick=(type,dt,index)=>async()=>{
        setLoading({...loading,[dt?.id]:true})
        try {
            if(type === 'accept') {
                await post(`/v1/user/${meta.username}/followers/pending/${dt?.token}`)
            } else if(type === 'decline') {
                await del(`/v1/user/${meta.username}/followers/pending/${dt?.token}`)
            }
            const a=data;
            a.splice(index,1)
            setData(a);
        } catch {
            
        } finally {
            const b = {...loading}
            if(b?.[dt?.id]) delete b?.[dt?.id]
            setLoading(b)
        }
    }

    const loadData=(pg,aaa)=>{
        setIsLoading(true);
        get(`/v1/user/${meta.username}/followers/pending?page=${pg}`).then(([res])=>{
            setReacEnd(!res.can_load);
            if(aaa) {
                setData(res?.data)
            } else {
                const a=data;
                const b=a.concat(res?.data);
                setData(b);
            }
        }).catch(()=>{
            setError(true);
        }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
    }

    React.useEffect(()=>{
        if(slug?.[1]==='friend-request' && !feedback && !keyboard) {
            if(typeof page !== 'undefined') loadData(page)
            else if(typeof page === 'undefined') loadData(1,true)
        }
    },[router.query])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if((scrollTop + docHeight) > (scrollHeight-100)) {
                if(!isLoading && !isReachEnd && !feedback && !keyboard) {
                    setIsLoading(true);
                    const {page:pg,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.replace({
                        pathname:'/user/[...slug]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/user/${slug?.[0]}/friend-request${pgg ? '?page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage!==1) {
            setIsLoadingFP(true);
            get(`/v1/user/${meta.username}/followers/pending?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res.data;
                const b=a.concat(data);
                setData(b);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    return(
        <div role='tabpanel' id={`tabpanel6`} aria-label={`tabpanel6`}>
            <Grid container spacing={2}>
                {firstPage!==1 ?
                    isLoadingFP ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <IconButton onClick={handleFirstPage} size="large">
                                    <Autorenew />
                                </IconButton>
                                <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                            </div>
                        </Grid>
                    )
                : null}

                {error ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <Typography variant="h5">Failed load data</Typography>
                        </Paper>
                    </Grid>
                ) : data?.length === 0 && !isLoading ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">There is no friend request</Typography>
                            </div>
                        </Paper>
                    </Grid>
                ) : data?.map((u,i)=>(
                    <Grid key={i.toString()} item xs={6} md={4} lg={3}>
                        <Card elevation={0}>
                            <CardHeader
                                avatar={
                                    <Avatar aria-label={`${u.name}'s Photo Profile`}>
                                        {u.picture===null ? u.name : <Image width={40} height={40} src={`${u.picture}&size=40&watermark=no`}/> }
                                    </Avatar>
                                }
                                title={u.name}
                                subheader={`@${u.username}`}
                            />
                            <CardActions>
                                <Button color='primary' disabled={typeof loading?.[u?.id] !== 'undefined'} loading={typeof loading?.[u?.id] !== 'undefined'} onClick={handleClick('accept',u,i)}>
                                    Accept
                                </Button>
                                <Button color='secondary' disabled={typeof loading?.[u?.id] !== 'undefined'} loading={typeof loading?.[u?.id] !== 'undefined'} onClick={handleClick('decline',u,i)}>
                                    Decline
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {isReachEnd && (
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="body2">You've reach the bottom of pages</Typography>
                        </div>
                    </Grid>
                )}
                {isLoading && (
                    <Grid item xs={12}>
                        { data.length > 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        ) : <Skeleton type='grid' number={8} />}
                    </Grid>
                )}
            </Grid>
        </div>
    )
}
const FriendRequest=withStyles(FriendRe,stylesPage);

const Media=({classes,meta,value})=>{
    const router=useRouter();
    const {slug,page}=router.query;
    const {get,post}=useAPI()
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [media,setMedia]=React.useState([]);
    const [isLoading,setIsLoading]=React.useState(true);
    const [isReachEnd,setReacEnd]=React.useState(false);
    const [error,setError]=React.useState(false);
    const [disable,setDisable]=React.useState(false)
    const {keyboard,feedback}=useHotKeys()

    //const [page,setPage]=React.useState(1);
    const [dialog,setDialog]=React.useState(null);
    //const [sudah,setSudah]=React.useState(false);
    //const [scrl,setScrl]=React.useState({});
    const viewClick=(med)=>{
        setDialog(med);
    }
    const closeDialog=()=>{
        setDialog(null)
    }
    const downloadClick=token=>(e)=>{
        router.push({
            pathname:'/download',
            query:{
                token:token
            }
        },`/download?token=${token}`);
    }

    const loadData=(pg,aaa)=>{
        setIsLoading(true);
        get(`/v1/user/${meta.username}/media?page=${pg}`).then(([res])=>{
            setReacEnd(!res.can_load);
            if(aaa) {
                setMedia(res?.data)
            } else {
                const a=media;
                const b=a.concat(res?.data);
                setMedia(b);
            }
        }).catch(()=>{
            setError(true);
        }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
    }

    React.useEffect(()=>{
        if(slug?.[1]==='media' && !feedback && !keyboard) {
            if(typeof page !== 'undefined') loadData(page)
            else if(typeof page === 'undefined') loadData(1,true)
        }
    },[router.query])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-100)) {
                if(!isLoading && !isReachEnd && !feedback && !keyboard) {
                    setIsLoading(true);
                    const {page:pg,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.replace({
                        pathname:'/user/[...slug]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/user/${slug?.[0]}/media${pgg ? '?page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        //if(!sudah && !isLoading) setSudah(true),loadData(page)
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage!==1) {
            setIsLoadingFP(true);
            get(`/v1/user/${meta.username}/media?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res.data;
                const b=a.concat(media);
                setMedia(b);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    const changeProfile=React.useCallback((id)=>()=>{
        setDisable(true)
        post(`/v1/user/${meta.username}`,{file_id:id})
        .then(([res])=>{
            setDialog(false)
            window.location.reload();
        }).catch(()=>{})
        .finally(()=>setDisable(false))
    },[meta,post])

    return (
        <div role='tabpanel' id={`tabpanel${value}`} aria-label={`tabpanel${value}`}>
            <Grid container spacing={2}>
                {firstPage!==1 ?
                    isLoadingFP ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <IconButton onClick={handleFirstPage} size="large">
                                    <Autorenew />
                                </IconButton>
                                <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                            </div>
                        </Grid>
                    )
                : null}

                {error ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">Failed load data</Typography>
                            </div>
                        </Paper>
                    </Grid>
                ) : !isLoading && media.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper className={classes.root}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">No media found.</Typography>
                            </div>
                        </Paper>
                    </Grid>
                ) : media.length > 0 ? media.map((m,i)=>{
                    const title = m?.type == 'audio' && m?.artist != m?.title ? `${m?.artist} - ${m?.title}` : m?.title;
                    return( 
                        <Grid key={`media-${m.id}`} item xs={12} sm={6} md={4} lg={3}>
                            <Card style={{position:'relative',height:325}} elevation={0}>
                                {m.type==='images' ? (
                                    <CardActionArea style={{position:'relative',height:325}} onClick={()=>viewClick(m)}>
                                        <div style={{width:200,marginLeft:'auto',marginRight:'auto',paddingTop:'.5rem'}}><Image width={200} height={200} webp src={`${m.thumbs}&watermark=no&size=400`} alt={title} style={{width:200,height:200,marginLeft:'auto',marginRight:'auto'}}/></div>
                                        <CardContent>
                                            <Tooltip title={title}>
                                                <Typography variant='h6' component='h6' className={classes.title}>{title}</Typography>
                                            </Tooltip>
                                        </CardContent>
                                    </CardActionArea>
                                ) : (
                                    <Link href='/media/[slug]' as={`/media/${m.id}`} passHref><a title={title}>
                                        <CardActionArea style={{position:'relative',height:325}}>
                                            <div style={{width:200,marginLeft:'auto',marginRight:'auto',paddingTop:'.5rem'}}><Image width={200} height={200} webp src={`${m.thumbs}&watermark=no&size=400`} alt={title} style={{width:200,height:200,marginLeft:'auto',marginRight:'auto'}}/></div>
                                            <CardContent>
                                                <Tooltip title={title}>
                                                    <Typography variant='h6' component='h6' className={classes.title}>{title}</Typography>
                                                </Tooltip>
                                            </CardContent>
                                        </CardActionArea>
                                    </a></Link>
                                )}
                            </Card>
                        </Grid>
                    )
                }) : null}
                {isReachEnd && (
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="body2">You've reach the bottom of pages</Typography>
                        </div>
                    </Grid>
                )}
                {isLoading && (
                    <Grid item xs={12}>
                        { media.length > 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <CircularProgress thickness={5} size={50}/>
                            </div>
                        ) : <Skeleton type='grid' number={8} image/>}
                    </Grid>
                )}

            </Grid>
            <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle id='dialog title'>{dialog?.title}</DialogTitle>
                <DialogContent dividers>
                    <center><Image src={dialog!==null ? dialog.thumbs : ''} alt={dialog?.title} style={{width:'100%',height:'auto'}} /></center>
                </DialogContent>
                <DialogActions className='grid-items'>
                        {dialog?.can_set_profile && !dialog?.is_profile_picture && <Button disabled={disable} loading={disable} outlined onClick={changeProfile(dialog?.id)}>Set as Profile Picture</Button>}
                        <Button disabled={disable} onClick={downloadClick(dialog?.download_token)} icon='download'>Download</Button>
                        <Button color='secondary' disabled={disable} onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>
            
        </div>
    );
}
const MediaPage=withStyles(Media,stylesPage);

const stylesTab=theme=>({
    selected:{
        color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.dark} !important`
    },
    root:{
        width:'100%'
    }
})

const TabHeader=({classes,value,meta,slug})=>{
    const router=useRouter();
    const {data,isLoading}=useUser(meta.username);

    const linkClick=(as)=>(e)=>{
        e.preventDefault();
        router.push(`/user/[...slug]`,`/user/${meta.username}${as}`,{shallow:true});
    }
    return(
        <>
            <AppBar elevation={1} position='static' color='default' style={{marginBottom:'1rem'}}>
                <Tabs
                value={value}
                indicatorColor="primary"
                aria-label="Tab Menu"
                variant='fullWidth'
                >
                    <Tab component='a' href={`/user/${meta.username}`} onClick={linkClick('')} icon={<AccountCircleIcon />} label="ABOUT" className={classNames('MuiTab-fullWidth',classes.root,value===0 ? classes.selected : '')} />
                    <Tab component='a' href={`/user/${meta.username}/followers`} onClick={linkClick('/followers')} icon={<PeopleIcon />} label="FOLLOWER" className={classNames('MuiTab-fullWidth',classes.root,value===1 ? classes.selected : '')} />
                    <Tab component='a' href={`/user/${meta.username}/following`} onClick={linkClick('/following')} icon={<PeopleAltIcon />} label="FOLLOWING" className={classNames('MuiTab-fullWidth',classes.root,value===2 ? classes.selected : '')} />
                    <Tab component='a' href={`/user/${meta.username}/media`} onClick={linkClick('/media')} icon={<PermMediaIcon />} label="MEDIA" className={classNames('MuiTab-fullWidth',classes.root,value===3 ? classes.selected : '')} />
                </Tabs>
            </AppBar>
            
            {isLoading ? (
                <Grid item xs={12}>
                    <div style={{margin:'30px auto',textAlign:'center'}}>
                        <CircularProgress thickness={5} size={50}/>
                    </div>
                </Grid>
            ) : data?.private && value!==3 ? (
                <Paper style={{padding:'1rem',textAlign:'center'}}>
                    <Typography variant="h5">This account is private</Typography>
                    <Typography>Follow @{meta.username} to see this account</Typography>
                </Paper>
            ) : value===3 && data?.media_private ? (
                <Paper style={{padding:'1rem',textAlign:'center'}}>
                    <Typography variant="h5">This media is private</Typography>
                    <Typography>Follow @{meta.username} to see this account</Typography>
                </Paper>
            ) : data?.suspend ? (
                <Paper style={{padding:'1rem',textAlign:'center'}}>
                    <Typography variant="h5">This account is suspended</Typography>
                </Paper>
            ) : slug[1] && slug[1]==='friend-request' ? (
                <FriendRequest meta={meta} />
            ) : (
                <>
                    { value===0 && (
                        <AboutPage meta={meta} value={value}/>
                    )}
                    { value===1 && (
                        <FollowPage type='followers' meta={meta} value={value} />
                    )}
                    { value===2 && (
                        <FollowPage type='following' meta={meta} value={value} />
                    )}
                    { value===3 && (
                        <MediaPage meta={meta} value={value}/>
                    )}
                </>
            )}
        </>
    )
}
const TabHeaderStyle=withStyles(TabHeader,stylesTab);

//let dat={name:'',about:'',birthday:''}
const genderArr = ['Male','Female'];
const EditProfile=({meta,dialog,setDialog})=>{
    const router=useRouter()
    const {put}=useAPI()
    const {data,isLoading,error}=useUser(meta.username);
    const [selectedDate,setSelectedDate]=React.useState(dayjs().subtract(20, 'year'));
    const [input,setInput]=React.useState({name:'',about:'',gender:''})
    const [loading,setLoading]=React.useState(false);
    const [canChange,setCanChange]=React.useState(true)
    useBeforeUnload(canChange,`/user/${meta.username}/edit`)
    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit()
    },true)
    const {setNotif}=useNotif();

    const handleDateChange = (date) => {
        setCanChange(false)
        setSelectedDate(date);
    };
    
    const handleSubmit=()=>{
        setLoading(true);
        const date=dayjs(selectedDate).valueOf();
        put(`/v1/user/${meta.username}`,{...input,birthday:date})
        .then(([res])=>{
            setLoading(false);
            setCanChange(true)
            router.replace('/user/[...slug]',`/user/${meta.username}/edit`,{shallow:true});
        })
        .catch(()=>{
            setLoading(false);
        })
    }

    React.useEffect(()=>{
        if(data){
            setSelectedDate(dayjs.unix(data.birthday));
            setInput({
                name:data?.name,
                about:data?.about,
                gender:data?.gender
            })
        }
    },[data])
    return(
        <LocalizationProvider dateAdapter={AdapterDayJS}>
            {isLoading ? (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{margin:'30px auto',textAlign:'center'}}>
                            <CircularProgress thickness={5} size={50}/>
                        </div>
                    </Grid>
                </Grid>
            ) : error ? (
                <Grid item xs={12}>
                    <Paper className={classes.root}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="h5">{error}</Typography>
                        </div>
                    </Paper>
                </Grid>
            ) : (
                <PaperBlock title="Edit Profile" whiteBg>
                    <form noValidate autoComplete="off" onSubmit={(e)=>{e.preventDefault(),handleSubmit()}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}><TextField required variant='outlined' id="standard-basic" label="Name" value={input.name} fullWidth onChange={(event)=>{setCanChange(false),setInput({...input,name:event.target.value})}} disabled={loading} /></Grid>
                            <Grid item xs={12} lg={6}>
                                <TextField
                                    select
                                    value={input?.gender}
                                    onChange={(e)=>{setCanChange(false),setInput({...input,gender:e.target.value})}}
                                    SelectProps={{native:isMobile}}
                                    variant="outlined"
                                    fullWidth
                                    required
                                    disabled={loading}
                                    label="Gender"
                                >
                                    {isMobile ? genderArr.map((cat,i)=><option key={`mobile-${i}`} value={i}>{cat}</option>) : genderArr.map((cat,i)=><MenuItem key={`desktop-${i}`} value={i}>{cat}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <DatePicker
                                    maxDate={dayjs().subtract(13, 'year')}
                                    minDate={dayjs().subtract(60, 'year')}
                                    disableFuture
                                    fullWidth
                                    id="date-picker-dialog"
                                    inputFormat="DD MMMM YYYY"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    required
                                    disabled={loading}
                                    renderInput={props=><TextField label="Birthday" required disabled={loading} variant="outlined"  {...props} />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <SimpleMDE
                                    label="About Me"
                                    onChange={(text)=>{setCanChange(false),setInput({...input,about:text})}}
                                    value={input.about}
                                />
                            </Grid>
                        </Grid>
                    </form>
                    <center><Button tooltip='Ctrl + S' onClick={handleSubmit} disabled={loading} loading={loading} icon='save'>Save</Button></center>
                    
                </PaperBlock>
            )}
        </LocalizationProvider>
    )
}

const User=({meta,err,user})=>{
    if(err) return <ErrorPage statusCode={err}/>
    const {post,get}=useAPI()
    const router=useRouter();
    const {slug}=router.query;
    const first=meta.username;
    const [value, setValue] = React.useState(0);
    const [dialog,setDialog]=React.useState(false)
    const [imageLoaded,setImageLoaded]=React.useState(false);
    const [title,setTitle]=React.useState(meta?.title)
    const [loading,setLoading]=React.useState(false);
    const [imgName,setImgName]=React.useState("");
    const [backdrop,setBackdrop]=React.useState(false);
    const [progress,setProgress]=React.useState(0)
    const cropEl=React.useRef(null);
    const inputEl=React.useRef(null);

    const editProfilePicture=()=>{
        inputEl?.current?.click()
    }
    const onImageChange=(e)=>{
        if(e.target.files[0]) {
            setImgName(e.target.files[0].name);
            cropEl?.current?.imageLoad(e);
        }
        else {
            setImgName("")
            const imagee=document.getElementById('imageLoader')
            if(imagee) {
                imagee.value='';
            }
        }
    }

    const handleChangeProfilePicture=(e)=>{
        setBackdrop(true);
        setLoading(true);
        cropEl?.current?.renderImage();
    }

    const onRenderEnd=(res)=>{
        if(process.browser && res.length) {
            const block = res.split(";");
            // Get the content type of the image
            const contentType = block[0].split(":")[1];
            const realData = block[1].split(",")[1];
            const blob = toBlob(realData, contentType);
            const formData = new FormData();
            formData.append("image",blob,imgName);
            const opt={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:(progEvent)=>{
                    const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                    setProgress(complete)
                }
            }
            post(`/v1/user/${meta.username}`,formData,opt).then(()=>{
                setDialog(false)
                window.location.reload();
            }).catch((err)=>{
                
            }).finally(()=>{
                setLoading(false);
                setBackdrop(false);
                setProgress(0)
            })
        }
    }

    const onRotate=()=>{
        cropEl?.current?.rotate(-90);
    }

    const onImageLoaded=()=>{
        setImageLoaded(true)
        setDialog(true)
        //cropEl?.current?.refreshImage();
    }

    const onDialogExit=()=>{
        setImgName("")
        const imagee=document.getElementById('imageLoader')
        if(imagee) {
            imagee.value='';
        }
    }

    React.useEffect(()=>{
        if(first !== slug[0]) router.replace('/user/[...slug]',`/user/${slug[0]}${slug[1] ? '/'+slug[1] : ''}`)
        else {
            if(slug[1]) {
                switch(slug[1]) {
                    case 'followers':
                        setTitle(`${meta?.name} (@${meta?.username}) - Followers`);
                        setValue(1);
                        break;
                    case 'following':
                        setTitle(`${meta?.name} (@${meta?.username}) - Following`);
                        setValue(2);
                        break;
                    case 'media':
                        setTitle(`${meta?.name} (@${meta?.username}) - Media`);
                        setValue(3);
                        break;
                    case 'friend-request':
                        setTitle('Friend Request');
                        setValue(false);
                        break;
                    case 'edit':
                        setTitle('Edit Profile');
                        setValue(false);
                        break;
                }
            } else {
                setTitle(`${meta?.name} (@${meta?.username})`);
                setValue(0);
            }
        }
    },[router.query.slug])
    
    React.useEffect(()=>{
        const {ref,refid} = router.query;
        console.log(ref,refid);
        if(ref === 'notification') {
            get(`/v1/internal/refid/${refid}`,{error_notif:false,success_notif:false})
        }
    },[router.query])

    return (
        <Header navTitle={meta?.username} title={title} desc={meta.description} image={meta.image} canonical={slug?.[1] ? `/user/${slug[0]}/${slug[1]}` : `/user/${slug[0]}`} noIndex={slug?.[1] === 'edit' || slug?.[1]==='friend-request'}
        openGraph={{
            type:'profile',
            profile:{
                username:meta?.username
            }
        }}
        >
            <SocialProfileJsonLd
                type="Person"
                name={adddesc(meta?.name)}
                url={`${process.env.URL}/user/${meta?.username}`}
                sameAs={meta?.social}
            />
            {slug[1] && slug[1] === 'edit' ? (
                <>
                <ProfilHeaderStyles meta={meta} editpage setBackdrop={setBackdrop} onEditPicture={editProfilePicture} />
                <EditProfile meta={meta} slug={slug} />
                </>
            ) : (
                <>
                <ProfilHeaderStyles meta={meta} />
                <TabHeaderStyle value={value} meta={meta} slug={slug}/>
                </>
            )}
            <input id="imageLoader" ref={inputEl} type='file' accept="image/*" style={{display:'none'}} onChange={onImageChange} />
            
            {user?.id === meta?.id && (
                <Dialog
                    keepMounted
                    open={dialog}
                    aria-labelledby='dialog'
                    maxWidth='sm'
                    fullWidth
                    scroll='body'
                    TransitionProps={{
                        onExited: onDialogExit
                    }}>
                    <DialogTitle>{imageLoaded ? "Crop Picture" : "Change Profile Picture"}</DialogTitle>
                    <DialogContent dividers>
                        <div>
                            <Croppie
                                keys={meta?.username}
                                ref={cropEl}
                                onRenderEnd={onRenderEnd}
                                onImageLoaded={onImageLoaded}
                            />
                            <div style={{display:'flex',justifyContent:'space-evenly'}}>
                                {imageLoaded && <Button disabled={loading} sx={{backgroundImage:'yellow',color:'black'}} onClick={onRotate}>Rotate</Button>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        {imageLoaded && <Button disabled={loading} loading={loading} onClick={handleChangeProfilePicture}>Change</Button>}
                        <Button disabled={loading} color='secondary' onClick={()=>setDialog(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}
            {backdrop && <Portal><Backdrop open={backdrop} {...(progress!==0 ? {progress:progress} : {})} /></Portal> }
        </Header>
    );
}

export default connect(state=>({user:state.user}))(User);