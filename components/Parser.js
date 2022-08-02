import React from 'react'
import Parserr,{domToReact} from 'html-react-parser'
import {styled} from '@mui/material/styles'
import Image from 'portal/components/Image'
import clx from 'classnames'
import Link from 'next/link'
import {AdsRect,AdsBanner1,AdsBanner2,AdsBanner3} from 'portal/components/Ads'
import {slugFormat} from '@portalnesia/utils'
import {Table,TableHead,TableBody,TableRow,TableCell,Typography} from '@mui/material'
import {useHotKeys} from 'portal/utils/useKeys'
import {useDispatch} from 'react-redux'
import DOMpurify from 'dompurify'
import styleClass from 'portal/styles/Home.module.css'
import hljs from 'highlight.js'
import {marked} from 'marked'
import Script from 'next/script'

const ckImageStyleSpacing='1.5em';
const ckTodoListCheckmarkSize=16;

const Div = styled('div')(({theme})=>({
    '& code:not(.hljs), & blockquote, & code.code:not(.hljs)':{
        background:theme.palette.action.hover,
        borderRadius:'.5rem'
    },
    '& pre code':{
        borderRadius:'.5rem',
        '@media (hover: hover) and (pointer: fine)':{
            '&::-webkit-scrollbar':{
                height:8,
                borderRadius:4
            },
            '&::-webkit-scrollbar-thumb':{
                //background:theme.palette.mode=='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                background:'rgba(255,255,255,.2)',
                borderRadius:4,
                '&:hover':{
                    background:'rgba(255,255,255,.4)'
                }
            },
        }
    },
    '& table':{
        '& td':{
            color:theme.palette.text.primary,
            borderTop:`1px solid ${theme.palette.divider}`,
        },
        '& th':{
            borderTop:`1px solid ${theme.palette.divider}`,
            borderBottom:`2px solid ${theme.palette.divider}`
        }
    },
    '& h1:not(.no-underline), & h2:not(.no-underline), & h3:not(.no-underline), & h4:not(.no-underline), .underline':{
        paddingBottom:'.3em',
        borderBottom:`1px solid ${theme.palette.divider}`
    },
    '& a[href]:not(.no-format):hover':{
        textDecoration:'underline'
    },
    '& .image-style-side': {
        float: 'right',
        marginLeft: `${ckImageStyleSpacing} !important`,
        maxWidth: '50% !important'
    },
    '& p + .image-style-side': {
        marginTop: 0
    },
    '& .image > figcaption': {
        display: 'table-caption',
        captionSide: 'bottom',
        wordBreak: 'break-word',
        color: theme.palette.text.secondary,
        padding: '.6em',
        fontSize: 14,
        outlineOffset: '-1px'
    },
    '& .image':{
        display: 'table',
        clear: 'both',
        textAlign: 'center',
        margin: '0.9em auto',
        minWidth: '50px'
    },
    '& .image img':{
        display: 'block',
        margin: '0 auto',
        maxWidth: '100%',
        minWidth: '100%',
    },
    '& .image.image_resized': {
        maxWidth: '100%',
        display: 'block',
        boxSizing: 'border-box'
    },
    '& .image.image_resized img': {
        width: '100%'
    },
    '& .image.image_resized > figcaption': {
        display: 'block'
    },
    '& .page-break': {
        '@media print':{
            padding: 0
        },
        position: 'relative',
        clear: 'both',
        padding: '5px 0',
        display: 'flex',
        aligniitems: 'center',
        justifyContent: 'center',
    },
    '& .page-break::after': {
        '@media print':{
            display: 'none'
        },
        content: '""',
        position: 'absolute',
        borderBottom: `2px dashed ${theme.palette.divider}`,
        width: '100%'
    },
    '& .page-break__label': {
        position: 'relative',
        zIndex: 1,
        padding: '.3em .6em',
        display: 'block',
        textTransform: 'uppercase',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        fontSize: '0.75em',
        fontWeight: 'bold',
        color: theme.palette.text.secondary,
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        MsUserSelect: 'none',
        userSelect: 'none'
    },
    '& .media': {
        clear: 'both',
        margin: '0.9em 0',
        display: 'block',
        minWidth: '15em',
    },
    '& .todo-list':{
        listStyle:'none',
        '& li':{
            marginBottom: 5,
            '& input':{
                WebkitAppearance:'none',
                display:'inline-block',
                position:'relative',
                width:ckTodoListCheckmarkSize,
                height:ckTodoListCheckmarkSize,
                verticalAlign:'middle',
                border:0,
                left:'-25px',
                marginRight:'-15px',
                right:0,
                marginLeft:0
            },
            '& input:before':{
                display:'block',
                position:'absolute',
                boxSizing:'border-box',
                content: '""',
                width:'100%',
                height:'100%',
                border:`1px solid ${theme.palette.text.primary}`,
                borderRadius:2
            },
            '& input:after':{
                display:'block',
                position:'absolute',
                boxSizing:'content-box',
                pointerEvents:'none',
                content: '""',
                left: ckTodoListCheckmarkSize/3,
                top:ckTodoListCheckmarkSize/5.3,
                width:ckTodoListCheckmarkSize/5.3,
                height:ckTodoListCheckmarkSize/2.6,
                border:`1px solid ${theme.palette.text.primary}`,
                borderLeft: '0 solid transparent',
                borderBottom: `${ckTodoListCheckmarkSize/8}px solid transparent`,
                borderRight: `${ckTodoListCheckmarkSize/8}px solid transparent`,
                borderTop: '0 solid transparent',
                transform:'rotate(45deg)'
            },
            '& input[checked]:before':{
                background:theme.palette.primary.main,
                borderColor:theme.palette.primary.main
            },
            '& input[checked]:after':{
                borderColor:theme.palette.background.paper
            }
        }
    },
    '& .mention': {
        background: theme.palette.action.hover,
        color: theme.palette.mode==='dark' ? '#ff97c6' : '#e83e8c',
    }
}))

