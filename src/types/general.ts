

export type IPages<D extends {} = any> = {
    data: D
    meta?: {
        title: string
        desc?: string
    }
}

export type Without<T,K> = {
    [L in Exclude<keyof T,K>]: T[L]
}

export type ISeen = {
    number: number,
    format: string
}

export type IDate = Date

declare global {
    interface Window {
        grecaptcha?: number
        
    }
}