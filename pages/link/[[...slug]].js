import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import {AdsRect,AdsBanner2} from 'portal/components/Ads'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import {isEmptyObj} from '@portalnesia/utils'
import db from 'portal/utils/db'
import useAPI from 'portal/utils/api'
import {Grid,Typography,CircularProgress} from '@mui/material'

export const getServerSideProps = wrapper(async({res,params,query})=>{
    const slug=params.slug;
    const {u,s,m,c}=query;
    const qs=require('qs');
    const urlMetadata=require('url-metadata');
    if(slug?.[0]) {
        // Twitter, Chord, News
        if(['t','c','n','m','g'].indexOf(slug?.[0]) !== -1) {
            const utm={};
            if(s) utm.utm_source=s;
            if(m) utm.utm_medium=m;
            if(c) utm.utm_campaign=c;
            const utm_string=qs.stringify(utm);
            let urll;
            if(slug?.[0] === 'g') {
                return {
                    redirect: {
                        destination:`${process.env.APP_URL}/native${typeof slug?.[1] !== 'string' ? '' : `/${slug?.[1]}`}`,
                        permanent:false
                    }
                }
            }
            if(typeof slug?.[1] !== 'string') {
                urll=slug?.[0]==='t'?'twitter/thread':(slug?.[0]==='c'?'chord':(slug?.[0]==='n'? 'news' : 'url'));
                return {
                    redirect:{
                        destination:`${process.env.URL}/${urll}${isEmptyObj(utm) ? '' : `?${utm_string}`}`,
                        permanent:false
                    }
                }
            } else {
                const type=slug?.[0]==='t'?'twitter_thread':(slug?.[0]==='c'?'chord':(slug?.[0]==='m' ? 'toko' : 'news'));
                const getData= await db.kata(`SELECT * FROM klekle_${type} WHERE id=? LIMIT 1`,[slug?.[1]]);
                if(!getData) {
                    return {
                        notFound:true
                    }
                }

                if(slug?.[0]==='t') urll=`twitter/thread/${getData?.[0]?.tweet_id}`;
                else if(slug?.[0]==='c') urll=`chord/${getData?.[0]?.slug}`;
                else if(slug?.[0]==='n') urll=`news/${encodeURIComponent(getData?.[0]?.source).replace(/%20/g,"+")}/${encodeURIComponent(getData?.[0]?.title).replace(/%20/g,"+")}`;
                else if(slug?.[0]==='m') urll=`toko/${getData?.[0]?.slug}/menu`;
                else {
                    return {
                        notFound: true
                    }
                }
                return {
                    redirect:{
                        destination:`${process.env.URL}/${urll}${isEmptyObj(utm) ? '' : `?${utm_string}`}`,
                        permanent:false
                    }
                }
            }
        }
        // URL Shortener
        else {
            if(typeof slug?.[1]==='string') {
                if(res) res.statusCode=404;
                return {props:{err:404}}
            }
            const DB= await db.kata(`SELECT id,url,custom,meta_title,meta_description,click FROM klekle_url WHERE custom=? AND BINARY(custom) = BINARY(?) LIMIT 1`,[slug?.[0],slug?.[0]]);
            if(!DB) {
                return {
                    notFound:true
                }
            }
            const {id,url,custom,meta_title,meta_description,click}=DB[0];
            /*try {
                const click_1 = Number(click)+1;
                await db.update("url",{click:click_1},{id})
            } catch(err) {

            }*/
            const meta={
                title:meta_title,
                description:meta_description,
                url:url,
                custom:custom,
                id
            }
            return {props:{meta:meta}}
        }
    } else if(u) {
        // EXTERNAL LINK
        if(typeof slug !== 'undefined') {
            return {
                notFound:true
            }
        }
        try{
            const urll=decodeURIComponent(Buffer.from(u, 'base64').toString('ascii').replace(/\+/g," "));
            const metaData=await urlMetadata(urll);
            const meta={
                title:metaData?.title||"Redirect...",
                description:metaData?.description||"",
                url:urll,
                custom:null,
                id:null
            }
            return {props:{meta:meta}}
        } catch(er) {
            const urll=decodeURIComponent(Buffer.from(u, 'base64').toString('ascii').replace(/\+/g," "));
            const meta={
                title:"Redirect...",
                description:"",
                url:urll,
                custom:null,
                id:null
            }
            return {props:{meta:meta}}
        }
    } else {
        return {
            redirect:{
                destination:`${process.env.URL}/url`,
                permanent:false
            }
        }
    }
})

