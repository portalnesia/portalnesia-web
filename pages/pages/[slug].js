import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import ErrorPage from 'portal/pages/_error'
import {withStyles,blogStyles} from 'portal/components/styles';
import {clean,truncate as Ktruncate,adddesc,ucwords} from '@portalnesia/utils'
import {wrapper} from 'portal/redux/store'
import useSWR from 'portal/utils/swr';
import useAPI,{getLocal} from 'portal/utils/api'
import db from 'portal/utils/db'
import {Hidden,Grid,Typography} from '@mui/material'
import { ArticleJsonLd } from 'next-seo';
import {useRouter} from 'next/router'
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'
import {Parser,Markdown} from 'portal/components/Parser'
import {marked} from 'marked'
import useTableContent,{HtmlLgDown,HtmlLgUp} from 'portal/components/TableContent'

const CombineAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.CombineAction),{ssr:false})
const CountUp=dynamic(()=>import('portal/components/CountUp'),{ssr:false})

const dayjs=require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export const getServerSideProps = wrapper(async({pn:data,token,req,res,params})=>{
    const slug=params.slug;
    const blog = await db.kata(`SELECT id,title,text,publish,slug,photo,tag,datetime,datetime_edit,format FROM klekle_pages WHERE type='pages' AND slug=? LIMIT 1`,[slug]);
    if(!blog) {
        return db.redirect();
    }
    const {id:idd,title,text,publish,tag,slug:slugg,photo,datetime,datetime_edit,format}=blog[0];
    if(publish==0 && !data?.user?.admin) {
        return db.redirect();
    }
    const textt = format==='html' ? text : marked.parse(text);
    const meta={
        title:title,
        description:Ktruncate(clean(textt),200),
        slug:slugg,
        id:idd,
        tag:(tag.length > 0  ? tag.split(",") : []),
        published:dayjs(datetime).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ"),
        modified: dayjs((datetime_edit==null ? datetime : datetime_edit)).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ")
    }
    if(photo!=null) meta.image=`${photo}&export=twibbon`;

    try {
        const a = await getLocal(token,`/v1/pages/${slug}`);
        meta.initial = a;
    } catch{
        meta.initial=null;
    }
    return {props:{meta:meta}}
})

const PagesDetail=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter()
    const {get}=useAPI()
    const {data,error,mutate}=useSWR(`/v1/pages/${meta.slug}`,{fallbackData:meta?.initial});
    const {content} = useTableContent({data})

    React.useEffect(()=>{
        mutate()
        const timeout=setTimeout(()=>{
            if(process.env.NODE_ENV === 'production') {
                get(`/v1/pages/${meta.slug}/update`,{error_notif:false}).catch(()=>{});
            }
            gtag.event({
                action:'select_content',
                content_type:'pages',
                item_id:meta.id
            })
        },5000)

        return ()=>{
            clearTimeout(timeout)
        }
    },[router.query,meta.slug])

    return (
        <Header title={meta.title} desc={meta.description} canonical={`/pages/${meta.slug}`} {...(meta?.image ? {image:meta.image} : {})}
        {...(meta?.tag?.length ? {keyword:meta?.tag?.join(",")} : {})}
        openGraph={{
            type:'article',
            article:{
                authors:[`${process.env.URL}/user/portalnesia`],
                publishedTime:meta?.published,
                modifiedTime:meta?.modified,
                tags:meta?.tag
            }
        }}
        >
            <ArticleJsonLd
                url={`${process.env.URL}/pages/${meta?.slug}`}
                title={meta?.title}
                {...(meta?.image ? {images:[meta?.image]} : {})}
                datePublished={meta?.published}
                dateModified={meta?.modified}
                authorName='Portalnesia'
                publisherName="Portalnesia"
                publisherLogo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
                description={adddesc(meta?.description)}
            />
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12} lg={content.length > 0 ? 8 : 10}>
                    <PaperBlock id='cardContent' title={meta.title} linkColor noPaddingHeader whiteBg
                    action={data ? (
                        <CombineAction
                            list={{
                                share:{campaign:'pages',posId:data?.id},
                                report:true,
                            }}
                        />
                    ) : null}
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
                                {data?.format === 'html' ? (
                                    <Parser html={data?.text} />
                                ) : (
                                    <Markdown source={data?.text} skipHtml={false}/>
                                )}
                            </div>
                        )}
                    </PaperBlock>
                </Grid>
                {content.length > 0 && (
                    <Hidden lgDown>
                        <Grid item xs={12} lg={4}>
                            <Sidebar id='cardContent' disabled={!error && !data}>
                                <PaperBlock title='Table of Contents' whiteBg>
                                    <HtmlLgDown data={data} />
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                    </Hidden>
                )}
            </Grid>
            
            {content.length > 0 && (
                <Hidden lgUp>
                    <HtmlLgUp data={data} />
                </Hidden>
            )}
        </Header>
    );
}

export default withStyles(PagesDetail,blogStyles)