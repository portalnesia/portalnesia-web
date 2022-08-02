import React from 'react'
import { NextSeo,LogoJsonLd } from 'next-seo';
import HeaderContent from './HeaderComponent'
import Sidebar from './Sidebar'
import Button from 'portal/components/Button'
import {truncate as Ktruncate,clean} from '@portalnesia/utils'
import clx from 'classnames';
import { useTheme } from '@mui/material/styles';
import {makeStyles} from 'portal/components/styles'
import {connect} from 'react-redux';
import Head from 'next/head'
import Cookies from 'js-cookie'
import useAPI from 'portal/utils/api'
import {useRouter} from 'next/router'
import {useSocket} from 'portal/utils/Socket'
import {useHotKeys} from 'portal/utils/useKeys'
import {useNotif} from 'portal/components/Notification'
import {IconButton,Portal,Typography,Divider,Dialog,DialogTitle,DialogContent,DialogActions} from '@mui/material'
import {Close} from '@mui/icons-material'
import ReCaptcha from 'portal/components/ReCaptcha'
import dynamic from 'next/dynamic'
import {isMobile} from 'react-device-detect'
import {useDarkTheme} from 'portal/utils/useDarkTheme'
import * as gtag from 'portal/utils/gtag'
import loadingImage from 'portal/components/header/loading-image-base64'
import useSWRS from 'swr'
import useSWR from 'portal/utils/swr'

const Feedback=dynamic(()=>import('portal/components/Feedback'),{ssr:false});
//const getSysInfo=dynamic(()=>import('./Feedback').then((mod)=>mod.getSysInfo),{ssr:false});

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
    outerContent: {
      width: '100%',
      backgroundSize: 'cover',
      flexDirection: 'column',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('lg')]: {
        padding: '20px 0'
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
  }
});

const fetcher = (url)=>fetch(url).then(res=>res.json())

