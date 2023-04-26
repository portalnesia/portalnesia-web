import React from 'react'
import Parserr, { domToReact, Element, HTMLReactParserOptions, attributesToProps } from 'html-react-parser'
import { styled } from '@mui/material/styles'
import Image from '@comp/Image'
import clx from 'classnames'
import Link from 'next/link'
import { slugFormat } from '@portalnesia/utils'
import type { SxProps, Theme } from '@mui/material/styles'
import { convertToHtml } from '@utils/marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { portalUrl, staticUrl } from '@utils/main'
import Scrollbar from './Scrollbar'
import { handlePageContent } from './TableContent'
import { BoxPagination } from './Pagination'
import SocialEmbed from '@comp/SocialEmbed'
import { Em, Figcaption, Figure } from './Dom'
import Divider from '@mui/material/Divider'

export const editorStyles = (theme: Theme) => ({
    '& pre code': {
        borderRadius: '.5rem',
        '@media (hover: hover) and (pointer: fine)': {
            '&::-webkit-scrollbar': {
                height: 8,
                borderRadius: 4
            },
            '&::-webkit-scrollbar-thumb': {
                //background:theme.palette.mode=='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                background: 'rgba(255,255,255,.2)',
                borderRadius: 4,
                '&:hover': {
                    background: 'rgba(255,255,255,.4)'
                }
            },
        }
    },
    '& table': {
        '& td': {
            color: theme.palette.text.primary,
            borderTop: `1px solid ${theme.palette.divider}`,
        },
        '& th': {
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `2px solid ${theme.palette.divider}`
        }
    },
    '& h1:not(.no-underline), & h2:not(.no-underline), & h3:not(.no-underline), & h4:not(.no-underline), .underline': {
        marginTop: 32,
        paddingBottom: '.1rem',
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    '& a': {
        '&[href]:not(.no-format)': {
            color: theme.palette.customColor.link,
        },
        '&[href]:not(.no-format):hover': {
            textDecoration: 'underline'
        },
    }
})

const Div = styled('div')(({ theme }) => ({
    ...editorStyles(theme)
}))

const Img = styled(Image)(({ theme }) => ({
    maxWidth: 400,
    [theme.breakpoints.down(400)]: {
        maxWidth: '100%'
    },
    maxHeight: 800,
    objectFit: 'cover'
}))

export function usePageContent(data?: any) {
    let hashRef = React.useRef<number>();
    React.useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        if (data) {
            timeout = setTimeout(() => {
                if (!hashRef.current) {
                    hashRef.current = 10;
                    const hash = window.location.hash;
                    if (hash.length > 0) {
                        console.log(hash)
                        handlePageContent(hash.substring(1))()
                    }
                }
            }, 500)
        }

        return () => timeout && clearTimeout(timeout)
    }, [data])

    return null;
}

function checkParentHasFigure(node: Element['parent'] | null) {
    let check = false;
    let currentNode: Element['parent'] | null = node;
    for (let i = 0; i < 4 && currentNode; i++) {
        if (
            (currentNode.type === "tag" && currentNode.name === "figure") ||
            (currentNode.type === "tag" && currentNode.name === "div" && currentNode?.attribs?.class === "article__media") //vice
        ) {
            check = true;
            break;
        } else {
            currentNode = currentNode.parent
        }
    }
    return check;
}

