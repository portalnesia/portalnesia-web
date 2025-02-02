import React from 'react'
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/system/colorManipulator';
import { GlobalStyles as GlobalThemeStyles, Theme } from '@mui/material';
import type { Interpolation } from '@mui/styled-engine'

// ----------------------------------------------------------------------

export interface GlobalStylesProps {
    styles?: Interpolation<Theme>
}
export default function GlobalStyles({ styles }: GlobalStylesProps) {
    const theme = useTheme();

    return (
        <GlobalThemeStyles
            styles={{
                '*': {
                    //margin: 0,
                    //padding: 0,
                    boxSizing: 'border-box'
                },
                html: {
                    width: '100%',
                    height: '100%',
                    WebkitOverflowScrolling: 'touch'
                },
                body: {
                    width: '100%',
                    height: '100%'
                },
                'div#arc-widget-container[data-arc-widget-portalnesia]': {
                    zIndex: 'unset !important'
                },
                '#root': {
                    width: '100%',
                    height: '100%'
                },
                'ul,ol': {
                    paddingInlineStart: 20
                },
                input: {
                    '&[type=number]': {
                        MozAppearance: 'textfield',
                        '&::-webkit-outer-spin-button': {
                            margin: 0,
                            WebkitAppearance: 'none'
                        },
                        '&::-webkit-inner-spin-button': {
                            margin: 0,
                            WebkitAppearance: 'none'
                        }
                    }
                },
                textarea: {
                    '&::-webkit-input-placeholder': {
                        color: theme.palette.text.disabled
                    },
                    '&::-moz-placeholder': {
                        opacity: 1,
                        color: theme.palette.text.disabled
                    },
                    '&:-ms-input-placeholder': {
                        color: theme.palette.text.disabled
                    },
                    '&::placeholder': {
                        color: theme.palette.text.disabled
                    }
                },
                'pre code': {
                    overflowX: 'auto',
                    width: '100%',
                    padding: '.6rem .8125rem',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-wrap',
                },
                pre: {
                    marginTop: 16,
                    marginBottom: 16
                },
                'code:not(.hljs), blockquote, code.code:not(.hljs)': {
                    background: theme.palette.action.hover,
                    //color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                    borderRadius: '.5rem',
                    padding: '.15rem .5rem',
                },
                blockquote: {
                    fontSize: 16,
                    width: '100%',
                    margin: '10px 0 10px 0',
                    padding: '1em 10px 1em 15px',
                    borderLeft: '8px solid #78c0a8',
                    position: 'relative',
                    overflowX: 'auto'
                },
                'blockquote::before': {
                    fontFamily: 'Arial',
                    color: '#78c0a8',
                    fontSize: '4em',
                    position: 'absolute',
                    left: 10,
                    top: -10
                },
                'blockquote::after': {
                    content: "''"
                },
                'blockquote span': {
                    display: 'block',
                    color: '#333',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    marginTop: '1em'
                },
                li: {
                    listStylePosition: 'inside'
                },
                'li:not(.MuiListItem-container):not(.MuiBreadcrumbs-li):not(.MuiBreadcrumbs-separator):not(.not-margin)': {
                    marginBottom: 10
                },
                'li:not(.MuiListItem-container):not(.MuiBreadcrumbs-li):not(.MuiBreadcrumbs-separator):last-child': {
                    marginBottom: 'unset'
                },
                'ul.MuiPagination-ul li': {
                    marginBottom: 'inherit !important'
                },
                a: { color: 'inherit', textDecoration: 'unset', WebkitTapHighlightColor: 'transparent' },
                'a:not(.no-underline),a:not(.no-underline)': {
                    cursor: 'pointer',
                    '&:hover': {
                        '& p, & span': {
                            textDecoration: 'underline'
                        }
                    }
                },
                'p.underline, span.underline': {
                    '&:hover': {
                        textDecoration: 'underline'
                    }
                },
                'a.a-blank[target="blank"], a.a-blank[target="_blank"], a[target="_blank"]:not(.no-blank), a[target="blank"]:not(.no-blank)': {
                    //display:'inline-flex',
                    alignItems: 'center',
                    '&:after': {
                        backgroundImage: `url(/svg/new_tab_${theme.palette.mode}.svg)`,
                        backgroundRepeat: 'no-repeat',
                        content: '""',
                        display: 'inline-block',
                        height: '.8125rem',
                        position: 'relative',
                        left: 5,
                        width: '.8125rem',
                        top: 1.5,
                        marginRight: 7
                    }
                },
                img: { display: 'block', maxWidth: '100%' },
                // Lazy Load Img
                '.blur-up': {
                    WebkitFilter: 'blur(5px)',
                    filter: 'blur(5px)',
                    transition: 'filter 400ms, -webkit-filter 400ms'
                },
                '.blur-up.lazyloaded ': {
                    WebkitFilter: 'blur(0)',
                    filter: 'blur(0)'
                },
                '.flex-header': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                },
                '.image-container': {
                    borderRadius: '.525rem',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: 1,
                    WebkitTransition: '.3s ease-in-out',
                    transition: '.3s ease-in-out',
                    '&:hover': {
                        opacity: '0.6 !important',
                    }
                },
                '#nprogress .bar': {
                    background: `${theme.palette.primary.main} !important`,
                    zIndex: '9999  !important',
                    height: '4px !important',
                },
                '.underline-heading': {
                    paddingBottom: '.1rem',
                    borderBottom: `1px solid ${theme.palette.divider}`
                },
                '.grecaptcha-badge': {
                    visibility: 'hidden'
                },
                '.scroll-disabled': {
                    overflow: 'hidden'
                },
                '.form .postComment': {
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${theme.palette.divider} !important`
                },
                '.react-responsive-modal-modal': {
                    color: `${theme.palette.text.secondary} !important`,
                    background: `${theme.palette.background.paper} !important`,
                },
                '.no-drag,.fancybox__image': {
                    WebkitUserSelect: 'none',
                    WebkitUserDrag: 'none',
                    WebkitAppRegion: 'no-drag',
                    MozUserSelect: 'none',
                    msUserSelect: "none",
                    userSelect: 'none',
                    WebkitTouchCallout: "none",
                },
                '.no-context': {
                    pointerEvents: "none",
                    WebkitTouchCallout: "none",
                },
                'div.fancybox__container': {
                    zIndex: '9999 !important'
                },
                ...styles as unknown as object
            }}
        />
    );
}