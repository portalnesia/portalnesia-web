export type Without<T,K> = {
    [L in Exclude<keyof T,K>]: T[L]
}

export type CopyPartial<Base,WhichPartial extends keyof Base> = Omit<Base,WhichPartial> & Partial<Base>

export type CopyRequired<Base,WhichRequired extends keyof Base> = Base & Pick<Base,WhichRequired>

export type IDate = {
    format:string,
    timestamp: number
}
export type ISeen = {
    number: number,
    format: string
}