import useResponsive from "@design/hooks/useResponsive";
import React from "react";
import { getOffset } from "./TableContent";

export interface SidebarProps {
    children?: React.ReactNode,
    type?: 'fixed'|'scroll',
    /**
     * ID on left grid
     */
    id: string,
    disabled?:boolean
    minimalScreen?: 'md'|'lg'
    mutation?: any[]
}

export default function Sidebar({children,type='scroll',id,disabled,minimalScreen='md',mutation}: SidebarProps) {
    const isMd = useResponsive('up','md')
    const isLg = useResponsive('up','lg')
    const staticDynamic = React.useRef<HTMLDivElement>(null);
    const dynamic = React.useRef<HTMLDivElement>(null);
    const staticEl = React.useRef<HTMLDivElement>(null);

    const isActive = React.useMemo(()=>{
        if(minimalScreen === 'md') return isMd;
        else return isLg
    },[minimalScreen,isMd,isLg])

    React.useEffect(()=>{
        function getScrollTop() {
            return document?.documentElement?.scrollTop || document.body.scrollTop
        }
        const padding = 64+24;
        let lastScroll = getScrollTop(),last: number=lastScroll+padding,t: number;
        
        function onScroll() {
            // IF SCROLL
            const idHeight = Number((document.getElementById(id)?.offsetHeight||0)) + padding;
            const dynOfs = (dynamic.current?.offsetHeight||0) + padding
            //console.log(dynOfs,window.outerHeight,idHeight)
            if(type === 'scroll' && dynOfs > (window.outerHeight) && idHeight > dynOfs) {
                const staticTop = Number(getOffset(staticEl.current).top),st=getScrollTop();
                const idTop = Number(getOffset(document.getElementById(id)).top)

                if((st + padding >= staticTop)) {
                    t = Math.round(last - (st - lastScroll));
                    // Scroll ke bawah
                    if(st - lastScroll > 0) {
                        if((st + window.outerHeight - 10) < (idTop + idHeight)) {
                            if(t < Math.round(window.outerHeight - dynOfs - 10)) {
                                t = Math.round(window.outerHeight - dynOfs - 10)
                            } else if(t > padding) t = padding;
                        }
                    }

                    // Scroll ke atas
                    else {
                        if((st + window.outerHeight - 10) < (idTop + idHeight)) {
                            if(t < Math.round(window.outerHeight - dynOfs)) {
                                t = Math.round(window.outerHeight - dynOfs)
                            } else if (t > padding){
                                t=padding;
                            }
                        }
                    }

                    if(dynamic.current) {
                        dynamic.current.style.zIndex='1'
                        dynamic.current.style.position='fixed';
                        dynamic.current.style.top = `${t.toString()}px`
                        dynamic.current.style.width = `${staticDynamic.current?.clientWidth}px`;
                    }

                } else {
                    t = padding;
                    if(dynamic.current) {
                        dynamic.current.style.removeProperty('top')
                        dynamic.current.style.removeProperty('width')
                        dynamic.current.style.zIndex='1'
                        dynamic.current.style.position='relative';
                    }
                }
                last=t;
                lastScroll = st;
            }
            // FIXED
            else {
                if(staticDynamic.current) {
                    staticDynamic.current.style.zIndex='1';
                    staticDynamic.current.style.position='sticky';
                    staticDynamic.current.style.top = `${padding}px`
                    staticDynamic.current.style.width = `${staticDynamic.current.clientWidth}px`;
                }
            }
        }

        if(!disabled) {
            if(isActive) {
                window.addEventListener('scroll',onScroll)
            } else {
                if(dynamic.current) {
                    dynamic.current.style.removeProperty('position');
                    dynamic.current.style.removeProperty('z-index');
                    dynamic.current.style.removeProperty('top')
                    dynamic.current.style.removeProperty('width')
                }
                if(staticDynamic.current) {
                    staticDynamic.current.style.removeProperty('z-index');
                    staticDynamic.current.style.removeProperty('position');
                    staticDynamic.current.style.removeProperty('top')
                    staticDynamic.current.style.removeProperty('width')
                }
            }
        }
        

        return ()=>{
            if(dynamic.current) {
                dynamic.current.style.removeProperty('position');
                dynamic.current.style.removeProperty('z-index');
                dynamic.current.style.removeProperty('top')
                dynamic.current.style.removeProperty('width')
            }
            if(staticDynamic.current) {
                staticDynamic.current.style.removeProperty('z-index');
                staticDynamic.current.style.removeProperty('position');
                staticDynamic.current.style.removeProperty('top')
                staticDynamic.current.style.removeProperty('width')
            }
            window.removeEventListener('scroll',onScroll)
        }
    },[id,type,isActive,disabled,children])

    return (
        <div ref={staticDynamic} style={{width:'100%'}}>
            <div key='static' ref={staticEl} />
            <div key='dynamic' ref={dynamic}>
                {children}
            </div>
        </div>
    )
}