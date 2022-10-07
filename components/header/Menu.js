import {Info,Dashboard,LibraryMusic,Twitter,Terrain,Build,Event,Link,
    LibraryBooks,Filter,ListAlt} from '@mui/icons-material'


export const otherMenuArray=[
    {
        key: 'contact',
        name: 'Contact',
        link: '/contact',
        short:'Shift + C'
    },
    {
        key: 'status',
        name: 'Status',
        exlink: 'https://status.portalnesia.com'
    },
    {
        key: 'terms',
        name: 'Terms of Services',
        link: '/pages/[slug]',
        as:'/pages/terms-of-service'
    },
    {
        key: 'privacy',
        name: 'Privacy Policy',
        link: '/pages/[slug]',
        as:'/pages/privacy-policy'
    },
    {
        key: 'cookie',
        name: 'Cookie Policy',
        link: '/pages/[slug]',
        as:'/pages/cookie-policy'
    },
    {
        key: 'donate',
        name: 'Donate',
        exlink: 'https://paypal.me/adityatranasuta'
    },
]

export const menuArray=[
    /*{
        key: 'corona',
        name: 'COVID-19',
        icon: <Info />,
        link:'/corona'
    },*/
    {
      key: 'home',
      name: 'Home',
      icon: <Dashboard />,
      link:'/',
      short: 'G + H'
    },
    {
        key: 'chord',
        name: 'Chord',
        icon: <LibraryMusic />,
        link:'/chord/[[...slug]]',
        as:'/chord',
        short: 'G + C'
    },
    {
        key: 'news',
        name: 'News',
        icon: <path fill="currentColor" d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" />,
        fontAwesome:true,
        link:'/news',
        short: 'G + N'
    },
    {
        key: 'thread',
        name: 'Twitter Thread Reader',
        icon: <Twitter />,
        link:'/twitter/thread/[[...slug]]',
        as:'/twitter/thread',
        short: 'G + T + R'
    },
    {
        key: 'geodata',
        name: 'Geodata',
        icon: <Terrain />,
        child:[
            {
                key: 'transform',
                name: 'Transform Coordinate',
                link: '/geodata/transform',
                short: 'G + G + T'
            },
        ]
    },
    {
        key: 'tools',
        name: 'Tools',
        icon: <Build />,
        child:[
            {
                key: 'qr_code',
                name: 'QR Code Generator',
                link: '/qr-code/[[...slug]]',
                as:'/qr-code',
                short: 'G + Q + G'
            },
            {
                key: 'random_number',
                name: 'Random Number Generator',
                link: '/random-number',
                short: 'G + N + G'
            },
            {
                key: 'parse_html',
                name: 'Parse HTML',
                link: '/parse-html',
                short: 'G + P + H'
            },
            {
                key: 'downloader',
                name: 'Downloader',
                link: '/downloader',
                short: 'G + D'
            },
            {
                key: 'images_check',
                name: 'Images Checker',
                link: '/images-checker',
                short: 'G + I + C'
            },
            {
                key: 'twitter_menfess',
                name: 'Twitter Menfess',
                link: '/twitter/docs'
            },
        ]
    },
    /*{
        key: 'events',
        name: 'Events',
        icon: <Event />,
        child: [
          {
            key: 'calendar',
            name: 'Calendar',
            link: '/events',
            short: 'G + E'
            
          },
          {
            key: 'my-events',
            name: 'My Events',
            link: '/events/my-events'
          },
        ]
    }*/
    {
        key: 'url',
        name: 'URL Shortener',
        icon: <Link />,
        link:'/url',
        short: 'G + U'
    }
];

export const allMenuArray=[
    //...menuArray,
    {
        key: 'blog',
        name: 'Blog',
        icon: <LibraryBooks />,
        link:'/blog',
        short: 'G + B'
    },
    {
        key: 'twibbon',
        name: 'Twibbon',
        icon: <Filter />,
        link:'/twibbon',
        short: 'G + T'
    },
    {
        key: 'quiz',
        name: 'Quiz',
        icon: <ListAlt />,
        link:'/quiz',
        short: 'G + Q'
    },
]

export const menuNoSidebar=[
    {
        key: 'news',
        name: 'News',
        icon: <path fill="currentColor" d="M20,11H4V8H20M20,15H13V13H20M20,19H13V17H20M11,19H4V13H11M20.33,4.67L18.67,3L17,4.67L15.33,3L13.67,4.67L12,3L10.33,4.67L8.67,3L7,4.67L5.33,3L3.67,4.67L2,3V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V3L20.33,4.67Z" />,
        fontAwesome:true,
        link:'/news'
    },
    {
        key: 'chord',
        name: 'Chord',
        icon: <LibraryMusic />,
        link:'/chord/[[...slug]]',
        as:'/chord'
    },
    {
        key: 'thread',
        name: 'Twitter Thread Reader',
        icon: <Twitter />,
        link:'/twitter/thread/[[...slug]]',
        as:'/twitter/thread'
    },
    {
        key: 'transform',
        name: 'Transform Coordinate',
        link: '/geodata/transform',
        icon: <Terrain />
    }
]