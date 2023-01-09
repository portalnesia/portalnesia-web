import React from 'react'
import {useRouter} from 'next/router'
import Head from 'next/head'
import { NextSeo,LogoJsonLd } from 'next-seo';
import { portalUrl, staticUrl } from '@utils/main';
import { Span } from '@design/components/Dom';

const titleMeta="Page Not Found – Portalnesia";
const descMeta="The page you are looking for cannot be found anywhere.";
const imageMeta=staticUrl("og_image_default.png")

const Custom404=()=>{
    const router=useRouter();
    
    return (
        <div>
            <NextSeo
                title={titleMeta}
                description={descMeta}
                nofollow
                noindex
                additionalMetaTags={[{
                  property:'fb:pages',
                  content:'105006081218628'
                },{
                  name:'viewport',
                  content:'width=device-width, initial-scale=1, shrink-to-fit=yes'
                }]}
                openGraph={{
                  url: portalUrl(router.asPath),
                  title: titleMeta,
                  description: descMeta,
                  images: [
                    { url: imageMeta },
                  ],
                  site_name: "Portalnesia",
                  type:'website'
                }}
                facebook={{appId:'313154633008072'}}
                twitter={{
                  handle: '@putuaditya_sid',
                  site: '@portalnesia1',
                  cardType: 'summary_large_image',
                }}
            />
            <LogoJsonLd
                logo={staticUrl('icon/android-chrome-512x512.png')}
                url={portalUrl()}
            />
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div id="article">
                <h1>Page not found!</h1>
                <div>
                    <p>The page you are looking for cannot be found anywhere.</p><p>If you feel this is a mistake, please contact us at <a href="mailto:support@portalnesia.com"><Span sx={{color:'#dc8100'}}>support@portalnesia.com</Span></a>.</p>
                    <p>&mdash; Portalnesia</p>
                </div>
            </div>
            <style jsx global>{`
                body { text-align: center; padding: 150px;background-color:#2f6f4e !important;font: 20px Helvetica, sans-serif; color: #FFF!important;}
                h1 { font-size: 40px; }
                p { font-size: 20px; }
                #article { display: block; text-align: left; max-width: 650px; margin: 0 auto; }
                @media(max-width:776px){
                    body{padding:150px 50px;}
                }
            `}</style>
        </div>
    );
}
export default Custom404;