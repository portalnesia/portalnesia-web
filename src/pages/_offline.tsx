import React from 'react';
import { useRouter } from 'next/router'
import Head from 'next/head'
import { NextSeo, LogoJsonLd } from 'next-seo';
import { portalUrl, staticUrl } from '@utils/main';
import Typography from '@mui/material/Typography';

const titleMeta = "Portalnesia";
const descMeta = "Website Multifungsi,  Chord - Kunci Gitar dengan Transpose Auto Scroll, Baca Utas Twitter, Twitter Thread Reader, Membuat Twibbon, Pasang Twibbon, Berita Terbaru Terhangat Terkini, Download dari Youtube Twitter Soundcloud Instagram,  Buat Kuis Anda, Events, Perpendek URL";
const imageMeta = staticUrl("og_image_default.png")

export default function Offline() {
    const router = useRouter();

    return (
        <div>
            <NextSeo
                title={titleMeta}
                description={descMeta}
                nofollow
                noindex
                additionalMetaTags={[{
                    property: 'fb:pages',
                    content: '105006081218628'
                }, {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1, shrink-to-fit=yes'
                }]}
                openGraph={{
                    url: portalUrl(router.asPath),
                    title: titleMeta,
                    description: descMeta,
                    images: [
                        { url: imageMeta },
                    ],
                    site_name: "Portalnesia",
                    type: 'website'
                }}
                facebook={{ appId: '313154633008072' }}
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
                <meta name="msapplication-TileColor" content="#2f6f4e" />
                <meta name="theme-color" content="#2f6f4e" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div id="article" style={{ display: "flex", justifyContent: "center", flexDirection: "column", minHeight: "100svh" }}>
                <Typography variant="h1" sx={{ color: "white" }} paragraph>You are offline</Typography>
                <div style={{ marginTop: 16 }}>
                    <Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>It seems you are not connected to the internet.</Typography>
                    <Typography variant="h4" component="p" sx={{ color: "white" }} gutterBottom>&mdash; Portalnesia</Typography>
                </div>
            </div>
            <style jsx global>{`
                body { text-align: center; background-color:#2f6f4e !important;font: 20px Helvetica, sans-serif; color: #FFF!important;margin:0;}
                a {color: #dc8100;text-decoration: none;}
                a:hover {color: #ff9600;}
                #article { display: block; text-align: left; max-width: 650px; margin: 0 auto; }
                @media(max-width:776px){
                    body{padding:30px;}
                }
                @media(max-width:776px){
                    body{padding:10px;}
                }
            `}</style>
        </div>
    );
};