import React from 'react'

export type sysInfoType={
    origin: string,
    browserDetail: any,
    userAgent: string,
    appName: string,
    appVersion: string,
    cookieEnabled: string,
    mimeType: Array<any>,
    platform: string,
    screenWidth: string,
    screenHeight: string,
    colorDepth: string,
    onLine: string,
    support_localStorage: string,
    support_sessionStorage: string,
    support_history: string,
    support_webSocket: string,
    support_applicationCache: string,
    support_webWorker: string,
    support_canvas: string,
    support_video: string,
    support_audio: string,
    support_svg: string,
    support_css3_3d: string,
    support_geolocation: string,
    plugins: string,
    javaEnabled: string,
}

export type FeedbackProps={
    theme?: string,
    onCancel: ()=>void,
    onSend: (data: {[key: string]: any})=>void,
    license?: React.ReactNode,
    proxy?: string,
    title?: string,
    placeholder?: string,
    required?: boolean,
    requiredTip?: string,
    editTip?: string,
    loadingTip?: string,
    checkboxLabel?: string,
    cancelLabel?: string,
    confirmLabel?: string,
    highlightTip?: string,
    hideTip?: string,
    editDoneLabel?: string,
    disabled?: boolean,
    rating?: boolean
}

export type FeedbackState={
    docWidth: number,
    docHeight: number,
    winHeight: number,
    shotOpen: boolean,
    loading: boolean,
    screenshotEdit: boolean,
    editMode: boolean,
    toolBarType: 'hightlight'|'black',
    hightlightItem: Array<any>,
    blackItem: Array<any>,
    text: string,
    textError: string,
    feedbackVal: string|null,
}

export const getSysInfo=(stringify?: boolean): sysInfoType=>{}
export const defaultSysInfo: sysInfoType

/**
 * 
 * Feedback Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export class Feedback extends React.Component<FeedbackProps,FeedbackState>{}

export default Feedback