let loaddd=false,intrval=null;
const Header=({active,getMenu,children,user,config,title,desc,image,keyword,subactive,noIndex,full,canonical,toggleDrawer,dispatch,report,openGraph})=>{
  const {classes} = styles();  
  const {atasKeyMap,bawahKeyMap,keyboard,feedback,setKeyboard,setFeedback,setNavigation}=useHotKeys(true)
    useSocket()
    const themee=useTheme();
    const {post}=useAPI()
    const router=useRouter();
    const [loaded,setLoaded]=React.useState(loaddd);
    const [loading,setLoading] = React.useState(null)
    const [sudahHome,setSudahHome] = React.useState(false)
    const {setNotif}=useNotif()
    const {setTheme}=useDarkTheme()
    const captchaRef=React.useRef(null)
    const captchaLoginRef=React.useRef(null)
    const [adBlock,setAdBlock]=React.useState(false)

    const {data:dataUser,error:errorUser} = useSWR('/v1/user')
    
    const {data:dataInit}=useSWRS(`${process.env.APP_URL}/developers.json`,{
      fetcher,
      revalidateOnReconnect:true,
      revalidateOnFocus:false,
      revalidateIfStale:true,
    })

    React.useEffect(()=>{
      if(getMenu) getMenu(dataInit)
    },[dataInit,getMenu]);

    const toggleDrawerOpen=React.useCallback(()=>{
      dispatch({type:'TOGGLE_DRAWER',payload:!toggleDrawer})
    },[toggleDrawer])

    const titleMeta =  React.useMemo(()=>title && title.length > 0 ? `${title} – ${(config?.title||"Portalnesia")} Developer` : `${(config?.title||"Portalnesia")} Developer`,[title,config.title]);
    const descMeta = React.useMemo(()=>desc && desc?.length > 0 ? Ktruncate(clean(desc),200) : (config?.description||""),[desc,config.description]);
    const imageMeta = React.useMemo(()=>image && image?.length > 0 ? `${image}` : `${process.env.URL}/icon/og_image_default.png`,[image]);
    const keywordMeta = React.useMemo(()=>keyword && keyword?.length > 0 ? `${keyword} ${config?.keywords}` : (config?.keywords||""),[keyword,config.keywords]);

    const feedbackSubmit=(type,addi)=>(dt)=>{
      if(['konten','komentar'].indexOf(type)!==-1 && dt?.text?.length === 0) {
        setNotif("Description must be added",true)
      } else if(type==='feedback' && (typeof dt?.rating==='undefined' || dt?.rating===null)) {
        setNotif("Error: You have not provided your feedback",true)
      } else {
        setLoading('feedback')
        if(type==='feedback'){
          dt.endpoint=dt.rating;
          delete dt.rating;
        }
        if(typeof dt.screenshot!=='undefined') {
          dt.image=dt.screenshot;
          delete dt.screenshot;
        }
        dt.sysInfo=JSON.stringify(dt.sysInfo);
        console.log(captchaRef)
        captchaRef.current.execute()
        .then(recaptcha=>{
          return post(`/v1/internal/report`,{...addi,...dt,recaptcha},{},{success_notif:true})
        }).then(res=>{
            if(type==='feedback') handleBack('feedback',false)
            else dispatch({type:'REPORT',payload:null})
        }).finally(()=>{
          setLoading(null)
        })
      }
    }

    const onScrollTop=()=>{
      window.scrollTo({top:0,left:0,behavior:'smooth'})
    }

    const handleBack=(type,value,r)=>{
      if(r) return;
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
      let hidden, visibilityChange,tabActive=true;
      
      const getTheme=()=>{
        return new Promise((res)=>{
          const theme = (Cookies.get('theme')||'auto');
          setTheme(theme,true);
          res();
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

        if(user?.id) {
          gtag.setPortalUserId(user.id);
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

      
      if(!loaddd) {
        loaddd=true;
        getTheme().finally(()=>setLoaded(true))
      }
      //window.addEventListener('load',onLoaded)
      document.addEventListener(visibilityChange,onVisibilityChange, false);

      return ()=>{
        //window.removeEventListener('load',onLoaded)
        //if(intrval!==null) clearInterval(intrval)
        if(intrval!==null) clearInterval(intrval)
        document.removeEventListener(visibilityChange,onVisibilityChange, false);
      }
    },[])
    
    return (
      <div key='header-wrapper' className={clx(loaded ? classes.appFrameInner : '')}>
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
          {!loaded && (
            <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
              <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
            </div>
          )}

          {adBlock!==true ? (                    
              <React.Fragment key={1}>
                <HeaderContent full={full} active={active} subactive={subactive} menu={dataInit||[]} data={dataUser} error={errorUser} open={toggleDrawer} toggleDrawerOpen={toggleDrawerOpen} handleBack={handleBack} />
                {!full && <Sidebar menu={dataInit||[]} open={toggleDrawer} toggleDrawerOpen={toggleDrawerOpen} active={active} subactive={subactive} />}
                <main className={clx(classes.content, !full && classes.contentFull, !toggleDrawer ? classes.contentPadding : '')} id="mainContent">
                    <section className={clx(classes.mainWrap,!full&&classes.mainWrapM)}>
                        {full ? children : (
                          <div key='header-children'>
                            {children}
                          </div>
                        )}
                    </section>
                </main>
              </React.Fragment>
          ) : null}
          <Dialog open={adBlock} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
              <DialogTitle>WARNING !!!</DialogTitle>
              <DialogContent dividers>
                <Typography>Please support us by disable your adblock!</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>window.location.reload()}>Refresh</Button>
              </DialogActions>
          </Dialog>
          
          <Dialog open={keyboard} onClose={(_,r)=>handleBack('keyboard',false,r)} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
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

          {feedback && report===null && <Portal><Feedback title="Send Feedback" placeholder="Have feedback? We'd love to hear it, but please don't share sensitive information. Have questions? try support." rating onCancel={()=>handleBack('feedback',false)} onSend={feedbackSubmit('feedback',{type:'feedback',urlreported:window?.location?.href})} disabled={loading==='feedback'} /></Portal> }
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
      </div>
    );
}

Header.defaultProps={
    active:'',
    subactive:'',
    noIndex:false,
    full:false,
    menu:[],
    openGraph:{
      type:'website'
    }
}

const stateToProps=state=>({
  config:{
    title:(state?.config?.title||null),
    description:(state?.config?.description||null),
    keywords:(state?.config?.keywords||null),
    captcha_sitekey:(state?.config?.captcha_sitekey||null),
  },
  user:state.user,
  toggleDrawer:state.toggleDrawer,
  report:state.report
})

export default connect(stateToProps)(Header);