import React, { Fragment,useState } from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import {makeStyles} from 'portal/components/styles';
import { alpha } from '@mui/material/styles';
import classNames from 'classnames';
import {Hidden,Drawer,Divider,List,ListItem,ListItemIcon,ListItemText,Collapse,Tooltip,SvgIcon, ListItemButton} from '@mui/material'
import {menuArray,allMenuArray,otherMenuArray} from './Menu'
import Image from 'portal/components/Image'
import {isMobile} from 'react-device-detect';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react'
import {useDarkTheme} from 'portal/utils/useDarkTheme'
import * as gtag from 'portal/utils/gtag'
import ThemeCon from 'portal/components/header/ThemeCon'
//import {connect} from 'react-redux';
import {
    ExitToApp,
    AccountCircle,
    Message as MessageIcon,
    Search as SearchIcon,
    InsertDriveFile,
    Favorite as FavoriteIcon,
    Settings as SettingIcon,
    Keyboard as KeyboardIcon,
    Brightness4 as DarkIcon,
    ContactSupport,
    Lock as LoginIcon,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material'

const drawerWidth = 240;
const styles = makeStyles()((theme,_,classes) => {
    return {
        user:{
            justifyContent: 'center'
        },
        drawerPaper: {
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            //zIndex:'unset', // TODO INI HILANG
            backgroundColor: theme.palette.background.default,
            border: 'none',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerPaperBottom:{
            backgroundColor: theme.palette.background.default,
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            width:'100%',
            border:'none !important'
        },
        swipeDrawerPaper: {
            width: '70%',
            maxWidth:480
        },
        tooltip:{
            fontSize:15
        },
        opened: {
            background: `${theme.custom.action} !important`,
            /*background: theme.palette.grey[200],*/
            [`& .${classes.primary}, & .${classes.icon}, & svg`]: {
                color: `${theme.palette.text.primary} !important`,
            },
        },
        active: {
            background: `${theme.custom.action} !important`,
            [`& .${classes.primary}, & .${classes.icon}, & svg`]: {
                color: `${theme.palette.text.primary} !important`,
            },
        },
        hovered:{
            '&:hover':{
                background: `${theme.custom.action} !important`,
                color:`${theme.palette.text.primary} !important`,
                [`& .${classes.primary}, & .${classes.icon}`]: {
                    color:`${theme.palette.text.primary} !important`,
                },
            },
        },
        drawerInner:{
            height: '100%',
            position:'fixed',
        },
        drawerInnerNonMobile: {
            width: drawerWidth
        },
        drawerInnerMobile: {
            width: '100%',
            overflowY:'auto'
        },
        drawerInnerMobileHeight:{
            height:'calc(100vh - 57px - 64px)'
        },
        drawerHeader: {
            color: theme.palette.primary.contrastText,
            padding: '0',
            ...theme.mixins.toolbar,
            '& h3': {
                color: theme.palette.primary.contrastText,
            }
        },
        drawerPaperClose: {
            width: 66,
            position: 'fixed',
            overflowX: 'hidden',
            borderRight:`1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            [`& .${classes.user}`]: {
                justifyContent: 'flex-start'
            },
            [`& .${classes.bigAvatar}`]: {
                width: 40,
                height: 40,
                marginLeft:6,
                marginRight:14
            },
            '& li ul': {
                display: 'none'
            },
            '&:hover': {
                width: drawerWidth,
                borderRight:`none`,
                '& li ul': {
                    display: 'block'
                }
            },
            [`& .${classes.menuContainer}`]: {
                width:drawerWidth
            },
            [theme.breakpoints.up('md')]:{
                zIndex:1101
            }
        },
        avatar: {
            margin: 10,
            backgroundColor:'unset'
        },
        bigAvatar:{
            width: 80,
            height: 80
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
        nested: {
            padding: theme.spacing(0.7),
            borderRadius:'.625rem',
            margin:'3px 0'
        },
        child: {
            '& a': {
            paddingLeft: theme.spacing(6),
            }
        },
        dense: {
            marginLeft: 15,
            padding:0
        },
        nolist: {
            listStyle: 'none',
        },
        primary:{
            textOverflow:'ellipsis',
            whiteSpace:'nowrap',
            overflow:'hidden'
        },
        primaryNested: {
            paddingLeft:41,
            textOverflow:'ellipsis',
            whiteSpace:'nowrap',
            overflow:'hidden'
        },
        icon:{
            'svg':{
                marginRight: 0,
                color: theme.palette.text.primary,
            }
        },
        head: {
            paddingLeft: 16,
            borderRadius:'.625rem',
            margin:'3px 0'
        },
        brand: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 64,
            position: 'relative',
            '& img': {
            width: 20
            },
            '& h3': {
                fontSize: 16,
                margin: 0,
                paddingLeft: 10,
                fontWeight: 500
            },
            background: theme.palette.primary.main,
            [theme.breakpoints.down('md')]: {
                padding: '5px 10px',
            },
            [theme.breakpoints.up('md')]: {
                padding: '10px 10px 5px',
            },
        },
        profile: {
            height: 120,
            display: 'flex',
            fontSize: 14,
            padding: 10,
            alignItems: 'center',
            backgroundColor:theme.palette.background.default,
            '& h4': {
                color:theme.palette.text.primary,
                fontSize: 18,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: 110
            },
            '& span': {
                color:theme.palette.text.primary,
                fontSize: 12,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 110,
                display: 'block',
                overflow: 'hidden'
            }
        },
        menuContainer:{
            padding: theme.spacing(1),
            position: 'relative',
            display: 'block',
            backgroundColor:theme.palette.background.default,
            [theme.breakpoints.up('md')]: {
                overflow: 'auto',
            },
            [theme.breakpoints.down('md')]: {
                overflow: 'hidden',
            },
        },
        withHeight:{
            height: 'calc(100% - 185px)'
        },
        divider: {
            marginTop: `${theme.spacing(1.5)} !important`,
            marginBottom: `${theme.spacing(1.5)} !important`
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
            '&::placeholder':{
                color:'#ffffff'
            }
        },
        wrapperXS:{
            fontFamily: theme.typography.fontFamily,
            position: 'relative',
            marginRight: theme.spacing(1),
            marginLeft: theme.spacing(1),
            borderRadius: 2,
            background: alpha(theme.palette.common.white, 0.15),
            display: 'inline-block',
            width:'100%',
            '&:hover': {
                background: alpha(theme.palette.common.white, 0.25),
            },
            [`& .${classes.input}`]: {
                transition: theme.transitions.create('width'),
                width: '100%',
                [theme.breakpoints.up('sm')]: {
                    display: 'none'
                },
                '&::placeholder':{
                    color:'#ffffff'
                }
            },
        },
        searchXS:{
            width: theme.spacing(5),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [theme.breakpoints.up('sm')]: {
            display: 'none'
            },
        },
        otherMenuRoot:{
            WebkitBoxAlign:'stretch',
            WebkitBoxDirection:'normal',
            WebkitBoxOrient:'vertical',
            WebkitFlexBasis:'auto',
            WebkitFlexDirection:'column',
            WebkitFlexShrink:0,
            alignItems:'stretch',
            boxSizing:'border-box',
            display:'-webkit-box',
            display:'-moz-box',
            display:'-ms-flexbox',
            display:'-webkit-flex',
            display:'flex',
            flexBasis:'auto',
            flexDirection:'column',
            flexShrink:0,
            margin:0,
            marginBottom:15,
            padding:0,
            position:'relative',
            zIndex:0,
            '& a:hover':{
                textDecoration:'underline'
            },
            [`&.${classes.otherMenu}`]:{
                WebkitFlexDirection:'row',
                WebkitFlexWrap:'wrap',
                WebkitBoxDirection:'normal',
                WebkitBoxOrient:'horizontal',
                flexWrap:'wrap',
                flexDirection:'row',
                marginBottom:0,
                paddingLeft:theme.spacing(2),
                paddingRight:theme.spacing(2)
            },
            [`& .${classes.otherMenuChild}`]:{
                color:theme.palette.text.secondary,
                lineHeight:'20px',
                fontSize:13,
                overflowWrap:'break-word',
                margin:'2px 0',
                padding:0,
                paddingRight:10,
                whiteSpace:'pre-wrap',
            },
            '& span':{
                overflowWrap:'break-word',
                lineHeight:1.3125,
                color:theme.palette.text.secondary,
                whiteSpace:'pre-wrap',
            }
        },
        otherMenu:{},
        otherMenuChild:{}
    }
});

/* OTHER MENU */
const OtherMenus=()=>{
    const {classes} = styles();  
    const getOtherMenu = menuArray => menuArray.map((item, index) => {
        return (
             <React.Fragment key={`${index.toString()}_${item?.key}`}>
                {item.link ? (
                    <Link href={item.link} passHref {...(item.as ? {as:item.as} : {})}>
                        <a className={classes.otherMenuChild}>
                            {item.short ? (
                                <Tooltip title={item.short}  classes={{tooltip:classes.tooltip}}>
                                    <span>{item.name}</span>
                                </Tooltip>
                            ) : <span>{item.name}</span>}
                        </a>
                    </Link>
                ) : (
                    <a className={classes.otherMenuChild} href={item.exlink} target='blank' rel='nofollow noopener noreferrer'>
                        <span>{item.name}</span>
                    </a>
                )}
            </React.Fragment>
        );
    });
    return(
        <div style={{paddingBottom:5}}>
            <div key="other-sidebar-1" className={classes.otherMenuRoot} style={{marginBottom:5}}>
                <div className={classNames(classes.otherMenuRoot,classes.otherMenu)} style={{marginBottom:0}}>
                    {getOtherMenu(otherMenuArray)}
                </div>
            </div>
            <div key="other-sidebar-2" className={classes.otherMenuRoot}>
                <div className={classNames(classes.otherMenuRoot,classes.otherMenu)}>
                    <div className={classes.otherMenuChild}>
                        <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
                            <a property="dct:title" rel="cc:attributionURL" href="https://portalnesia.com">Portalnesia</a> © {(new Date().getFullYear())} is licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer" style={{display:"inline-block"}}>CC BY 4.0</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
const OtherMenu = React.memo(OtherMenus)

/* MAIN MENU */
const MainMenu=({notBack,data,collapse,active,subactive,mobile,handleBack})=>{
    const {classes} = styles();  
    const dense=false;
    const router=useRouter()
    const [anchorEl,setAnchorEl]=React.useState(null);
    const [openMenu,setOpenMenu]=React.useState(null);

    const handleClose = () => {
        setOpenMenu(null);
        setAnchorEl(null);
    };


    const [open,setOpen]=useState(active);
    /*const handleClick=()=>{
        toggleDrawerOpen ? toggleDrawerOpen() : null;
    }*/
    const onOpen=(key)=>{
        if(open===key) setOpen(null)
        else setOpen(key);
    }
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
        //handleClick();
    }
    const filteredMenu = React.useMemo(()=>{
        let arr = [...menuArray]
        if(mobile && notBack) arr.splice(1,3)
        return arr
    },[mobile,notBack]);
    const filteredAllMenu = React.useMemo(()=>{
        return allMenuArray;
    },[]);
    const mobileUserMenu = React.useMemo(()=>{
        if(data && data!==null) {
            return [
                ...(!notBack ? [{
                    key: 'profile',
                    name: 'Profile',
                    icon: <AccountCircle />,
                    link:'/user/[...slug]',
                    as:`/user/${data?.username}`,
                    short: 'G + P'
                }] : []),
                {
                    key: 'messages',
                    name: 'Messages',
                    icon: <MessageIcon />,
                    link:'/messages/[[...slug]]',
                    as:`/messages`,
                    short: 'G + M'
                },
                {
                    key: 'file_manager',
                    name: 'File Manager',
                    icon: <InsertDriveFile />,
                    link:'/file-manager',
                    short: 'G + F'
                },
                {
                    key: 'likes',
                    name: 'Likes',
                    icon: <FavoriteIcon />,
                    link:'/likes/[[...slug]]',
                    as:`/likes`,
                    short: 'G + L'
                },
                {
                    key: 'setting',
                    name: 'Setting',
                    icon: <SettingIcon />,
                    link:'/setting/[[...slug]]',
                    as:`/setting`,
                    short: 'Shift + S'
                },
            ]
        } else return [];
    },[mobile,data,notBack])

    const mobileMenu=(data,mobile,handleBack)=>{
        if(!mobile) return null
        const menu=[
            {
                key: 'keyboard_shortcut',
                name: 'Keyboard Shortcut',
                icon: <KeyboardIcon />,
                action:()=>{handleBack('keyboard',true)},
            },
            {
                key: 'change_theme',
                name: 'Themes',
                icon: <DarkIcon />,
                action:(event)=>{setAnchorEl(event.currentTarget),setOpenMenu('theme')},
            },
        ];
        const botMenu=React.useMemo(()=>{
            if(data && data!==null) {
                return [
                    {
                        key: 'support',
                        name: 'Support',
                        icon: <ContactSupport />,
                        link:'/support',
                        internal:true
                    },
                    {
                        key: 'logout',
                        name: 'Logout',
                        icon: <ExitToApp />,
                        link: `${process.env.ACCOUNT_URL}/logout`,
                    },
                ]
            } else {
                return [
                    {
                        key: 'login',
                        name: 'Login',
                        icon: <LoginIcon />,
                        link: `${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(process.env.URL+router.asPath)}`,
                    },
                    {
                        key: 'register',
                        name: 'Register',
                        icon: <AccountCircle />,
                        link: `${process.env.ACCOUNT_URL}/register`,
                    },
                ]
            }
        })
        return (
            <>
                {menu.map((item,index)=>(
                    <div key={`${index.toString()}_${item?.key}`}>
                        <Tooltip title={item.name} classes={{tooltip:classes.tooltip}}>
                            <ListItem
                                style={{paddingLeft:0}}
                                button
                                onClick={item.action}
                            >
                                <ListItemIcon style={{width:'45px',minWidth:0,marginLeft:'16px',marginRight:0}} className={classNames(classes.icon)}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item?.name} />
                            </ListItem>
                        </Tooltip>
                    </div>
                ))}
                {botMenu.map((item,index)=>(
                    <div key={`${(index+10)}_${item?.key}`}>
                        <Tooltip title={item.name} classes={{tooltip:classes.tooltip}}>
                            <ListItem
                                style={{paddingLeft:0}}
                                button
                                component='a'
                                href={item.link}
                                {...(item?.internal ? {onClick:linkClick(item.link || item.link)} : {})}
                            >
                                <ListItemIcon style={{width:'45px',minWidth:0,marginLeft:'16px',marginRight:0}} className={classNames(classes.icon)}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item?.name} />
                            </ListItem>
                        </Tooltip>
                    </div>
                ))}
                <ThemeCon setAnchorEl={setAnchorEl} mobile anchorEl={anchorEl} openMenu={openMenu} handleClose={handleClose} setOpenMenu={setOpenMenu} />
            </>
        )
    }

    const getMenus = menuArrayy => menuArrayy.map((item, index) => {
        if(item.child) {
            return(
                <div key={`${index.toString()}_${item?.key}`}>
                    <Tooltip title={item.name} classes={{tooltip:classes.tooltip}}><ListItem
                    style={{paddingLeft:0}}
                    button
                    className={classNames(classes.head,classes.hovered,active===item.key ? classes.opened : '')}
                    onClick={() => onOpen(item.key)}
                    >
                        {item.icon &&
                            <ListItemIcon style={{width:'45px',minWidth:0,marginLeft:'16px',marginRight:0}} className={classNames(classes.icon)}>
                                {item.fontAwesome ? <SvgIcon>{item.icon}</SvgIcon> : item.icon}
                            </ListItemIcon>
                        }
                        <ListItemText classes={{ primary: classes.primary }} primary={item.name} />
                        { open === item.key ? <ExpandLess /> : <ExpandMore /> }
                    </ListItem></Tooltip>

                    <Collapse
                        component="li"
                        className={classNames(
                            classes.nolist,
                            //(item.keyParent ? classes.child : ''),
                        )}
                        in={open === item.key}
                        timeout="auto"
                        unmountOnExit
                    >
                        <List className={classes.dense} dense={dense}>
                            {item.child.map((child,i)=>{
                                return(
                                    <ListItemButton
                                        key={`listitembutton${child.name}_${i}`}
                                        className={classNames(classes.nested,classes.hovered, subactive===child.key ? classes.opened : '')}
                                        classes={{selected:classes.active}}
                                        component='a'
                                        href={child.as||child.link}
                                        onClick={linkClick(child.link,child.as||child.link)}
                                    >
                                        <Tooltip title={`${child.name}${child.short ? ` (${child.short})` : ''}`} classes={{tooltip:classes.tooltip}}><ListItemText classes={{ primary: classes.primaryNested }} primary={child.name}/></Tooltip>
                                    </ListItemButton>
                                )
                            })}
                        </List>
                    </Collapse>
                </div>
            )
        }
        return(
            <ListItemButton
                key={`${index.toString()}_${item?.key}`}
                style={{paddingLeft:0}}
                className={classNames(classes.head,classes.hovered,active===item.key ? classes.opened : '')}
                classes={{selected:classes.active}}
                component='a'
                href={item.as || item.link}
                onClick={linkClick(item.link,item.as || item.link)}
            >
                {item.icon &&
                    <ListItemIcon style={{width:'45px',minWidth:0,marginLeft:'16px',marginRight:0}} className={classNames(classes.icon)}>
                        {item.fontAwesome ? <SvgIcon>{item.icon}</SvgIcon> : item.icon}
                    </ListItemIcon>
                }
                <Tooltip title={`${item.name}${item.short ? ` (${item.short})`:''}`} classes={{tooltip:classes.tooltip}}><ListItemText classes={{ primary: classes.primary }} primary={item.name}/></Tooltip>
            </ListItemButton>
        )
    })
    
    return (
        <div key='menu'>
            {mobile && data && data!==null ? (
                <>
                    {getMenus(mobileUserMenu)}
                    <Divider className={classes.divider} />
                </>
            ) : null}
            {getMenus(filteredMenu)}
            <Collapse
                className={classNames(
                    classes.nolist,
                )}
                in={collapse}
                timeout="auto"
                unmountOnExit
            >
                {getMenus(filteredAllMenu)}
            </Collapse>
            {mobile && (
                <>
                    <Divider className={classes.divider} />
                    {mobileMenu(data,mobile,handleBack)}
                </>
            )}
        </div>
    );
}

const MainMenuStyle = React.memo(MainMenu);

/* MENU CONTENT */
let sear='';
const MemoizeImage=React.memo(Image)
const MenuContent=({data,notBack,errorInitial,collapse,onCollapse,withHeight,drawerPaper,active,drawerMobile,subactive,handleBack})=>{
    const {classes} = styles();  
    const router=useRouter();
    const {q}=router.query;
    const pathname=router.pathname;
    const {isDark}=useDarkTheme()
    const [search,setSearch]=React.useState(sear);
    const handleSearch=(e)=>{
        e.preventDefault();
        if(search.length) {
            gtag.event({
                action:"search",
                search_term:search
            })
            //toggleDrawerOpen ? toggleDrawerOpen() : null;
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
    const CollapseComponent=()=>(
        <div key='menu-collapse'>
            <Tooltip title={collapse ? "See Less" : "See More"} classes={{tooltip:classes.tooltip}}><ListItem
                style={{paddingLeft:0}}
                button
                className={classNames(classes.head,classes.hovered)}
                onClick={onCollapse}
                >
                    <ListItemText style={{marginLeft:16}} classes={{ primary: classes.primary }} primary={collapse ? "See Less" : "See More"} />
                    { collapse ? <ExpandLess /> : <ExpandMore /> }
                </ListItem>
            </Tooltip>
        </div>
    )
    React.useEffect(()=>{
        if(pathname=='/search' && q) {
          const qq=decodeURIComponent(q)
          sear=qq
          setSearch(qq)
        }
    },[q,pathname])
    return (
        <div 
        id='sidebar-menu-content'
        className={
            classNames(
                classes.drawerInner,
                drawerMobile ? classes.drawerInnerMobile : classes.drawerInnerNonMobile,
                drawerMobile && notBack ? classes.drawerInnerMobileHeight : '',
                !drawerPaper && !drawerMobile ? classes.drawerPaperClose : ''
            )
        }
        >
            <div className={classes.drawerHeader}>
                <div className={classNames(classes.brand, classes.brandBar)}>
                    <Hidden mdUp>
                        <div className={classes.wrapperXS}>
                            <div className={classes.searchXS}>
                                <SearchIcon />
                            </div>
                            <form onSubmit={handleSearch}><input id='search-input-home' className={classes.input} placeholder="Search" value={search} onChange={changeSearch} /></form>
                        </div>
                    </Hidden>
                    <Hidden mdDown>
                        <h3>portalnesia.com</h3>
                    </Hidden>
                </div>
                <div className={classNames(classes.profile, classes.user)}>
                    <MemoizeImage width={drawerMobile ? 40 : !drawerPaper ? 40 : 80} alt='Portalnesia' className={classNames(classes.avatar, classes.bigAvatar)} src='/pn-round.png' />
                    <div>
                        <h4 style={{margin:0}}>Portalnesia</h4>
                        <span>{`© ${(new Date().getFullYear())}`}</span>
                    </div>
                </div>
            </div>
            {isMobile ? (
                <>
                    <div className={classNames(classes.menuContainer, withHeight && classes.withHeight)} {...(drawerMobile && notBack ? {} : {style:{marginBottom:56}})}>
                        <Hidden mdUp>
                            <MainMenuStyle notBack={notBack} data={data} errorInitial={errorInitial} handleBack={handleBack} mobile collapse active={active} subactive={subactive}/>
                        </Hidden>
                        <Hidden mdDown>
                            <MainMenuStyle notBack={notBack} data={data} errorInitial={errorInitial} handleBack={handleBack} collapse={collapse} active={active} subactive={subactive}/>
                            <CollapseComponent />
                        </Hidden>
                        <Divider className={classes.divider} />
                        <OtherMenu />
                    </div>
                </>
            ) : (
                <OverlayScrollbarsComponent 
                    className={classNames(isDark ? 'os-theme-light' : 'os-theme-dark',classes.menuContainer, withHeight && classes.withHeight)}
                    options={{
                        className:classNames(isDark ? 'os-theme-light' : 'os-theme-dark',classes.menuContainer, withHeight && classes.withHeight),
                        scrollbars : {
                            autoHide: "l",
                            autoHideDelay:0
                        }
                    }}
                >
                    <MainMenuStyle data={data} errorInitial={errorInitial} handleBack={handleBack} collapse={collapse} active={active} subactive={subactive}/>
                    <CollapseComponent />
                    <Divider className={classes.divider} />
                    <OtherMenu />
                </OverlayScrollbarsComponent>
            )}
        </div>
    );
}

MenuContent.defaultProps = {
    collapse:false,
    onCollapse:()=>{}
};

const MenuContentStyle = React.memo(MenuContent);

/* SIDEBAR */
let colla=false
const Sidebar=({data,errorInitial,open,active,subactive,handleBack,notBack})=>{
    const {classes} = styles();  
    const [collapse,setCollapse]=React.useState(colla)
    const onCollapse=React.useCallback(()=>{
        colla=!collapse;
        setCollapse(!collapse)
    },[collapse])
    return (
        <Fragment>
            <Hidden mdUp>
                <Drawer
                    id='sidebar-menu'
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaperBottom),
                    }}
                    open={!open}
                    transitionDuration={0}
                >
                    <MenuContentStyle notBack={notBack} data={data} errorInitial={errorInitial} handleBack={handleBack} collapse={collapse} onCollapse={onCollapse}  drawerPaper={open} subactive={subactive} active={active} drawerMobile />
                </Drawer>
            </Hidden>
            <Hidden mdDown>
                <Drawer
                    id='sidebar-menu'
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !open ? classes.drawerPaperClose : ''),
                    }}
                    //style={{height:'100%',overflowY:'auto'}}
                    open={open}
                    anchor='left'
                >
                    <MenuContentStyle notBack={notBack} data={data} errorInitial={errorInitial} handleBack={handleBack} withHeight collapse={collapse} onCollapse={onCollapse} drawerPaper={open} subactive={subactive} active={active}/>
                </Drawer>
            </Hidden>
        </Fragment>
    );
}
  
export default React.memo(Sidebar);