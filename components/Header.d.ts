import React from 'react'

type typeOpenGraph<T>={
    type?: T
}

interface profileOpenGraph extends typeOpenGraph<'profile'> {
    profile?:{
        firstName?: string,
        lastName?: string,
        username?: string,
        gender?: 'male'|'female'
    }
}
interface articleOpenGraph extends typeOpenGraph<'article'> {
    article?:{
        publishedTime?: Date,
        modifiedTime?: Date,
        expirationTime?: Date,
        section?: string,
        authors?: Array<string>,
        tags?: Array<string>
    }
}

export type HeaderProps={
    /**
     * Title of HTML pages
     */
    title?: string,
    /**
     * Description of HTML pages
     */
    desc?: string,
    /**
     * Image meta of HTML pages
     */
    image?: string,
    /**
     * Keyword meta of HTML pages
     */
    keyword?: string,
    /**
     * Active key for Sidebar Menu
     */
    active?: string,
    children: React.ReactNode,
    /**
     * Subactive key for Sidebar Menu
     */
    subactive?: string,
    /**
     * If true, HTML pages will add 'no-index' meta
     * 
     * default false
     */
    noIndex?: boolean,
    /**
     * Canonical of HTML pages
     */
    canonical: string,
    /**
     * If true, template will have no margin and padding
     * 
     * default false
     * 
     */
    full?: boolean,
    /**
     * If true, no sidebar
     */
    noSidebar?: boolean,
    /**
     * Show Ads ? 
     */
    iklan?: boolean,
    /**
     * Additional Open Graph Meta Tag
     */
    openGraph?: typeOpenGraph<'website'> | profileOpenGraph | articleOpenGraph,
    /**
     * If true, show back icon in Header
     */
    notBack?: boolean,
    /**
     * Title of Header Navbar, default Portalnesia
     */
    navTitle?: string
}

/**
 * 
 * Header Parent Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Header: React.FunctionComponent<HeaderProps>
export default Header