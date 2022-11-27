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

export const footerMenu: {header:string,child:IFooter[]}[] = ([
  {
    header:"Company",
    child:[...generalFooter]
  },
])