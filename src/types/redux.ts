import type { ContentCommentType } from "@model/comment";
import type { IMe } from "@model/user";
import {HYDRATE} from 'next-redux-wrapper';

type ReportType = ContentCommentType | 'quiz' | 'twibbon'

export type ReportInformation = {
    /**
         * API type
         * 
         * API Endpoint
         */
    api?: string,
    /**
     * Komentar type
     * 
     * Komentar ID
     */
    komentar?: number
    /**
     * Konten type
     * 
     * Konten URL
     */
    konten?: {
        type: ReportType,
        id: number
    }
}

export type KontenReport = {
    type:"konten",
    information:{
        konten:{
            type: ReportType,
            id: number
        }
    }
}

export type FeedbackReport = {
    type:"feedback"
}

export type APIReport = {
    type:"api"
    information:{
        api: string
    }
}

export type UserReport = {
    type:"user",
    information:{
        user:number
    }
}

export type KomentarReport = {
    type:"komentar",
    information:{
        komentar: number
    }
}

export type IReport = KontenReport | FeedbackReport | KomentarReport | APIReport | UserReport

export type State = {
    theme:'auto'|'light'|'dark',
    redux_theme:'light'|'dark',
    user?: IMe | null,
    appToken?: string
    hotkeys:{
        disabled:boolean
        dialog: 'keyboard'|'feedback'|undefined
    }
    report?: IReport
}

export type ActionType = {
    type: typeof HYDRATE,
    payload: Partial<State>
} | {
    type: 'CHANGE_THEME',
    payload: State['theme']
} | {
    type: 'REDUX_THEME',
    payload: State['redux_theme']
} | {
    type:'CUSTOM',
    payload: Partial<State>
}