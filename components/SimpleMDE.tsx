import React from 'react'
import {SimpleMDEReactProps} from "react-simplemde-editor";
import {UnsplashTypes,PixabayTypes} from 'portal/types/files'
import ReactDOMServer from "react-dom/server";
import {Markdown} from './Parser'
import dynamic from 'next/dynamic'
import 'easymde/dist/easymde.min.css'
import { ucwords } from '@portalnesia/utils';
import {styled} from '@mui/material/styles'

const Browser=dynamic(()=>import('portal/components/Browser'))
const SimpleMDE=dynamic(()=>import('react-simplemde-editor'),{ssr:false})
    
const Div = styled("div")(()=>({
    '.editor-preview a':{
        color:'#1591f9 !important'
    },
    /*'.code':{
        color:'#000000 !important',
        background:'unset !important'
    }*/
}))

export interface SimpleMDEProps extends SimpleMDEReactProps {
    image?: boolean;
}

const Simple=(props: SimpleMDEProps)=>{
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
        if(editor.current) editor.current?.drawImages(url,`Photo by <a href="${href}?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer">${name}</a> on <a href="https://unsplash.com?utm_source=Portalnesia&utm_medium=referral" target="_blank" rel="nofollow noopener noreferrer">Unsplash</a>`);
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
                    <Markdown
                      source={text}
                      skipHtml={!Boolean(image)}
                      preview
                    />
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
                        return window.open(process.env.URL+'/blog/markdown-guide')
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
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} onUnsplashSelected={handleUnsplashSelectedImage} onPixabaySelected={handlePixabaySelectedImage} withUnsplash withPixabay />
        </Div>
    )
}
export default Simple;