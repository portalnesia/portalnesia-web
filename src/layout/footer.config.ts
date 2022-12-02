import config from '@src/config'

export type IFooter = {
  name: string,
  link?:string,
  exlink?:string
}

export const generalFooter: IFooter[] = [
  {
    name:"Contact",
    link:"/contact"
  },{
    name:"Status",
    exlink:config.url.status
  },
  {
    name:"Terms of Services",
    link:"/pages/terms-of-service"
  },{
    name:"Privacy Policy",
    link:"/pages/privacy-policy"
  },{
    name:"Cookie Policy",
    link:"/pages/cookie-policy"
  },{
    name:"Donate",
    exlink:"https://paypal.me/adityatranasuta"
  }
]

export const featuresFooter: IFooter[] = [{
  name:"News",
  link:"/news"
},{
  name:"Chord",
  link:"/chord"
},{
  name:"Twibbon",
  link:"/twibbon"
},{
  name:"Blog",
  link:"/blog"
},{
  name:"Quiz",
  link:"/quiz"
},{
  name:"URL Shortener",
  link:'/url'
}]

export const toolsFooter: IFooter[] = [{
  name:"Transform Coordinate",
  link:'/geodata/transform'
},{
  name:"QR Code Generator",
  link:'/qr-code'
},{
  name:"Parse HTML",
  link:"/parse-html"
},{
  name:"Random Number Generator",
  link:"/random-number"
},{
  name:"Downloader",
  link:"/downloader"
},{
  name:"Images Checker",
  link:"/images-checker"
}]

export const footerMenu: {header:string,child:IFooter[]}[] = ([
  {
    header:"Features",
    child:featuresFooter
  },{
    header:"Tools",
    child:toolsFooter
  },{
    header:"Help",
    child:generalFooter
  }
])