
import React from 'react'
import type {ImageManager,CKEditorReactProps} from '@portalnesia/custom-ckeditor5'
import PortalnesiaEditor from '@portalnesia/custom-ckeditor5'
import dynamic from 'next/dynamic'
import {UnsplashTypes,PixabayTypes} from '@model/files'
import { PluginInterface } from '@ckeditor/ckeditor5-core/src/plugin'
import { CopyPartial } from '@type/general'
import {styled} from '@mui/material/styles'
import {useDispatch, useSelector} from '@redux/store'
import { ucwords } from '@portalnesia/utils'
import type EditorClass from '@ckeditor/ckeditor5-core/src/editor/editor'
import { NAVBAR_HEIGHT } from '@layout/navbar.config'

// @ts-ignore
const NativeCKEditor = dynamic(()=>import('@ckeditor/ckeditor5-react/dist/ckeditor').then(m=>m.CKEditor)) as React.ComponentType<CKEditorReactProps>
const FileManager = dynamic(()=>import("@comp/FileManager"));

export interface EditorProps extends CopyPartial<CKEditorReactProps,'editor'> {
    onSave?(): void;
}

const Div = styled("div")(({theme})=>({
    '.ck-content pre code':{
        background:'unset !important',
        padding:'0 !important',
        borderRadius:'0 !important'
    },
    '.ck':{
        color:"#000000"
    },
    '.pn_ck_fullscreen .ck-sticky-panel__content':{
        top:'0 !important',
        width:'100vw !important'
    },
    '.ck .ck-editor__main a':{
        color:'#1591f9 !important'
    },
    '.ck figure.table' :{
        overflowX:'auto',
        color:'#000',
        '& td, & th':{
            color:'#000',
        },
        '& th':{
            color:'#000 !important',
        }
    },
    '.ck-editor__editable_inline':{
        minHeight:800
    },
    '.pn_ck_fullscreen .ck-editor__editable_inline':{
        minHeight:'unset',
        paddingBottom:40
    },
    [theme.breakpoints.up("lg")]: {
        '.ck.ck-toolbar-dropdown>.ck-dropdown__panel': {
            maxWidth: 400
        },
    }
}))

export default function CKEditor(props: EditorProps) {
    const {config:_,onReady,data:dt,onFocus:_b,onBlur:_n,onSave,disabled,...rest} = props;
    const hotkeys = useSelector(s=>s.hotkeys);
    const dispatch = useDispatch();
    const [browser,setBrowser] = React.useState(false);
    const editorRef = React.useRef<PortalnesiaEditor>();

    const data = React.useMemo(()=>dt,[]);

    const handleSelectedImage=React.useCallback((url: string)=>{
        console.log("SELECTED IMAGE",dt);
        if(editorRef.current) {
            const editor = editorRef.current as unknown as EditorClass;
            editor.plugins.get<ImageManager>("ImageManager" as unknown as PluginInterface<ImageManager>).handleSelectedImage(url);
        }
    },[])

    const handleUnsplashSelectedImage=React.useCallback((dt: UnsplashTypes)=>{
        if(editorRef.current) {
            const editor = editorRef.current as unknown as EditorClass;
            const url = dt?.url;
            const name = dt?.user?.name;
            const href = dt?.user?.links?.html;
            editor.plugins.get<ImageManager>("ImageManager" as unknown as PluginInterface<ImageManager>).handleSelectedImage(url,["Photo by ",{text:name,href:`${href}?utm_source=Portalnesia&utm_medium=referral`}," on ",{text:"Unsplash",href:"https://unsplash.com?utm_source=Portalnesia&utm_medium=referral"}]);
        }
    },[])

    const handlePixabaySelectedImage=React.useCallback((dt: PixabayTypes)=>{
        if(editorRef.current) {
            const editor = editorRef.current as unknown as EditorClass;
            const url = dt?.url;
            const name = dt?.user;
            const href = `https://pixabay.com/users/${name}-${dt.user_id}`;
            editor.plugins.get<ImageManager>("ImageManager" as unknown as PluginInterface<ImageManager>).handleSelectedImage(url,[`${ucwords(dt.type)} by `,{text:name,href:`${href}?utm_source=Portalnesia&utm_medium=referral`}," on ",{text:"Pixabay",href:"https://pixabay.com?utm_source=Portalnesia&utm_medium=referral"}]);
        }
    },[])

    const handleCloseBrowser=React.useCallback((e?:{},reason?: "backdropClick" | "escapeKeyDown")=>{
        setBrowser(false)
    },[])

    const openBrowser = React.useCallback(()=>{
        console.log("OPEN")
        setBrowser(true)
    },[])

    const handleReady=React.useCallback((editor: PortalnesiaEditor)=>{
        editorRef.current = editor;
        if(onReady) onReady(editor)
    },[onReady])

    const handleFocusBlur=React.useCallback((disableHotkeys: boolean)=>()=>{
        dispatch({type:"CUSTOM",payload:{hotkeys:{...hotkeys,disabled:disableHotkeys}}})
    },[dispatch,hotkeys])

    const handleSave=React.useCallback(()=>{
        if(onSave) onSave();
    },[onSave])

    React.useEffect(()=>{
        //console.log(PortalnesiaEditor.defaultConfig)
    },[])

    return (
        <>
            <Div>
                <NativeCKEditor
                    editor={PortalnesiaEditor}
                    config={{
                        // @ts-ignore
                        ui:{
                            viewportOffset:{
                                top:NAVBAR_HEIGHT
                            }
                        },
                        toolbar:{
                            viewportTopOffset:NAVBAR_HEIGHT,
                        },
                        portalnesia:{
                            onImageManager: openBrowser,
                            onSave: handleSave
                        },
                        heading:{
                            options: [
                                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                            ]
                        }
                    }}
                    data={data}
                    onReady={handleReady}
                    onError={(e=>console.error(e))}
                    onFocus={handleFocusBlur(true)}
                    onBlur={handleFocusBlur(false)}
                    {...rest}
                />
            </Div>
            <FileManager open={browser} onSelected={handleSelectedImage} onUnsplashSelected={handleUnsplashSelectedImage} onPixabaySelected={handlePixabaySelectedImage} handleClose={handleCloseBrowser} withUnsplash withPixabay />
        </>
    )
}