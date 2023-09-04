import React, { useCallback, useEffect, useState, MouseEvent } from 'react'
import { styled } from '@mui/material/styles'
import List from '@mui/material/List'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Hidden from '@mui/material/Hidden'

export const ContentRoot = styled('div')(({ theme }) => ({
    position: 'fixed',
    top: 200,
    zIndex: 101,
    transition: theme.transitions.create(['right', 'opacity'], {
        easing: theme.transitions.easing.easeIn,
        duration: 500
    }),
    maxWidth: '80%'
}))

export const ContentButton = styled('div')(({ theme }) => ({
    cursor: 'pointer',
    fontSize: 15,
    padding: '7px 20px',
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    display: 'inline-block',
    position: 'absolute',
    top: 61,
    left: -97,
    transform: 'rotate(-90deg)',
    borderRadius: '10px 10px 0 0',
}))

export const ContentContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    position: 'relative'
}))

export const ContentSpan = styled('a')(({ theme }) => ({
    '& span': {
        '&:hover': {
            textDecoration: 'underline'
        },
    },
}))

export const CustomLi = styled('li')(({ theme }) => ({
    '&.active': {
        color: `${theme.palette.customColor.link} !important`,
    }
}))

export const ContentContainerChild = styled('div')(({ theme }) => ({
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
    WebkitBoxShadow: '50px 4px 40px -7px rgba(0,0,0,0.2)',
    boxShadow: '50px 4px 40px -7px rgba(0,0,0,0.2)',
    padding: 20,
    wordBreak: 'break-word',
    minHeight: 167
}))

type Args = {
    data: any
}

type BaseContent = {
    id: string;
    name: string;
    tag: string;
}

type Content = BaseContent & {
    child: (BaseContent & { child: BaseContent[] })[]
}

export function getOffset(elem: Element | null) {
    if (elem === null || !elem.getClientRects().length) return { top: 0, left: 0 }
    const rect = elem.getBoundingClientRect();
    const win = elem.ownerDocument.defaultView;
    return {
        top: rect.top + (win?.scrollY || 0),
        left: rect.left + (win?.scrollX || 0)
    }
}

export const handlePageContent = (id: string) => (e?: React.MouseEvent<HTMLAnchorElement>) => {
    if (e && e.preventDefault) e.preventDefault()
    const conta = document.getElementById(id);
    const isSm = window.matchMedia('(max-width: 767px)');
    if (conta) {
        const a = getOffset(conta).top;
        let b = a - 64 - 24;
        if (isSm.matches) {
            b -= 48;
        }
        window.scrollTo({ top: b, left: 0, behavior: 'smooth' });
    }
}

