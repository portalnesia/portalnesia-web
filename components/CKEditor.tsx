import React from 'react'
import PortalnesiaEditor,{ImageManager,CKEditorReactProps} from '@portalnesia/custom-ckeditor5'
import dynamic from 'next/dynamic'
import {UnsplashTypes,PixabayTypes} from 'portal/types/files'
import { PluginInterface } from '@ckeditor/ckeditor5-core/src/plugin'
import { Without } from 'portal/types/types'
import {styled} from '@mui/material/styles'
import {useDispatch} from 'react-redux'
import {Dispatch} from 'redux'
import { ucwords } from '@portalnesia/utils'
import type EditorClass from '@ckeditor/ckeditor5-core/src/editor/editor'

const Browser=dynamic(()=>import('portal/components/Browser'))
const CKEditor = dynamic(()=>import('@ckeditor/ckeditor5-react').then(m=>m.CKEditor)) as React.ComponentType<CKEditorReactProps>

export interface EditorProps extends Without<CKEditorReactProps,'editor'> {
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
        width:'100% !important'
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
    [theme.breakpoints.up("lg")]: {
        '.ck.ck-toolbar-dropdown>.ck-dropdown__panel': {
            maxWidth: 400
        },
    }
}))

function EditorComp(props: EditorProps) {
    const {config:_,onReady,data:dt,onFocus:_b,onBlur:_n,onSave,disabled,...rest} = props;
    const dispatch = useDispatch();
    const [browser,setBrowser] = React.useState(false);
    const editorRef = React.useRef<PortalnesiaEditor>();

    const data = React.useMemo(()=>dt,[]);

    const handleSelectedImage=React.useCallback((url: string)=>{
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
        if(!e || e && reason === 'escapeKeyDown') {
            setBrowser(false)
        }
    },[])

    const openBrowser = React.useCallback(()=>{
        setBrowser(true)
    },[])

    const handleReady=React.useCallback((editor: PortalnesiaEditor)=>{
        editorRef.current = editor;
        if(onReady) onReady(editor)
    },[onReady])

    const handleFocusBlur=React.useCallback((disableHotkeys: boolean)=>()=>{
        dispatch({type:"CUSTOM",payload:{disableHotkeys}})
    },[dispatch])

    const handleSave=React.useCallback(()=>{
        if(onSave) onSave();
    },[onSave])

    return (
        <>
            <Div>
                <CKEditor
                    editor={PortalnesiaEditor}
                    config={{
                        toolbar:{
                            viewportTopOffset:64
                        },
                        portalnesia:{
                            onImageManager: openBrowser,
                            onSave: handleSave
                        },
                    }}
                    data={data}
                    onReady={handleReady}
                    onFocus={handleFocusBlur(true)}
                    onBlur={handleFocusBlur(false)}
                    disabled={disabled}
                    {...rest}
                />
            </Div>
            <Browser open={browser} onSelected={handleSelectedImage} onUnsplashSelected={handleUnsplashSelectedImage} onPixabaySelected={handlePixabaySelectedImage} onClose={handleCloseBrowser} withUnsplash withPixabay />
        </>
    )
}

const Editor = React.memo(EditorComp);
export default Editor;