import React from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ErrorPage from 'portal/pages/_error'
import {withStyles,blogStyles,blogResponsive} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import useSWR from 'portal/utils/swr';
import {useAPI,db,getLocal} from 'portal/utils'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {clean,ucwords,truncate as Ktruncate,adddesc} from '@portalnesia/utils'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import Comments from 'portal/components/Comments'
import Button from 'portal/components/Button'
import {Parser} from 'portal/components/Parser'
import {Hidden,Grid,Typography,Card,CardActionArea,CardContent} from '@mui/material'
import { NewsArticleJsonLd } from 'next-seo';
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'

const Carousel=dynamic(()=>import('portal/components/Carousel'))
const CombineAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.CombineAction),{ssr:false})
const LikeAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.LikeAction),{ssr:false})
const AdsRect=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsRect),{ssr:false})
const CountUp=dynamic(()=>import('portal/components/CountUp'),{ssr:false})

const dayjs=require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export const getServerSideProps = wrapper(async({pn:data,token,req,res,params})=>{
    const slug=params.slug;
    if(typeof slug[1]==='undefined') {
        return db.redirect();
    }
    try {
        const ttle=decodeURI(slug[1].replace(/\+/g," "));
        const news = await db.kata(`SELECT id,title,text,foto as 'image',datetime FROM klekle_news WHERE source=? AND title=? LIMIT 1`,[slug[0],ttle]);
        if(!news) return {
            notFound:true
        }
        const {id,title,text,datetime}=news[0];
        const meta = {
            title,
            description:Ktruncate(clean(text),200).replace("Liputan6.com, ",""),
            image:`${process.env.CONTENT_URL}/ogimage/news/${slug[0].toLowerCase()}/${slug[1]}`,
            published:dayjs(datetime).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ"),
            id,
            initial:null
        }
        try {
            const a = await getLocal(token,`/v1/news/${slug[0]}/${ttle}`);
            meta.initial = a;
        } catch {}
        return {props:{meta:meta}}
    } catch(err) {
        return {
            notFound:true
        }
    }
})

