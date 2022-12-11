import React from 'react'
import {SimpleMDEReactProps} from "react-simplemde-editor";
import {UnsplashTypes,PixabayTypes} from '@model/files'
import ReactDOMServer from "react-dom/server";
import {Markdown} from '@design/components/Parser'
import dynamic from 'next/dynamic'
import 'easymde/dist/easymde.min.css'
import { ucwords } from '@portalnesia/utils';
import { createTheme, styled, ThemeOptions, ThemeProvider } from '@mui/material/styles';
import {GlobalStyles} from '@design/themes'
import palette from '@design/themes/palette';
import typography from '@design/themes/typography';
import shadows, { customShadows } from '@design/themes/shadows';
import { enUS } from '@mui/material/locale';
import componentsOverride from '@design/themes/overrides'
import CssBaseline from '@mui/material/CssBaseline';
import StyledEngineProvider from '@mui/styled-engine/StyledEngineProvider';
import { portalUrl } from '@utils/main';

const FileManager = dynamic(()=>import("@comp/FileManager"));

const Div = styled("div")(()=>({
    '& .CodeMirror-fullscreen,& .editor-toolbar.fullscreen': {
        zIndex:'2000!important'
    },
    '& .editor-toolbar': {
        background: '#fff'
    },
    '& .editor-preview': {
        zIndex:'2000!important',
        color:'#000 !important'
    },
    '& .editor-preview pre': {
        background:'unset !important',
        margin:'1em 0 !important'
    }
}))

const SimpleMDE=dynamic(()=>import('react-simplemde-editor'),{ssr:false})

export interface SimpleMDEProps extends SimpleMDEReactProps {
    image?: boolean;
}

function AppProvider({children}: {children: React.ReactNode}) {
    const themeOptions = React.useMemo<ThemeOptions>(
        () => ({
            palette: palette,
            shape: { borderRadius: 8 },
            typography,
            shadows,
            customShadows
        }),
        []
    );

    const themes = React.useMemo(()=>createTheme(themeOptions,enUS),[themeOptions]);
    themes.components = React.useMemo(()=>componentsOverride(themes),[themes]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export default function Simple(props: SimpleMDEProps) {
    const {id="markdown-editor",value="",onChange,image,...other} = props;
    const editor = React.useRef<any>()
    const [browser,setBrowser] = React.useState(false)

    const handleChange=(text: string)=>{
        const result=image === false ? text.replace(/(\[\!\[|\!\[)/g,"[") : text;
        if(onChange) onChange(result);
    }

    const handleSelectedImage=React.useCallback((url: string)=>{
        if(editor.current) editor.current?.drawImages(url);
    },[])

    const handleUnsplashSelectedImage=React.useCallback((dt: UnsplashTypes)=>{
        const url = dt?.url;
        const name = dt?.user?.name;
        const href = dt?.user?.links?.html;
        if(editor.current) editor.current?.drawImages(url,`Photo by <a href="${href}?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer"><span>${name}</span></a> on <a href="https://unsplash.com?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer"><span>Unsplash</span></a>`);
    },[])

    const handlePixabaySelectedImage=React.useCallback((dt: PixabayTypes)=>{
        const url = dt?.url;
        const name = dt?.user;
        const href = `https://pixabay.com/users/${name}-${dt.user_id}`;
        if(editor.current) editor.current?.drawImages(url,`${ucwords(dt.type)} by <a href="${href}?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer">${name}</a> on <a href="https://pixabay.com?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer">Pixabay</a>`);
    },[])

    const openBrowserImage=React.useCallback(()=>{
        setBrowser(true)
    },[])

    const opt = React.useMemo(()=>{
        const opt={
            spellChecker: false,
            allowAtxHeaderWithoutSpace:true,
            promptURLs:true,
            forceSync:true,
            previewRender:(text: string)=>{
                return ReactDOMServer.renderToString(
                    <AppProvider>
                        <GlobalStyles />
                        <Markdown
                            source={text}
                            skipHtml={!Boolean(image)}
                            preview
                        />
                    </AppProvider>
                );
            }
        } as any
        if(image) {
            opt.toolbar=["heading-1","heading-2","heading-3","unordered-list","ordered-list","horizontal-rule","|","bold", "italic", "quote","code","|","link",
                {
                    name: "images",
                    action: openBrowserImage,
                    className: "fa fa-picture-o",
                    title: "Insert Image",
                },
                    "table","preview","side-by-side","fullscreen",
                {
                    name: "guide",
                    action: function(){
                        return window.open(portalUrl('/blog/markdown-guide'))
                },
                className: "fa fa-question-circle",
                title: "Markdown Guide",
            }];
        } else {
            opt.toolbar=["heading-1","heading-2","heading-3","unordered-list","ordered-list","horizontal-rule","|","bold", "italic", "quote","code","|","link","preview","side-by-side","fullscreen",{
                name: "guide",
                action: function(){
                    return window.open(process.env.URL+'/blog/markdown-guide')
                },
                className: "fa fa-question-circle",
                title: "Markdown Guide",
            }];
        }
        return opt;
    },[])
    
    return(
        <Div>
            <SimpleMDE
                onChange={handleChange}
                value={value}
                options={opt}
                getMdeInstance={(instance)=>{
                    editor.current=instance
                }}
                {...(id ? {id:id} : {})}
                {...other}
            />
            <FileManager open={browser} onSelected={handleSelectedImage} handleClose={()=>setBrowser(false)} onUnsplashSelected={handleUnsplashSelectedImage} onPixabaySelected={handlePixabaySelectedImage} withUnsplash withPixabay />
        </Div>
    )
}