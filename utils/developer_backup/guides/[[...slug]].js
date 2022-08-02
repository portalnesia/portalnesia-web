import React from 'react'
import withStyles from '@mui/styles/withStyles';
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/developer/Header'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import {Parser,Markdown} from 'portal/components/Parser'
import {CombineAction} from 'portal/components/Action'
import Skeleton from 'portal/components/Skeleton'
import db from 'portal/utils/db'
//import useAPI from 'portal/utils/api'
import {clean,truncate as Ktruncate,ucwords} from '@portalnesia/utils'
import { ArticleJsonLd } from 'next-seo';
import {useRouter} from 'next/router'
import * as gtag from 'portal/utils/gtag'
import {Hidden,Grid,Typography} from '@mui/material'
import useSWR from 'portal/utils/swr';

const dayjs=require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export const getServerSideProps = wrapper(async({pn:data,req,res,params})=>{
    const slug = params.slug
    if(!slug) {
        return db.redirect(`${process.env.URL}/developer/guides/getting-started`);
    }
    const marked=require('marked');
    if(data.user === null || !data?.user?.admin) {
        return db.redirect();
    }
    const slugg = slug?.[1] ? `guides-${slug[0]}-${slug[1]}` : `guides-${slug?.[0]}`;
    const blog = await db.kata(`SELECT title,text,publish,photo,datetime,datetime_edit,format FROM klekle_pages WHERE type='developer' AND slug=? LIMIT 1`,[slugg]);
    if(!blog) {
        return db.redirect();
    }
    const {title,text,publish,photo,datetime,datetime_edit,format}=blog[0];
    if(publish==0 && !data?.user?.admin) {
        return db.redirect();
    }
    const datee=dayjs(datetime).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
    const dateee=dayjs(datetime_edit).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
    const textt = format==='html' ? text : marked(text);
    const meta={
        title:title,
        description:Ktruncate(clean(textt),200),
        //active:(slug?.[0]||'getting-started').toLowerCase(),
        subactive:(slug?.[0]||'getting-started').toLowerCase(),
        published: datee,
        modified: dateee,
        slug:`guides/${slug?.[0].toLowerCase()}${slug?.[1] ? `/${slug[1].toLowerCase()}` : ''}`,
    }
    if(photo!=null) meta.image=`${photo}&export=twibbon`;
    return {props:{meta:meta}}
})

const styles=theme=>({
    divider:{
        padding:'.5rem 0',
        borderTop:`1px solid ${theme.palette.divider}`,
        '& > div':{
            [theme.breakpoints.down('sm')]: {
                paddingLeft:theme.spacing(2),
                paddingRight:theme.spacing(2)
            },
                [theme.breakpoints.up('sm')]: {
                paddingLeft:theme.spacing(3),
                paddingRight:theme.spacing(3)
            },
        }
    },
    contspan:{
        '& span':{
            '&:hover':{
                textDecoration:'underline'
            },
        },
        '&.active':{
            color:theme.palette.primary.link,
        }
    },
    contentTools:{
        position:'fixed',
        top:200,
        zIndex:101,
        transition: 'right .5s ease-out',
        maxWidth:'calc(100% - 40px)'
    },
    contentBtn:{
        cursor:'pointer',
        fontSize:15,
        padding:'7px 20px',
        backgroundColor:theme.palette.primary.main,
        color:'#ffffff',
        display:'inline-block',
        position:'absolute',
        top:65,
        left:-100,
        transform:'rotate(-90deg)',
        borderRadius:'10px 10px 0 0',
    },
    contentCont:{
        backgroundColor:theme.palette.background.default,
        borderBottomLeftRadius:10,
        position:'relative'
    },
    contentContt:{
        maxHeight:'calc(100% - 250px)',
        overflowY:'auto',
        '-webkit-box-shadow':'50px 4px 40px -7px rgba(0,0,0,0.2)',
        boxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
        padding:20,
        wordBreak:'break-word'
    }
})

