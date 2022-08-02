import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import Sidebar from 'portal/components/Sidebar'
import PaperBlock from 'portal/components/PaperBlock'
import Comments from 'portal/components/Comments'
import Chip from 'portal/components/Chip'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {db,useAPI,getLocal} from 'portal/utils'
import {clean,ucwords,slugFormat as Kslug,truncate as Ktruncate,adddesc} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ErrorPage from 'portal/pages/_error'
import {withStyles,blogStyles,blogResponsive} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import useSWR from 'portal/utils/swr';
import {Hidden,Grid,Typography} from '@mui/material'
import { BlogJsonLd } from 'next-seo';
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'
import {Parser,Markdown} from 'portal/components/Parser'
import {marked} from 'marked'
import useTableContent,{HtmlLgDown,HtmlLgUp} from 'portal/components/TableContent'

const Card=dynamic(()=>import('@mui/material/Card'))
const Avatar = dynamic(()=>import('portal/components/Avatar'),{ssr:false})
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'))
const CardContent=dynamic(()=>import('@mui/material/CardContent'))
const Carousel=dynamic(()=>import('portal/components/Carousel'))
const CombineAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.CombineAction),{ssr:false})
const AdsRect=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsRect),{ssr:false})
const CountUp=dynamic(()=>import('portal/components/CountUp'),{ssr:false})
const Image=dynamic(()=>import('portal/components/Image'),{ssr:false})

const dayjs=require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export const getServerSideProps = wrapper(async({pn,token,req,res,params})=>{
    const slug=params?.slug;
    const blog = await db.kata(`SELECT b.id,b.title,b.userid,b.text,b.publish,b.block,b.slug,b.photo,b.tag,b.datetime,b.datetime_edit,b.format,u.user_nama,u.user_login FROM klekle_pages b LEFT JOIN klekle_users u ON u.id=b.userid WHERE type='blog' AND slug=? LIMIT 1`,[slug]);
    if(!blog) {
        db.redirect();
    }
    const {id:idd,userid,title,text,publish,block,slug:slugg,photo,user_login,user_nama,tag,datetime,datetime_edit,format}=blog[0];
    if(publish==0 && pn?.user?.id != userid || block==1 && pn?.user?.id != userid) {
        db.redirect();
    }
    if(block==1 && pn?.user?.id == userid) return {props:{meta:{err:'blocked'}}}
    const datee=dayjs(datetime).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
    const textt = format==='html' ? text : marked.parse(text);
    const meta={
        title:title,
        description:Ktruncate(clean(textt),200),
        slug:slugg,
        author:user_login,
        authorName:user_nama,
        tags:(tag.length > 0  ? tag.split(",") : []),
        published: datee,
        id:idd,
        modified: dayjs((datetime_edit==null ? datetime : datetime_edit)).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ")
    }
    try {
        const a = await getLocal(token,`/v1/blog/${slug}`);
        meta.initial = a;
    } catch(e) {
        
    }
    if(photo!=null) meta.image=`${photo}&export=twibbon`;
    return {props:{meta:meta}}
})

