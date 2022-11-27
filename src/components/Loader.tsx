import {useEffect} from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import {useRouter} from 'next/router'
import 'nprogress/nprogress.css'

NProgress.configure({speed: 500,showSpinner:false,minimum: 0.2,trickleSpeed: 100});
let popShallow=false,backShallow=false

export default function Loader(){
    const router = useRouter()

    useEffect(()=>{
        const startLoading=()=>{
            //setOpen(true)
            NProgress.start()
        }

        const routeChangeStart=(url: string,{shallow}: {shallow: boolean})=>{
            if(shallow || popShallow) {
                backShallow = !popShallow;
            } else {
                startLoading()

                backShallow = false;
            }
            popShallow = false;
        }

        const stopLoading=()=>{
            //setOpen(false)
            NProgress.done()
        }

        const completeLoading=(url: string)=>{
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[])

    return null;
}