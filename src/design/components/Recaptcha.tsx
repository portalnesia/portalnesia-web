import React from 'react'
import {ApiError} from '@design/hooks/api'
import Script from 'next/script'
import config from '@src/config'

export type RecaptchaProps={
    action?: 'social'|'login',
    onReady?:()=> void
}

class Recaptcha extends React.PureComponent<RecaptchaProps>{
    constructor(props: RecaptchaProps){
        super(props)
        this.execute=this.execute.bind(this)
    }
    static defaultProps={
        action:'social',
        onReady:()=>{}
    }
    execute(){
        return new Promise<string>((res,rej)=>{
            (window as any).grecaptcha?.execute(config.recaptcha, {action: this.props.action||'social'})
            .then((token: string)=>{
                res(token)
            })
            .catch((e: any)=>{
                rej(new ApiError(e?.message||"Failed to get recaptcha token. Please try again"))
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
        return <Script key='grecaptcha' strategy="lazyOnload" onLoad={()=>this.onLoad()} src={`https://www.google.com/recaptcha/api.js?render=${config.recaptcha}`} />
    }
}

export default Recaptcha;