const Img = styled(Image)(({theme})=>({
    [theme.breakpoints.up('md')]: {
        maxWidth:400
    },
    [theme.breakpoints.down('md')]: {
        maxWidth:'80%'
    },
    height:'auto'
}))

const Parserrr=({html,className,style,noMargin,preview,fromMarkdown})=>{
    const parseOption={
        replace:(node)=>{
            // ADS
            if(node?.type==='tag'&&node?.name==='div'){
                if(node?.attribs?.['data-portalnesia-action']) {
                    if(node?.attribs?.['data-portalnesia-action']=='ads') {
                        const type=node?.attribs?.['data-ads'];
                        if(type=='300') return <AdsRect />
                        else if(type=='468') return <AdsBanner1 />
                        else if(type=='728') return <AdsBanner2 />
                        else if(type=='button') return <AdsBanner3 />
                    } else if(node?.attribs?.['data-portalnesia-action']=='feedback') {
                        const {setFeedback}=useHotKeys()
                        return <a href="#" onClick={(e)=>{e.preventDefault,setFeedback(true)}}>{domToReact(node?.children,parseOption)}</a>
                    } else if(node?.attribs?.['data-portalnesia-action']=='report') {
                        const dispatch=useDispatch()
                        const onClick=(e)=>{
                            e.preventDefault()
                            dispatch({type:'REPORT',payload:{type:node?.attribs?.['data-type'],urlreported:window.location.href,endpoint:(node?.attribs?.['data-endpoint']||null)}})
                        }
                        return <a href="#" onClick={onClick}>{domToReact(node?.children,parseOption)}</a>
                    }
                }
                if(/table\-responsive/.test(node?.attribs?.class||"")) {
                    return domToReact(node?.children,parseOption);
                }
            }
            // A LINK
            if(node?.type==='tag'&&node?.name==='a'){
                if(node?.attribs?.['data-fancybox']){
                    return domToReact(node?.children,parseOption)
                } else if(node?.attribs?.href) {
                    const parent=node?.parent;
                    const isSocMed = parent?.name === 'blockquote' && ['instagram-media','twitter-tweet','tiktok-embed'].includes(parent?.attribs?.class||'');
                    if(!isSocMed) {
                        const {href,target,rel,...other}=node?.attribs
                        if(href?.match(/^\#/)) {
                            const idd = href.substring(1);
                            return (
                                <a href={href} onClick={handlePageContent(idd)}>{domToReact(node?.children,parseOption)}</a>
                            )
                        }
                        if(
                            /^https?\:\/\//.test(href)
                            && !/portalnesia\.com/.test(href)
                            && !/kakek\.c1\.biz/.test(href)
                        ) {
                            const hreff = /utm\_source\=portalnesia/i.test(href) ? href : `/link?u=${Buffer.from(encodeURIComponent(href)).toString('base64')}`
                            return (
                                <a target="_blank" rel='nofollow noreferrer noopener' href={hreff} {...other}>
                                    {domToReact(node?.children,parseOption)}
                                </a>
                            )
                        } else if(
                            (typeof target === 'undefined' || target=='_self')
                            && (/^https:\/\/portalnesia\.com+/.test(href) || /^\//.test(href))
                        ) {
                            const hreff=href?.replace(/^https:\/\/portalnesia\.com\/?/,"/");
                            return <Link href={hreff} passHref><a {...other}>{domToReact(node?.children,parseOption)}</a></Link>
                        }
                    }
                }
            }
            // PICTURE
            if(node?.type==='tag'&&node?.name==='picture'){
                const parent=node?.parent;
                const oriSrc = parent?.attribs?.['data-src']||parent?.attribs?.href;
                const caption = parent?.attribs?.['data-caption'];
                const child = node?.children?.[node?.children?.length -1];
                if(child?.name === 'img') {
                    const {src,style,class:classs,...other}=child?.attribs;
                    const srrrc=child?.attribs?.['data-src']||src;
                    const ssrc=oriSrc||srrrc;
                    const isUnsplash = /unsplash\.com/.test(srrrc);
                    const srrc=!(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=300&compress` : isUnsplash ? srrrc : `${srrrc}&compress`;
                    const withPng = Boolean(child?.attribs?.['data-png']=='true');
                    let styles=null;
                    if(typeof style==='string') {
                        const result={},attributes=style.split(';')
                        for(let i=0;i<attributes?.length;i++){
                            const entry=attributes?.[i]?.split(':')
                            result[entry?.splice(0,1)?.[0]] = entry.join(':')
                        }
                        styles=result;
                    } else if(typeof style==='object') styles = style
                    //return null
                    return <Img caption={caption} lazy={!preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx(styleClass['image-container'],classs)} {...other} {...(typeof styles==='object' ? {style:styles} : {})} />
                }
            }
            // IMG
            if(node?.type==='tag' && node?.name==='img' && (node?.attribs?.src||node?.attribs?.['data-src'])){
                const {src,style,class:classs,...other}=node?.attribs
                const parent=node?.parent;
                const srrrc=node?.attribs?.['data-src']||src;
                const isUnsplash = /unsplash\.com/.test(srrrc);
                const srrc=!(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=300&compress` : isUnsplash ? srrrc : `${srrrc}&compress`;
                const withPng = Boolean(node?.attribs?.['data-png']=='true');
                const caption = parent?.attribs?.['data-caption'];
                const oriSrc = parent?.attribs?.['data-src'];
                const ssrc=oriSrc||srrrc;
                let styles=null;
                if(typeof style==='string') {
                    const result={},attributes=style.split(';')
                    for(let i=0;i<attributes?.length;i++){
                        const entry=attributes?.[i]?.split(':')
                        result[entry?.splice(0,1)?.[0]] = entry.join(':')
                    }
                    styles=result;
                } else if(typeof style==='object') styles = style
                return <Img caption={caption} lazy={!preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx(styleClass['image-container'],classs)} {...other} {...(typeof styles==='object' ? {style:styles} : {})} />
                
                /*if(
                    !src?.match(/portalnesia\.com\/+/)
                    && !src?.match(/^\/+/)
                ) {
                    return <Image webp fancybox src={`${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(src)}&size=300`} dataSrc={src} {...other} />
                }*/
            }
            // TABLE
            if(node?.type==='tag'&&node?.name==='table'){
                return(
                    <div className='table-responsive'>
                        <Table>
                            {domToReact(node?.children,parseOption)}
                        </Table>
                    </div>
                )
            }
            // THEAD
            if(node?.type==='tag'&&node?.name==='thead'){
                return(
                    <TableHead>
                        {domToReact(node?.children,parseOption)}
                    </TableHead>
                )
            }
            // TBODY
            if(node?.type==='tag'&&node?.name==='tbody'){
                return(
                    <TableBody>
                        {domToReact(node?.children,parseOption)}
                    </TableBody>
                )
            }
            // TR
            if(node?.type==='tag'&&node?.name==='tr'){
                return(
                    <TableRow>
                        {domToReact(node?.children,parseOption)}
                    </TableRow>
                )
            }
            // TH || TD
            if(node?.type==='tag'&&(node?.name==='th'||node?.name==='td')){
                return(
                    <TableCell>
                        {domToReact(node?.children,parseOption)}
                    </TableCell>
                )
            }
            if(node?.type==='tag'&&(node?.name==='html'||node?.name==='body')) {
                return <div>{domToReact(node?.children,parseOption)}</div>
            }
            /*if(node?.type==='tag'&&node?.name==='pre'&&preview&&!fromMarkdown) {
                const child = node?.children?.[0];
                if(child?.type === 'tag' && child?.name === 'code' && child?.children?.[0]?.type==='text') {
                    const {class:classs} = child?.attribs
                    const lang = classs?.match(/language\-(\S+)/)?.[1];
                    try {
                        const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext'
                        const html = hljs.highlight((child?.children?.[0]?.data||""),{language:validLanguage}).value;
                        return <pre><code className={classs} dangerouslySetInnerHTML={{__html:html}} /></pre>
                    } catch {}
                }
            }*/
            if(node?.type==='tag'&&node?.name==='p') {
                return <Typography variant='body1' component='p' gutterBottom>{domToReact(node?.children,parseOption)}</Typography>
            }
            if(node?.type==='tag'&&node?.name==='script') {
                const src = node?.attribs?.src;
                if(src) {
                    return <Script src={src} strategy='lazyOnload' />
                }
            }
            if(node?.type==='tag' && ['h1','h2','h3','h4'].includes(node?.name)) {
                let {id,style,...other}=node?.attribs;

                if(!id) {
                    let text="";
                    node?.children?.forEach(c=>{
                        if(c?.type === 'text') text+=` ${c?.data}`;
                        else {
                            c?.children?.forEach(cc=>{
                                if(cc?.type === 'text') text+=` ${cc?.data}`;
                            })
                        }
                    })
                    if(text?.length > 0) id = slugFormat(text);
                } 
                
                let styles=undefined;
                if(typeof style==='string') {
                    const result={},attributes=style.split(';')
                    for(let i=0;i<attributes?.length;i++){
                        const entry=attributes?.[i]?.split(':')
                        result[entry?.splice(0,1)?.[0]] = entry.join(':')
                    }
                    styles=result;
                } else if(typeof style==='object') styles = style
                if(id && node?.parent?.name != 'td') {
                    if(node?.name === 'h1') {
                        return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><h2 style={styles} id={id} {...other}>{domToReact(node?.children,parseOption)}</h2></a>
                    }
                    else if(node?.name === 'h2') {
                        return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><h3 style={styles} id={id} {...other}>{domToReact(node?.children,parseOption)}</h3></a>
                    }
                    else if(node?.name === 'h3'||node?.name === 'h4'||node?.name === 'h5'||node?.name === 'h6') {
                        return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><h4 style={styles} id={id} {...other}>{domToReact(node?.children,parseOption)}</h4></a>
                    }
                } else {
                    if(node?.name === 'h1') {
                        return <h2 {...other} id={id} {...(node?.parent?.name == 'td' ? {style:{...styles,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles})}>{domToReact(node?.children,parseOption)}</h2>
                    }
                    else if(node?.name === 'h2') {
                        return <h3 {...other} id={id} {...(node?.parent?.name == 'td' ? {style:{...styles,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles})}>{domToReact(node?.children,parseOption)}</h3>
                    }
                    else if(node?.name === 'h3'||node?.name === 'h4'||node?.name === 'h5'||node?.name === 'h6') {
                        return <h4 {...other} id={id} {...(node?.parent?.name == 'td' ? {style:{...styles,paddingBottom:'unset',borderBottom:'unset'}} : {style:styles})}>{domToReact(node?.children,parseOption)}</h4>
                    }
                }
            }
        }
    }

    const handlePageContent=(id)=>e=>{
        if(e && e.preventDefault) e.preventDefault()
        const conta=document.getElementById(id);
        if(conta){
            const a=conta.offsetTop,b=a-10;
            window.scrollTo({top:b,left:0,behavior:'smooth'});
        }
    }
    const divRef=React.useRef()

    React.useEffect(()=>{
        if(divRef.current) {
            //,code.code:not(.not-hljs)
            divRef.current.querySelectorAll('pre code:not(.not-hljs),code.code:not(.not-hljs)').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    },[html])

    return(
        <Div ref={divRef} className={className} {...(style ? {style:style} : {})}>
            {Parserr(html,parseOption)}
        </Div>
    )
}
Parserrr.defaultProps={
    preview:false
}

export const Parser=Parserrr;

const Markdow=({source,style,className,skipHtml,preview})=>{
    const html = React.useMemo(()=>{
        if(preview) {
            marked.setOptions({
                highlight: function(code,language){
                    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
                    return hljs.highlight(code,{language:validLanguage}).value
                },
                break:true
            })
        } else {
            marked.setOptions({
                breaks:true
            })
        }
        const hhtm = marked.parse(source)
        const forb = skipHtml ? ['img','iframe','video'] : ['video'];
        return DOMpurify.sanitize(hhtm, {FORBID_TAGS: forb,USE_PROFILES: {html: true}})
    },[source,skipHtml,preview])

    return <Parser preview={preview} html={html} style={style} className={className} fromMarkdown />
}

Markdow.defaultProps={
    skipHtml:true
}
/*Markdow.propTypes={
    source:PropTypes.string.isRequired,
    className:PropTypes.string,
    style:PropTypes.object,
    skipHtml:PropTypes.bool
}


const Markdownn=({source,classes,className,style,skipHtml})=>{
    const ReactMarkdown = require('react-markdown');

    const Aexternal = (props) => {
        const {href,target,rel,children,...other}=props
        if(
            !href.match(/^mailto\:/)
            && !href.match(/portalnesia\.com+/)
            && !href.match(/kakek\.c1\.biz\/+/)
            && !href.match(/^javascript\:/)
            && !href.match(/^\/+/)
        ) {
            return <a target="_blank" rel='nofollow noreferrer noopener' href={`/link?u=${btoa(encodeURIComponent(href))}`} {...other}>{children}</a>
        } else if(
            (typeof target === 'undefined' || target=='_self')
            && (href?.match(/https:\/\/portalnesia\.com+/) || href?.match(/^\/+/))
        ) {
            const hreff=href?.match(/https:\/\/portalnesia\.com\/+/) ? href.substring(23) : href;
            return <Link href={hreff} passHref><a {...other}>{children}</a></Link>
        }
    };

    const Imgexternal = (props) => {
        const {src,...other}=props
        const srrrc=src|props?.['data-src'];
        const srrc=!srrrc?.match(/portalnesia\.com\/+/) && !srrrc?.match(/^\/+/) ? `${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(srrrc)}&size=300` : srrrc;
        
        return <Image webp blured fancybox src={srrc} dataSrc={src} className={styleClass['image-container']} {...other} />
        /*if(
            !src.match(/portalnesia\.com\/+/)
            && !src.match(/^\/+/)
        ) {
            return <Image webp fancybox src={`${process.env.CONTENT_URL}/img/url?image=${encodeURIComponent(src)}&size=300`} dataSrc={src} {...other} />
        }
    };

    const TableEx=(props)=>{
        const {children}=props
        return (
            <div style={{overflowX:'auto'}}>
                <Table>{children}</Table>
            </div>
        )
    }
    const Thead=(props)=>{
        const {children}=props
        return <TableHead>{children}</TableHead>
    }
    const Tbody=(props)=>{
        const {children}=props
        return <TableBody>{children}</TableBody>
    }
    const Th=(props)=>{
        const {children}=props
        return <TableRow>{children}</TableRow>
    }
    const Td=(props)=>{
        const {children}=props
        return <TableCell>{children}</TableCell>
    }

    const divRef=React.useRef()

    React.useEffect(()=>{
        if(divRef.current) {
            divRef.current.querySelectorAll('pre code:not(.not-hljs),code.code:not(.not-hljs)').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
    },[source])

    return(
        <div ref={divRef} className={clx(classes.div,className ? className : '')} {...(style ? {style:style} : {})}>
            <ReactMarkdown
                skipHtml={skipHtml}
                renderers={{
                    link:Aexternal,
                    linkReference:Aexternal,
                    image:Imgexternal,
                    imageReference:Imgexternal,
                    table:TableEx,
                    tableHead:Thead,
                    tableBody:Tbody,
                    tableRow:Th,
                    tableCell:Td
                }}
                children={source}
            />
        </div>
    )
}
Markdownn.defaultProps={
    skipHtml:true
}
Markdownn.propTypes={
    source:PropTypes.string.isRequired,
    className:PropTypes.string,
    style:PropTypes.object,
    skipHtml:PropTypes.bool
}
*/

export const Markdown=Markdow