const NewsDetail=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const {get} = useAPI();
    const router=useRouter();
    const {slug,ref,refid}=router.query;
    const slugg=encodeURIComponent(decodeURIComponent(slug[1].replace(/\+/g,"%20"))).replace(/\%20/g,"+");
    const {data,error,mutate}=useSWR(`/v1/news/${slug[0]}/${slugg}`,{fallbackData:meta?.initial});
    let hashRef=React.useRef(null);
    
    const {data:dataOthers,error:errorOthers,mutate:refreshOthers}=useSWR(`/v1/news/recommendation/${meta.id}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
        revalidateOnMount:false
    })

    const handlePageContent=(id)=>e=>{
        if(e && e.preventDefault) e.preventDefault()
        const conta=document.getElementById(id);
        if(conta){
            const a=conta.offsetTop,b=a-10;
            window.scrollTo({top:b,left:0,behavior:'smooth'});
        }
    }
    
    React.useEffect(()=>{
        if(data) {
            setTimeout(()=>{
                if(hashRef.current===null) {
                    hashRef.current=10;
                    const hash = window.location.hash;
                    if(hash.length > 0) {
                        handlePageContent(hash.substring(1))()
                    }
                }
            },200)
        }
    },[data])

    React.useEffect(()=>{
        mutate()
        const timeout=setTimeout(async()=>{
            if(process.env.NODE_ENV === 'production') {
                const url = new URL(window.location.href)
                await get(`/v1/news/${slug[0]}/${slugg}/update${url.search}`);
            }
            gtag.event({
                action:'select_content',
                content_type:'news',
                item_id:meta.id
            })
        },5000)
        refreshOthers()
        return ()=>{
            clearTimeout(timeout)
            hashRef.current=null
        }
    },[slug,slugg])

    return (
        <Header iklan title={meta.title} desc={meta.description} image={meta.image} active='news' subactive='news_detail' canonical={`/news/${slug[0]}/${slugg}`}>
            <NewsArticleJsonLd
                url={`${process.env.URL}/news/${slug[0]}/${slugg}`}
                title={meta?.title}
                {...(meta?.image?.length ? {images:[meta?.image]} : {})}
                datePublished={meta?.published}
                dateModified={meta?.published}
                authorName={adddesc(ucwords(slug?.[0]))}
                publisherName="Portalnesia"
                publisherLogo="https://content.portalnesia.com/icon/ms-icon-310x310.png"
                {...(meta?.description!=='Recent News' ? {description:adddesc(meta?.description)} : {})}
            />
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12}>
                    <Breadcrumbs routes={[{label:"News",href:"/news"}]} title={meta.title} />
                </Grid>
                <Grid id='newsContainer' item xs={12} lg={8}>
                    <PaperBlock title={meta.title} linkColor noPaddingHeader whiteBg
                        footer={data && data?.source_link ? <div style={{textAlign:'right'}}><a href={data?.source_link} target='_blank' rel='nofollow noopener noreferrer' className="not_blank"><Button outlined>Artikel Asli</Button></a></div> : ''}
                        header={data && !error && (
                            <div>
                                <div key='flex-1' className={`flex-header ${classes.divider} pbottom`}>
                                    <div key='flex-1-1'>
                                        <Typography variant="body2">{data?.created?.format}</Typography>
                                    </div>
                                    <div key='flex-1-2' style={{display:'flex',alignItems:'center'}}>
                                        <Typography variant="body2">{data?.seen?.number !== undefined && <CountUp data={data?.seen} />} views</Typography>
                                    </div>
                                </div>
                                <div key='flex-2' className={`flex-header ${classes.divider}`}>
                                    <div key='flex-2-1'>
                                        {typeof data?.id === 'number' && <LikeAction type='news' posId={data?.id} liked={data?.liked} onChange={(e)=>mutate({...data,liked:e})} />}
                                    </div>
                                    <div key='flex-2-2'>
                                        <CombineAction
                                            list={{
                                                share:{
                                                    campaign:'news',
                                                    ...(typeof data?.id === 'number'?{posId:data.id}:{})
                                                },
                                                report:true,
                                                donation:true,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    >
                        {!error && !data ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Skeleton number={3} />
                            </div>
                        ) : error  ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{error}</Typography>
                            </div>
                        ) : (
                            <div>
                                <Parser html={data?.text} />
                            </div>
                        )}
                    </PaperBlock>

                    <Hidden mdDown>
                        {!errorOthers && !dataOthers ? (
                            <PaperBlock title='Recommended'>
                                <Skeleton type='carousel' number={4} image carouselProps={{responsive:blogResponsive}} />
                            </PaperBlock>
                        ) : errorOthers ? (
                            <PaperBlock title='Recommended'>
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h5">{errorOthers}</Typography>
                                </div>
                            </PaperBlock>
                        ) : dataOthers.length > 0 ? (
                                <Carousel data={dataOthers} title='Recommended' linkParams="/news/[...slug]" asParams="link"
                                responsive={blogResponsive}
                                />
                            
                        ) : (
                            <PaperBlock title='Recommended' whiteBg>
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h5">No news</Typography>
                                </div>
                            </PaperBlock>
                        )}
                    </Hidden>
                    {data?.seen?.number !== undefined && typeof data?.id === 'number' && <Comments type='news' posId={data?.id} {...(ref==='comment' ? {comment_id:Number(refid)} : {})} />}
                </Grid>
                <Grid item xs={12} lg={4}>
                    <PaperBlock title='Advertisement'>
                        {!error && !data ? (
                            <Skeleton type='ads' />
                        ) : <AdsRect /> }
                    </PaperBlock>
                    <Sidebar id='newsContainer' disabled={errorOthers || !dataOthers}>
                        <PaperBlock title='Recommended'>
                            {!errorOthers && !dataOthers ? (
                                <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                            ) : errorOthers ? (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h5">Failed to load data</Typography>
                                </div>
                            ) : dataOthers?.length > 0 ? dataOthers?.map((item,i)=>(
                                <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                    <Link href={item?.link?.replace(process.env.DOMAIN,"")} passHref><a title={item.title}><CardActionArea>
                                        <CardContent>
                                            <p className={classes.title} style={{margin:0}}>{item.title}</p>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            )) : (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <Typography variant="h5">No news</Typography>
                                </div>
                            )}
                        </PaperBlock>
                    </Sidebar>
                </Grid>
            </Grid>
        </Header>
    );
}

export default withStyles(NewsDetail,blogStyles)