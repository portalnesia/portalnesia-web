import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import config from '@src/config';
import { NextSeo, SiteLinksSearchBoxJsonLd, CorporateContactJsonLd } from 'next-seo';
import Router from 'next/router';
import { portalUrl, staticUrl } from '@utils/main';
import { useDispatch, useSelector } from '@redux/store';
import SplashScreen from '@design/components/Splashscreen';
import useInit from '@hooks/init';
import Typography from '@mui/material/Typography';
import Button from './Button';
import dynamic from 'next/dynamic';
import { KeyboardArrowUp } from '@mui/icons-material';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import { Socket } from './Socket';
import Script from 'next/script';
import Portal from '@mui/material/Portal';
import { useHotKeys } from '@hooks/hotkeys';
import HotKeys from './HotKeys';
import { IReport } from '@type/redux';
import type { IData } from '@comp/Feedback';
import Recaptcha from '@design/components/Recaptcha';
import useAPI, { ApiError } from '@design/hooks/api';
import useNotification, { ContentMessage, useNotificationSWR } from '@design/components/Notification';
import { nanoid } from '@portalnesia/utils';
import firebaseApp from '@utils/firebase';
import { Messaging, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

//const Backdrop = dynamic(()=>import('@design/components/Backdrop'));
const Dialog = dynamic(()=>import('@design/components/Dialog'))
const Feedback = dynamic(()=>import("@comp/Feedback"),{ssr:false})

export interface PageProps {
    children: ReactNode
    title?:string
    desc?:string
    keyword?:string
    canonical?: string
    /**
     * Full URL
     */
    image?: string
    noIndex?:boolean
    withoutShowTop?: boolean
}



export default function Pages({children,title,desc,keyword,canonical:canonicalProps,image,noIndex=false,withoutShowTop}: PageProps) {
    const { adBlock } = useInit();
    const dispatch = useDispatch();
    const {appToken,report,user} = useSelector(s=>({appToken:s.appToken,report:s.report,user:s.user}));
    const theme = useTheme();
    const [showToTop,setShowToTop] = useState(false);
    const {atasKeyMap,bawahKeyMap,keysDialog,setKeysDialog} = useHotKeys(true)
    const captchaRef = useRef<Recaptcha>(null)
    const {post} = useAPI();
    const setNotif = useNotification();
    const [loading,setLoading] = useState<'report'>();
    const pushAlready = useRef(false);
    const {mutate:mutateNotification} = useNotificationSWR();
    const canonical = useMemo(()=>portalUrl(canonicalProps),[canonicalProps])
    
    const header = useMemo(()=>{
        return {
            title: `${title && title.length > 0 ? `${title} | `:''}${config.meta.title}`,
            desc: `${desc && desc.length > 0 ? `${desc} `:''}${config.meta.description}`,
            keyword: `${keyword && keyword.length > 0 ? `${keyword},`:''}${config.meta.keywords}`,
            image: image && image.length > 0 ? image : staticUrl("og_image_default.png")
        }
    },[title,desc,keyword,image])

    const handleToTop = useCallback(()=>{
        window.scrollTo({top:0,left:0,behavior:'smooth'});
    },[])

    const handleCloseFeecback = useCallback(()=>{
        dispatch({type:"CUSTOM",payload:{report:undefined}})
    },[dispatch])

    useEffect(() => {
        if (!appToken||report) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
    }, [appToken,report]);

    useEffect(()=>{
        function onScroll() {
          const scroll = document?.documentElement?.scrollTop || document.body.scrollTop;
          if(scroll > 200) {
            setShowToTop(true)
          } else {
            setShowToTop(false)
          }
        }
        window.addEventListener('scroll',onScroll);
    
        return ()=>window.removeEventListener('scroll',onScroll);
    },[])

    const handleReport = useCallback((report?: IReport)=>async(data: IData)=>{
        if(!report) return;
        try {
            setLoading('report')
            const recaptcha = await captchaRef.current?.execute();
            if(data.image) {
                const form = new FormData();
                form.append('type',report.type)
                form.append('text',data.text||"")
                form.append('url',window.location.href)
                form.append('sysInfo',JSON.stringify(data.sysInfo))
                if('information' in report) form.append('information',JSON.stringify(report.information))
                if(data.image) form.append('image',data.image,`${nanoid()}.png`);
                if(recaptcha) form.append('recaptcha',recaptcha);
                await post(`/v2/internal/report`,form,{
                    headers:{
                        'Content-Type':'multipart/form-data'
                    }
                })
            } else {
                await post(`/v2/internal/report`,{...report,...data,url:window.location.href,recaptcha});
            }
            dispatch({type:"CUSTOM",payload:{report:undefined}});
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true);
        } finally {
            setLoading(undefined)
        }
    },[dispatch,post,setNotif])

    useEffect(()=>{
        async function registerPushNotification(messaging: Messaging) {
            try {
                const registration = await navigator.serviceWorker.getRegistration("/");
                const permission = await Notification.requestPermission();
                if(permission==='granted') {
                    const token = await getToken(messaging,{
                        vapidKey:config.vapidKey,
                        serviceWorkerRegistration:registration
                    })
                    post(`/v2/internal/send-notification`,{token},{},{success_notif:false})
                }
            } catch {}
        }

        function handleNotification(messaging: Messaging) {
            onMessage(messaging,(payload)=>{
                mutateNotification();
                // @ts-ignore
                const dataLink = payload?.notification?.click_action||payload?.fcmOptions?.link||portalUrl();
                const title = payload?.notification?.title
                const options = {
                    body: payload?.notification?.body,
                    icon: payload?.notification?.icon,
                    data:dataLink,
                    requireInteraction: true
                }

                if(!/(\/support)/.test(Router.asPath) && title) {
                    setNotif(payload?.notification?.body||"",'info',{
                        autoHideDuration:null,
                        content:(key,message) => <ContentMessage id={key} title={title} message={message} onClick={()=>window.location.href=dataLink} />
                    })
                }

                if(!("Notification" in window)) {
                    console.log("This browser does not support system notification")
                } else if(Notification.permission === "granted") {
                    if(!/(\/support)/.test(Router.asPath) && title) {
                        navigator.serviceWorker.ready.then((registration)=>{
                            registration.showNotification(title,options);
                        });
                        const notification = new Notification(title,options);
                        notification.onclick = ()=>{
                            window.open(dataLink,'_blank')
                            notification.close();
                        }
                    }
                }
            })
        }

        if(process.env.NODE_ENV === 'production') {
            if(!pushAlready.current && appToken && user) {
                pushAlready.current = true;
                isSupported().then(supported=>{
                    if(supported) {
                        const messaging = getMessaging(firebaseApp);
                        registerPushNotification(messaging)
                        .then(()=>handleNotification(messaging))
                    }
                }).catch(()=>{})
            }
        }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[post,appToken,user])

    const onWidgetLoad = useCallback(()=>{
        setTimeout(()=>{
            const widget = document.getElementById('arc-widget-container');
            if(widget) {
                widget.setAttribute('data-arc-widget-portalnesia','');
            }
        },2000)
    },[])

    useEffect(()=>{
        const widget = document.getElementById('arc-widget-container');
        if(widget) {
            widget.setAttribute('data-arc-widget-portalnesia','');
        }
    },[canonicalProps])

    return (
        <div>
            {!appToken ? (
                <SplashScreen />
            ) : <Socket />}
            <NextSeo
                title={header.title}
                description={header.desc}
                canonical={canonical}
                nofollow={noIndex}
                noindex={noIndex}
                additionalMetaTags={[{
                    property: 'keywords',
                    content: header.keyword
                },{
                    property:'fb:pages',
                    content:'105006081218628'
                },{
                    name:"msapplication-TileColor",
                    content:'#2f6f4e'
                },{
                    name:"theme-color",
                    content:theme.palette.background.paper
                }]}
                openGraph={{
                    url: canonical,
                    title: header.title,
                    description: header.desc,
                    images: [
                        { url: header.image },
                    ],
                    site_name: "Portalnesia",
                    type:'website'
                }}
                facebook={{appId:'313154633008072'}}
                twitter={{
                    handle: '@putuaditya_sid',
                    site: '@portalnesia1',
                    cardType: 'summary_large_image',
                }}
            />
            <SiteLinksSearchBoxJsonLd
                url={portalUrl()}
                potentialActions={[{
                target: portalUrl(`/search?q`),
                queryInput:'search_term_string'
                }]}
            />
            <CorporateContactJsonLd
                url={portalUrl()}
                logo={staticUrl('icon/android-chrome-512x512.png')}
                contactPoint={[{
                contactType:"customer service",
                email: config.contact.email,
                areaServed: "ID",
                availableLanguage: ["Indonesian","English"]
                }]}          
            />
            {!adBlock && children}
            <Dialog open={adBlock} title="WARNING!" titleWithClose={false} actions={
                <Button onClick={()=>window.location.reload()}>Refresh</Button>
            }>
                <Typography>Please support us by disable your adblock!</Typography>
            </Dialog>
            <Zoom in={showToTop&&!withoutShowTop}>
                <Fab size='medium' color='primary' sx={{position:'fixed',bottom:16,right:16}} onClick={handleToTop}>
                    <KeyboardArrowUp fontSize='large' />
                </Fab>
            </Zoom>
            {process.env.NODE_ENV==='production' ? <Script key='arcio' strategy="lazyOnload" onLoad={onWidgetLoad} src="https://arc.io/widget.min.js#3kw38brn" /> : null}
            {process.env.NODE_ENV==='production' ? <Script key="instatus" strategy="lazyOnload" src="https://portalnesia.instatus.com/widget/script.js" /> : null}

            <Portal>
                <Feedback open={report!==undefined} title={report?.type === 'feedback' ? 'Send Feedback' : 'Send Report'} placeholder={report?.type === 'feedback' ? "Tell us how we can improve our product":undefined} onCancel={handleCloseFeecback} onSend={handleReport(report)} disabled={loading==='report'} required={['konten','komentar','user'].includes(report?.type||"")} />
            </Portal>
            <HotKeys atasKeymap={atasKeyMap} bawahKeymap={bawahKeyMap} open={keysDialog==='keyboard'} onClose={setKeysDialog(undefined)} />
            <Recaptcha ref={captchaRef} />
        </div>
    )
}