const DeveloperGuides=({err,meta,classes})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter()
    const {slug}=router.query
    const {data,error}=useSWR(`/v1/developer/${meta.slug}`);
    const [right,setRight]=React.useState(-500);
    const [opacity,setOpacity]=React.useState(0)
    const [content,setContent]=React.useState([]);
    const divRef=React.useRef(null)
    let containerRef=React.useRef(null);
    let hashRef=React.useRef(null)

    const handlePageContent=(id,tutup)=>e=>{
        if(e && e.preventDefault) e.preventDefault()
        const conta=document.getElementById(id);
        if(conta){
            const a=conta.offsetTop,b=a+15;
            window.scrollTo({top:b,left:0,behavior:'smooth'});
            if(tutup===true) setRight(containerRef.current)
        }
    }

    const btnPageContent=()=>{
        if(right === 0) setRight(containerRef.current)
        else setRight(0)
    }

    React.useEffect(()=>{
        const $=require('jquery')
        const tim1 = setTimeout(()=>{
            if(divRef.current) {
                let konten=[];
                $("h1[id],h2[id]").each(function(){
                    const id=$(this).attr("id")
                    const name = ucwords($(this).text())
                    konten = konten.concat({id:id,name:name})
                })
                setContent(konten);
            }
        },500)
        
        return()=>{
            setContent([])
            clearTimeout(tim1)
        }
    },[data])

    React.useEffect(()=>{
        const $=require('jquery')
        function onScroll() {
            const aa=$("#tableOfContents").find("a");
            const o=$(window).scrollTop();
            aa.each(function(){
                $(this.hash).length&&$(this.hash).offset().top-84<=o&&($(this).addClass("active"),$(this).siblings().removeClass("active"))
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
                $(window).on('scroll',onScroll)
            }
        },500)
            
        return ()=>{
            $(window).off('scroll',onScroll)
            clearTimeout(tim2)
            setRight(-500)
            setOpacity(0)
            containerRef.current=null
        }
    },[content])

    React.useEffect(()=>{
        const timeout=setTimeout(async()=>{
            /*await fetchGet(`${process.env.API}/developer/update_view/${meta.slug}`);
            gtag.event({
                action:'select_content',
                content_type:'pages',
                item_id:meta.id
            })*/
        },5000)

        

        return ()=>{
            setRight(-500)
            setOpacity(0)
            containerRef.current=null
            setContent([])
            clearTimeout(timeout)
            hashRef.current=null
        }
    },[slug])

    React.useEffect(()=>{
        const sl = slug?.[1] ? `guides/${(slug?.[0]||'getting-started')}/${slug[1]}` : `guides/${(slug?.[0]||'getting-started')}`
        if(sl !== meta.slug) router.replace('/developer/guides/[[...slug]]',meta.slug,{shallow:true})
    },[])

    return (
        <Header title={meta.title} desc={meta.description} active="guides" subactive={meta.subactive} canonical={`/developer/${meta.slug}`} {...(meta?.image ? {image:meta.image} : {})}
        keyword={['api','developer','documentation','authentication'].join(",")}
        openGraph={{
            type:'article',
            article:{
                authors:[`${process.env.URL}/user/portalnesia`],
                publishedTime:meta?.published,
                modifiedTime:meta?.modified,
                tags:['api','developer','documentation','authentication']
            }
        }}
        >
            <ArticleJsonLd
                url={`${process.env.URL}/developer/${meta?.slug}`}
                title={meta?.title}
                {...(meta?.image ? {images:[meta?.image]} : {})}
                datePublished={meta?.published}
                dateModified={meta?.modified}
                authorName='Portalnesia'
                publisherName="Portalnesia"
                publisherLogo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
                description={meta?.description}
            />
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} lg={content.length > 0 ? 8 : 10}>
                    <PaperBlock id='cardContent' title={meta.title} linkColor noPaddingHeader whiteBg
                    action={data ? (
                        <CombineAction
                            list={{
                                share:{campaign:'developer',posId:data?.docs?.id},
                                report:true,
                            }}
                        />
                    ) : null}
                    >
                        {!error && !data ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Skeleton number={3} />
                            </div>
                        ) : error || data.error == 1 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">Failed load data</Typography>
                            </div>
                        ) : (
                            <div ref={divRef}>
                                {data?.docs?.format === 'html' ? (
                                    <Parser html={data?.docs?.text} />
                                ) : (
                                    <Markdown source={data?.docs?.text} skipHtml={false}/>
                                )}
                            </div>
                        )}
                    </PaperBlock>
                </Grid>
                {content.length > 0 && (
                    <Hidden lgDown>
                        <Grid item xs={12} lg={4}>
                            <Sidebar id='cardContent'>
                                <PaperBlock title='Table of Contents'>
                                    <div id="tableOfContents">
                                        {content.map((dt,i)=>(
                                            <a key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id)} className={classes.contspan}><Typography>{i+1}. <span>{dt?.name}</span></Typography></a>
                                        ))}
                                    </div>
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                    </Hidden>
                )}
            </Grid>
            {content.length > 0 && (
                <Hidden lgUp>
                    <div className={classes.contentTools} style={{right:right,opacity:opacity}}>
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
                </Hidden>
            )}
        </Header>
    );
}

export default withStyles(DeveloperGuides,styles)