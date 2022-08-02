import React from 'react'
import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import { EditorConfig } from '@ckeditor/ckeditor5-core/src/editor/editorconfig';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

declare module '@mui/material/styles' {
    interface SimplePaletteColorOptions {
        action?: string
        link?: string
        dasar?: string
    }
    interface ThemeOptions {
        custom:{
            action: React.CSSProperties['color'],
            link: React.CSSProperties['color'],
            dasar: React.CSSProperties['color'],
            dasarText: React.CSSProperties['color'],
            dasarIcon: React.CSSProperties['color'],
            bgChat: React.CSSProperties['color'],
            bubbleLeftChat: React.CSSProperties['color'],
            bubbleRightChat: React.CSSProperties['color']
        }
    }
    interface Theme {
        custom:{
            action: string,
            link: string,
            dasar: string,
            dasarText: string,
            dasarIcon: string,
            bgChat: string,
            bubbleLeftChat: string,
            bubbleRightChat: string
        }
    }
}
declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
      grey: true;
    }
}

declare module "@mui/material" {
    interface Color {
      main:string,
      dark: string
    }
}

export type CKEditorReactProps = {
    editor: typeof ClassicEditor
    disabled?: boolean;
    data?: string
    id?: string
    config?: EditorConfig;
    onReady?(editor: ClassicEditor): void
    onChange?(event: EventInfo,editor: ClassicEditor): void;
    onBlur?(event: EventInfo,editor: ClassicEditor): void;
    onFocus?(event: EventInfo,editor: ClassicEditor): void;
    onError?(event: EventInfo,editor: ClassicEditor): void;
}

declare module '@ckeditor/ckeditor5-react' {
    const CKEditor: React.FunctionComponent<CKEditorReactProps>
    export {CKEditor}
}

declare module 'react-email-editor' {
    export interface User {
        name?: string,
        signature?: string,
        email?: string
    }
    export type SpecialLinks = {
        name: string;
        href: string;
        target: string
    }
    export interface UnlayerOptions {
        readonly specialLinks?: SpecialLinks[]
    }
    export interface EmailEditorProps {
        onReady?(): void
    }
}