
export const NAVBAR_HEIGHT = 64;

export type INavbarChild = {
    name: string,
    link:string
    tooltip?: string
    icon?: string
    desc?: string
}

export type INavbar = {
    name: string,
    link: string,
    tooltip?: string
    icon: string
    iconActive?: string
    desc?: string
    child?: INavbarChild[]
}

export const navbarMenu: INavbar[] = [{
    name:"Chord",
    link:"/chord",
    icon: 'material-symbols:music-video-outline',
    iconActive: 'material-symbols:music-video'
},{
    name:"News",
    link:"/news",
    icon: 'fluent:news-20-regular',
    iconActive: 'fluent:news-20-filled'
},{
    name:"Blog",
    link:"/blog",
    icon: 'material-symbols:library-books-outline',
    iconActive: 'material-symbols:library-books'
},{
    name:"URL Shortener",
    link:"/url",
    icon: 'mdi:link-box-variant-outline',
    iconActive: 'mdi:link-box-variant'
},{
    name:"Twibbon",
    link:"/twibbon",
    icon: 'material-symbols:photo-frame-outline',
    iconActive: 'material-symbols:photo-frame'
},{
    name:"Quiz",
    link:"/quiz",
    icon: 'fluent:clipboard-task-list-ltr-20-regular',
    iconActive: 'fluent:clipboard-task-list-ltr-20-filled'
},{
    name:"More",
    link:"",
    icon:"fe:app-menu",
    child:[{
        name:"Transform Coordinate",
        link:"/geodata/tranasform-coordinate"
    },{
        name:"QR Code Generator",
        link:"/qr-code"
    },{
        name:"Random Number Generator",
        link:"/geodata/tranasform-coordinate"
    },{
        name:"Parse HTML",
        link:"/parse-html"
    },{
        name:"Downloader",
        link:"/downloader"
    },{
        name:"Images Checker",
        link:"/images-checker"
    }]
}]