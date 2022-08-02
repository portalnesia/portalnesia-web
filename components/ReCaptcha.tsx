import React from 'react'
import {useSelector} from 'react-redux'
import {ApiError} from 'portal/utils/api'
import {useNotif,VariantOption,OptionSnack} from 'portal/components/Notification'
import Script from 'next/script'

export type ReCaptchaProps={
    action?: 'social'|'login',
    onReady?:()=> void
}

interface ReCaptchaClassProps extends ReCaptchaProps {
    sitekey: string
    setNotif(msg: string|React.ReactNode,variant: VariantOption,option?: OptionSnack): void
}

export class ReCaptchaClass extends React.PureComponent<ReCaptchaClassProps>{
    constructor(props: ReCaptchaClassProps){
        super(props)
        this.execute=this.execute.bind(this)
    }
    static defaultProps={
        action:'social',
        onReady:()=>{}
    }
    execute(){
        return new Promise<string>((res,rej)=>{
            const setNotif = this.props.setNotif;
            (window as any).grecaptcha?.execute(this.props.sitekey, {action: this.props.action})
            .then((token: string)=>{
                res(token)
            })
            .catch((e: any)=>{
                setNotif("Failed to get recaptcha token. Please try again",true)
                rej(new ApiError(e?.message))
            });
        })
    }
    onLoad() {
        if((window as any).grecaptcha?.ready==='function') {
            (window as any).grecaptcha?.ready(()=>{
                this.props.onReady && this.props.onReady()
            });
        }
    }
    render(){
        return <Script key='grecaptcha' strategy="lazyOnload" onLoad={()=>this.onLoad()} src={`https://www.google.com/recaptcha/api.js?render=${this.props.sitekey}`} />
    }
}

/**
 * 
 * ReCaptcha Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const ReCaptcha=React.forwardRef<ReCaptchaClass,ReCaptchaProps>((props,ref)=>{
    const connect=useSelector<{config:{captcha_sitekey: string}},{sitekey: string}>(state=>({sitekey:state.config.captcha_sitekey}))
    const {setNotif}=useNotif();
    return <ReCaptchaClass {...props} sitekey={connect.sitekey} ref={ref} setNotif={setNotif} />
})
export default ReCaptcha;