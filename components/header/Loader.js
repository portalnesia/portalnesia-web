import React from 'react'
import styles from 'portal/styles/Loading.module.css'
import {Portal,Backdrop} from '@mui/material'
import NProgress from 'nprogress'
import {useRouter} from 'next/router'
//import * as gtag from 'portal/utils/gtag'
import 'nprogress/nprogress.css'

NProgress.configure({speed: 500,showSpinner:false,minimum: 0.2,trickleSpeed: 100});
let popShallow=false,backShallow=false
function Loader(){
    //const [open,setOpen]=React.useState(false)
    const router = useRouter()

    React.useEffect(()=>{
        const startLoading=()=>{
            //setOpen(true)
            NProgress.start()
        }

        const routeChangeStart=(url,{shallow})=>{
            if(shallow || popShallow) {
                backShallow = !popShallow;
            } else {
                startLoading()
                popShallow = false;
                backShallow = false;
            }
            popShallow = false;
        }

        const stopLoading=()=>{
            //setOpen(false)
            NProgress.done()
        }

        const completeLoading=(url)=>{
            //gtag.pageview(url)
            stopLoading()
        }
        
        router.events.on('routeChangeStart',routeChangeStart);
        router.events.on('routeChangeComplete',completeLoading);
        router.events.on('routeChangeError',stopLoading);

        router.beforePopState(({url,as,options})=>{
            if(backShallow && !options.shallow) {
                popShallow = true;
                router.replace(url,as,{shallow:true})
                return false
            }
            popShallow = false;
            return true;
        })

        return()=>{
            router.events.off('routeChangeStart',routeChangeStart);
            router.events.off('routeChangeComplete',completeLoading);
            router.events.off('routeChangeError',stopLoading);
        }
    },[])

    return null;
}
export default React.memo(Loader)

/*
return (
        <Portal>
            <Backdrop open={open} style={{zIndex:2000,backgroundColor: 'rgba(240, 240, 240, 0.5)'}} transitionDuration={700}>
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%'}}>
                    <div className={styles['sk-bounce']} style={{pointerEvents:'none'}}>
                        <div key={0} className={styles['sk-bounce-dot']} style={{pointerEvents:'none'}}></div>
                        <div key={1} className={styles['sk-bounce-dot']} style={{pointerEvents:'none'}}></div>
                    </div>
                </div>
            </Backdrop>
        </Portal>
    )
*/