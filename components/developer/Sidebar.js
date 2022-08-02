import React, { Fragment,useState } from 'react';
import Link from 'next/link'
import {useRouter} from 'next/router';
import { alpha } from '@mui/material/styles';
import {makeStyles} from 'portal/components/styles';
import Button from 'portal/components/Button'
import classNames from 'classnames';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {Hidden,Drawer,Divider,Typography,ListItem,ListItemText,Fade,Tooltip} from '@mui/material'
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import {otherMenuArray} from 'portal/components/header/Menu'
import SearchIcon from '@mui/icons-material/Search';
import Image from 'portal/components/Image'
import {isMobile} from 'react-device-detect';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react'
import {useDarkTheme} from 'portal/utils/useDarkTheme'
import * as gtag from 'portal/utils/gtag'

const drawerWidth = 240;
const styles = makeStyles()((theme,_,classes) => ({
    user: {
        justifyContent: 'center'
    },
    drawerPaper: {
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
        border: 'none',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
    },
    swipeDrawerPaper: {
        width: '70%',
        maxWidth:480
    },
    opened: {
        background: theme.palette.primary.action,
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
    drawerInner: {
        // Make the items inside not wrap when transitioning:
        width: drawerWidth,
        height: '100%',
        position:'fixed'
    },
    drawerInnerMobile: {
        // Make the items inside not wrap when transitioning:
        width: '100%',
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
            //boxShadow: theme.shadows[6],
            '& li ul': {
                display: 'block'
            }
        },
        [`& .${classes.menuContainer}`]: {
            width:drawerWidth
        }
    },
    avatar: {
        margin: 10,
        backgroundColor:'unset'
    },
    bigAvatar: {
        width: 80,
        height: 80,
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
        paddingLeft:16,
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
    primary: {
        textOverflow:'ellipsis',
        whiteSpace:'nowrap',
        overflow:'hidden'
    },
    primaryNested: {
        paddingLeft:0,
        textOverflow:'ellipsis',
        whiteSpace:'nowrap',
        overflow:'hidden'
    },
    icon: {
        'svg':{
            marginRight: 0,
            color: theme.palette.text.primary,
        }
    },
    head: {
        paddingLeft: '16px',
        borderRadius:'.625rem',
        margin:'3px 0'
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 10px 5px',
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
    menuContainer: {
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
}));

/* OTHER MENU */
const OtherMenusComp=({toggleDrawerOpen})=>{
    const {classes} = styles();  
    const getOtherMenu = menuArray => menuArray.map((item, index) => {
        const keyIndex = index.toString();
        const handleClick=()=>{
            toggleDrawerOpen ? toggleDrawerOpen() : null;
        }
        return (
             <React.Fragment key={keyIndex}>
                {item.link ? (
                    <Link href={item.link} passHref {...(item.as ? {as:item.as} : {})}>
                        <a onClick={handleClick} className={classes.otherMenuChild}>
                            {item.short ? (
                                <Tooltip title={item.short} disableInteractive>
                                    <span>{item.name}</span>
                                </Tooltip>
                            ) : <span>{item.name}</span>}
                        </a>
                    </Link>
                ) : (
                    <a className={classes.otherMenuChild} href={item.exlink} target='_blank' rel='nofollow noopener noreferrer' onClick={handleClick}>
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
const OtherMenu = React.memo(OtherMenusComp)

/* MAIN MENU */
const MainMenu=({menu,toggleDrawerOpen,active,subactive})=>{
    const {classes} = styles();
    const router=useRouter()
    const [isParent,setIsParent] = useState(typeof subactive === 'string' && subactive?.length > 0 ? active : null);

    const handleClick=()=>{
        toggleDrawerOpen ? toggleDrawerOpen() : null;
    }
    const linkClick=(item)=>(e)=>{
        if(e) e.preventDefault();

        if(isParent !== null || item?.href && !item?.child) {
            if(item?.href==router.pathname) {
                router.push({
                    pathname:router.pathname,
                    query:{
                        reloadedPage:true
                    }
                },(item?.as||item?.href));
            } else {
                router.push(item?.href,(item?.as||item?.href));
            }
            handleClick();
        } else {
            setIsParent(item?.key);
        }
    }

    const getMenus = (mn)=>mn?.map((item, index) => {
        return(
            <React.Fragment key={`listitem-${index}`}>
                {isParent !== null && subactive && index===0 ? (
                    <Button
                        key={`listitem-menu-0`}
                        text
                        onClick={()=>setIsParent(null)}
                        startIcon={<ArrowBack />}
                        size="large"
                        sx={{width:'100%',mb:3}}
                    >
                        Back
                    </Button>
                ) : null}

                <ListItem
                    key={`listitem-menu-1`}
                    //style={{paddingLeft:0}}
                    button
                    className={classNames(classes.head,classes.hovered,(isParent === null && active===item.key || isParent !== null && subactive === item?.key) ? classes.opened : '')}
                    classes={{selected:classes.active}}
                    component='a'
                    href={isParent !== null || (item?.href && !item?.child) ? (item.as || item.href) : "#"}
                    onClick={linkClick(item)}
                >
                    <Tooltip title={item.name} disableInteractive><ListItemText classes={{ primary: classes.primary }} primary={item.name}/></Tooltip>
                </ListItem>
            </React.Fragment>
        )
    })

    const menuFilter = React.useMemo(()=>{
        return Array.isArray(menu) ? menu.filter(i=>typeof i?.menu === 'undefined') : [];
    },[menu])

    const menuFilterChild = React.useMemo(()=>{
        if(isParent !== null) {
            return menu?.filter(i=>(i.key === isParent && i.child))?.map(i=>i.child)?.[0]||[];
        }
        return [];
    },[active,menu,isParent])
    

    React.useEffect(()=>{
        setIsParent(typeof subactive === 'string' && subactive?.length > 0 ? active : null)
    },[subactive,active])

    return (
        <>
            <Fade in={isParent !== null} key='menu-0'>
                <div>
                    {menuFilter?.length > 0 && getMenus(menuFilterChild)}
                </div>
            </Fade>
            <Fade in={isParent === null} key='menu-1'>
                <div>
                    {isParent === null && getMenus(menuFilter)}
                </div>
            </Fade>
        </>
    );
}

const MainMenuStyle = React.memo(MainMenu);

/* MENU CONTENT */
const MemoizeImage=React.memo(Image)
const MenuContent=({menu,drawerPaper,toggleDrawerOpen,active,drawerMobile,subactive,withHeight})=>{
    const {classes} = styles();
    const {isDark}=useDarkTheme()
    return (
        <div 
        id='sidebar-menu-content'
        className={classNames(drawerMobile ? classes.drawerInnerMobile : classes.drawerInner,!drawerPaper ? classes.drawerPaperClose : '')}
        //{...(!drawerPaper ? { style:{width:'66px'} } : {})}
        >
            <div className={classes.drawerHeader}>
                <div className={classNames(classes.brand, classes.brandBar)}>
                    <h3>portalnesia.com</h3>
                </div>
                <div className={classNames(classes.profile, classes.user)}>
                    <MemoizeImage alt='Portalnesia' className={classNames(classes.avatar, classes.bigAvatar)} src='/pn-round.png' width='100%' />
                    <div>
                        <h4 style={{margin:0}}>Portalnesia</h4>
                        <span>Developer</span>
                    </div>
                </div>
            </div>
            {isMobile ? (
                <div className={classNames(classes.menuContainer, withHeight && classes.withHeight)}>
                    <MainMenuStyle menu={menu} toggleDrawerOpen={toggleDrawerOpen} active={active} subactive={subactive}/>
                    <Divider className={classes.divider} />
                    <OtherMenu toggleDrawerOpen={toggleDrawerOpen} />
                </div>
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
                    <MainMenuStyle menu={menu} toggleDrawerOpen={toggleDrawerOpen} active={active} subactive={subactive}/>
                    <Divider className={classes.divider} />
                    <OtherMenu toggleDrawerOpen={toggleDrawerOpen} />
                </OverlayScrollbarsComponent>
            )}
        </div>
    );
}

const MenuContentStyle = React.memo(MenuContent);

/* SIDEBAR */
const Sidebar=({menu,toggleDrawerOpen,open,active,subactive})=>{
    const {classes} = styles();  
    return (
        <Fragment>
            <Hidden mdUp>
                <SwipeableDrawer
                    onClose={toggleDrawerOpen}
                    onOpen={toggleDrawerOpen}
                    open={!open}
                    anchor='left'
                    classes={{
                        paper: classes.swipeDrawerPaper,
                    }}
                >
                    <MenuContentStyle menu={menu} drawerPaper subactive={subactive} toggleDrawerOpen={toggleDrawerOpen} active={active} drawerMobile />
                </SwipeableDrawer>
            </Hidden>
            <Hidden mdDown>
                <Drawer
                    id='sidebar-menu'
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawer, classes.drawerPaper, !open ? classes.drawerPaperClose : ''),
                    }}
                    //style={{height:'100%',overflowY:'auto'}}
                    open
                    anchor='left'
                >
                    <MenuContentStyle withHeight menu={menu} drawerPaper={open} subactive={subactive} active={active}/>
                </Drawer>
            </Hidden>
        </Fragment>
    );
}

export default React.memo(Sidebar);