import React from 'react'
import Header from 'portal/components/developer/Header'
import Button from 'portal/components/Button'
import Script from 'next/script'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import { Fab as Fabb,Fade,Typography,Grid,CircularProgress } from '@mui/material';
import {styled,useTheme} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {Code as CodeIcon,Close,ArrowBack,ArrowForward} from '@mui/icons-material'
import Link from 'next/link'
import {useRouter} from 'next/router'

export const getServerSideProps = wrapper('admin');

const Fab = styled(Fabb)(({theme})=>({
  [theme.breakpoints.up(768)]:{
    display:'none'
  },
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  '& svg':{
    fontSize:30
  }
}))

const Footer = styled('div')(({theme})=>({
  marginTop:30,
  '& .footer':{
    WebkitBoxAlign:'stretch',
    WebkitBoxDirection:'normal',
    WebkitBoxOrient:'vertical',
    WebkitFlexBasis:'auto',
    WebkitFlexDirection:'column',
    WebkitFlexShrink:0,
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
    marginBottom:15,
    padding:0,
    position:'relative',
    zIndex:0,
    justifyContent:'center',
    '& a:hover':{
      textDecoration:'underline'
    },
    '& .footer-menu':{
      WebkitFlexDirection:'row',
      WebkitFlexWrap:'wrap',
      WebkitBoxDirection:'normal',
      WebkitBoxOrient:'horizontal',
      flexWrap:'wrap',
      flexDirection:'row',
      marginBottom:0,
      paddingLeft:theme.spacing(2),
      paddingRight:theme.spacing(2)
    },
    '& .footer-child':{
      color:'#000',
      lineHeight:'20px',
      fontSize:13,
      overflowWrap:'break-word',
      margin:'2px 0',
      padding:0,
      paddingRight:10,
      whiteSpace:'pre-wrap',
    },
    '& p':{
      textAlign:'center',
      fontSize:13
    },
    '& span':{
      overflowWrap:'break-word',
      lineHeight:1.3125,
      color:'#444444',
      whiteSpace:'pre-wrap',
      fontSize:13
    },
  }
}))

const Code = styled('code')(()=>({
  backgroundColor: 'rgba(0,0,0,0.04)'
}))

