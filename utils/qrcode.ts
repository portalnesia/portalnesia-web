import {Options} from 'qr-code-styling'

module QrCode {
  export class QrError extends Error {
    constructor(msg: string,type?: string) {
      super(msg);
      this.name=`[QrCodeError]${type ? ` ${type}` : ''}`
    }
  }
  export function url(url: string) {
    if(!/^(http(s)?|otpauth):\/\//.test(url)) throw new QrError('Invalid URL','url');
    return url;
  }
  export function text(text: string) {
    return text;
  }
  export type IVCard = {
    first_name: string,
    telephone: string,
    website?: string,
    last_name?: string,
    company?: string,
    position?: string,
    address?: string,
    city?: string,
    country?: string,
    post_code?: string
  }
  export function vcard(input: IVCard) {
    if(!input.first_name || input.first_name.length === 0) throw new QrError('First name cannot be empty','vcard');
    if(!input.telephone || input.telephone.length === 0) throw new QrError('telephone number cannot be empty','vcard');
    if(input.website && !/^http(s)?:\/\//.test(input.website)) throw new QrError('Invalid website format','vcard');

    input.first_name = input.first_name.replace(/(\\|:|;|,)/gim," ");
    input.last_name = input.last_name && input.last_name.length > 0 ? input.last_name.replace(/(\\|:|;|,)/gim," ") : undefined;
    input.company = input.company && input.company.length > 0 ? input.company.replace(/(\\|:|;|,)/gim," ") : undefined;
    input.position = input.position && input.position.length > 0 ? input.position.replace(/(\\|:|;|,)/gim," ") : undefined;
    input.address = input.address && input.address.length > 0 ? input.address.replace(/(\\|:|;|,)/gim," ") : undefined;
    input.city = input.city && input.city.length > 0 ? input.city.replace(/(\\|:|;|,)/gim," ") : undefined;
    input.country = input.country && input.country.length > 0 ? input.country.replace(/(\\|:|;|,)/gim," ") : undefined;

    let text=`BEGIN:VCARD\nVERSION:4.0\nN:${input.first_name};${input.last_name ? `${input.last_name};` : ''}\n`;
    text+=`FN:${input.first_name}${input.last_name ? ` ${input.last_name}` : ''}\n`;
    if(input.website && input.website.length > 0) text+=`URL:${input.website}\n`;
    if(input.company) text+=`ORG:${input.company}\n`;
    if(input.position) text+=`TITLE:${input.position}\n`;
    text+=`TEL;TYPE=home,voice;VALUE=uri:tel:${input.telephone}\n`;
    if(input.address) {
      text+=`ADR;TYPE=HOME;LABEL=\"${input.address}\n`;
      if(input.city) text+=`${input.city}\n`;
      if(input.post_code) text+=`${input.post_code}\n`;
      if(input.country) text+=`${input.country}\n`;
      text+=`\":;;${input.address};${input.city ? input.city : ''};;${input.post_code ? input.post_code : ''};${input.country ? input.country : ''}\n`;
    }
    text+=`END:VCARD`;
    return text;
  }

  export function email(input: {email: string,subject?: string,email_content?: string}) {
    if(!input.email || input.email.length === 0) throw new QrError('Invalid Email','email');
    let text = `mailto:${input.email}`;
    let isi: string[]=[];
    if(input.subject && input.subject.length > 0) isi.push(`subject=${encodeURIComponent(input.subject)}`);
    if(input.email_content && input.email_content.length > 0) isi.push(`body=${encodeURIComponent(input.email_content)}`);
    if(isi.length > 0) text+=`?${isi.join("&")}`;

    return text;
  }

  export function telephone(telp: string) {
    if(!telp || telp.length === 0) throw new QrError("Invalid telephone number",'telephone');
    return `tel:${telp}`;
  }

  export function sms(input:{telephone: string,sms_content?:string}) {
    if(!input.telephone || input.telephone.length === 0) throw new QrError("Invalid telephone number",'sms');
    let text=`smsto:${input.telephone}`;
    if(input.sms_content && input.sms_content.length > 0) text+=`:${encodeURIComponent(input.sms_content)}`;
    return text;
  }

  export type IWifi = {
    encryption: 'nopass'|'wpa'|'wep',
    ssid: string,
    password?: string,
    hidden?: boolean
  }
  export function wifi(input: IWifi) {
    if(!input.encryption || !['nopass','wpa','wep'].includes(input.encryption)) throw new QrError("Invalid encryption",'wifi');
    input.encryption = input.encryption === 'nopass' ? 'nopass' : input.encryption.toUpperCase() as IWifi['encryption'];
    if(!input.ssid || input.ssid.length === 0) throw new QrError("SSID cannot be empty",'wifi');
    if(input.encryption !== 'nopass' && (!input.password || input.password.length === 0)) throw new QrError('Password cannot be empty','wifi');
    input.ssid = input.ssid.replace(/\\/gim,'\\').replace(/\:/gim,'\:').replace(/\;/gim,'\;').replace(/\,/gim,'\,');
    input.password = input.password && input.password.length > 0 ? input.password.replace(/\\/gim,'\\').replace(/\:/gim,'\:').replace(/\;/gim,'\;').replace(/\,/gim,'\,') : undefined;

    let text=`WIFI:T:${input.encryption};S:${input.ssid};`;
    if(input.hidden) text+=`H:true;`;
    if(input.encryption !== 'nopass') text+=`P:${input.password};`
    text+=`;`;
    return text;
  }

  export function geographic(input: {latitude: number,longitude: number}) {
    if(!input.latitude || !input.longitude) throw new QrError('Latitude and Longitude cannot be empty','geographic');
    
    return `geo:${input.latitude},${input.longitude}`
  }

  export const qrOptions: Options = {
    width:500,
    height:500,
    type:'canvas',
    data:'https://portalnesia.com',
    image:'https://content.portalnesia.com/icon/qrcode.png',
    dotsOptions:{
      color:'#2f6f4e',
      type:'rounded'
    },
    imageOptions:{
      hideBackgroundDots:true,
      imageSize:0.3,
      margin:5,
      crossOrigin:'anonymous'
    },
    qrOptions:{
      mode:'Byte',
      errorCorrectionLevel:'H'
    },
    cornersDotOptions:{
      color:'#2f6f4e'
    },
    cornersSquareOptions:{
      type:'extra-rounded',
      color:'#c24741'
    }
  }

  export function getOptions(data: string,options: Partial<Options>): Options {
    return {
      ...qrOptions,
      ...options,
      data
    }
  }

  export async function create(options?: Options) {
    const QR = (await import('qr-code-styling')).default
    return new QR(options||qrOptions);
  }
}

export default QrCode