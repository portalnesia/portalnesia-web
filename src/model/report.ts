import type { KontenReport,FeedbackReport,APIReport,UserReport } from "@type/redux"
import type { UserPagination } from "./user"
import { ICommentContent } from "./comment";
import { CopyPartial } from "@type/general";

type KomentarReport = {
    type:"komentar",
    information:{
        komentar:{
            id: number;
            content: ICommentContent;
            user: CopyPartial<UserPagination, "id" | "picture" | "username">;
            timestamp: Date;
            comment: string;
            block: boolean;
        }
    }
}

type IReport = KontenReport | FeedbackReport | APIReport | UserReport | KomentarReport

export type ReportDetail = IReport & {
    id: number
    user: UserPagination|null
    text: string|null
    url: string
    image: string|null
    system: Record<string,any>|null
    browser: string|null
    timestamp: Date
}