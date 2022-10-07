import React from 'react'
import { NextSeo,LogoJsonLd } from 'next-seo';
//import Button from './Button'
import {truncate as Ktruncate,clean,addslashes,uuid} from '@portalnesia/utils'
import clx from 'classnames';
import { useTheme } from '@mui/material/styles';
import {makeStyles} from 'portal/components/styles';
import {connect} from 'react-redux';
import Head from 'next/head'
import Image from 'portal/components/Image'
import Cookies from 'js-cookie'
import useAPI from 'portal/utils/api'
import {useRouter} from 'next/router'
import {useSocket,CallContainer} from 'portal/utils/Socket'
import {useHotKeys} from 'portal/utils/useKeys'
import {getInstalledApps} from 'portal/utils/Main'
import {useNotif} from './Notification'
import {Hidden,IconButton,Typography,Grid,Divider,Paper,Card,CardActions,Collapse,SvgIcon,Fade,CircularProgress} from '@mui/material'
import {Close,ExpandMore,LibraryMusic,Dashboard,Menu as MenuIcon,LibraryBooks} from '@mui/icons-material'
import Link from 'next/link'
import { Workbox } from 'workbox-window'
import {useNotification} from 'portal/components/header/Notification'
import { useSnackbar } from 'notistack';
import dynamic from 'next/dynamic'
import {isMobile} from 'react-device-detect'
import {useDarkTheme} from 'portal/utils/useDarkTheme'
import * as gtag from 'portal/utils/gtag'
import firebaseApp from 'portal/utils/firebase'
import {getMessaging,getToken,onMessage} from 'firebase/messaging'
//import Appbar from './HeaderNoSidebar'
import HeaderContent from './header/HeaderComponent'
import Sidebar from './header/Sidebar'
import useSWR from 'portal/utils/swr'
import loadingImage from 'portal/components/header/loading-image-base64'
import ReCaptcha from 'portal/components/ReCaptcha'

const BottomNavigation=dynamic(()=>import('@mui/material/BottomNavigation'))
const BottomNavigationAction=dynamic(()=>import('@mui/material/BottomNavigationAction'))
const Dialog=dynamic(()=>import('@mui/material/Dialog'),{ssr:false})
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'),{ssr:false})
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'),{ssr:false})
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'),{ssr:false})
const Portal=dynamic(()=>import('@mui/material/Portal'),{ssr:false})
const Appbar = dynamic(()=>import('./HeaderNoSidebar'))
const Button = dynamic(()=>import('./Button'))
const Feedback=dynamic(()=>import('./Feedback'),{ssr:false});

const appFrame = {
    position: 'relative',
    //display: 'flex',
    width: '100%',
    zIndex: 1,
  };