const parseOption = (opt: { preview?: boolean }): HTMLReactParserOptions => ({
    replace: (htmlNode) => {
        const node = htmlNode as Element
        if (node?.type === 'tag' && node?.name === 'hr') {
            return <Divider />
        }
        if (node?.type === 'tag' && node?.name === 'div') {
            if (node?.attribs?.['data-portalnesia-action']) {
                if (node?.attribs?.['data-portalnesia-action'] == 'ads') {
                    return domToReact(node?.children, parseOption(opt)) as any;
                    //const type=node?.attribs?.['data-ads'];
                    //if(type=='300') return <AdsRect />
                    //else if(type=='468') return <AdsBanner1 />
                    //else if(type=='728') return <AdsBanner2 />
                    //else if(type=='button') return <AdsBanner3 />
                }
            } else if (/table\-responsive/.test(node?.attribs?.class || "")) {
                return domToReact(node?.children, parseOption(opt)) as any;
            } else if (node?.attribs?.class === "fb-post" && typeof node?.attribs?.['data-href'] === "string") {
                <SocialEmbed type="facebook" url={node?.attribs?.['data-href']} />
            } else if (node?.attribs?.class === "article__image-caption") {
                return (
                    <Figcaption data-id='caption-content'>
                        <Em sx={{ fontSize: 14, color: 'text.secondary' }}>{domToReact(node?.children, parseOption(opt))}</Em>
                    </Figcaption>
                )
            } else if (node?.attribs?.class === "article__embed article__embed--vice") {
                return <></>
            } else if (node?.attribs?.class === "article__media") {
                return <Figure>{domToReact(node?.children, parseOption(opt))}</Figure>
            }
        }
        if (node?.type === 'tag' && node?.name === 'center') {
            return domToReact(node?.children, parseOption(opt)) as any;
        }
        // BLOCKQUOTE (SOCIAL)
        if (node?.type === 'tag' && node?.name === 'blockquote') {
            const bqClass = node?.attribs?.class;
            if (['instagram-media', 'twitter-tweet', 'tiktok-embed'].includes(bqClass || "")) return domToReact(node?.children, parseOption(opt));
        }
        // A LINK
        if (node?.type === 'tag' && node?.name === 'a') {
            if (node?.attribs?.['data-fancybox']) {
                return domToReact(node?.children, parseOption(opt)) as any
            } else if (node?.attribs?.href) {
                const parent = node?.parent as Element;
                const isSocMed = parent?.name === 'blockquote' && ['instagram-media', 'twitter-tweet', 'tiktok-embed'].includes(parent?.attribs?.class || '');
                if (!isSocMed) {
                    const { href, target, rel, ...other } = node?.attribs
                    if (href?.match(/^\#/)) {
                        const idd = href.substring(1);
                        return (
                            <a href={href} onClick={handlePageContent(idd)}>{domToReact(node?.children, parseOption(opt))}</a>
                        )
                    }
                    if (
                        /^https?\:\/\//.test(href)
                        && !/portalnesia\.com/.test(href)
                        && !/prtl\.c1\.biz/.test(href)
                    ) {
                        const hreff = (/utm\_source\=portalnesia/i.test(href) || /portalnesia\.com/.test(href)) ? href : portalUrl(`/link?u=${Buffer.from(encodeURIComponent(href)).toString('base64')}`)
                        return (
                            <a target="_blank" rel='nofollow noreferrer noopener' href={hreff} {...other}>
                                {domToReact(node?.children, parseOption(opt))}
                            </a>
                        )
                    } else if (
                        (typeof target === 'undefined' || target == '_self')
                        && (/^https:\/\/portalnesia\.com+/.test(href) || /^\//.test(href))
                    ) {
                        const hreff = href?.replace(/^https:\/\/portalnesia\.com\/?/, "/");
                        return <Link href={hreff} passHref legacyBehavior><a {...other}>{domToReact(node?.children, parseOption(opt))}</a></Link>
                    } else if (/portalnesia\.com+/.test(href)) {
                        return <a target="_blank" rel='nofollow noreferrer noopener' href={href} {...other}>{domToReact(node?.children, parseOption(opt))}</a>
                    }
                } else {
                    const parentClass = parent?.attribs?.class;
                    const href = node?.attribs?.href
                    return (
                        <Box display='flex' justifyContent='center' my={3}>
                            {parentClass === "twitter-tweet" ? (
                                <SocialEmbed type="twitter" url={href} width={500} />
                            ) : parentClass === "instagram-media" ? (
                                <SocialEmbed type="instagram" url={href} width={500} />
                            ) : parentClass === "tiktok-embed" ? (
                                <SocialEmbed type="tiktok" url={href} width={500} />
                            ) : null}
                        </Box>
                    )
                }
            }
        }
        // PICTURE
        if (node?.type === 'tag' && node?.name === 'picture') {
            const parent = node?.parent as Element;
            const oriSrc = parent?.attribs?.['data-src'] || parent?.attribs?.href;
            const caption = parent?.attribs?.['data-caption'];
            const child = node?.children?.[node?.children?.length - 1] as Element | undefined;
            if (child?.name === 'img') {
                const margin = checkParentHasFigure(node.parent) ? 0 : 3
                const { src, class: classs, ...other } = child?.attribs;
                const srrrc = child?.attribs?.['data-src'] || src;
                const ssrc = oriSrc || srrrc;
                const isUnsplash = /unsplash\.com/.test(srrrc);
                const srrc = !(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? staticUrl(`img/url?image=${encodeURIComponent(srrrc)}&size=300&compress`) : isUnsplash ? srrrc : `${srrrc}&compress`;
                const withPng = Boolean(child?.attribs?.['data-png'] == 'true');
                //return null
                return (
                    <Box mb={margin} data-id="image-content" display='flex' justifyContent='center'>
                        <Img caption={caption} lazy={!opt.preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx('image-container', classs)} />
                    </Box>
                )
            }
        }
        if (node?.type === 'tag' && node?.name === 'em') {
            if (node?.parent?.children && node?.parent?.children?.length > 2) {
                const child = node?.parent?.children[0] as Element;
                if (child.name === "img") {
                    const props = attributesToProps(node?.attribs);
                    return (
                        <Figcaption data-id='caption-content'>
                            <Em {...props} sx={{ fontSize: 14, color: 'text.secondary' }}>{domToReact(node?.children, parseOption(opt))}</Em>
                        </Figcaption>
                    )
                }
            }

        }
        // IMG
        if (node?.type === 'tag' && node?.name === 'img' && (node?.attribs?.src || node?.attribs?.['data-src'])) {
            const { src, class: classs, ...other } = node?.attribs
            const parent = node?.parent as Element;
            const srrrc = node?.attribs?.['data-src'] || src;
            const isUnsplash = /unsplash\.com/.test(srrrc);
            const srrc = !(/portalnesia\.com\/+/.test(srrrc)) && !(/^\/+/.test(srrrc)) && !isUnsplash ? staticUrl(`img/url?image=${encodeURIComponent(srrrc)}&size=300&compress`) : isUnsplash ? srrrc : `${srrrc}&compress`;
            const withPng = Boolean(node?.attribs?.['data-png'] == 'true');
            const caption = parent?.attribs?.['data-caption'];
            const oriSrc = parent?.attribs?.['data-src'];
            const ssrc = oriSrc || srrrc;
            return (
                <Box data-id="image-content" display='flex' justifyContent='center'>
                    <Img caption={caption} lazy={!opt.preview} webp withPng={withPng} fancybox src={srrc} dataSrc={ssrc} className={clx('image-container', classs)} />
                </Box>
            )
        }
        // figure
        if (node?.type === 'tag' && node?.name === 'figure') {
            return <Figure>{domToReact(node?.children, parseOption(opt))}</Figure>
        }
        // figcaption
        if (node?.type === 'tag' && node?.name === 'figcaption') {
            return (
                <Figcaption data-id='caption-content'>
                    <Em sx={{ fontSize: 14, color: 'text.secondary' }}>{domToReact(node?.children, parseOption(opt))}</Em>
                </Figcaption>
            )
        }
        // TABLE
        if (node?.type === 'tag' && node?.name === 'table') {
            return (
                <Scrollbar>
                    <Table>
                        {domToReact(node?.children, parseOption(opt))}
                    </Table>
                </Scrollbar>
            )
        }
        // THEAD
        if (node?.type === 'tag' && node?.name === 'thead') {
            return (
                <TableHead>
                    {domToReact(node?.children, parseOption(opt))}
                </TableHead>
            )
        }
        // TBODY
        if (node?.type === 'tag' && node?.name === 'tbody') {
            return (
                <TableBody>
                    {domToReact(node?.children, parseOption(opt))}
                </TableBody>
            )
        }
        // TR
        if (node?.type === 'tag' && node?.name === 'tr') {
            return (
                <TableRow>
                    {domToReact(node?.children, parseOption(opt))}
                </TableRow>
            )
        }
        // TH || TD
        if (node?.type === 'tag' && (node?.name === 'th' || node?.name === 'td')) {
            return (
                <TableCell>
                    {domToReact(node?.children, parseOption(opt))}
                </TableCell>
            )
        }
        if (node?.type === 'tag' && (node?.name === 'html' || node?.name === 'body')) {
            return <div>{domToReact(node?.children, parseOption(opt))}</div>
        }
        // P
        if (node?.type === 'tag' && node?.name === 'p') {
            const findChildDiv = node.children.find(n => {
                return n?.type === 'tag' && (["div"].includes(n?.name))
            });
            if (findChildDiv) return domToReact(node?.children, parseOption(opt));

            const findChildImage = node.children.find(n => {
                return n?.type === 'tag' && (["img", "picture"].includes(n?.name))
            });
            if (findChildImage) return <Figure>{domToReact(node?.children, parseOption(opt))}</Figure>

            const parent = node?.parent;
            if (parent?.type === 'tag' && parent?.name === "li") {
                return <Typography paragraph variant='body1' component='span' sx={{ textAlign: "justify" }}>{domToReact(node?.children, parseOption(opt))}</Typography>
            }
            return <Typography paragraph variant='body1' component='p' sx={{ textAlign: "justify" }}>{domToReact(node?.children, parseOption(opt))}</Typography>
        }
        // SCRIPT
        if (node?.type === "script" && node?.name === 'script') {
            /*const src = node?.attribs?.src;
            if(src) {
              return <Script src={src} strategy='lazyOnload' />
            }*/
            return <></>;
        }

        if (node?.type === 'tag' && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node?.name)) {
            let { id, style, ...other } = node?.attribs;
            const styles = attributesToProps({ style })
            if (!id && ['h1', 'h2', 'h3', 'h4'].includes(node?.name)) {
                let text = "";
                node?.children?.forEach(c => {
                    if (c?.type === 'text') text += ` ${(c as any)?.data}`;
                    else {
                        (c as Element)?.children?.forEach(cc => {
                            if (cc?.type === 'text') text += ` ${(cc as any)?.data}`;
                        })
                    }
                })
                if (text?.length > 0) id = slugFormat(text);
            }
            const parent = node?.parent as Element
            if (id && parent?.name != 'td' && !['h5', 'h6'].includes(node?.name)) {
                if (node?.name === 'h1') {
                    return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography sx={{ mb: 3 }} variant='h4' component='h2' {...attributesToProps(other)} style={styles.style} id={id} >{domToReact(node?.children, parseOption(opt))}</Typography></a>
                }
                else if (node?.name === 'h2') {
                    return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography sx={{ mb: 3 }} variant='h5' component='h3' {...attributesToProps(other)} style={styles.style} id={id}>{domToReact(node?.children, parseOption(opt))}</Typography></a>
                }
                else if (node?.name === 'h3' || node?.name === 'h4' || node?.name === 'h5' || node?.name === 'h6') {
                    return <a className="no-format" href={`#${id}`} onClick={handlePageContent(id)}><Typography sx={{ mb: 3 }} variant='h6' component='h4' {...attributesToProps(other)} style={styles.style} id={id}>{domToReact(node?.children, parseOption(opt))}</Typography></a>
                }
            } else {
                if (node?.name === 'h1') {
                    return <Typography sx={{ mb: 3 }} variant='h4' component='h2' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' ? { style: { ...styles.style, paddingBottom: 'unset', borderBottom: 'unset' } } : { style: styles.style })}>{domToReact(node?.children, parseOption(opt))}</Typography>
                }
                else if (node?.name === 'h2') {
                    return <Typography sx={{ mb: 3 }} variant='h5' component='h3' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' ? { style: { ...styles.style, paddingBottom: 'unset', borderBottom: 'unset' } } : { style: styles.style })}>{domToReact(node?.children, parseOption(opt))}</Typography>
                }
                else if (node?.name === 'h3' || node?.name === 'h4' || node?.name === 'h5' || node?.name === 'h6') {
                    return <Typography sx={{ mb: 3 }} variant='h6' component='h4' {...attributesToProps(other)} id={id} {...(parent?.name == 'td' || ['h5', 'h6'].includes(node?.name) ? { style: { ...styles.style, paddingBottom: 'unset', borderBottom: 'unset' } } : { style: styles.style })}>{domToReact(node?.children, parseOption(opt))}</Typography>
                }
            }
        }
    }
})

export interface ParserProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    html: string,
    preview?: boolean,
    sx?: SxProps<Theme>
}

export function Parser({ html, preview, ...other }: ParserProps) {
    const divRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (divRef.current) {
            //,code.code:not(.not-hljs)
            divRef.current.querySelectorAll('pre code:not(.not-hljs),code.code:not(.not-hljs)').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [html])

    const children = React.useMemo(() => {
        return Parserr(html, parseOption({ preview }))
    }, [html, preview])

    return (
        <Div ref={divRef} {...other}>
            {children}
        </Div>
    )
}

export interface MarkdrownProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    source: string,
    preview?: boolean,
    skipHtml?: boolean,
    sx?: SxProps<Theme>
}

export function Markdown({ source, skipHtml, preview, ...other }: MarkdrownProps) {
    const [html, setHtml] = React.useState<string | undefined>();

    React.useEffect(() => {
        if (typeof window !== 'undefined' || preview) {
            const hhtm = convertToHtml(source, preview);
            const forb = skipHtml ? ['img', 'iframe', 'video'] : ['video'];
            const html = DOMPurify.sanitize(hhtm, { FORBID_TAGS: forb, USE_PROFILES: { html: true } })
            setHtml(html);
        }
    }, [source, preview, skipHtml])

    const finalHtml: string | undefined = React.useMemo(() => {
        if (preview) {
            const hhtm = convertToHtml(source, preview);
            return hhtm;
        }
        return html;
    }, [preview, html, source])

    if (typeof finalHtml !== 'string') {
        return (
            <BoxPagination style={{ width: 50, height: 50 }} loading />
        )
    }
    return <Parser preview={preview} html={finalHtml} {...other} />
}