import type { AlertProps } from "@mui/material";
import { domainCookie } from "@src/config";
import { deleteCookie, getCookie } from "cookies-next";

export function removeCookieMsg() {
    deleteCookie("msg",{domain:domainCookie})
}
export function getCookieMsg(){
    const cookie = getCookie("msg");
    if(typeof cookie !== "string") return undefined;
    const split = cookie.split("::");
    if(!['error','success','info','warning'].includes(split?.[0])) return undefined;
    return {
        severity:split[0].toLowerCase() as AlertProps['severity'],
        msg:split[1]
    }
}