const styles = makeStyles()((theme,_,classes) => {
  return {
    appFrameInner: {
      ...appFrame,
      height: '100%',
    },
    content: {
      backgroundColor: theme.palette.background.default,
      width: '100%',
      //height: '100%',
      //overflow: 'auto',
    },
    contentFull:{
      padding: theme.spacing(2),
      [theme.breakpoints.down('md')]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
      },
      [theme.breakpoints.up('md')]: {
        //paddingLeft: theme.spacing(1.5),
        paddingLeft: theme.spacing(31.5),
        paddingRight: theme.spacing(1.5),
      },
    },
    mainWrap: {
      position: 'relative',
      marginTop: theme.spacing(8),
      height: '100%',
      '& > div': {
        paddingBottom: theme.spacing(4),
        willChange: 'inherit !important' // hack for floating form issue whne expaded
      },
      '& > a':{
        color:theme.palette.primary.link
      },
    },
    mainWrapM:{
      marginTop: 90,
    },
    contentPadding: {
      [theme.breakpoints.up('md')]: {
        paddingLeft: 80
      },
    },
    keyboard:{
      WebkitBoxPack:'justify',
      justifyContent:'space-between',
      WebkitBoxDirection:'normal',
      WebkitBoxOrient:'horizontal',
      flexDirection:'row',
      display:'flex',
      flexBasis:'auto',
      position:'relative',
      marginTop:5,
      marginBottom:5,
      [`& .${classes.keyTitle}`]:{display:'inline'},
      [`& .${classes.keyCode}`]:{
        display:'flex',
        WebkitBoxAlign:'center',
        alignItems:'center',
        WebkitBoxDirection:'normal',
        WebkitBoxOrient:'horizontal',
        flexDirection:'row',
      },
      [`& .${classes.keyLabel}`]:{
        minWidth:'1.7rem',
        textAlign:'center',
        padding:'1px 5px',
        borderRadius:5,
        border:'1px solid #e6ecf0',
        backgroundColor:'#f5f8fa'
      },
      [`& .${classes.keyPlus}`]:{
        paddingLeft:'.25rem',
        paddingRight:'.25rem'
      }
    },
    keyCode:{},
    keyTitle:{},
    keyLabel:{},
    keyPlus:{},
    wrapper:{
      minHeight:'calc(100% - 64px)'
    },
    contentNoSidebar: {
        backgroundColor: theme.palette.background.default,
        //overflow: 'auto',
        paddingTop:theme.spacing(2),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom:theme.spacing(2),
        //marginTop:64
    },
    wrapperNoSidebar:{
      marginBottom:theme.spacing(9),

    },
    footer:{
      WebkitBoxAlign:'stretch',
      WebkitBoxDirection:'normal',
      WebkitBoxOrient:'vertical',
      WebkitFlexBasis:'auto',
      WebkitFlexDirection:'column',
      WebkitFlexShrink:0,
      background:theme.palette.background.paper,
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
      padding:0,
      position:'relative',
      zIndex:0,
      '& p':{
        textAlign:'center'
      },
      '& a':{
          color:theme.palette.text.secondary,
          lineHeight:'20px',
          fontSize:13,
          overflowWrap:'break-word',
          margin:'2px 0',
          padding:0,
          paddingRight:10,
          whiteSpace:'pre-wrap',
          '&:hover':{
            textDecoration:'underline'
          },
          '& span':{
            overflowWrap:'break-word',
            lineHeight:1.3125,
            color:theme.palette.text.secondary,
            whiteSpace:'pre-wrap',
          }
      },
    },
    footerChild:{
      WebkitFlexDirection:'row',
      WebkitFlexWrap:'wrap',
      WebkitBoxDirection:'normal',
      WebkitBoxOrient:'horizontal',
      flexWrap:'wrap',
      flexDirection:'row',
      marginBottom:0,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    },
    noSidebar:{
      margin:0,height:'100%'
    },
    botnav:{
      bottom:0,
      width:'100%',
      zIndex:1225,
      position:'fixed',
      borderTop:`1px solid ${theme.palette.divider}`,
    },
    botnavSelected:{
      color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.main} !important`,
      paddingTop:6,
      fontWeight:'bold',
      [`& svg, & .${classes.botnavIcon}`]:{
        color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.main} !important`,
      }
    },
    botnavIcon:{}
  }
});

const useStyles=makeStyles()((theme)=>({
  root: {
      [theme.breakpoints.up('sm')]: {
          minWidth: '344px !important',
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: '500px',
      },
      backgroundColor: theme.palette.primary.main,
      width:'100%'
  },
  title:{
    fontWeight: 'bold',
    color:'#fff'
  },
  actionRoot: {
      padding: '8px 8px 8px 16px',
  },
  icons: {
    marginLeft: 'auto',
  },
  expand: {
      padding: '8px 8px',
      transform: 'rotate(0deg)',
      transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
      }),
      '& svg':{
        color:"#fff"
      }
  },
  expandOpen: {
      transform: 'rotate(180deg)',
  },
  collapse: {
    padding: 16,
    backgroundColor:'#fafafa',
    borderTopLeftRadius:0,
    borderTopRightRadius:0
  },
}))

