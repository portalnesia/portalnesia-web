import {dataUserType} from 'portal/types/user'

export type State = {
    user: dataUserType,
    config: Record<string,any>|null,
    theme: 'light'|'dark'|'auto',
    redux_theme: 'light'|'dark',
    toggleDrawer: boolean,
    report: any,
    totalNotif: number,
    token: string|null,
    debugToken: string|null,
    disableHotkeys: boolean,
    call:{
        isCall:boolean,
        interval:NodeJS.Timer|null,
        callType:string|null,
        callPerson:Record<string,any>,
        dialer:boolean,
        callShow:boolean,
        callAccept:boolean,
    }
}

export type ActionType = {
    type: string,
    payload?: any
}