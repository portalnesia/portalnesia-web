export type arrayNotificationType={
    type: string,
    message: string,
    read: boolean,
    room?:number|null,
    userid?:number|null
    picture: null|string,
    name: string,
    timestamp: number
    url: string|{pathname:string,query?:Record<string,string>},
    id: string|number,
    as: string|{pathname:string,query?:Record<string,string>},
    username?: string,
    support_id?: string,
    comment_type?: string
}
export type dataNotificationType={
    error: number|boolean,
    status: string,
    total: number,
    notifications: Array<arrayNotificationType>
} | null

export type outputType={
    data: dataNotificationType,
    error: boolean,
    loading: boolean,
    total: number,
    setTotal: (t: number,validate?: boolean)=>void,
    onClick:(index: number,dt: arrayNotificationType)=>void,
    refreshNotification: (data?: any, shouldRevalidate?: boolean | undefined) => Promise<any>
}