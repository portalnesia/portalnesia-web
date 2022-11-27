import crypto from './crypto'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import pnPlugins from '@portalnesia/dayjs-plugins'
import config from '@src/config'
import 'dayjs/locale/id'

dayjs.extend(relativeTime);
dayjs.extend(pnPlugins);

export function getDayJs(date?: string | number | Date | dayjs.Dayjs | null,defaultNow=false) {
    let datetime: dayjs.Dayjs;
    let dt = date;
    if(typeof date === 'undefined') return dayjs();
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
    if(!datetime.isValid()) {
        if(defaultNow) return dayjs();
        throw new Error('date error');
    }
    return datetime;
}
function parsePath(path?: string) {
    return path ? path.startsWith("/") ? path : `/${path}` : "/"
}
export function staticUrl(path?: string) {
    return config.url.static + parsePath(path);
}
export function linkUrl(path?: string) {
    return config.url.link + parsePath(path);
}
export function accountUrl(path?: string) {
    return config.url.account + parsePath(path);
}
export function href(path?: string) {
    const url = !path ? '/' : /^https?\:\/\/portalnesia\.com/.test(path) ? path.replace(/^https?\:\/\/portalnesia\.com/,'') : path;
    return url;
}
export function portalUrl(path?: string) {
    return process.env.NEXT_PUBLIC_URL + parsePath(path);
}
export function profileUrl<D=string|null>(path: string|null) {
    return ((path === 'images/avatar.png' || path === null) ? null : analyzeStaticUrl(path)) as unknown as D;
}
export function analyzeStaticUrl(path: string) {
    if((/^https?/.test(path))) {
        return staticUrl(`img/url?image=${encodeURIComponent(path)}`)
    } else {
        return staticUrl(`img/content?image=${encodeURIComponent(path)}`);
    }
}
export function createToken(other?: Record<string,any>) {
    let token: Record<string,any>={date:getDayJs().toDate()};
    if(other) {
        Object.keys(other).map((key,i)=>{
            token[key] = other[key];
        })
    }
    return crypto.encrypt(JSON.stringify(token));
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
        const date = getDayJs(token?.date,false).add(time[0],time[1]);
        if(date.isBefore(dayjs())) return undefined;
        return token as D & BaseVerifyToken
    } catch {
        return undefined;
    }
}