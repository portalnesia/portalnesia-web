import React from 'react'
import Button from '@mui/material/Button';
import {useRouter} from 'next/router'
import Head from 'next/head'
import { NextSeo,LogoJsonLd } from 'next-seo';

const Custom404=()=>{
    const router=useRouter();
    const titleMeta="Page Not Found – Portalnesia";
    const descMeta="The page you are looking for cannot be found anywhere.";
    const imageMeta='/icon/android-chrome-512x512.png';
    return (
        <div>
            <NextSeo
                title={titleMeta}
                description={descMeta}
                nofollow
                noindex
                additionalMetaTags={[{
                  key:'meta-fb-pages',
                  property:'fb:pages',
                  content:'105006081218628'
                },{
                  key:'meta-viewport',
                  name:'viewport',
                  content:'width=device-width, initial-scale=1, shrink-to-fit=yes'
                }]}
                openGraph={{
                  url: `${process.env.URL}${router.asPath}`,
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
                logo={`${process.env.CONTENT_URL}/icon/android-chrome-512x512.png`}
                url={process.env.URL}
            />
            <Head>
                <meta name="msapplication-TileColor" content="#2f6f4e" />
                <meta name="theme-color" content="#2f6f4e" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div id="article">
                <h1>Page not found!</h1>
                <div>
                    <p>The page you are looking for cannot be found anywhere.</p><p>If you feel this is a mistake, please contact us at <a href="mailto:support@portalnesia.com">support@portalnesia.com</a>.</p>
                    <p>&mdash; Portalnesia</p>
                </div>
                <Button
                    variant='outlined'
                    style={{color:'#fff'}}
                    onClick={()=>router.back()}
                >
                   &larr; Go Back
                </Button>
            </div>
            <style jsx global>{`
                body { text-align: center; padding: 150px;background-color:#2f6f4e !important;font: 20px Helvetica, sans-serif; color: #FFF!important;}
                h1 { font-size: 40px; }
                p { font-size: 23px; }
                #article { display: block; text-align: left; max-width: 650px; margin: 0 auto; }
                a { color: #dc8100; text-decoration: none; }
                a:hover { color: #333; text-decoration: none; }
                @media(max-width:776px){
                    body{padding:150px 50px;}
                }
            `}</style>
        </div>
    );
}

export default Custom404;