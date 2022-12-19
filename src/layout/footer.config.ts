import config from '@src/config'

export type IFooter = {
  name: string,
  link?:string,
  exlink?:string
}

export const generalFooter: IFooter[] = [
  {
    name:"Contact",
    link:"/contact?utm_source=portalnesia+web&utm_medium=footer"
  },{
    name:"Status",
    exlink:config.url.status
  },
  {
    name:"Terms of Services",
    link:"/pages/terms-of-service?utm_source=portalnesia+web&utm_medium=footer"
  },{
    name:"Privacy Policy",
    link:"/pages/privacy-policy?utm_source=portalnesia+web&utm_medium=footer"
  },{
    name:"Cookie Policy",
    link:"/pages/cookie-policy?utm_source=portalnesia+web&utm_medium=footer"
  },{
    name:"Donate",
    exlink:"https://paypal.me/adityatranasuta"
  }
]

export const featuresFooter: IFooter[] = [{
  name:"News",
  link:"/news?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Chord",
  link:"/chord?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Twibbon",
  link:"/twibbon?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Blog",
  link:"/blog?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Quiz",
  link:"/quiz?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"URL Shortener",
  link:'/url?utm_source=portalnesia+web&utm_medium=footer'
}]

export const toolsFooter: IFooter[] = [{
  name:"Transform Coordinate",
  link:'/geodata/transform?utm_source=portalnesia+web&utm_medium=footer'
},{
  name:"QR Code Generator",
  link:'/qr-code?utm_source=portalnesia+web&utm_medium=footer'
},{
  name:"Parse HTML",
  link:"/parse-html?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Random Number Generator",
  link:"/random-number?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Downloader",
  link:"/downloader?utm_source=portalnesia+web&utm_medium=footer"
},{
  name:"Images Checker",
  link:"/images-checker?utm_source=portalnesia+web&utm_medium=footer"
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