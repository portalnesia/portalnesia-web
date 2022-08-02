import React from 'react';
import Button from '@mui/material/Button';
import {useRouter} from 'next/router'
import Head from 'next/head'
import { NextSeo,LogoJsonLd } from 'next-seo';

function Error({statusCode}){
    const router=useRouter();
    const titleMeta=statusCode===404 ? "Page Not Found – Portalnesia" : "Portalnesia";
    const descMeta=statusCode ? statusCode===404 ? "The page you are looking for cannot be found anywhere" : "Website Multifungsi,  Chord - Kunci Gitar dengan Transpose Auto Scroll, Baca Utas Twitter, Twitter Thread Reader, Membuat Twibbon, Pasang Twibbon, Berita Terbaru Terhangat Terkini, Download dari Youtube Twitter Soundcloud Instagram,  Buat Kuis Anda, Events, Perpendek URL" : "An error occured on client";
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
                <h1>{statusCode === 404 ? `Page not found!` : statusCode === 1234 ? `Our site is getting a little tune up and some love` : `Oooppss`}</h1>
                <div>
                    {statusCode && statusCode === 404 ? (
                        <React.Fragment>
                            <p>The page you are looking for cannot be found anywhere.</p><p>If you feel this is a mistake, please contact us at <a href="mailto:support@portalnesia.com">support@portalnesia.com</a>, thankyou.</p>
                        </React.Fragment>
                    ) : statusCode && statusCode === 1234 ? (
                        <React.Fragment>
                            <p>We apologize for the inconvenience, but we're performing some maintenance. You can still contact us at <a href="mailto:support@portalnesia.com">support@portalnesia.com</a>.</p><p>We'll be back up soon!</p>
                        </React.Fragment>
                    ) : statusCode ? (
                        <React.Fragment>
                            <p>We apologize for the inconvenience, an error occured on server-side.</p><p>Please report this problem to us at <a href="mailto:support@portalnesia.com">support@portalnesia.com</a>, thankyou.</p>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <p>We apologize for the inconvenience, an error occured on client-side.</p><p>Please report this problem to us at <a href="mailto:support@portalnesia.com">support@portalnesia.com</a>, thankyou.</p>
                        </React.Fragment>
                    )}
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

Error.getInitialProps = ({res,err})=>{
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return {statusCode}
}

export default Error;