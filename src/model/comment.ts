import { CopyPartial, IDate } from "@type/general"
import { UserPagination } from "./user"

export type ICommentContent={
    id: number,
    type: string,
    link: string,
    userid: number
}

export type ICommentReply = {
    id: number,
    content: ICommentContent,
    user: CopyPartial<UserPagination,'picture'|'username'|'id'>,
    timestamp: IDate,
    comment: string,
    block: boolean,
    can_deleted: boolean
}

export type IReply = {
    page: number,
    total_page: number,
    can_load: boolean,
    total: number,
    data: ICommentReply[]
}

export type CommentType = "news" | "twitter_thread" | "chord" | "blog" | "url" | "media"

export interface IComment extends ICommentReply {
    replies?: IReply
}