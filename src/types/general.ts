

export type IPages<D extends {} = any> = {
    data: D
}

export type Without<T,K> = {
    [L in Exclude<keyof T,K>]: T[L]
}

declare global {
    interface Window {
        grecaptcha?: number
        
    }
}