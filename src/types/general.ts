

export type IPages<D extends {} = any> = {
    data: D
    meta?: {
        title: string
        desc?: string
        image?: string
    }
}

export type Without<T, K> = {
    [L in Exclude<keyof T, K>]: T[L]
}
export type CopyPartial<Base, WhichPartial extends keyof Base> = Omit<Base, WhichPartial> & Partial<Base>
export type CopyRequired<Base, WhichRequired extends keyof Base> = Omit<Base, WhichRequired> & ({ [P in keyof Pick<Base, WhichRequired>]-?: Base[P] })

export type ISeen = {
    number: number,
    format: string
}

/**
 * Date string
 */
export type IDate = string

declare global {
    interface Window {
        grecaptcha?: number
        gtag?: any
    }
}