const ContentMessage=React.forwardRef((props,ref)=>{
  const {classes}=useStyles()
  const { closeSnackbar } = useSnackbar();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
      setExpanded(!expanded);
  };

  const handleDismiss = () => {
      closeSnackbar(props.id);
  };

  return (
    <Card ref={ref} className={classes.root}>
      <CardActions classes={{ root: classes.actionRoot }} className='flex-header'>
          <Typography variant="subtitle2" className={classes.title}>{props.title}</Typography>
          <div className={classes.icons}>
              <IconButton
                aria-label="Show more"
                className={clx(classes.expand, { [classes.expandOpen]: expanded })}
                onClick={handleExpandClick}
                size="large">
                  <ExpandMore />
              </IconButton>
              <IconButton className={classes.expand} onClick={handleDismiss} size="large">
                  <Close />
              </IconButton>
          </div>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Paper className={classes.collapse}>
              <Typography gutterBottom style={{wordBreak:'break-word',color:'#000'}}>{props.message}</Typography>
              <Button onClick={props.onclick} color='secondary'>Open</Button>
          </Paper>
      </Collapse>
    </Card>
  );
})
const BottomNav=({active,toggleDrawer,dispatch,classes})=>{
  const router = useRouter();
  const value = React.useMemo(()=>{
    if(!toggleDrawer) return 'others'
    else if(['home','chord','news','blog'].indexOf(active) !== -1) return active;
    else return 'portalnesia'
  },[active,toggleDrawer])

  const handleChange=(event, newVal)=>{
    if(newVal == 'others') return dispatch({type:'TOGGLE_DRAWER',payload:false})
    else {
      if(newVal == 'home') return active != 'home' ? router.push('/') : !toggleDrawer ? dispatch({type:'TOGGLE_DRAWER',payload:true}) : window.scrollTo({top:0,left:0,behavior:'smooth'});
      else return active != newVal ? router.push(`/${newVal}`) : !toggleDrawer ? dispatch({type:'TOGGLE_DRAWER',payload:true}) : window.scrollTo({top:0,left:0,behavior:'smooth'})
    }
  }

  return (
    <div className={classes.botnav}>
      <BottomNavigation value={value} onChange={handleChange}>
        <BottomNavigationAction classes={{selected:classes.botnavSelected}} label="Home" value="home" icon={<Dashboard className={classes.botnavIcon} />} />
        <BottomNavigationAction classes={{selected:classes.botnavSelected}} label="News" value="news" icon={<SvgIcon className={classes.botnavIcon}><path fill="currentColor" d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" /></SvgIcon>} />
        <BottomNavigationAction classes={{selected:classes.botnavSelected}} label="Chord" value="chord" icon={<LibraryMusic className={classes.botnavIcon}/>} />
        <BottomNavigationAction classes={{selected:classes.botnavSelected}} label="Blog" value="blog" icon={<LibraryBooks className={classes.botnavIcon} />} />
        <BottomNavigationAction classes={{selected:classes.botnavSelected}} label="Menu" value="others" icon={<MenuIcon className={classes.botnavIcon} />} />
      </BottomNavigation>
    </div>
  )
}


let sudah=false,loadd=false,intrval=null,actt=null,sdhBck=false,adsRoot=false;
const Header=({navTitle,iklan,notBack,active,noSidebar,children,user,config,title,desc,image,keyword,subactive,noIndex,full,canonical,toggleDrawer,dispatch,report,openGraph})=>{
  const {classes} = styles();    
  const {atasKeyMap,bawahKeyMap,keyboard,feedback,setKeyboard,setFeedback,setNavigation}=useHotKeys(true)
    const {total:notifTotal,refreshNotification}=useNotification()
    useSocket()
    const themee=useTheme();
    const {post}=useAPI()
    const router=useRouter();
    const [loaded,setLoaded]=React.useState(loadd||false);
    const [loading,setLoading] = React.useState(null)
    const [sudahHome,setSudahHome] = React.useState(false)
    const {setNotif}=useNotif()
    const {setTheme} = useDarkTheme()
    const captchaRef=React.useRef(null)
    const captchaLoginRef=React.useRef(null)
    const [adBlock,setAdBlock]=React.useState(false)
    const [dialogNative,setDialogNative] = React.useState(false);
    const [sudahBack,setSudahBack]=React.useState(sdhBck)
    const [titleMeta,setTitleMeta]=React.useState( title && title?.length ? `${title} – ${(config?.title||"Portalnesia")}` : (config?.title||"Portalnesia") )
    const [optionMobile,setOptionMobile]=React.useState(false);
    const {data,error:errorInitial,mutate:mutateInitial}=useSWR(`/v1/user`,{
      revalidateOnFocus:false,
      revalidateOnReconnect:false,
      revalidateOnMount:false
    })

    const toggleDrawerOpen=React.useCallback(()=>{
      dispatch({type:'TOGGLE_DRAWER',payload:!toggleDrawer})
    },[toggleDrawer])
    const optionClickMobile=React.useCallback(()=>{
      setOptionMobile(prev=>!prev);
    },[setOptionMobile])

    React.useEffect(()=>{
      if(!data) mutateInitial()
    },[data])

    React.useEffect(()=>{
      let timout;

      const backTitle=(aa)=>{
        timout=setTimeout(()=>{
          setTitleMeta(title && title?.length ? `${title} – ${(config?.title||"Portalnesia")}` : (config?.title||"Portalnesia"))
          if(aa===true) titleWithNotif(true)
        },2000);
      }

      const titleWithNotif=(aa)=>{
        timout=setTimeout(()=>{
          setTitleMeta(title && title?.length ? `(${notifTotal}) ${title} – ${(config?.title||"Portalnesia")}` : `(${notifTotal}) ${(config?.title||"Portalnesia")}`)
          if(aa===true) backTitle(true)
        },2000);
      }

      if(notifTotal !== 0) titleWithNotif(true)
      else {
        clearTimeout(timout)
        setTitleMeta(title && title?.length ? `${title} – ${(config?.title||"Portalnesia")}` : (config?.title||"Portalnesia"))
      }

      return ()=>clearTimeout(timout)
    },[title,config?.title,notifTotal])

    /*React.useEffect(()=>{
      let ads=null;
      if(process.env.NODE_ENV === 'production' && !adsRoot) {
        adsRoot=true;
        const p = document.body||document.documentElement;
        if(iklan) {
          const ads =document.createElement('script');
          ads.setAttribute('data-zone','3824493');
          ads.src='https://iclickcdn.com/tag.min.js';
          p.appendChild(ads)
        }
      }
    },[title,iklan])*/

    React.useEffect(()=>{
      actt=active;
    },[active])

    const descMeta = React.useMemo(()=>addslashes(desc && desc?.length ? Ktruncate(clean(desc),200) : (config?.description||"")),[desc,config.description]);
    const imageMeta = React.useMemo(()=>image && image?.length ? `${image}` : `${process.env.URL}/icon/og_image_default.png`,[image]);
    const keywordMeta = React.useMemo(()=>addslashes(keyword && keyword?.length ? `${keyword} ${config?.keywords}` : (config?.keywords||"")),[keyword,config.keywords]);

    const feedbackSubmit=(type,addi={})=>async(dt={})=>{
      // ERROR
      if(['konten','komentar'].indexOf(type)!==-1 && dt?.text?.length === 0) {
        setNotif("Description must be added",true)
      } else if(type==='feedback' && (typeof dt?.rating==='undefined' || dt?.rating===null)) {
        setNotif("Error: You have not provided your feedback",true)
      } else {
        setLoading('feedback')
        try {
          let input=null,opt={};
          if(type==='feedback'){
            dt.endpoint=dt.rating;
            delete dt.rating;
          }
          dt.sysInfo=JSON.stringify(dt.sysInfo);
          const recaptcha = await captchaRef.current.execute();

          if(typeof dt.screenshot!=='undefined') {
            opt = {
              headers:{
                'Content-Type':'multipart/form-data'
              }
            }            
            const res = await fetch(dt.screenshot);
            delete dt.screenshot;
            const blob = await res.blob();
            const file = new File([blob],`${uuid('report')}.png`)
            input = new FormData();
            input.append('image',file);
            input.append('recaptcha',recaptcha);
            Object.keys(addi).forEach(k=>{
              input.append(k,addi[k])
            })
            Object.keys(dt).forEach(k=>{
              input.append(k,dt[k])
            });
          } else {
            input = {
              ...addi,
              ...dt,
              recaptcha
            }
          }
          
          await post(`/v1/internal/report`,input,opt,{success_notif:true});
          if(type==='feedback') handleBack('feedback',false)
          else dispatch({type:'REPORT',payload:null})
        } catch {} finally {
          setLoading(null)
        }
      }
    }

    const onScrollTop=()=>{
      window.scrollTo({top:0,left:0,behavior:'smooth'})
    }

    const handleBack=(type,value)=>{
      if(sudahHome && value===false) {
        setNavigation(null)
        router.back();
      }
      else {
        if(type==='keyboard') setKeyboard(value,true)
        else setFeedback(value,true)
      }
    }

    React.useEffect(()=>{
      const onScroll=()=>{
        //const smDown = window && window.matchMedia && window.matchMedia('(max-width: 959.95px)').matches;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        const btt=document.getElementById('backToTop');
        if(btt) {
          if(typeof active==='string' && ['messages','notification','support'].indexOf(active)!==-1) {
            btt.style.display='none';
          } else {
            if(scrollTop < 200) {
              btt.style.display='none';
              btt.style.opacity='0';
            } else {
              btt.style.display='block';
              btt.style.opacity='0.5';
            }
          }
        }
      }
      //const jssStyles = document.querySelector('#jss-server-side');
      //if (jssStyles) jssStyles.parentElement.removeChild(jssStyles);

      const cookie=Cookies.get('msg')
      if(typeof cookie === 'string') {
        Cookies.remove('msg', { domain: '.portalnesia.com',path:'/' })
        const msg = cookie.split('::');
        setNotif(msg[1].replace(/\+/g," "),(msg[0]=='danger' ? true : (msg[0]=='success' ? false : 'info')))
      }

      window.addEventListener('scroll',onScroll)
      return()=>{
        window.removeEventListener('scroll',onScroll)
      }
    },[active])

    React.useEffect(()=>{
      if(router?.query?.i === 'navigation') setNavigation('keyboard')
      else if(router?.query?.i === 'feedback') setNavigation('feedback')
      else{
        setNavigation(null)
        setSudahHome(true)
      }
    },[router.query])

    React.useEffect(()=>{
        const smDown = window && window.matchMedia && window.matchMedia('(max-width: 959.95px)').matches;
        if(smDown) dispatch({type:'TOGGLE_DRAWER',payload:true})
        setOptionMobile(false);
    },[router])

    React.useEffect(()=>{
      const smDown = window && window.matchMedia && window.matchMedia('(max-width: 959.95px)').matches;
      if(smDown) {
        if(!toggleDrawer) document.body.classList.add('call-container');
        else document.body.classList.remove('call-container');
      }
  },[toggleDrawer])

    React.useEffect(()=>{
      let messaging = null
      try {
        messaging = getMessaging(firebaseApp);
      } catch {
        //console.error(e)
      }
      let hidden, visibilityChange,tabActive=true,locAuto=null;
      
      const getTheme=()=>{
        return new Promise((res)=>{
          const theme = (Cookies.get('theme')||'auto');
          setTheme(theme,true)
          refreshNotification()
          return res();
        })
      }

      setTimeout(()=>{
        const ads=document.getElementById('wrapfabtest')
        if(ads) {
          const height=ads.clientHeight||ads.offsetHeight;
          if(height <= 0) setAdBlock(true)
        } else {
          setAdBlock(true)
        }
        

        if(!sudah){
          sudah=true;
          
          if(user?.id) {
            gtag.setPortalUserId(user.id);
          }

          if(process.env.NODE_ENV === 'production') {
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.workbox = new Workbox(__PWA_SW__, { scope: __PWA_SCOPE__ })
              window.workbox.addEventListener('activated', function(event) {
                if (!event.isUpdate) {
                  caches.keys().then(function(c) {
                    if (!c.includes('start-url')) {
                      fetch(__PWA_START_URL__)
                    }
                  })
                }
              })
              
              window.workbox.register()
              .then((registration)=>{
                getInstalledApps().then(apps=>{
                  const cookie=Cookies.get('n_banner');
                  /*if(!apps && isMobile && !cookie) {
                    Cookies.set("n_banner",'1',{secure:true,sameSite:'strict',expires:1})
                    setDialogNative(true);
                  }*/
                  if(user!==null && messaging!==null) {
                    Notification.requestPermission()
                    .then((permission)=>{
                      if(permission==='granted') {
                        console.log("Notification permission granted.");
                        getToken(messaging,{
                          vapidKey:"BCchOVH17v-HJon-RqIZE-bWVcvVT9F2KFb73kwDwBzvlyLxG_gYMYJ_TpcCPyif4t42NSYibviJHHxjUb5nXOY",
                          serviceWorkerRegistration:registration
                        }).then(token=>{
                          console.log("Notification permission success.");
                          post(`/v1/internal/send-notification`,{token: token,has_application:apps},{},{error_notif:false,success_notif:false})
                        })
                      } else {
                        console.log("Permission not granted",permission);
                      }
                    }).catch((e)=>{
                      console.log(e);
                    });
                  }
                })
              })
              .catch(err=>console.log("Workbox error",err))
            }

            if(messaging!==null) {
              onMessage(messaging,(payload)=>{
                //console.log('Received message ', payload);
                refreshNotification()
                const dataLink=payload?.notification?.click_action||payload?.fcmOptions?.link||'https://portalnesia.com';
                const notificationTitle = payload.notification.title;
                let notificationOptions = {
                    body: payload.notification.body,
                    icon: payload.notification.icon,
                    data:  dataLink,
                    requireInteraction: true
                };
                if(["messages","support","notification"].indexOf((actt||""))===-1) {
                  setNotif(payload.notification.body,'info',{
                    autoHideDuration:null,
                    content:(key,message)=><ContentMessage id={key} title={payload.notification.title} message={message} onclick={()=>window.location.href=dataLink} />
                  })
                }
                
                if (!("Notification" in window)) {
                  console.log("This browser does not support system notifications");
                }
                else if (Notification.permission === "granted") {
                  if(["messages","support","notification"].indexOf((actt||""))===-1){
                    navigator.serviceWorker.ready.then((registration)=>{
                      registration.showNotification(notificationTitle,notificationOptions);
                    });
                    var notification = new Notification(notificationTitle,notificationOptions);
                    notification.onclick = ()=>{
                        window.open(dataLink , '_blank');
                        notification.close();
                    }
                  }
                }
              })
            }
          }
        }
      },2000)

      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
          hidden = "hidden";
          visibilityChange = "visibilitychange";
      } else if (typeof document.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
      }

      const onVisibilityChange=()=>{
        if (document[hidden]) {
            tabActive=false;
        } else {
            tabActive=true;
        }
      }

      
      if(!loadd) {
        loadd=true;
        getTheme().finally(()=>setLoaded(true))
        document.body.style.overflow = null
      }
      
      const sudahUntukBack=()=>{
        setSudahBack(true)
        sdhBck=true;
        //dispatch({type:'TOGGLE_DRAWER',payload:true})
      }
      router.events.on('routeChangeComplete', sudahUntukBack)

      //window.addEventListener('load',onLoaded)
      document.addEventListener(visibilityChange,onVisibilityChange, false);

      return ()=>{
        //window.removeEventListener('load',onLoaded)
        router.events.off('routeChangeComplete', sudahUntukBack)
        if(intrval!==null) clearInterval(intrval)
        document.removeEventListener(visibilityChange,onVisibilityChange, false);
      }
    },[])
    
    return (
      <div key='header-wrapper' className={clx(loaded ? noSidebar ? classes.noSidebar : classes.appFrameInner : '')}>
          <NextSeo
            title={titleMeta}
            description={descMeta}
            nofollow={noIndex}
            noindex={noIndex}
            canonical={`${process.env.URL}${canonical}`}
            additionalMetaTags={[{
              key:'meta-keyword',
              property: 'keywords',
              content: keywordMeta
            },{
              key:'meta-fb-pages',
              property:'fb:pages',
              content:'105006081218628'
            },{
              key:'meta-viewport',
              name:'viewport',
              content:'width=device-width, initial-scale=1, shrink-to-fit=yes'
            }]}
            openGraph={{
              url: `${process.env.URL}${canonical}`,
              title: titleMeta,
              description: descMeta,
              images: [
                { url: imageMeta },
              ],
              site_name: (config?.title||"Portalnesia"),
              ...openGraph
            }}
            facebook={{appId:'313154633008072'}}
            twitter={{
              handle: '@putuaditya_sid',
              site: '@portalnesia1',
              cardType: 'summary_large_image',
            }}

          />
          <LogoJsonLd
            logo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
            url={process.env.URL}
          />
          <Head>
            <meta name="msapplication-TileColor" content={themee.palette.primary.main} />
            <meta name="theme-color" content={((report!==null || feedback) && isMobile) ? '#3986FF' : themee.palette.primary.main} />
          </Head>
        {loaded===false && (
          <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img style={{position:'fixed',top:'35%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
            <CircularProgress size={60} sx={{color:'white',position:'fixed',top:'60%',left:'calc(50% - 30px)'}} />
          </div>
        )}
        {adBlock!==true ? 
          noSidebar ? (
            <React.Fragment key={0}>
              <Appbar data={data} errorInitial={errorInitial} handleBack={handleBack} setKeyboard={setKeyboard} setFeedback={setFeedback} />
              <main className={clx(classes.contentNoSidebar,classes.wrapper,classes.wrapperNoSidebar)} id="mainContent">
                  <section className={clx(classes.content)}>
                      <Grid container justifyContent='center'>
                          <Grid item xs={12} md={10}>
                              {children}
                          </Grid>
                      </Grid>
                  </section>
              </main>
              <div className={classes.footer}>
                  <div className={classes.footerChild}>
                      <Typography variant='body1'>{`Portalnesia © ${(new Date().getFullYear())}`}</Typography>
                      <Typography variant='body1'>
                          <Link href='/contact' passHref><a><Typography component='span'>Contact</Typography></a></Link>
                          <a href='https://status.portalnesia.com' target='_blank'><Typography component='span'>Status</Typography></a>
                          <Link href='/pages/[slug]' as='/pages/terms-of-service' passHref><a><Typography component='span'>Terms of Services</Typography></a></Link>
                          <Link href='/pages/[slug]' as='/pages/privacy-policy' passHref><a><Typography component='span'>Privacy Policy</Typography></a></Link>
                          <Link href='/pages/[slug]' as='/pages/cookie-policy' passHref><a><Typography component='span'>Cookie Policy</Typography></a></Link>
                          <a href="https://paypal.me/adityatranasuta" target="_blank"><Typography component='span'>Donate</Typography></a>
                      </Typography>
                  </div>
              </div>
              <style jsx global>{`
                  html,body{
                      height:100%;
                      margin:0;
                  }
                  #__next{
                      height:100%
                  }
                  #nprogress .bar{
                      z-index:99999;
                  }
              `}</style>
            </React.Fragment>
          ) : (
            <React.Fragment key={1}>
              <HeaderContent data={data} errorInitial={errorInitial} title={navTitle} sudahBack={sudahBack} notBack={notBack} open={toggleDrawer} active={active} subactive={subactive} toggleDrawerOpen={toggleDrawerOpen} handleBack={handleBack} optionClickMobile={optionClickMobile} optionMobile={optionMobile} />
              <Hidden mdUp>
                <main className={clx(classes.content, !full && classes.contentFull, !toggleDrawer ? classes.contentPadding : '')} id="mainContent">
                  <section className={clx(classes.mainWrap,!full&&classes.mainWrapM)}>
                      {full ? children : (
                        <div key='header-children'>
                          {children}
                        </div>
                      )}
                  </section>
                </main>
                {notBack && <BottomNav active={active} classes={classes} toggleDrawer={toggleDrawer} dispatch={dispatch} /> }
                <Fade in={!toggleDrawer||toggleDrawer && optionMobile}>
                  <div style={{position:'fixed',top:64,left:0,width:'100%',height:optionMobile ? '100%':'calc(100vh - 57px - 64px)',zIndex:1101}}>
                    <Sidebar notBack={notBack} data={data} errorInitial={errorInitial}  open={false} active={active} subactive={subactive} handleBack={handleBack} />
                  </div>
                </Fade>
              </Hidden>
              <Hidden mdDown>
                <Sidebar notBack={notBack} data={data} errorInitial={errorInitial} open={toggleDrawer} active={active} subactive={subactive} handleBack={handleBack} /> 
                <main className={clx(classes.content, !full && classes.contentFull, !toggleDrawer ? classes.contentPadding : '')} id="mainContent">
                    <section className={clx(classes.mainWrap,!full&&classes.mainWrapM)}>
                        {full ? children : (
                          <div key='header-children'>
                            {children}
                          </div>
                        )}
                    </section>
                </main>
              </Hidden>
            </React.Fragment>
          )
        : null}

        <Dialog open={adBlock} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
            <DialogTitle>WARNING !!!</DialogTitle>
            <DialogContent dividers>
              <Typography>Please support us by disable your adblock!</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>window.location.reload()}>Refresh</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={dialogNative} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
            <DialogTitle>Portalnesia on Android</DialogTitle>
            <DialogContent dividers>
              <Typography style={{marginBottom:15}}>Portalnesia is available on Android. Install now!</Typography>
              <Image blured src={`${process.env.CONTENT_URL}/feature_graphic.png`} style={{width:'100%'}} alt={`Portalnesia on Android`} />
            </DialogContent>
            <DialogActions>
              <Button color='secondary' onClick={()=>setDialogNative(false)}>Cancel</Button>
              <Button onClick={()=>window.open(`https://github.com/portalnesia/portalnesia-native/releases/tag/v${config?.native_version}`)}>Install</Button>
            </DialogActions>
        </Dialog>
        
        <Dialog open={keyboard} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
          <DialogTitle>
            <div className='flex-header'>
              <Typography component='h2' variant='h6'>Navigation</Typography>
              <IconButton onClick={()=>handleBack('keyboard',false)} size="large">
                <Close />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent dividers>
              {Object.keys(atasKeyMap).map((key,i)=>{
                const dt=atasKeyMap?.[key]
                return (
                  <div key={`keyboard-atas-${i}`} className={classes.keyboard}>
                    <div key={0} className={classes.keyTitle}><Typography component='span'>{dt?.name}</Typography></div>
                    <div key={1} className={classes.keyCode}>
                      {dt?.button?.map((bt,i)=>(
                        <React.Fragment key={`atas-${i}`}>
                          <div key={`label-${i}`} className={classes.keyLabel}><Typography component='span' style={{color:'#000'}}>{bt}</Typography></div>
                          {i+1 < dt?.button?.length && <div key={`plus-${i}`} className={classes.keyPlus}><Typography component='span'>+</Typography></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div style={{margin:'15px 0'}}><Divider /></div>
              {Object.keys(bawahKeyMap).map((key,i)=>{
                const dt=bawahKeyMap?.[key]
                return (
                  <div key={`keyboard-bawah-${i}`} className={classes.keyboard}>
                    <div key={0} className={classes.keyTitle}><Typography component='span'>{dt?.name}</Typography></div>
                    <div key={1} className={classes.keyCode}>
                      {dt?.button?.map((bt,i)=>(
                        <React.Fragment key={`bawah-${i}`}>
                          <div key={`label-${i}`} className={classes.keyLabel}><Typography component='span' style={{color:'#000'}}>{bt}</Typography></div>
                          {i+1 < dt?.button?.length && <div key={`plus-${i}`} className={classes.keyPlus}><Typography component='span'>+</Typography></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )
              })}
          </DialogContent>
        </Dialog>

        {feedback && report===null && <Portal><Feedback title="Send Feedback" placeholder="Have feedback? We'd love to hear it, but please don't share sensitive information. Have questions? try support." rating onCancel={()=>handleBack('feedback',false)} onSend={feedbackSubmit('feedback',{type:'feedback',url:window?.location?.href})} disabled={loading==='feedback'} /></Portal> }
        {report!==null && <Portal><Feedback title="Send Report" onCancel={()=>dispatch({type:'REPORT',payload:null})} onSend={feedbackSubmit(report?.type,{...report})} required={['kontent','komentar'].indexOf(report?.type)!==-1} disabled={loading==='feedback'} {...(report?.type==='url' ? {placeholder:"We are sorry for the inconvenience, it seems that there is a problem with our internal server service. Can you tell us how this happened?"} : {})} /></Portal> }
        
        <ReCaptcha
            key='captcha-0'
            ref={captchaRef}
        />
        <ReCaptcha
            key='captcha-1'
            ref={captchaLoginRef}
            action='login'
        />
        <div id="backToTop" onClick={onScrollTop} className="back-to-topp" title="Back to top" style={{display:'none'}}><span style={{marginLeft:5}}>TOP</span></div>
        <CallContainer />
    </div>
    );
}

Header.defaultProps={
    active:'',
    subactive:'',
    noIndex:false,
    full:false,
    noSidebar:false,
    iklan:false,
    openGraph:{
      type:'website'
    }
}

const stateToProps=state=>({
  config:{
    title:(state?.config?.title||null),
    description:(state?.config?.description||null),
    keywords:(state?.config?.keywords||null),
    native_version:(state?.config?.native_version||null)
  },
  user:state.user,
  toggleDrawer:state.toggleDrawer,
  report:state.report
})

export default connect(stateToProps)(Header);