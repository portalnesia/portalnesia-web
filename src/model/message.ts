import { Without } from "@type/general"
import { ICommentReply } from "./comment"
import { UserPagination } from "./user"

export interface UsersPagination extends UserPagination {
    verify: boolean
}

export type IRoom = {
    id: number,
    timestamp: Date|null,
    read: boolean,
    pubkey?: string,
    user: UsersPagination
}

export type ISupportRoom = {
    id: string,
    timestamp: Date,
    read: boolean,
    status: string,
    subject: string,
    user: UserPagination,
    ticket:{
        name:string,
        email: string
    }
}

export type IMessages = {
    id: number,
    room: number,
    remove: boolean,
    read: boolean,
    delivered: boolean,
    from: number|string,
    to: number|string,
    message: string|null,
    image: string|null,
    timestamp: Date,
    type:string
}

export type ISupportNotification = ISupportRoom & ({
    type:"support"
    message: string
})

export type INotificationNotification = IRoom & ({
    type:"notification"
    message: string
})

export type IFollowNotification = {
    id: string
    type:"follow"
    message:string
    timestamp: Date
    user: UserPagination
}

export type ICommentNotification = Without<ICommentReply,'comment'> & {
    type:"comment"
    message:string
}

export type INotifications = ISupportNotification | INotificationNotification | IFollowNotification | ICommentNotification