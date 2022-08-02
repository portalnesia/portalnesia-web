import React from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import { alpha } from '@mui/material/styles';
import {makeStyles} from 'portal/components/styles';
import classNames from 'classnames';
import {Hidden,AppBar,Toolbar,IconButton,Typography,Divider,Menu,MenuItem,CircularProgress,ListItemIcon} from '@mui/material'
import Avatar from 'portal/components/Avatar'
import Image from 'portal/components/Image'
import Button from 'portal/components/Button'
import Search from 'portal/components/developer/Search'
import ThemeCon from 'portal/components/header/ThemeCon'
import {
  ExitToApp,
  Search as SearchIcon,
  Keyboard as KeyboardIcon,
  Brightness4 as DarkIcon,
  Feedback as FeedbackIcon,
  ContactSupport,
  Menu as MenuIcon
} from '@mui/icons-material'
const drawerWidth = 240;

const styles = makeStyles()((theme,_,classes) => ({
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
      width: 200,
      cursor:'pointer',
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      },
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: '50%'
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
  },
  input: {
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
  darker: {
    background: theme.palette.primary.dark,
    '&:after': {
      content: '""',
      left: -240,
      width: 'calc(100% + 240px)',
      position: 'absolute',
      bottom: -2,
      height: 1,
      background: '#000',
      filter: 'blur(3px)'
    }
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
    margin:'10 !important'
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
  dense: {
    marginLeft: 15,
  },
  nolist: {
    listStyle: 'none',
  },
  btn:{
    '&.active, &:hover':{
      backgroundColor:`rgba(255, 255, 255, 0.08) !important`
    }
  },
}));
//let sudah=false,dat=null;
const Menuu=({handleBack,data,error})=>{
    const {classes} = styles();  
    const router=useRouter();
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);
    /* =========================*/
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
      if(href==router.pathname) {
          //let quer={...router.query}
          //if(quer.page) delete quer.page;
          //if(quer.slug) delete quer.slug
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
      <div className="userMenu">
          <IconButton
            key='user-btn'
            disabled={Boolean(typeof data === 'undefined' && !error)}
            onClick={handleMenu('user-setting')}
            aria-haspopup="true"
            color="inherit"
            size="large">
            <Avatar alt="Option" withTop={typeof data !== 'undefined'}>
              {typeof data === 'undefined' && !error ? (
                <CircularProgress color='secondary' />
              ) : typeof data!=='undefined' && data !== null ? 
                  data.picture !== null ? <Image width={40} height={40} lazy={false} src={`${data.picture}&watermark=no&size=40`}/>
                  : data.name
              : undefined}
            </Avatar>
          </IconButton>
          <Menu key='user-menu'
            id="menu-appbar"
            anchorPosition={anchorEl}
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
            <MenuItem onClick={()=>setOpenMenu('theme')}><ListItemIcon><DarkIcon /></ListItemIcon> Themes</MenuItem>
            <MenuItem onClick={()=>{handleBack('feedback',true),handleClose()}}><ListItemIcon><FeedbackIcon /></ListItemIcon> Send Feedback</MenuItem>
            <MenuItem component='a' href={`/support`} onClick={linkClick(`/support/[[...slug]]`,'/support')}><ListItemIcon><ContactSupport /></ListItemIcon> Support</MenuItem>
            <Divider />
            <MenuItem component='a' href='/' onClick={linkClick(`/`)}><ListItemIcon><ExitToApp /></ListItemIcon> Back to Portalnesia</MenuItem>
          </Menu>
          <ThemeCon anchorEl={anchorEl} openMenu={openMenu} handleClose={handleClose} setOpenMenu={setOpenMenu} />
          <style jsx>{`
            .message{
              width:100%;
              display:-webkit-box;
              display:-ms-flexbox;
              display:flex;
              padding:10px;
              background:none;
              border:none;
            }
            .icon-avatar{
              min-width:56px;
              flex-shrink:0;
            }
          `}</style>
      </div>
    );
}

const UserMenu=React.memo(Menuu);

const FullMenuu = ({menu=[],active,handleClose,isSmDown,anchorEl=null})=>{
  const {classes} = styles();
  const router=useRouter();
  const linkClick=(href,as)=>(e)=>{
    e.preventDefault();
    router.push(href,(as||href));
    handleClose();
  }

  const menuFilter = React.useMemo(()=>{
    return Array.isArray(menu) ? menu.filter(i=>typeof i?.menu === 'undefined') : [];
  },[menu])

  if(isSmDown) {
    return (
      <Menu
        anchorEl={anchorEl}
        PaperProps={{
            className:classes.notifMenu,
            style: {
                width: '80%',
                maxWidth:400
            },
        }}
        open={anchorEl !== null}
        onClose={handleClose}>
          {menuFilter?.map((m,i)=>(
            <MenuItem key={`menu-${i}`} selected={active === m?.key} onClick={linkClick(m?.as || m?.href,m?.as)} component='a' href={m?.as || m?.href}>
              {m?.name}
            </MenuItem>
          ))}
      </Menu>
    )
  }
  return menuFilter?.map((m,i)=>(
    <Link key={`menu-${i}`} href={m?.href} as={m?.as||m?.href} passHref>
      <Button className={classNames(classes.btn,active === m.key && 'active')} size='medium' text component='a' style={{textTransform:'inherit',margin:'14px 8px'}}>
        <div style={{display:'flex',alignItems:'center',color:'#FFF'}}>
            {m.name}
        </div>
      </Button>
    </Link>
  ))
}
const FullMenu = React.memo(FullMenuu);