const BlogDetail=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter()
    const {ref,refid}=router.query
    const {get}=useAPI()
    const {data,error,mutate}=useSWR(`/v1/blog/${meta.slug}`,{...(meta?.initital ? {fallbackData:meta?.initital} : {})});
    const {data:dataOther,error:errorOther}=useSWR(`/v1/blog/recommendation/${meta?.id}`,{
        revalidateOnFocus:false,
    });

    const {content} = useTableContent({data})

    React.useEffect(()=>{
        mutate()
        const timeout=setTimeout(()=>{
            if(process.env.NODE_ENV === 'production') {
                get(`/v1/blog/${meta.slug}/update`,{error_notif:false})
                .catch(()=>{});
            }
            gtag.event({
                action:'select_content',
                content_type:'blog',
                item_id:meta.id
            })
        },5000)
        return ()=>{
            clearTimeout(timeout)
        }
    },[router.query,meta.slug])
    
    return (
        <Header iklan title={meta.title} desc={meta.description} active='blog' subactive='blog_detail' canonical={`/blog/${meta.slug}`} {...(meta?.image ? {image:meta.image} : {})}
        {...(meta?.tags?.length ? {keyword:meta?.tags?.join(",")} : {})}
        openGraph={{
            type:'article',
            article:{
                authors:[`${process.env.URL}/user/${meta?.author}`],
                publishedTime:meta?.published,
                modifiedTime:meta?.modified,
                tags:meta?.tags
            }
        }}
        >
            <BlogJsonLd
                url={`${process.env.URL}/blog/${meta?.slug}`}
                title={meta?.title}
                {...(meta?.image ? {images:[meta?.image]} : {})}
                datePublished={meta?.published}
                dateModified={meta?.modified}
                authorName={adddesc(meta?.authorName)}
                description={adddesc(meta?.description)}
            />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Breadcrumbs routes={[{label:"Blog",href:"/blog"}]} title={meta.title} />
                </Grid>
                <Grid id='cardContent' item xs={12} lg={8}>
                    <PaperBlock title={meta.title} linkColor noPaddingHeader whiteBg
                    footer={data ? (
                        <div>
                            <Typography gutterBottom variant="body1">Category: <Link href='/blog/category/[slug]' as={`/blog/category/${Kslug(data?.category)}`}><a className="underline">{ucwords(data?.category)}</a></Link></Typography>
                            <Grid container spacing={1}>
                                {data?.tags?.map((t,i)=>(
                                    <Grid key={`chip-${i}`} item xs="auto" zeroMinWidth>
                                        <Chip label={t} href='/blog/tags/[slug]' as={`/blog/tags/${Kslug(t)}`} outlined clickable />
                                    </Grid>
                                ))}
                            </Grid>
                        </div>
                    ) : null}
                    header={data ? (
                        <div>
                            <div key='flex-1' className={`flex-header ${classes.divider} pbottom`}>
                                <div key='flex-1-1'>
                                    <Typography variant="body2">{`Last modified ${data?.last_modified?.format}`}</Typography>
                                </div>
                                <div key='flex-1-2' style={{display:'flex',alignItems:'center'}}>
                                    <Typography variant="body2">{data?.seen?.number !== undefined && <CountUp data={data?.seen} />} views</Typography>
                                </div>
                            </div>
                            <div key='flex-2' className={`flex-header ${classes.divider}`}>
                                <div key='flex-2-1' style={{display:'flex',alignItems:'center'}}>
                                    <Avatar alt={data?.user?.name} sx={{mr:'10px !important'}}>
                                        {data?.user?.picture !== null ? <Image alt={data?.user?.name} src={`${data?.user?.picture}&watermark=no&size=40`} /> : data?.user?.name}
                                    </Avatar>
                                    <Typography variant="body2"><Link href='/user/[...slug]' as={`/user/${data?.user?.username}`} passHref><a>{data?.user?.name}</a></Link></Typography>
                                </div>
                                <div key='flex-2-2'>
                                    <CombineAction
                                        list={{
                                            share:{campaign:'blog',posId:data?.id},
                                            report:true,
                                            like:{
                                                liked:data?.liked,
                                                type:'blog',
                                                posId:data?.id,
                                                onChange:(vv)=>mutate({...data,liked:vv})
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}
                    >
                        {!error && !data ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Skeleton number={3} />
                            </div>
                        ) : data ? (
                            <div>
                                {data?.format === 'html' ? (
                                    <Parser html={data?.text} />
                                ) : (
                                    <Markdown source={data?.text} skipHtml={false} />
                                )}
                            </div>
                        ) : error ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">Failed load data</Typography>
                            </div>
                        ) : null}
                    </PaperBlock>
                    
                    {!errorOther && !dataOther ? (
                        <PaperBlock title='Others Post'>
                            <Skeleton type='carousel' number={4} image carouselProps={{responsive:blogResponsive}} />
                        </PaperBlock>
                    ) : dataOther && (dataOther?.length > 0) ? (
                        <Hidden lgDown>
                            <Carousel data={dataOther} title='Others Post' linkParams="/blog/[slug]" asParams="link"
                                responsive={blogResponsive}
                            />
                        </Hidden>
                    ) : errorOther ? (
                        <PaperBlock title='Others Post'>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">Failed load data</Typography>
                            </div>
                        </PaperBlock>
                    ) : (
                        <PaperBlock title='Others Post'>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">No post</Typography>
                            </div>
                        </PaperBlock>
                    )}
                    {data?.seen?.number !== undefined && <Comments type='blog' posId={data?.id} {...(ref==='comment' ? {comment_id:Number(refid)} : {})} />}
                </Grid>
                <Grid item xs={12} lg={4}>
                    <PaperBlock key={1} title='Advertisement'>
                        {!error && !data ? (
                            <Skeleton type='ads' />
                        ) : <AdsRect /> }
                    </PaperBlock>
                    <PaperBlock key={2} title='Others Post'>
                        {!errorOther && !dataOther ? (
                            <Skeleton type='grid' number={4} gridProps={{xs:12}} />
                        ) : dataOther && (dataOther?.length > 0) ? dataOther?.map((item,i)=>(
                            <Card key={`others-${i.toString()}`} style={{position:'relative',marginTop:10,marginBottom:10}} elevation={0} >
                                <Link href='/blog/[slug]' as={`/blog/${item?.slug}`} passHref><a title={item.title}><CardActionArea>
                                    <CardContent>
                                        <p className={classes.title}>{item.title}</p>
                                    </CardContent>
                                </CardActionArea></a></Link>
                            </Card>
                        )) : errorOther ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">Failed load data</Typography>
                            </div>
                        ) : (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">No post</Typography>
                            </div>
                        )}
                    </PaperBlock>
                    {content.length > 0 && (
                        <Hidden lgDown>
                            <Sidebar id='cardContent' disabled={!error && !data}>
                                <PaperBlock key='content' title='Table of Contents' whiteBg>
                                    <HtmlLgDown data={data} />
                                </PaperBlock>
                            </Sidebar>
                        </Hidden>
                    )}
                </Grid>
            </Grid>
            {content.length > 0 && (
                <Hidden lgUp>
                    <HtmlLgUp data={data} />
                </Hidden>
            )}
        </Header>
    );
}

export default withStyles(BlogDetail,blogStyles)