export default function ApiRef({err}){
  if(err) return <ErrorPage statusCode={err} />
  const router = useRouter();
  const theme = useTheme();
  const [navBar,setnavBar] = React.useState(false);
  const isNav = useMediaQuery(theme.breakpoints.down(767));
  const [ready,setReady] = React.useState(false);
  const [hash,setHash] = React.useState('overview');
  const [prev,setPrev] = React.useState(null);
  const [next,setNext] = React.useState(null);

  const handleNavBar=React.useCallback((show=true)=>()=>{
    setnavBar(show)
  },[])

  React.useEffect(()=>{
    if(ready && isNav) {
      const rapidocs = document.getElementById('rapidocs').shadowRoot
      if(navBar) rapidocs.querySelector("nav.nav-bar").classList.add('navbar-mobile')
      else rapidocs.querySelector("nav.nav-bar").classList.remove('navbar-mobile')
    }
  },[navBar,ready,isNav])

  React.useEffect(()=>{
    const $ = require('jquery');
    const sr = document.getElementById('rapidocs').shadowRoot;
    const find = $(sr).find("nav.nav-bar div[data-content-id]");

    function onClick() {
      setnavBar(false);
      setTimeout(()=>window.dispatchEvent(new HashChangeEvent("hashchange")),50);
    }

    if(ready) {
      find.on('click',onClick);
    }

    return ()=>{
      find.off('click',onClick);
    }
  },[ready]);

  React.useEffect(()=>{
    const rapidoc = document.getElementById('rapidocs');

    function hashChange() {
      //console.log("HASH CHANGED");
      const hash = location.hash;
      if(hash && hash?.length > 0) {
        const url = hash?.substring(1);
        setHash(url);
      } else {
        setHash('overwiew')
      }

      setTimeout(()=>{
        if(rapidoc && rapidoc?.shadowRoot) {
          rapidoc.shadowRoot.querySelectorAll('div.main-content-inner--focused-mode a').forEach(link=>{
            if(link.hasAttribute('href')) {
              const href = link.getAttribute('href');
              if(/^https?\:\/\/portalnesia\.com/.test(href)) {
                
              } else {
                if(/^https?\:\/\//.test(href)) {
                  link.setAttribute('target','_blank');
                  link.setAttribute('rel','nofollow noopener noreferrer')
                }
              }
            }
          })
        }
      },50)
    }

    function specLoaded() {
      setReady(true);
      if(rapidoc.shadowRoot.querySelector('style#portalnesia-rapidoc-id')) {
        
      } else {
        const style = document.createElement('style');
        style.setAttribute('id','portalnesia-rapidoc-id');
        style.innerHTML = `
          .nav-bar {
            padding-top:15px;
            padding-bottom:15px;
          }
          .navbar-mobile {
            position: fixed !important;
            top: 64px;
            left: 0;
            width: 100% !important;
            height: calc(100% - 64px) !important;
            display: block !important;
            z-index:10;
            overflow: hidden overlay !important;
          }
          main.main-content {
            padding-left: 16px !important;
            padding-right: 16px !important;
            display:flex;
            flex-direction:column;
          }
          .main-content-inner--focused-mode {
            flex-grow:1;
          }
          section#auth {
            overflow-x:auto;
          }
          section#auth table {
            word-break:break-word;
          }
        `
        rapidoc.shadowRoot.appendChild(style);
      }
      hashChange();
    }

    rapidoc.addEventListener('spec-loaded',specLoaded)
    window.addEventListener('hashchange',hashChange,false);

    return ()=>{
      if(rapidoc) {
        rapidoc.removeEventListener('spec-loaded',specLoaded);
      }
      window.removeEventListener('hashchange',hashChange,false);
    }
  },[])

  React.useEffect(()=>{
    const $ = require('jquery');
    function getPrev(curr) {
      let value=null;
      if(curr.attr('data-first-path-id')) {
        const parent = curr.parent().prev()
        if(curr.attr('data-content-id') === 'tag--Blog') {
          const prev = parent.prev();
          value = {
            id:prev.attr('data-content-id'),
            text:prev.text()
          }
          //console.log("FIRST PREV",value)
        } else {
          const find = parent.find('[data-content-id]');
          if(find?.length > 0) {
            const a = $(find[find.length-1])
            value = {
              id:a.attr('data-content-id'),
              text:a.text()
            };
            //console.log("SECOND PREV",value)
          }
        }
      } else {
        const prev = curr?.prev('[data-content-id]');
        if(prev?.length > 0) {
          const a = $(prev[0]);
          value = {
            id:a.attr('data-content-id'),
            text:a.text()
          };
          //console.log("THIRD PREV",value)
        } else {
          const parent = curr.parent().prev('[data-content-id]');
          if(parent?.length > 0) {
            const a = $(parent[0]);
            value = {
              id:a.attr('data-content-id'),
              text:a.text()
            };
            //console.log("FOURTH PREV",value);
          }
        }
      }
      return value;
    }

    function getNext(curr) {
      let value = null;
      if(curr.attr('data-first-path-id')) {
        const next = curr?.next();
        if(next?.length > 0) {
          const child = $(next[0]).find('[data-content-id]');
            if(child?.length > 0) {
              const a = $(child[0]);
              value = {
                id:a.attr('data-content-id'),
                text:a.text()
              };
              //console.log("FIRST NEXT",value)
            }
        }
      } else {
        const next = curr?.next('[data-content-id]');
        if(next?.length > 0) {
          const n = $(next[0]);
          if(n.attr('data-content-id') === 'operations-top') {
            const child = n.next().find('[data-content-id]');
            if(child?.length > 0) {
              const a = $(child[0]);
              value = {
                id:a.attr('data-content-id'),
                text:a.text()
              };
              //console.log("SECOND NEXT",value)
            }
          } else {
            const a = $(next[0]);
            value = {
              id:a.attr('data-content-id'),
              text:a.text()
            };
            //console.log("THIRD NEXT",value)
          }
        } else {
          const parent = curr.parent().parent().next().find('[data-content-id]');
          if(parent?.length > 0) {
            const a = $(parent[0])
            value = {
              id:a.attr('data-content-id'),
              text:a.text()
            };
            //console.log("FOURTH NEXT",value)
          }
        }
      }
      
      return value;
    }
    
    if(ready) {
      if(hash !== 'operations-top') {
        const rapidoc = document.getElementById('rapidocs').shadowRoot;
        const hhash = decodeURIComponent(!hash ? 'overview' : hash);
        const find = $(rapidoc).find(`[data-content-id="${hhash}"`);
        if(find?.length > 0) {
          const current = find?.[0];
          const curr = $(current);
          const prev = getPrev(curr);
          const next = getNext(curr);
          //console.log("PREV",prev)
          //console.log("NEXT",next);
          setPrev(prev);
          setNext(next);
        }
      }
    }
  },[hash,ready])

  const linkClick = React.useCallback(({id,text})=>(e)=>{
    if(e?.preventDefault) e?.preventDefault();
    const rapidoc = document.getElementById('rapidocs');
    rapidoc?.scrollTo(id);
    setTimeout(()=>window.dispatchEvent(new HashChangeEvent("hashchange")),50);
  },[])

  return (
    <Header full title="Api Reference" active='api-reference' canonical={`/developer/api-reference`}
    keyword={['api','developer','documentation','authentication','api reference'].join(",")}

    >
      {!ready && (
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:2000}}>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
            <Typography sx={{color:'#fff',mb:3}}>Please wait..</Typography>
            <CircularProgress thickness={5} size={50} sx={{color:'#fff'}} />
          </div>
        </div>
      )}
      <rapi-doc
        id='rapidocs'
        spec-url="https://api.portalnesia.com/openapi.json"
        header-text="Portalnesia"
        primary-color="#2f6f4e"
        allow-spec-url-load="false"
        allow-spec-file-load="false"
        show-header="false"
        fill-request-fields-with-example="false"
        schema-expand-level="5"
        font-size="default"
        nav-item-spacing="relaxed"
        nav-bg-color="#181818"
        render-style="focused"
        theme="light"
        regular-font='"Inter","Inter var",-apple-system,"Helvetica Neue",Roboto'
        mono-font='Courier, monospace'
        schema-description-expanded="true"
        api-key-location="header"
        on-nav-tag-click="show-description"
        allow-search="false"
        load-fonts="false"
        allow-advanced-search="false"
      >
        <div style={{marginTop:15}}></div>
        <div slot="footer">
          <Footer>
            <div style={{marginBottom:30}}>
              <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
                {prev !== null && (
                  <Grid item xs={12} sm={6}>
                    <Button component='a' href={`#${prev?.id}`} onClick={linkClick(prev)} startIcon={<ArrowBack />} variant='outlined' size='large' sx={{color:'#000000',textAlign:'unset',textTransform:'unset'}}>
                      <div>
                        <Typography color='rgba(0,0,0,0.6)' sx={{fontSize:13}}>Previous</Typography>
                        <Typography>{prev?.text}</Typography>
                      </div>
                    </Button>
                  </Grid>
                )}
                {next !== null && (
                  <Grid item xs={12} sm={!prev ? 12 : 6} sx={{textAlign:'right'}}>
                    <Button component='a' href={`#${next?.id}`} onClick={linkClick(next)} endIcon={<ArrowForward />} variant='outlined' size='large' sx={{color:'#000000',textAlign:'unset',textTransform:'unset'}}>
                      <div>
                        <Typography color='rgba(0,0,0,0.6)' sx={{fontSize:13}}>Next</Typography>
                        <Typography>{next?.text}</Typography>
                      </div>
                    </Button>
                  </Grid>
                )}
              </Grid>
            </div>
            <div className='footer'>
              <Typography variant='body1'>{`Portalnesia © ${(new Date().getFullYear())}`}</Typography>
              <div className='footer footer-menu'>
                <Link href='/contact' passHref><a className='footer-child'><Typography component='span'>Contact</Typography></a></Link>
                <a className='footer-child' href='https://status.portalnesia.com' target='_blank'><Typography component='span'>Status</Typography></a>
                <Link href='/pages/[slug]' as='/pages/terms-of-service' passHref><a className='footer-child'><Typography component='span'>Terms of Services</Typography></a></Link>
                <Link href='/pages/[slug]' as='/pages/privacy-policy' passHref><a className='footer-child'><Typography component='span'>Privacy Policy</Typography></a></Link>
                <Link href='/pages/[slug]' as='/pages/cookie-policy' passHref><a className='footer-child'><Typography component='span'>Cookie Policy</Typography></a></Link>
                <a href="https://paypal.me/adityatranasuta" target="_blank" className='footer-child'><Typography component='span'>Donate</Typography></a>
              </div>
            </div>
          </Footer>
        </div>
        <div slot='auth' style={{marginTop:15}}>
          <Typography sx={{fontWeight:'bold'}}>Notes:</Typography>
          <Typography>If you want to try to make API call using <Code className='code'>try</Code> feature, you must include <Code className="code">{`${process.env.URL}/developer/oauth-receiver.html`}</Code> in one of the callback urls in your Portalnesia application.</Typography>
        </div>
      </rapi-doc>
      {isNav && (
        <>
          <Fade in={navBar}>
            <Fab color='primary' onClick={handleNavBar(false)}>
              <Close />
            </Fab>
          </Fade>
          <Fade in={!navBar}>
            <Fab color='primary' onClick={handleNavBar(true)}>
              <CodeIcon />
            </Fab>
          </Fade>
        </>
      )}
      <Script strategy="lazyOnload" type="module" src="https://unpkg.com/rapidoc@9.1.4/dist/rapidoc-min.js" />
    </Header>
  )
}