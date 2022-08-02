import React from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {makeStyles} from 'portal/components/styles';
import classNames from 'classnames';
import {Hidden,AppBar,Toolbar,IconButton,Badge,Divider,Menu,CircularProgress,MenuItem,ListItemIcon,ListItemText} from '@mui/material'
import { alpha } from '@mui/material/styles';
import * as gtag from 'portal/utils/gtag'
import {ucwords} from '@portalnesia/utils'
import {useNotification} from 'portal/components/header/Notification'
import Avatar from 'portal/components/Avatar'
import ThemeCon from 'portal/components/header/ThemeCon'
import {time_ago} from 'portal/utils/Main'
import {
  ExitToApp,
  AccountCircle,
  Message as MessageIcon,
  Notifications as Notification,
  Search as SearchIcon,
  Menu as MenuIcon,
  InsertDriveFile,
  Favorite as FavoriteIcon,
  Settings as SettingIcon,
  Keyboard as KeyboardIcon,
  Brightness4 as DarkIcon,
  Feedback as FeedbackIcon,
  ContactSupport,
  Lock as LoginIcon,
  ArrowBack,
  Close as CloseIcon,
  MoreVert
} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Image=dynamic(()=>import('portal/components/Image'))

const drawerWidth = 240;

const styles = makeStyles()((theme,_,classes) => {
  return {
    appBar: {
      position: 'fixed !important',
      background: `${theme.palette.primary.main} !important`,
      transition: theme.transitions.create(['width', 'margin', 'background'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      zIndex: `${theme.zIndex.drawer + 1} !important`,
      boxShadow: 'none !important',
      '& ::-webkit-input-placeholder': { /* Chrome/Opera/Safari */
        color: 'rgba(255,255,255,.8)'
      },
      '& ::-moz-placeholder': { /* Firefox 19+ */
        color: 'rgba(255,255,255,.8)'
      },
      '& :-ms-input-placeholder': { /* IE 10+ */
        color: 'rgba(255,255,255,.8)'
      },
      '& :-moz-placeholder': { /* Firefox 18- */
        color: 'rgba(255,255,255,.8)'
      },
      /*[theme.breakpoints.down('sm')]: {
        zIndex: theme.zIndex.drawer,
      },
      [theme.breakpoints.up('md')]: {
        zIndex: theme.zIndex.drawer + 1,
      },*/
    },
    flex: {
      [theme.breakpoints.up('md')]: {
        flex: 1,
      },
      textAlign: 'right'
    },
    appBarShift: {
      transition: theme.transitions.create(['width', 'margin', 'background'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      [theme.breakpoints.up('md')]: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px) !important`,
      },
    },
    menuButton: {
      marginLeft: `${theme.spacing(1)} !important`
    },
    hide: {
      display: 'none !important',
    },
    textField: {
      marginLeft: `${theme.spacing(1)} !important`,
      marginRight: `${theme.spacing(1)} !important`,
      width: `200px !important`,
    },
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    wrapper: {
      fontFamily: theme.typography.fontFamily,
      position: 'relative',
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
      borderRadius: 2,
      background: alpha(theme.palette.common.white, 0.15),
      display: 'inline-block',
      '&:hover': {
        background: alpha(theme.palette.common.white, 0.25),
      },
      [`& .${classes.input}`]: {
        transition: theme.transitions.create('width'),
        width: 180,
        '&:focus': {
          width: 350,
        },
        [theme.breakpoints.down('sm')]: {
          display: 'none'
        },
      },
    },
    search: {
      width: theme.spacing(5),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      },
    },
    input:{
      font: 'inherit',
      padding: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(5)}`,
      border: 0,
      display: 'block',
      verticalAlign: 'middle',
      whiteSpace: 'normal',
      background: 'none',
      margin: 0, // Reset for Safari
      color: 'inherit',
      width: '100%',
      '&:focus': {
        outline: 0,
      },
    },
    separatorV: {
      borderLeft: `1px solid ${theme.palette.grey[300]}`,
      height: 20,
      margin: '0 10px',
      opacity: 0.4
    },
    notifMenu: {
      '@media (hover: hover) and (pointer: fine)':{
        '&::-webkit-scrollbar':{
            width:'.7em',
            borderRadius:4
        },
        '&::-webkit-scrollbar-thumb':{
            background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
            borderRadius:4
        },
      }
    },
    badgeMenu: {
      '& span': {
        top: -12,
        right: -30
      }
    },
    textNotif: {
      '& span': {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        //display:'-webkit-box',
        WekbitBoxOrient:'vertical',
        WebkitLineClamp:2
      },
      marginLeft: `10px !important`
    },
    iconMenu:{
      minWidth:'56px !important',
      flexShrink:'0 !important'
    },
    selected:{
      background:`${alpha(theme.palette.primary.light,0.25)} !important`,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 10px',
        height: 64,
        position: 'relative',
        '& img': {
          width: 20
        },
        '& h3': {
          margin: 0,
          paddingLeft: 10,
          fontWeight: 500
        },
        [theme.breakpoints.down('md')]: {
          display:'block',
          padding: '16px 10px 10px 0',
          minWidth:0,
          flex:1
        },
    },
    brandH3:{
      [theme.breakpoints.up('md')]:{
        fontSize: 16,
      },
      [theme.breakpoints.down('md')]: {
        textOverflow:'ellipsis',
        whiteSpace:'nowrap',
        overflow:'hidden',
        fontSize:20
      },
    },
    brandBar: {
        transition: theme.transitions.create(['width', 'margin', 'background'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
        '&:after': {
        transition: theme.transitions.create(['box-shadow'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        }
    },
    tooltip:{fontSize:15},
    brandMobile:{
      '@media (max-width: 319px)':{
        display:'none'
      }
    },
    userMenu:{
      [theme.breakpoints.down('md')]: {
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
      },
    },
    notifMargin:{
      [theme.breakpoints.down('md')]: {
        marginRight:10
      },
    }
  }
});
//let sudah=false,dat=null;
const Menuu=({notBack,data,errorInitial,handleBack,optionClickMobile,optionMobile})=>{
  const {classes} = styles();  
    const router=useRouter();
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    const {data:notifData,total:notifTotal,loading:notifLoading,error:notifError,onClick:handleNotification,setTotal}=useNotification()
    const handleMenu = menu => (event) => {
        if(menu==='notification' && notifTotal!==0) setTotal(0)
        setOpenMenu(openMenu === menu ? null : menu);
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setOpenMenu(null);
        setAnchorEl(null);
    };

    const linkClick=(href,as)=>(e)=>{
      e.preventDefault();
      if(href==router.pathname) {
          router.push({
              pathname:router.pathname,
              query:{
                  reloadedPage:true
              }
          },(as||href));
      } else {
          router.push(href,(as||href));
      }
      handleClose();
    }

    return (
      <div className={classNames("userMenu",classes.userMenu)}>
          <Hidden mdUp>
            <IconButton
              key='feedback-btn'
              aria-haspopup="true"
              onClick={()=>handleBack('feedback',true)}
              color="inherit"
              className={classNames((typeof data === 'undefined' || data===null) ? classes.notifMargin : '')}
              size="large">
              <FeedbackIcon />
            </IconButton>
          </Hidden>
          {typeof data !== 'undefined' && data!==null && (
            <>
            <IconButton
              key='notif-btn'
              aria-haspopup="true"
              onClick={handleMenu('notification')}
              color="inherit"
              className={classNames(optionMobile && classes.notifMargin)}
              size="large">
              <Badge className={classes.badge} badgeContent={notifTotal} color="error" invisible={notifTotal===0}>
                  <Notification />
              </Badge>
            </IconButton>
            <Menu key='notif-menu'
              id="menu-notification"
              anchorEl={anchorEl}
              anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
              }}
              transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
              }}
              PaperProps={{
                  className:classes.notifMenu,
                  style: {
                    width: '80%',
                    maxWidth:400
                  },
              }}
              open={openMenu === 'notification'}
              onClose={handleClose}
            >
              {notifLoading ? (
                <MenuItem key='loadig' style={{margin:'20px 0',textAlign:'center'}} component='div'>
                  <div className='message' style={{justifyContent:'center'}}>
                    <CircularProgress thickness={4.5} size={45}/>
                  </div>
                </MenuItem>
              ) : notifError ? (
                <MenuItem key='error' style={{margin:'20px 0',textAlign:'center'}} component='div'>
                  <div className='message' style={{justifyContent:'center'}}>
                    <ListItemText primary='Something went wrong' className={classes.textNotif} style={{flex:'unset'}}/>
                  </div>
                </MenuItem>
              ) : notifData?.length ? notifData?.map((dt,i)=>(
                <div key={i}>
                  <MenuItem title={dt?.message} classes={{selected:classes.selected}} selected={!dt?.read} key={`${i}`} onClick={(e)=>{e.preventDefault(),handleClose(),handleNotification(i,dt)}} component='a' href={dt?.as}>
                      <div className='message' >
                          <ListItemIcon>
                            {dt?.picture!==null ? (
                              <Avatar alt={dt?.name}>
                                <Image height={40} width={40} lazy={false} src={`${dt?.picture}&size=40&watermark=no`} alt={dt?.name} webp/>
                              </Avatar>
                            ) : <Avatar alt={dt?.name}>{dt?.name}</Avatar>}
                          </ListItemIcon>
                          <ListItemText
                            className={classes.textNotif}
                            primary={dt?.type == 'notification' ? `Portalnesia sent a notice` : dt?.type == 'support' ? "Portalnesia reply your support messages" : dt?.message}
                            secondary={time_ago(dt.timestamp)}
                          />
                      </div>
                  </MenuItem>
                  {i+1 !== notifData?.length && (
                    <Divider key={`divider-${i}`} sx={{mb:'0 !important',mt:'0 !important'}} />
                  )}
                </div>
              )) : (
                <MenuItem key='no-notif' style={{margin:'20px 0',textAlign:'center'}} component='div'>
                  <div className='message' style={{justifyContent:'center'}}>
                    <ListItemText primary='No notification' className={classes.textNotif} style={{flex:'unset'}}/>
                  </div>
                </MenuItem>
              )}
              <Divider key='divider' />
              <MenuItem key={`all`} onClick={linkClick('/notification/[[...slug]]','/notification')} component='a' href='/notification'>
                  <div className='message' style={{justifyContent:'center'}}>
                      <ListItemText
                        className={classes.textNotif}
                        style={{flex:'unset'}}
                        primary='See All Notification'
                      />
                  </div>
              </MenuItem>
            </Menu>
            </>
          )}
          <Hidden mdDown>
            <IconButton
              key='user-btn'
              disabled={Boolean(typeof data === 'undefined' && !errorInitial)}
              onClick={handleMenu('user-setting')}
              aria-haspopup="true"
              color="inherit"
              size="large">
              <Avatar alt="Option" withTop={typeof data !== 'undefined'}>
                {typeof data === 'undefined' && !errorInitial ? (
                  <CircularProgress color='secondary' />
                ) : typeof data!=='undefined' && data !== null ? 
                    data.picture !== null ? <Image width={40} height={40} lazy={false} src={`${data.picture}&watermark=no&size=40`}/>
                    : data.name
                : undefined}
              </Avatar>
            </IconButton>
          </Hidden>
          <Hidden mdUp>
            {typeof data !== 'undefined' ? 
              notBack && data !== null ? (
                <IconButton
                  key='user-btn'
                  disabled={Boolean(typeof data==='undefined' && !errorInitial)}
                  onClick={()=>router.push(`/user/${data?.username}`)}
                  aria-haspopup="true"
                  color="inherit"
                  size="large">
                  <Avatar alt="Option">
                    {data?.picture !== null ? (
                      <Image width={40} height={40} lazy={false} src={`${data?.picture}&watermark=no&size=40`}/>
                    ) : data?.name }
                  </Avatar>
                </IconButton>
              ) : !optionMobile ? (
                <IconButton
                  key='user-btn'
                  disabled={Boolean(typeof data === 'undefined' && !errorInitial)}
                  onClick={optionClickMobile}
                  aria-haspopup="true"
                  color="inherit"
                  className={classNames(classes.notifMargin)}
                  size="large">
                  <MoreVert />
                </IconButton>
              ) : null
            : null}
          </Hidden>
          {data && data !== null ? (
              <Menu key='user-menu'
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
                  PaperProps={{
                      className:classes.notifMenu,
                  }}
                  open={openMenu === 'user-setting'}
                  onClose={handleClose}
              > 
                <MenuItem component='a' href={`/user/${data?.username}`} onClick={linkClick(`/user/[...slug]`,`/user/${data?.username}`)}><ListItemIcon><AccountCircle /></ListItemIcon> Profile</MenuItem>
                <MenuItem component='a' href={`/messages`} onClick={linkClick(`/messages/[[...slug]]`,'/messages')}><ListItemIcon><MessageIcon /></ListItemIcon> Messages</MenuItem>
                <MenuItem component='a' href={`/file-manager`} onClick={linkClick(`/file-manager`)}><ListItemIcon><InsertDriveFile /></ListItemIcon> File Manager</MenuItem>
                <MenuItem component='a' href="/likes" onClick={linkClick(`/likes/[[...slug]]`,"/likes")}><ListItemIcon><FavoriteIcon /></ListItemIcon> Likes</MenuItem>
                <MenuItem component='a' href={`/setting`} onClick={linkClick(`/setting/[[...slug]]`,`/setting`)}><ListItemIcon><SettingIcon /></ListItemIcon> Setting</MenuItem>
                <Divider />
                <MenuItem onClick={()=>{handleBack('keyboard',true),handleClose()}}><ListItemIcon><KeyboardIcon /></ListItemIcon> Keyboard Shortcut</MenuItem>
                <MenuItem onClick={()=>setOpenMenu('theme')}><ListItemIcon><DarkIcon /></ListItemIcon> Themes</MenuItem>
                <MenuItem onClick={()=>{handleBack('feedback',true),handleClose()}}><ListItemIcon><FeedbackIcon /></ListItemIcon> Send Feedback</MenuItem>
                <MenuItem component='a' href={`/support`} onClick={linkClick(`/support/[[...slug]]`,'/support')}><ListItemIcon><ContactSupport /></ListItemIcon> Support</MenuItem>
                <Divider />
                <MenuItem component='a' href={`${process.env.ACCOUNT_URL}/logout`} onClick={handleClose}>
                    <ListItemIcon>
                        <ExitToApp />
                    </ListItemIcon>
                    Log Out
                </MenuItem>
              </Menu>
          ) : (
              <Menu key='user-menu'
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
                  PaperProps={{
                      className:classes.notifMenu,
                  }}
                  open={openMenu === 'user-setting'}
                  onClose={handleClose}
              > 
                <MenuItem onClick={()=>{handleBack('keyboard',true),handleClose()}}><ListItemIcon><KeyboardIcon /></ListItemIcon> Keyboard Shortcut</MenuItem>
                <MenuItem onClick={()=>setOpenMenu('theme')}><ListItemIcon><DarkIcon /></ListItemIcon> Themes</MenuItem>
                <MenuItem onClick={()=>{handleBack('feedback',true),handleClose()}}><ListItemIcon><FeedbackIcon /></ListItemIcon> Send Feedback</MenuItem>
                <Divider />
                <MenuItem component='a' href={`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(process.env.URL+router.asPath)}`} onClick={handleClose}><ListItemIcon><LoginIcon /></ListItemIcon> Login</MenuItem>
                <MenuItem component='a' href={`${process.env.ACCOUNT_URL}/register`} onClick={handleClose}><ListItemIcon><AccountCircle /></ListItemIcon> Register</MenuItem>
              </Menu>
          )}
          <ThemeCon setAnchorEl={setAnchorEl} anchorEl={anchorEl} openMenu={openMenu} handleClose={handleClose} setOpenMenu={setOpenMenu} />
          <style jsx>{`
            .message{
              width:100%;
              display:-webkit-box;
              display:-ms-flexbox;
              display:flex;
              padding:10px 0;
              background:none;
              border:none;
            }
          `}</style>
      </div>
    );
}
const UserMenu=React.memo(Menuu);

let sear='';
const Headerr = ({data,errorInitial,title,sudahBack,active,subactive,toggleDrawerOpen,open,handleBack,notBack,optionClickMobile,optionMobile})=>{
    const {classes} = styles();    
    const router=useRouter();
    const {q}=router.query;
    const pathname=router.pathname
    const [search,setSearch]=React.useState(sear);
    const handleSearch=(e)=>{
      e.preventDefault();
      if(search.length) {
        gtag.event({
          action:"search",
          search_term:search
        })
        router.push({
          pathname:'/search',
          query:{
            q:encodeURIComponent(search)
          }
        },`/search?q=${encodeURIComponent(search)}`)
      }
    }
    const changeSearch=(e)=>{
      sear=e.target.value;
      setSearch(e.target.value)
    }
    React.useEffect(()=>{
      if(pathname=='/search' && q) {
        const qq=decodeURIComponent(q)
        sear=qq
        setSearch(qq)
      }
    },[q,pathname])

    const onClick=(optMobile)=>()=>{
      if(optMobile) {
        return optionClickMobile();
      }
      if(sudahBack) router.back();
      else if(active?.length > 0) {
        if(subactive?.length > 0) {
          const sll = active == 'twitter_thread' ? 'twitter/thread' : subactive == 'dashboard' ? `${active}/dashboard` : active == 'tools' ? '' : active;
          router.push(`/${sll}`)
        }
        else router.push("/")
      }
      else router.push("/")
    }

    const navTitle=React.useMemo(()=>{
      if(!open || optionMobile) return "Portalnesia"
      else if(title) return title;
      else if(active?.length > 0 && active !== "home") return ucwords(active)
      else return "Portalnesia"
    },[title,active,open,optionMobile])

    return (
      <AppBar
          className={
              classNames(
                  classes.appBar,
                  open && classes.appBarShift
              )
          }
      >
        
          <Toolbar disableGutters={true}>
              <Hidden mdUp>
                {(!notBack && open && !optionMobile) ? (
                  <IconButton
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="Back"
                    onClick={onClick()}
                    size="large">
                      <ArrowBack />
                  </IconButton>
                ) : optionMobile ? (
                  <IconButton
                    className={classes.menuButton}
                    color="inherit"
                    aria-label="Back"
                    onClick={onClick(true)}
                    size="large">
                      <CloseIcon />
                  </IconButton>
                ) : null}
              </Hidden>
              <Hidden mdDown>
                <IconButton
                  className={classes.menuButton}
                  color="inherit"
                  aria-label="Menu"
                  onClick={toggleDrawerOpen}
                  size="large">
                    <MenuIcon />
                </IconButton>
              </Hidden>
              <Hidden mdUp>
                <div className={classNames(classes.brand, classes.brandBar,classes.brandMobile)}>
                  <Link href="/" passHref><a><h3 className={classes.brandH3}>{navTitle}</h3></a></Link>
                </div>
              </Hidden>
              <div className={classes.flex}>
                  <Hidden mdDown>
                    <div className={classes.wrapper}>
                      <div className={classes.search}>
                          <SearchIcon />
                      </div>
                      <form onSubmit={handleSearch}><input id='search-input-home' className={classes.input} placeholder="Search" value={search} onChange={changeSearch} /></form>
                    </div>
                  </Hidden>
              </div>
              <Hidden mdDown>
                  <span className={classes.separatorV} />
              </Hidden>
          
              <UserMenu optionClickMobile={optionClickMobile} optionMobile={optionMobile} notBack={notBack} data={data} errorInitial={errorInitial} handleBack={handleBack} />
          </Toolbar>
      </AppBar>
    );
}
export default React.memo(Headerr);