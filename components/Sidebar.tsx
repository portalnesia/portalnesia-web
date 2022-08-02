import React from 'react'
import {getOffset} from 'portal/components/TableContent'

export interface SidebarProps {
  children?: React.ReactNode,
  type?: 'top'|'bottom',
  id: string,
  disabled?: boolean
}

function SidebarComp(props: SidebarProps) {
  const {id,disabled=false,type='bottom',children} = props;

  React.useEffect(()=>{
    function getScrollTop() {
      return document?.documentElement?.scrollTop || document.body.scrollTop
    }
    const z = document.getElementById('staticdynamic');
    const x = window.matchMedia("(min-width: 960px)");
    let lastScroll = getScrollTop(),last: number|null=null,t: number;
    const dynamic = document.getElementById('dynamic')
    const dynOfs = dynamic.offsetHeight + 84
    function onScroll() {
      if(last === null) last = getScrollTop()+84;
      if(type === 'bottom' && Number(dynOfs) > Number(window.outerHeight - 84)) {
        const eh = Number(dynOfs),a = Number(getOffset(document.getElementById('static')).top),st=getScrollTop();
        if((st + 84 >= a) && (a + eh) < Number(document.getElementById(id).offsetHeight + 84)) {
          t = Math.round(last - (st - lastScroll));

          // Scroll ke bawah
          if(st - lastScroll > 0) {
            if(t < Math.round(window.outerHeight - eh - 10)) {
              t = Math.round(window.outerHeight - eh - 10)
            } else if(t > 84) t = 84;
            //console.log("1")
          }

          // Scroll ke atas
          else {
            //console.log("2")
            if(t < Math.round(window.outerHeight - eh)) {
              t = Math.round(window.outerHeight - eh)
            } else if (t > 84){
              t=84;
            }
          }
          dynamic.style.zIndex='1';
          dynamic.style.position='fixed';
          dynamic.style.top = `${t.toString()}px`
          dynamic.style.width = `${z.clientWidth}px`;
        } else {
          //console.log("3")
          t=84;
          dynamic.style.removeProperty('top')
          dynamic.style.removeProperty('width')
          dynamic.style.zIndex='1';
          dynamic.style.position='relative';
        }
        last=t;
        lastScroll = st;
      } else {
        //console.log("4")
        z.style.zIndex='1';
        z.style.position='sticky';
        z.style.top = `84px`
        z.style.width = `${z.clientWidth}px`;
      }
    }

    function onResize() {
      window.removeEventListener('scroll',onScroll)
      if(x.matches){
          window.addEventListener('scroll',onScroll)
      } else {
        if(dynamic) {
          dynamic.style.position='relative';
          dynamic.style.zIndex = '1'
        }
      }
    }

    if(disabled === false) {
      onResize();
      window.addEventListener('resize',onResize);
    }

    return ()=>{
      window.removeEventListener('resize',onResize)
      window.removeEventListener('scroll',onScroll)
    }

  },[id,disabled,type])

  return (
    <div id='staticdynamic'>
      <div key='static' id='static'></div>
      <div key='dynamic' id='dynamic'>
        {children}
      </div>
    </div>
  )
}

const Sidebar = React.memo(SidebarComp);
export default Sidebar