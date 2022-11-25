import crypto from './crypto';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc';
import pnPlugins,{IPNFormat} from '@portalnesia/dayjs-plugins' 
import 'dayjs/locale/id'

dayjs.extend(pnPlugins);
dayjs.extend(utc);
dayjs.extend(relativeTime);

export function getDayJs(date: string | number | Date | dayjs.Dayjs) {
    let datetime: dayjs.Dayjs;
    let dt = date;
    if(typeof date === 'string') {
        const parse = Number(date);
        if(!Number.isNaN(parse)) {
            if(parse.toString().length === 10 || parse.toString().length === 13) dt = parse;
        }
    }
    if(typeof dt === 'number' && dt.toString().length === 10) {
        datetime = dayjs.unix(dt);
    } else {
        datetime = dayjs(dt);
    }
    return datetime;
}

export function time_ago(date: string | number | Date | dayjs.Dayjs,locale?: 'en'|'id') {
    const datetime = getDayJs(date);
    if(locale) return datetime.locale('id').time_ago().format;
    return datetime.time_ago().format;
}
export function day_format(date: any,type: IPNFormat='minimal',locale?:'en'|'id') {
    const datetime = getDayJs(date);
    if(locale) return datetime.locale('id').pn_format(type);
    return datetime.pn_format(type);
}

export function staticUrl(path: string) {
    return process.env.CONTENT_URL + "/" + path;
}
export function href(path: string) {
    return process.env.URL + "/" + path;
}
export function linkUrl(path: string) {
    return process.env.LINK_URL + "/" + path;
}
export function accountUrl(path: string) {
    return process.env.ACCOUNT_URL + "/" + path;
}

export function analyzeStaticUrl(path: string) {
    if((/^https?/.test(path))) {
        return staticUrl(`img/url?image=${encodeURIComponent(path)}`)
    } else {
        return staticUrl(`img/content?image=${encodeURIComponent(path)}`);
    }
}

export function profileUrl<D=string|null>(path: string|null,withNull=true) {
    return ((path === 'images/avatar.png' || path === null) ? (withNull ? null : analyzeStaticUrl('images/avatar.png') ) : analyzeStaticUrl(path)) as unknown as D;
}

export async function getInstalledApps() {
    if(typeof navigator !== 'undefined') {
        const apps: {id: string,platform: string,version: string}[] = await (navigator as any).getInstalledRelatedApps();
        if(apps?.length > 0 && apps?.find(i=>i.id === "com.portalnesia.app") !== null) {
            return true;
        }
    }
    return false;
}

export function base64ToBlob(base64: string) {
    const splitDataURI = base64.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]


    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
}

type BaseVerifyToken = {token?: string,date: string}

export function verifyToken<D = Record<string,any>>(data_token: string,time: [number,dayjs.ManipulateType]=[1,"h"]) {
    try {
        let token_decrypt = crypto.decrypt(data_token);
        if(token_decrypt.length == 0) return undefined;
        const token = JSON.parse(token_decrypt) as D & BaseVerifyToken & ({datetime?: string});
        if(token?.datetime) {
            token.date = token.datetime
            delete token.datetime;
        }
        const date = getDayJs(token?.date).add(time[0],time[1]);
        if(date.isBefore(dayjs())) return undefined;
        return token as D & BaseVerifyToken
    } catch {
        return undefined;
    }
}