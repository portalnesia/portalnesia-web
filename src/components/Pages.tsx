import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import config from '@src/config';
import { NextSeo, LogoJsonLd } from 'next-seo';
import { useRouter } from 'next/router';
import { portalUrl, staticUrl } from '@utils/main';
import { useSelector } from '@redux/store';
import SplashScreen from '@design/components/Splashscreen';
import useInit from '@hooks/init';
import Typography from '@mui/material/Typography';
import Button from './Button';
import dynamic from 'next/dynamic';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { KeyboardArrowUp } from '@mui/icons-material';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import { Socket } from './Socket';

const Dialog = dynamic(()=>import('@design/components/Dialog'))
const DialogContent = dynamic(()=>import('@design/components/DialogContent'))
const DialogActions = dynamic(()=>import('@design/components/DialogActions'))

export interface PageProps {
    children: ReactNode
    title?:string
    desc?:string
    keyword?:string
}
export default function Pages({children,title,desc,keyword}: PageProps) {
    const router = useRouter()
    const { adBlock } = useInit();
    const appToken = useSelector(s=>s.appToken);
    const theme = useTheme();
    const [showToTop,setShowToTop] = useState(false);

    const trigger = useScrollTrigger({
        target: typeof window !== 'undefined' ? window : undefined,
    });
    
    const header = useMemo(()=>{
        return {
            title: `${title ? `${title} | `:''}${config.meta.title}`,
            desc: `${desc ? `${desc} `:''}${config.meta.description}`,
            keyword: `${keyword ? `${keyword},`:''}${config.meta.keywords}`
        }
    },[title,desc,keyword])

    const handleToTop = useCallback(()=>{
        window.scrollTo({top:0,left:0,behavior:'smooth'});
    },[])

    useEffect(() => {
        if (!appToken) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
    }, [appToken]);

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

    return (
        <div>
            {!appToken ? (
                <SplashScreen />
            ) : <Socket />}
            <NextSeo
                title={header.title}
                description={header.desc}
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
                    url: portalUrl(router.asPath),
                    title: header.title,
                    description: header.desc,
                    images: [
                        { url: staticUrl("og_image_default.png") },
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
            <LogoJsonLd
                logo={staticUrl('icon/android-chrome-512x512.png')}
                url={portalUrl()}
            />
            {!adBlock && children}
            <Dialog open={adBlock} title="WARNING!" titleWithClose={false} actions={
                <Button onClick={()=>window.location.reload()}>Refresh</Button>
            }>
                <Typography>Please support us by disable your adblock!</Typography>
            </Dialog>
            <Zoom in={showToTop}>
                <Fab size='medium' color='primary' sx={{position:'fixed',bottom:16,right:16}} onClick={handleToTop}>
                    <KeyboardArrowUp fontSize='large' />
                </Fab>
            </Zoom>
        </div>
    )
}