const Headerr = ({full,menu,open,handleBack,toggleDrawerOpen,data,error,active,subactive})=>{
    const {classes} = styles();
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [search,setSearch] = React.useState(false);
    const router = useRouter();

    const handleSearchClose=React.useCallback(()=>{
      setSearch(false);
    },[])

    const handleSearchOpen=React.useCallback(()=>{
      setSearch(true)
    },[])

    const handleMenu = React.useCallback((menu)=>(event) => {
      setAnchorEl(menu ? event.currentTarget : null);
    },[]);

    const handleClose=React.useCallback(()=>{
      setAnchorEl(null);
    },[])

    const handleFullSearch=React.useCallback((m)=>{
      if(m?.key && m?.href) {
        router.push(m.href,m?.as);
      } else {
        const rapidoc = document?.getElementById('rapidocs');
        if(rapidoc) {
          const url = new URL("http://localhost" + m?.as);
          const as = url.hash.substring(1);
          rapidoc.scrollTo(as);
          setTimeout(()=>window.dispatchEvent(new HashChangeEvent("hashchange")),50);
        }
      }
    },[])

    return (
      <AppBar
          className={
              classNames(
                  classes.appBar,
                  open && !full && classes.appBarShift
              )
          }
      >
        <Toolbar disableGutters={true}>
          {!full ? (
            <>
              <Hidden mdUp>
                <IconButton
                  className={classes.menuButton}
                  color="inherit"
                  aria-label="Back"
                  onClick={toggleDrawerOpen}
                  size="large">
                    <MenuIcon />
                </IconButton>
              </Hidden>
              <Hidden mdUp>
                <div className={classNames(classes.brand, classes.brandBar,classes.brandMobile)}>
                  <Link href="/developer" passHref><a><h3 className={classes.brandH3}>Portalnesia Dev</h3></a></Link>
                </div>
              </Hidden>
              <div className={classes.flex}>
                <Hidden smDown>
                  <div className={classes.wrapper}>
                    <div className={classes.search}>
                        <SearchIcon />
                    </div>
                    <button className={classes.input} onClick={handleSearchOpen}>
                      Search
                    </button>
                  </div>
                </Hidden>
                <Hidden smUp>
                  <div className={classes.wrapper}>
                    <IconButton
                      aria-haspopup="true"
                      color="inherit"
                      size="large"
                      onClick={handleSearchOpen}
                    >
                      <SearchIcon />
                    </IconButton>
                  </div>
                </Hidden>
              </div>
              <Hidden smDown>
                <span className={classes.separatorV} />
              </Hidden>
              <UserMenu data={data} error={error} handleBack={handleBack} />
            </>
          ) : (
            <>
              <div style={{display:'flex',flexDirection:'row',alignItems:'center',flexGrow:1}}>
                <Link key='link-1' href='/developer' passHref><a style={{display:'flex',alignItems:'center',paddingLeft:16}}>
                    <Image width={40} height={40} lazy={false} src='/icon/android-icon-48x48.png' alt='Portalnesia' style={{width:40}} />
                    <Typography sx={{pl:1}} variant='h6' component='h4'>Developer</Typography>
                </a></Link>
              </div>
              <Hidden smUp>
                <IconButton
                  onClick={handleMenu(true)}
                  aria-haspopup="true"
                  color="inherit"
                  size="large">
                  <MenuIcon />
                </IconButton>
                <FullMenu active={active} menu={menu||[]} isSmDown handleClose={handleClose} anchorEl={anchorEl} />
              </Hidden>
              <Hidden smDown>
                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
                  <FullMenu active={active} menu={menu||[]} />
                </div>
              </Hidden>
              <IconButton
                aria-haspopup="true"
                color="inherit"
                size="large"
                onClick={handleSearchOpen}
              >
                <SearchIcon />
              </IconButton>
              <span className={classes.separatorV} />
              <UserMenu data={data} error={error} handleBack={handleBack} />
              <style global jsx>{`
                body {
                  overflow: hidden;
                }
                rapi-doc {
                  height: calc(100% - 64px);
                  position: fixed;
                  top:64px;
                }
              `}</style>
            </>
          )}
          <Search open={search} onClose={handleSearchClose} menu={menu} {...(full ? {onSearch:handleFullSearch} : {})} />
        </Toolbar>
      </AppBar>
    );
}

export default React.memo(Headerr);