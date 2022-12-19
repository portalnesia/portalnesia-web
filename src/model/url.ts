import { IDate } from "@type/general"

export type UrlPagination = {
    id: number,
    custom: string,
    long_url: string,
    short_url: string,
    created: IDate,
    click?: number,
    download_token?: string
}