export default function useTableContent(opt: Args) {
    const [content, setContent] = React.useState<Content[]>([])
    const containerRef = React.useRef<number | null>(0)
    const hashRef = React.useRef<number | null>(null)

    React.useEffect(() => {
        const tim1 = setTimeout(() => {
            let konten: Content[] = [];
            document.querySelectorAll('a > h1[id],a > h2[id],a > h3[id], a > h4[id]').forEach(e => {
                const id = e.getAttribute('id') || '';
                const name = (e.textContent || '')

                if (e.tagName === 'H4') {
                    if (konten.length > 0) {
                        const h3 = konten[konten.length - 1].child;
                        if (h3.length) {
                            const lastH3 = konten[konten.length - 1].child[h3.length - 1];
                            if (lastH3.tag === "h3") {
                                const lastH3Child = konten[konten.length - 1].child[h3.length - 1].child;
                                konten[konten.length - 1].child[h3.length - 1].child = lastH3Child.concat({ id, name, tag: e.tagName.toLowerCase() });
                            } else {
                                konten[konten.length - 1].child = konten?.[konten.length - 1]?.child.concat({ id, name, tag: e.tagName.toLowerCase(), child: [] })
                            }
                        } else {
                            konten[konten.length - 1].child = konten?.[konten.length - 1]?.child.concat({ id, name, tag: e.tagName.toLowerCase(), child: [] })
                        }
                    } else {
                        konten = konten.concat({ id: id, name: name, tag: e.tagName.toLowerCase(), child: [] });
                    }
                }
                else if (e.tagName === 'H3') {
                    if (konten.length > 0 && ["h2", "h1"].includes(konten[konten.length - 1].tag)) {
                        konten[konten.length - 1].child = konten?.[konten.length - 1]?.child.concat({ id, name, tag: "h3", child: [] })
                    } else {
                        konten = konten.concat({ id: id, name: name, tag: e.tagName.toLowerCase(), child: [] });
                    }
                } else {
                    konten = konten.concat({ id: id, name: name, tag: e.tagName.toLowerCase(), child: [] });
                }
            })
            setContent(konten);
        }, 500)

        return () => {
            clearTimeout(tim1)
        }
    }, [opt.data])

    React.useEffect(() => {
        const isSm = window.matchMedia('(max-width: 767px)');
        function onScroll() {
            document.querySelectorAll<HTMLAnchorElement>('#tableOfContents a').forEach(a => {
                if (a.hash.length > 0) {
                    const o = document?.documentElement?.scrollTop || document.body.scrollTop
                    const id = document.querySelector<Element>(a.hash);
                    let padding = 64 + 24;
                    if (isSm.matches) {
                        padding += 52;
                    }
                    if (getOffset(id).top - padding <= o + 5) {
                        if (a.parentNode?.parentNode) {
                            const li = a.parentElement;
                            document.querySelectorAll<HTMLAnchorElement>('#tableOfContents li').forEach(l => {
                                l.classList.remove('active');
                            })
                            li?.classList?.add('active');
                        }
                    }
                }
            })
        }
        const tim2 = setTimeout(() => {
            if (content.length > 0) {
                if (hashRef.current === null) {
                    hashRef.current = 10;
                    const hash = window.location.hash;
                    if (hash.length > 0) {
                        handlePageContent(hash.substring(1))()
                    }
                }
                window.addEventListener('scroll', onScroll);
            }
        }, 500)
        return () => {
            window.removeEventListener('scroll', onScroll);
            clearTimeout(tim2)
            containerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content])

    return { content };
}

/**
 * Table Content for lgUp devices
 */
export function HtmlMdUp(props: Args) {
    const { content } = useTableContent(props);

    if (content?.length === 0) return null;
    return (
        <div id='tableOfContents'>
            <List component="ol" sx={{ listStyle: 'numeric', listStylePosition: 'inside' }}>
                {content.map((dt, i) => (
                    <React.Fragment key={`${dt?.id}-${i}`}>
                        <CustomLi {...dt.child && dt.child?.length > 0 ? { className: 'not-margin' } : {}}><ContentSpan href={`#${dt?.id}`} onClick={handlePageContent(dt?.id)}><span>{dt?.name}</span></ContentSpan></CustomLi>
                        {dt.child && dt.child?.length > 0 && (
                            <List component="ul" sx={{ listStyle: 'upper-roman', listStylePosition: 'inside', pl: 2 }}>
                                {dt.child.map((c, ii) => (
                                    <React.Fragment key={`${c.id}-${i}-${ii}`}>
                                        <CustomLi {...c.child && c.child?.length > 0 ? { className: 'not-margin' } : {}}><ContentSpan href={`#${c?.id}`} onClick={handlePageContent(c?.id)}><span>{c?.name}</span></ContentSpan></CustomLi>
                                        {c.child && c.child?.length > 0 && (
                                            <List component="ul" sx={{ listStyle: 'lower-roman', listStylePosition: 'inside', pl: 2 }}>
                                                {c.child.map((cc, iii) => (
                                                    <CustomLi key={`${cc.id}-${i}-${ii}-${iii}`}><ContentSpan href={`#${cc?.id}`} onClick={handlePageContent(cc?.id)}><span>{cc?.name}</span></ContentSpan></CustomLi>
                                                ))}
                                            </List>
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </React.Fragment>
                ))}
            </List>
        </div>
    )
}

export const ASummary = styled(AccordionSummary)(() => ({
    '& .MuiAccordionSummary-content': {
        margin: '12px 0 !important'
    },
    '&.Mui-expanded': {
        minHeight: 'unset !important'
    }
}))
/**
 * Table Content for lgDown devices
 */
export function HtmlMdDown(props: Args) {
    const [expand, setExpand] = useState(false);
    const { content } = useTableContent(props);

    const handleChange = useCallback(() => {
        setExpand(e => !e);
    }, [setExpand])

    useEffect(() => {
        if (expand) {
            document.body.classList.add("scroll-disabled")
        } else {
            document.body.classList.remove("scroll-disabled")
        }
    }, [expand])

    const handleClick = useCallback((id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setExpand(false);
        setTimeout(() => handlePageContent(id)(e), 500)
    }, [])

    if (content.length <= 0) return null;
    return (
        <Hidden mdUp>
            <Accordion disableGutters square expanded={expand} onChange={handleChange}>
                <ASummary expandIcon={<ExpandMoreIcon />}>Table of Content</ASummary>
                <AccordionDetails sx={{ overflow: 'auto', pb: 5, height: 'calc(100vh - 64px - 40px)' }}>
                    <div id='tableOfContents'>
                        <List component="ol" sx={{ listStyle: 'numeric', listStylePosition: 'inside' }}>
                            {content.map((dt, i) => (
                                <React.Fragment key={`${dt?.id}-${i}`}>
                                    <CustomLi {...dt.child && dt.child?.length > 0 ? { className: 'not-margin' } : {}}><ContentSpan href={`#${dt?.id}`} onClick={handleClick(dt?.id)}><span>{dt?.name}</span></ContentSpan></CustomLi>
                                    {dt.child && dt.child?.length > 0 && (
                                        <List component="ul" sx={{ listStyle: 'upper-roman', listStylePosition: 'inside', pl: 2 }}>
                                            {dt.child.map((c, ii) => (
                                                <React.Fragment key={`${c.id}-${i}-${ii}`}>
                                                    <CustomLi {...c.child && c.child?.length > 0 ? { className: 'not-margin' } : {}}><ContentSpan href={`#${c?.id}`} onClick={handleClick(c?.id)}><span>{c?.name}</span></ContentSpan></CustomLi>
                                                    {c.child && c.child?.length > 0 && (
                                                        <List component="ul" sx={{ listStyle: 'lower-roman', listStylePosition: 'inside', pl: 2 }}>
                                                            {c.child.map((cc, iii) => (
                                                                <CustomLi key={`${cc.id}-${i}-${ii}-${iii}`}><ContentSpan href={`#${cc?.id}`} onClick={handleClick(cc?.id)}><span>{cc?.name}</span></ContentSpan></CustomLi>
                                                            ))}
                                                        </List>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}

                                </React.Fragment>
                            ))}
                        </List>
                    </div>
                </AccordionDetails>
            </Accordion>
        </Hidden>
    )
}