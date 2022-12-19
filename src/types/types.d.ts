import type {FunctionComponent} from 'react'
import type {CKEditorReactProps} from '@portalnesia/custom-ckeditor5'

declare module '@ckeditor/ckeditor5-react' {
    declare const CKEditor: FunctionComponent<CKEditorReactProps>
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