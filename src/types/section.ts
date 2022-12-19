export type ImageType<T> = (T extends true ? string|null : string)

export type LinkPossible = (string|{url:string,text:string})

export type ICardSectionsContent = {
    title: string
    image?: string
    link: string
    footer?: (string)[]
}

export type ITableSectionsContent = {
    /**
     * Table column without `#`
     */
    column: string[],
    body: LinkPossible[]
}

export type AnnounceSection = {
    title?: string
    /**
     * Iconify icon
     */
    icon?: string
    text: string
    link?: string,
    actions?: LinkPossible[]
}

export type ISectionContent = ({
    cards: ICardSectionsContent[]
}) | ({
    tables: ITableSectionsContent
}) | {
    announcement: AnnounceSection
}

export type ISections = {
    title: string
    help?: string
} & ISectionContent