import {useEffect} from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import Router from 'next/router'
import 'nprogress/nprogress.css'

NProgress.configure({speed: 500,showSpinner:false,minimum: 0.2,trickleSpeed: 100});
let popShallow=false,backShallow=false

export default function Loader(){

    useEffect(()=>{
        const startLoading=()=>{
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
        
        Router.events.on('routeChangeStart',routeChangeStart);
        Router.events.on('routeChangeComplete',completeLoading);
        Router.events.on('routeChangeError',stopLoading);

        Router.beforePopState(({url,as,options})=>{
            if(backShallow && !options.shallow) {
                popShallow = true;
                Router.replace(url,as,{shallow:true})
                return false
            }
            popShallow = false;
            return true;
        })

        return()=>{
            Router.events.off('routeChangeStart',routeChangeStart);
            Router.events.off('routeChangeComplete',completeLoading);
            Router.events.off('routeChangeError',stopLoading);
        }
    },[])

    return null;
}