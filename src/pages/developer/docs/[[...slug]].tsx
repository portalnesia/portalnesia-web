import { CombineAction } from '@comp/Action';
import Button from '@comp/Button';
import Pages from '@comp/Pages';
import Link from '@design/components/Link';
import PaperBlock from '@design/components/PaperBlock';
import { Parser, usePageContent } from '@design/components/Parser';
import Sidebar from '@design/components/Sidebar';
import useTableContent, { HtmlMdUp } from '@design/components/TableContent';
import { useDeveloperMenu } from '@hooks/developer';
import DeveloperLayout from '@layout/developer';
import { ArrowBack, ArrowForward, Edit } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { clean, truncate } from '@portalnesia/utils';
import wrapper from '@redux/store';
import { IPages } from '@type/general';
import { getDayJs, portalUrl } from '@utils/main';
import splitMarkdown from '@utils/split-markdown';
import axios from 'axios';
import { marked } from 'marked';
import { ArticleJsonLd } from 'next-seo';
import React from 'react';

type MetaMarkdown = {
    title: string
    id: string
    keywords?: string[]
    modified?: string
    description?: string
    image?: string
}

type IData = MetaMarkdown & {
    html: string;
    slug: string;
    keywords: string[];
    github_slug: string;
    published: string
    modified: string
}

export const getServerSideProps = wrapper<IData>(async({redirect,params,session})=>{
    const slug = params?.slug
    if(!Array.isArray(slug)) return redirect();
    if(!session || !session.user.isAdmin('developer')) return redirect();

    const slugg = slug.join("-");
    const github = `https://raw.githubusercontent.com/portalnesia/portalnesia-web/main/docs/api/v2/${slugg}.md`
    try {
        const r = await axios.get(github);
        if(!r?.data) return redirect();

        const split = splitMarkdown<MetaMarkdown>(r.data);
        const meta = split.meta;
        if(!meta) return redirect();

        const html = marked(split.html);
        if(typeof meta?.description === 'string') {
            meta.description = truncate(clean(meta.description),200)
        }
        const defaultKeywords = ['API','Rest API','Developer','Docs','Documentation'];

        const data: IData = {
            ...meta,
            title: `${meta.title} - Developer`,
            html,
            slug: slug.join("/"),
            keywords: defaultKeywords.concat((meta.keywords||[])),
            github_slug: slugg,
            published:getDayJs('2021-03-05 19:00:00').toISOString(),
            modified: getDayJs((meta?.modified || '2022-01-01 19:00:00')).toISOString()
        }

        return {
            props:{
                data,
                meta:{
                    title:data.title,
                    desc: data?.description
                }
            }
        }
    } catch(e) {
        return redirect();
    }
})

export default function DeveloperDocs({data,meta}: IPages<IData>) {
    usePageContent(data);
    const {content} = useTableContent({data})
    const menu = useDeveloperMenu();

    const [prev,next]=React.useMemo(()=>{
        if(menu && menu?.length > 0) {
            const docsMenu = menu?.find(i=>i?.key==='docs');
            if(docsMenu) {
                const child = docsMenu?.child;
                const current = child?.findIndex(i=>i?.key === data.id);
                if(child && typeof current !== 'undefined' && current > -1) {
                    // AWAL
                    if(current === 0) {
                        const next = child[current + 1];
                        return [null,next];
                    }
                    // AKHIR
                    else if(current === child?.length - 1) {
                        const prev = child[current - 1];
                        return [prev,null];
                    }
                    else {
                        const prev = child[current - 1];
                        const next = child[current + 1];
                        return [prev,next];
                    }
                }
            }
        }
        return [null,null];
    },[data.id,menu]);

    return (
        <Pages title={meta?.title} desc={meta?.desc} noIndex image={meta?.image} canonical={`/developer/docs/${data?.slug}`} keyword={data?.keywords?.join(", ")}>
            <ArticleJsonLd
                url={portalUrl(`/developer/docs/${data?.slug}`)}
                title={meta?.title || ""}
                datePublished={data?.published || ""}
                dateModified={data?.modified}
                authorName={[{
                    name:"Portalnesia",
                    url: portalUrl(`/user/portalnesia`)
                }]}
                description={meta?.desc || ""}
                images={meta?.image ? [meta?.image] : [""]}
            />

            <DeveloperLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={0.5}>
                    <Stack direction='row' justifyContent='space-between' spacing={1}>
                        <Typography variant='h3' component='h1'>{data?.title}</Typography>
                        <CombineAction list={{
                            share:{campaign:'developer'}
                        }} />
                    </Stack>
                </Box>
                <Box mb={5}>
                    <Typography>{`Last modified: ${getDayJs(data.modified).time_ago().format}`}</Typography>
                </Box>

                <Grid container spacing={2} justifyContent='center'>
                    <Grid item xs={12} md={content.length > 0 ? 8 : 10}>
                        <Box id="page-content">
                            <Parser html={data.html} />

                            <Box mt={10}>
                                <Button outlined color='inherit' className='no-blank' target='_blank' rel='nofollow noopener noreferrer' component='a' href={`https://github.com/portalnesia/portalnesia-web/edit/main/docs/api/v2/${data?.github_slug}.md`} endIcon={<Edit />}>Edit this page</Button>
                            </Box>
                            <Box mt={2}>
                                <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
                                    {prev !== null && (
                                        <Grid item xs={12} sm={6}>
                                            <Link href={prev?.link} passHref legacyBehavior><Button className='no-blank no-underline' component='a' startIcon={<ArrowBack />} variant='outlined' size='large' sx={{textAlign:'unset'}}>
                                            <div>
                                                <Typography color='text.secondary' sx={{fontSize:13}}>Previous</Typography>
                                                <Typography>{prev?.name}</Typography>
                                            </div>
                                            </Button></Link>
                                        </Grid>
                                    )}
                                    {next !== null && (
                                        <Grid item xs={12} sm={!prev ? 12 : 6} sx={{textAlign:'right'}}>
                                            <Link href={next?.link} passHref legacyBehavior><Button className='no-blank no-underline' component='a' endIcon={<ArrowForward />} variant='outlined' size='large' sx={{textAlign:'unset'}}>
                                            <div>
                                                <Typography color='text.secondary' sx={{fontSize:13}}>Next</Typography>
                                                <Typography>{next?.name}</Typography>
                                            </div>
                                            </Button></Link>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>
                    {content.length > 0 && (
                        <Hidden mdDown>
                            <Grid item xs={12} md={4}>
                                <Sidebar id='page-content'>
                                    <PaperBlock title="Table of Content">
                                        <HtmlMdUp data={data} />
                                    </PaperBlock>
                                </Sidebar>
                            </Grid>
                        </Hidden>
                    )}
                </Grid>
            </DeveloperLayout>
        </Pages>
    )
}