const LinkRedirect=({meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug}=router.query;
    const [imageloaded,setImageloaded]=React.useState(false)
    const {get} = useAPI();

    const handleGO=(iklan)=>()=>{
        window.open(meta?.url);
        if(meta?.id) {
            get(`/v1/url-shortener/${meta?.id}/update`)
            .catch(()=>{});
        }
        if(iklan) window.location.href='https://civadsoo.net/afu.php?zoneid=3824553'
    }

    React.useEffect(()=>{
        const $=require('jquery')
        require('@fancyapps/fancybox');
        require('portal/utils/lazysizes');
        window.jQuery=$
        $('[data-fancybox]').fancybox({
    		protect: true,
    		hash: false,
    		mobile:{
                clickSlide: function(current, event) {
                    return "close";
                }
    		},
        });

        const onLazyLoaded=()=>{
            setImageloaded(true)
        }
        
        $(document).on("lazyloaded",onLazyLoaded)
        return ()=>$(document).off("lazyloaded",onLazyLoaded);
    },[])

    React.useEffect(()=>{
        return ()=>setImageloaded(false)
    },[meta?.url])

    return(
        <Header iklan title={meta?.title} desc={`${meta.description} - Portalnesia`} canonical={`/link/${slug?.[0] ? `${slug[0]}/${slug?.[1]||''}` :''}`}>
            <Grid container spacing={2} justifyContent='center'>
                {meta?.custom===null ? (
                    <Grid item xs={12} md={10} lg={8}>
                        <PaperBlock title={meta?.title} whiteBg
                        footer={
                            <div>
                                <AdsBanner2 />
                                <ul>
                                    <li><Typography variant='body1'><span style={{color:'#ff0202'}}>*</span>You are about to be redirected to another page. We are not responsible for the content of that page or the consequences it may have on you.</Typography></li>
                                </ul>
                            </div>
                        }
                        {...(meta?.description?.length ? {desc:meta.description} : {})}>
                            <AdsRect />
                            <div className='flex-header'>
                                <Button style={{marginRight:15}} onClick={handleGO(true)}>
                                    Redirect Me
                                </Button>
                                <Link href='/' passHref><a>
                                    <Button outlined>
                                        Homepage
                                    </Button>
                                </a></Link>
                            </div>
                        </PaperBlock>
                    </Grid>
                ) : (
                    <>
                        <Grid item xs={12} lg={4}>
                            <PaperBlock title='Website Thumbnails'>
                                <a href={`#`} data-src={`${process.env.API_URL}/v1/url-shortener/screenshot/${slug?.[0]}`} data-fancybox="images" data-options='{"protect" : "true"}'>
                                    <center><img style={{width:'100%'}} onContextMenu={(e)=>e.preventDefault()} className="no-drag lazyload" id="thumbImg" data-src={`${process.env.API_URL}/v1/url-shortener/screenshot/${slug?.[0]}`} /></center>
                                </a>
                                {!imageloaded && (
                                    <div style={{textAlign:'center'}}>
                                        <CircularProgress thickness={5} size={50}/>
                                    </div>
                                )}
                            </PaperBlock>
                        </Grid>
                        <Grid item xs={12} lg={8}>
                            <PaperBlock title={meta?.title} whiteBg
                            footer={
                                <div>
                                    <AdsBanner2 />
                                    <ul>
                                        <li><Typography variant='body1'><span style={{color:'#ff0202'}}>*</span>You are about to be redirected to another page. We are not responsible for the content of that page or the consequences it may have on you.</Typography></li>
                                        <li><Typography variant='body1'><span style={{color:'#ff0202'}}>*</span>See website thumbnails to make sure that the website you are going to is right.</Typography></li>
                                    </ul>
                                </div>
                            }
                            {...(meta?.description?.length > 0 ? {desc:meta.description} : {})}
                            >
                                <AdsRect />
                                <div className='flex-header'>
                                    <Button style={{marginRight:15}} onClick={handleGO(false)}>
                                        Redirect Me
                                    </Button>
                                    <Link href='/' passHref><a>
                                        <Button outlined>
                                            Homepage
                                        </Button>
                                    </a></Link>
                                </div>
                            </PaperBlock>
                        </Grid>
                    </>
                )}
            </Grid>
        </Header>
    )
}

export default LinkRedirect