import React from 'react'
import Image from './Image'
import {withStyles} from 'portal/components/styles';
import Avatar from 'portal/components/Avatar'
import clx from 'classnames'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {menuNoSidebar} from './header/Menu'
//import {usePost} from 'portal/utils/fetcher'
import {AppBar,Toolbar,IconButton,SvgIcon,Typography,Hidden,Menu,Divider,CircularProgress,Button as Buttonn,MenuItem,ListItemIcon} from '@mui/material'
import ThemeCon from 'portal/components/header/ThemeCon'
//import useSWR from 'swr'
import {
    ExitToApp,
    AccountCircle,
    Message as MessageIcon,
    Menu as MenuIcon,
    InsertDriveFile,
    Favorite as FavoriteIcon,
    Settings as SettingIcon,
    Keyboard as KeyboardIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    Feedback as FeedbackIcon,
    ContactSupport,
    Lock as LoginIcon
} from '@mui/icons-material'

const AppStyles=theme=>({
    appBar: {
        position: 'sticky',
        zIndex: theme.zIndex.drawer + 1,
        background: `${theme.palette.primary.main} !important`,
        transition: theme.transitions.create(['width', 'margin', 'background'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        padding:`0 ${theme.spacing(2)}`,
        boxShadow: 'none !important',
        '& ::-webkit-input-placeholder': { /* Chrome/Opera/Safari */
            color: 'rgba(255,255,255,.3)'
        },
        '& ::-moz-placeholder': { /* Firefox 19+ */
            color: 'rgba(255,255,255,.3)'
        },
        '& :-ms-input-placeholder': { /* IE 10+ */
            color: 'rgba(255,255,255,.3)'
        },
        '& :-moz-placeholder': { /* Firefox 18- */
            color: 'rgba(255,255,255,.3)'
        }
    },
    title:{
        flexGrow:1,
        paddingLeft:theme.spacing(1)
    },
    btn:{
        textTransform:'inherit',
        margin:`0 ${theme.spacing(1)}`
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
    tooltip:{fontSize:15},
    icon:{
        display:'flex',
        '& svg':{
            width:40,
            minWidth:0
        }
    }
})
//let sudah=false,dat=null;
const Appbar=({data,errorInitial,classes,handleBack})=>{
  const router=useRouter()
  const [anchorEl,setAnchorEl]=React.useState(null);
  const [openMenu,setOpenMenu]=React.useState(null);
  //const [data,setData]=React.useState(dat)
  //const {data}=useSWR(`${process.env.API}/initial`,fetchGet);

  const handleMenu = menu => (event) => {
      setOpenMenu(openMenu === menu ? null : menu);
      setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
      setOpenMenu(null);
      setAnchorEl(null);
  };
  const linkClick=(href,as)=>(e)=>{
      e.preventDefault();
      router.push(href,(as||href));
      handleClose();
  }
  return (
      <AppBar className={clx(classes.appBar)}>
          <Toolbar disableGutters={true}>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center',flexGrow:1}}>
                    <Link key='link-1' href='/' passHref><a style={{display:'flex',alignItems:'center',paddingLeft:16}}>
                        <Image width={40} height={40} lazy={false} src='/icon/android-icon-48x48.png' alt='Portalnesia' style={{width:40}} />
                        <Typography sx={{pl:1}} variant='h6' component='h4'>Portalnesia</Typography>
                    </a></Link>
                </div>
                <Hidden mdUp>
                    <IconButton
                        onClick={handleMenu('link')}
                        aria-haspopup="true"
                        color="inherit"
                        size="large">
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        disabled={Boolean(typeof data === 'undefined' && !errorInitial)}
                        onClick={handleMenu('user-setting')}
                        aria-haspopup="true"
                        color="inherit"
                        size="large">
                        <Avatar alt="Option" withTop={typeof data !== 'undefined'}>
                            {typeof data === 'undefined' && !errorInitial ? (
                                <CircularProgress color='secondary' />
                            ) : typeof data!=='undefined' && data !== null ? 
                                data.picture !== null ? <Image width={40} height={40} lazy={false} src={`${data?.picture}&watermark=no&size=40`}/>
                                : data?.name
                            : undefined}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        PaperProps={{
                            className:classes.notifMenu,
                            style: {
                                width: '80%',
                                maxWidth:400
                            },
                        }}
                        open={openMenu === 'link'}
                        onClose={handleClose}
                    >
                        {menuNoSidebar.map((menu,i)=>(
                            <MenuItem key={`menu-${i}`} onClick={linkClick(menu?.as || menu?.link,menu?.as)} component='a' href={menu?.as || menu?.link}>
                                {menu?.icon ? (
                                    <ListItemIcon className={classes.icon}>
                                        {menu.fontAwesome ? <SvgIcon>{menu.icon}</SvgIcon> : menu.icon}
                                    </ListItemIcon>
                                ) : null}
                                {menu?.name}
                            </MenuItem>
                        ))}
                    </Menu>
                </Hidden>
                <Hidden mdDown>
                    {menuNoSidebar.map((menu,i)=>(
                        <Link key={`menu-${i}`} href={menu.link} as={menu.as||menu.link} passHref>
                            <Buttonn component='a' href className={classes.btn}>
                                <div style={{display:'flex',alignItems:'center',color:'#FFF'}}>
                                    {menu?.icon ? (
                                        <div className={classes.icon}>
                                            {menu.fontAwesome ? <SvgIcon>{menu.icon}</SvgIcon> : menu.icon}
                                        </div> 
                                    ) :null}
                                    {menu.name}
                                </div>
                            </Buttonn>
                        </Link>
                    ))}
                    <IconButton
                        disabled={Boolean(!data && !errorInitial)}
                        onClick={handleMenu('user-setting')}
                        aria-haspopup="true"
                        color="inherit"
                        size="large">
                            <Avatar alt="Option">
                                {typeof data === 'undefined' && !errorInitial ? (
                                    <CircularProgress color='secondary' />
                                ) : typeof data!=='undefined' && data !== null ? 
                                    data.picture !== null ? <Image width={40} height={40} lazy={false} src={`${data?.picture}&watermark=no&size=40`}/>
                                    : data?.name
                                : undefined}
                            </Avatar>
                    </IconButton>
                </Hidden>
                {data && data!==null ? (
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
              <ThemeCon anchorEl={anchorEl} openMenu={openMenu} handleClose={handleClose} setOpenMenu={setOpenMenu} />
          </Toolbar>
      </AppBar>
  );
}

export default React.memo(withStyles(Appbar,AppStyles))

/*
<MenuItem onClick={handleTheme}>
                      {prefersDarkMode ? (
                        <Tooltip enterTouchDelay={100} interactive title="You cannot change the theme, because the dark theme on your device is active" classes={{tooltip:classes.tooltip}}>
                          <div><span>Dark Theme: ON</span></div>
                        </Tooltip>
                      ) : `Dark Theme: ${isDark ? 'ON' : 'OFF'}`}
                  </MenuItem>
*/