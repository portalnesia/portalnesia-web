import React from 'react'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/developer/Header'
import Sidebar from 'portal/components/Sidebar'
import Button from 'portal/components/Button'
import PaperBlock from 'portal/components/PaperBlock'
import {Parser} from 'portal/components/Parser'
import {CombineAction} from 'portal/components/Action'
import {withStyles,blogStyles} from 'portal/components/styles';
import {getDayJs} from 'portal/utils/Main'
import {clean,truncate as Ktruncate,ucwords} from '@portalnesia/utils'
import { ArticleJsonLd } from 'next-seo';
import {useRouter} from 'next/router'
import {Hidden,Grid,Typography} from '@mui/material'
import {marked} from 'marked'
import splitMarkdown from 'portal/utils/split-markdown'
import htmlEncode from 'portal/utils/html-encode'
import axios from 'axios'
import {Edit as EditIcon,ArrowBack,ArrowForward} from '@mui/icons-material'
import Link from 'next/link'
import useTableContent,{HtmlLgDown,HtmlLgUp} from 'portal/components/TableContent'

export const getServerSideProps = wrapper(async({pn:data,redirect,params})=>{
    const slug = params.slug
    if(!slug) {
        return redirect(`${process.env.URL}/developer/docs/getting-started`);
    }
    if(data.user === null || !data?.user?.admin) {
        return redirect();
    }

    const slugg = slug.join("-");
    const github = `https://raw.githubusercontent.com/portalnesia/portalnesia/main/docs/api/v1/${slugg}.md`

    try {
        const r = await axios.get(github);
        if(!r?.data) return redirect();
        
        const split = splitMarkdown(r.data);
        const meta = split.meta||{};
        const markHtml = marked(split.html);
        const html = htmlEncode(markHtml,true);
        if(meta?.description) {
            meta.description = Ktruncate(clean(meta.description),200)
        }
        meta.published = getDayJs('2021-03-05 19:00:00').utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");
        meta.modified = getDayJs((meta?.modified || '2022-01-01 19:00:00')).utcOffset(7).format("YYYY-MM-DDTHH:mm:ssZ");

        meta.html = html;
        meta.slug = slug.join("/");
        meta.subactive = meta?.id
        const defaultKeywords = ['API','Rest API','Developer','Docs','Documentation'];
        meta.keywords = defaultKeywords.concat((meta?.keywords||[]));
        meta.github_slug = slugg

        return {props:{meta}}
    } catch(e) {
        return redirect();
    }
})

export function DevGuides({meta,err,classes}){
    if(err) return <ErrorPage statusCode={err} />
    
    const {content} = useTableContent({data:meta})

    const [menu,setMenu] = React.useState([]);

    const getMenu=React.useCallback((data)=>{
        setMenu(data||[]);
    },[])

    const [prev,next]=React.useMemo(()=>{
        const {subactive} = meta;
        if(menu && menu?.length > 0) {
            const active = menu?.findIndex(i=>i?.key==='docs');
            if(active > -1) {
                const child = menu[active]?.child;
                const current = child.findIndex(i=>i?.key === subactive);
                if(current > -1) {
                    // AWAL
                    if(current === 0) {
                        const next = child[current + 1];
                        //console.log("NEXT",next);
                        return [null,next];
                    }
                    // AKHIR
                    else if(current === child?.length - 1) {
                        const prev = child[current - 1];
                        //console.log("PREV",prev);
                        return [prev,null];
                    }
                    else {
                        const prev = child[current - 1];
                        const next = child[current + 1];
                        //console.log("PREV",prev)
                        //console.log("NEXT",next);
                        return [prev,next];
                    }
                }
            }
        }
        return [null,null];
    },[meta?.subactive,menu]);

    return (
        <Header getMenu={getMenu} title={meta?.title} desc={meta?.description} active="docs" subactive={meta.subactive} canonical={`/developer/${meta.slug}`} {...(meta?.image ? {image:meta.image} : {})}
        keyword={meta.keywords.join(",")}
        openGraph={{
            type:'article',
            article:{
                authors:[`${process.env.URL}/user/portalnesia`],
                publishedTime:meta?.published,
                modifiedTime:meta?.modified,
                tags:meta.keywords
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
                    action={<CombineAction
                        list={{
                            share:{campaign:'developer'},
                            report:true,
                        }}
                    />}
                    footer={
                        <>
                            <Button text size='medium' style={{textTransform:'unset'}} className='no-format not_blank' target='_blank' rel='nofollow noopener noreferrer' component='a' href={`https://github.com/portalnesia/portalnesia/edit/main/docs/api/v1/${meta?.github_slug}.md`} endIcon={<EditIcon />}>Edit this page</Button>
                            <div style={{marginTop:15}}>
                                <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
                                    {prev !== null && (
                                        <Grid item xs={12} sm={6}>
                                            <Link href={prev?.href} as={prev?.as} passHref><Button className='no-format not_blank' component='a' startIcon={<ArrowBack />} variant='outlined' size='large' sx={{color:'text.primary',textAlign:'unset',textTransform:'unset'}}>
                                            <div>
                                                <Typography color='text.secondary' sx={{fontSize:13}}>Previous</Typography>
                                                <Typography>{prev?.name}</Typography>
                                            </div>
                                            </Button></Link>
                                        </Grid>
                                    )}
                                    {next !== null && (
                                        <Grid item xs={12} sm={!prev ? 12 : 6} sx={{textAlign:'right'}}>
                                            <Link href={next?.href} as={next?.as} passHref><Button className='no-format not_blank' component='a' endIcon={<ArrowForward />} variant='outlined' size='large' sx={{color:'text.primary',textAlign:'unset',textTransform:'unset'}}>
                                            <div>
                                                <Typography color='text.secondary' sx={{fontSize:13}}>Next</Typography>
                                                <Typography>{next?.name}</Typography>
                                            </div>
                                            </Button></Link>
                                        </Grid>
                                    )}
                                </Grid>
                            </div>
                        </>
                    }
                    >
                        <div>
                            <Parser html={meta?.html} />
                        </div>
                    </PaperBlock>
                </Grid>
                {content.length > 0 && (
                    <Hidden lgDown>
                        <Grid item xs={12} lg={4}>
                            <Sidebar id='cardContent'>
                                <PaperBlock title='Table of Contents' whiteBg>
                                    <HtmlLgDown data={meta} />
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                    </Hidden>
                )}
            </Grid>
            {content.length > 0 && (
                <Hidden lgUp>
                    <HtmlLgUp data={meta} />
                </Hidden>
            )}
        </Header>
    )
}

export default withStyles(DevGuides,blogStyles)