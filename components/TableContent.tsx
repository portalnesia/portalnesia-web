import React from 'react'
import {ucwords} from '@portalnesia/utils'
import {blogStyles,makeStyles} from './styles'
import {Typography} from '@mui/material'

type Args = {
  data: any
}

type Content = {
  id: string,
  name: string
}

const useStyles = makeStyles()(blogStyles);

export function getOffset(elem: Element){
  if(!elem.getClientRects().length) return {top:0,left:0}
  const rect = elem.getBoundingClientRect();
  const win = elem.ownerDocument.defaultView;
  return {
    top:rect.top + win.scrollY,
    left: rect.left + win.scrollX
  }
}

export default function useTableContent(opt: Args) {
  const [content,setContent] = React.useState<Content[]>([])
  const [right,setRight] = React.useState(-500);
  const [opacity,setOpacity]=React.useState(0)
  const containerRef = React.useRef<number|null>(0)
  const hashRef = React.useRef<number|null>(null)
  
  const handlePageContent=React.useCallback((id: string,tutup?: boolean)=>(e?: any)=>{
    if(e && e.preventDefault) e.preventDefault()
    const conta=document.getElementById(id);
    if(conta){
      const a=getOffset(conta).top,b=a-84;
      window.scrollTo({top:b,left:0,behavior:'smooth'});
      if(tutup===true) setRight(containerRef.current)
    }
  },[])

  const btnPageContent=React.useCallback(()=>{
    if(right === 0) setRight(containerRef.current)
    else setRight(0)
  },[right])

  React.useEffect(()=>{
    const tim1 = setTimeout(()=>{
      let konten=[];
      document.querySelectorAll('a > h2[id], a > h3[id], .table-content[id]').forEach(e=>{
          const id = e.getAttribute('id');
          const name = ucwords(e.textContent)
          konten = konten.concat({id:id,name:name})
      })
      setContent(konten);
    },500)
  
    return()=>{
      clearTimeout(tim1)
    }
  },[opt.data])

  React.useEffect(()=>{
    function onScroll() {
        document.querySelectorAll<HTMLAnchorElement>('#tableOfContents a').forEach(a=>{
            if(a.hash.length > 0) {
                const o = document?.documentElement?.scrollTop || document.body.scrollTop
                const id = document.querySelector<Element>(a.hash);
                if(getOffset(id).top - 86 <= o) {
                    for(let siblings of a.parentNode.children) {
                        siblings.classList.remove('active');
                    }
                    a.classList.add('active');
                }
            }
        })
    }
    const tim2 = setTimeout(()=>{
      if(content.length > 0) {
        if(hashRef.current===null) {
          hashRef.current=10;
          const hash = window.location.hash;
          if(hash.length > 0) {
              handlePageContent(hash.substring(1))()
          }
        }
        if(containerRef.current===null) {
            const cont=document.getElementById('table-contents')
            if(cont) {
                const a=cont.clientWidth||cont.offsetWidth;
                containerRef.current=Number(a*-1);
                setRight(Number(a*-1));
                setOpacity(1)
            }
        }
        window.addEventListener('scroll',onScroll);
      }
    },500)
    return ()=>{
      window.removeEventListener('scroll',onScroll);
      clearTimeout(tim2)
      setRight(-500)
      setOpacity(0)
      containerRef.current=null
    }
  },[content])

  return {content,btnPageContent,handlePageContent,right,opacity};
}

function HtmlLgDownComp(props: Args) {
  const {classes} = useStyles();
  const {content,handlePageContent} = useTableContent(props);

  if(content?.length === 0) return null;
  return (
    <div id='tableOfContents'>
          {content.map((dt,i)=>(
              <a key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id)} className={classes.contspan}><Typography>{i+1}. <span>{dt?.name}</span></Typography></a>
          ))}
      </div>
  )
}
export const HtmlLgDown = React.memo(HtmlLgDownComp)

export function HtmlLgUpComp(props: Args) {
  const {classes} = useStyles();
  const {content,btnPageContent,right,opacity,handlePageContent} = useTableContent(props);

  if(content?.length === 0) return null;
  return (
    <div className={classes.contentTools} style={{right,opacity}}>
      <div className={classes.contentCont}>
          <div onClick={btnPageContent} key={0} className={classes.contentBtn}>Table of Contents</div>
          <div key={1} id='table-contents' className={classes.contentContt}>
              <div id="tableOfContents">
                  {content.map((dt,i)=>(
                      <a key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id,true)} className={classes.contspan}><Typography>{i+1}. <span>{dt?.name}</span></Typography></a>
                  ))}
              </div>
          </div>
      </div>
    </div>
  )
}
export const HtmlLgUp = React.memo(HtmlLgUpComp)