
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
    desc:"A collection of guitar chords with transpose tools, auto scroll, font sizer, and print features that make it easy to learn guitar",
    icon: 'material-symbols:music-video-outline',
    iconActive: 'material-symbols:music-video'
},{
    name:"News",
    link:"/news",
    desc:"A collection of news that is updated every day",
    icon: 'fluent:news-20-regular',
    iconActive: 'fluent:news-20-filled'
},{
    name:"Blog",
    link:"/blog",
    desc:"Turn your thoughts into writing and share it easily",
    icon: 'material-symbols:library-books-outline',
    iconActive: 'material-symbols:library-books'
},{
    name:"URL Shortener",
    link:"/url",
    desc:"Shorten your long URLs so that it's easy to share with others",
    icon: 'mdi:link-box-variant-outline',
    iconActive: 'mdi:link-box-variant'
},{
    name:"Twibbon",
    link:"/twibbon",
    desc:"Create your own twibbon or edit your photo to twibbon that is already available and share it easily",
    icon: 'material-symbols:photo-frame-outline',
    iconActive: 'material-symbols:photo-frame'
},{
    name:"Quiz",
    link:"/quiz",
    desc:"Create your own quiz and share with friends or answer a few quizzes",
    icon: 'fluent:clipboard-task-list-ltr-20-regular',
    iconActive: 'fluent:clipboard-task-list-ltr-20-filled'
},{
    name:"More",
    link:"",
    icon:"fe:app-menu",
    child:[{
        name:"Transform Coordinate",
        link:"/geodata/transform",
        desc:"Insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection"
    },{
        name:"QR Code Generator",
        link:"/qr-code",
        desc:"Generate any type of QR Code in one click"
    },{
        name:"Random Number Generator",
        link:"/random-number",
        desc:"Generate number randomly"
    },{
        name:"Parse HTML",
        link:"/parse-html",
        desc:"Parse your HTML code into XML code compatible with all the Blogger templates or other blogs systems"
    },{
        name:"Downloader",
        link:"/downloader",
        desc:"Download media from supported sources (twitter, youtube, soundcloud)"
    },{
        name:"Images Checker",
        link:"/images-checker",
        desc:"Online tools to help you quickly identify unseemly images"
    }]
}]