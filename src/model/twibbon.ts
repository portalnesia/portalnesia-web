import { IDate } from "@type/general";
import { UserPagination } from "./user";

export type TwibbonPagination = {
    id: number,
    image: string,
    created: IDate,
    publish: boolean,
    slug: string,
    link: string,
    title: string,
    user: UserPagination
}

export interface TwibbonDetail extends TwibbonPagination {
    description?: string|null;
    block?: boolean;
}