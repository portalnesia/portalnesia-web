
export const NAVBAR_HEIGHT = 64;
export const NAVBAR_HEIGHT_DESKTOP = 92;
export const DRAWER_WIDTH = 280;

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
    icon?: string
    iconActive?: string
    desc?: string
    child?: INavbarChild[]
}

/**
 * QUIZ
    icon: 'fluent:clipboard-task-list-ltr-20-regular',
    iconActive: 'fluent:clipboard-task-list-ltr-20-filled'
 */
export const navbarMenu: INavbar[] = [{
    name:"Chord",
    link:"/chord?utm_source=portalnesia+web&utm_medium=header",
    desc:"A collection of guitar chords with transpose tools, auto scroll, font sizer, and print features that make it easy to learn guitar",
    icon: 'material-symbols:music-video-outline',
    iconActive: 'material-symbols:music-video'
},{
    name:"News",
    link:"/news?utm_source=portalnesia+web&utm_medium=header",
    desc:"A collection of news that is updated every day",
    icon: 'fluent:news-20-regular',
    iconActive: 'fluent:news-20-filled'
},{
    name:"Blog",
    link:"/blog?utm_source=portalnesia+web&utm_medium=header",
    desc:"Turn your thoughts into writing and share it easily",
    icon: 'material-symbols:library-books-outline',
    iconActive: 'material-symbols:library-books'
},{
    name:"URL Shortener",
    link:"/url?utm_source=portalnesia+web&utm_medium=header",
    desc:"Shorten your long URLs so that it's easy to share with others",
    icon: 'mdi:link-box-variant-outline',
    iconActive: 'mdi:link-box-variant'
},{
    name:"Twibbon",
    link:"/twibbon?utm_source=portalnesia+web&utm_medium=header",
    desc:"Create your own twibbon or edit your photo to twibbon that is already available and share it easily",
    icon: 'material-symbols:photo-frame-outline',
    iconActive: 'material-symbols:photo-frame'
},{
    name:"Quiz",
    link:"/quiz?utm_source=portalnesia+web&utm_medium=header",
    desc:"Create your own quiz and share with friends or answer a few quizzes",
    icon: 'fluent:clipboard-task-list-ltr-20-regular',
    iconActive: 'fluent:clipboard-task-list-ltr-20-filled'
},{
    name:"More",
    link:"",
    icon:"fe:app-menu",
    child:[{
        name:"Transform Coordinate",
        link:"/geodata/transform?utm_source=portalnesia+web&utm_medium=header",
        desc:"Insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection"
    },{
        name:"QR Code Generator",
        link:"/qr-code?utm_source=portalnesia+web&utm_medium=header",
        desc:"Generate any type of QR Code in one click"
    },{
        name:"Random Number Generator",
        link:"/random-number?utm_source=portalnesia+web&utm_medium=header",
        desc:"Generate number randomly"
    },{
        name:"Parse HTML",
        link:"/parse-html?utm_source=portalnesia+web&utm_medium=header",
        desc:"Parse your HTML code into XML code compatible with all the Blogger templates or other blogs systems"
    },{
        name:"Downloader",
        link:"/downloader?utm_source=portalnesia+web&utm_medium=header",
        desc:"Download media from supported sources (twitter, youtube, soundcloud)"
    },{
        name:"Images Checker",
        link:"/images-checker?utm_source=portalnesia+web&utm_medium=header",
        desc:"Online tools to help you quickly identify unseemly images"
    }]
}]

export const dashboardMenu: INavbar[] = [{
    name:"Dashboard",
    link:"/dashboard?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:dashboard-rounded',
},{
    name:"Chord",
    link:"/dashboard/chord?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:music-video-outline',
},{
    name:"Blog",
    link:"/dashboard/blog?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:library-books-outline',
},{
    name:"Twibbon",
    link:"/dashboard/twibbon?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:photo-frame-outline',
},{
    name:"Quiz",
    link:"/dashboard/quiz?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'fluent:clipboard-task-list-ltr-20-regular',
}]

export const adminMenu: INavbar[] = [{
    name:"Pages",
    link:"/admin/pages?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:library-books-outline',
},{
    name:"Blog",
    link:"/admin/blog?utm_source=portalnesia+web&utm_medium=navbar",
    icon: 'material-symbols:library-books-outline',
}]