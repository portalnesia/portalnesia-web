import React from 'react';
import { useRouter } from 'next/router'
import Head from 'next/head'
import { NextSeo, LogoJsonLd } from 'next-seo';
import type { NextPage } from 'next';
import { portalUrl, staticUrl } from '@utils/main';
import Typography from '@mui/material/Typography';

type IErrorProps = {
    statusCode?: number
}

const imageMeta = staticUrl("og_image_default.png")

const Error: NextPage<IErrorProps> = ({ statusCode }) => {
    const router = useRouter();
    const titleMeta = statusCode === 404 ? "Page Not Found – Portalnesia" : "Portalnesia";
    const descMeta = statusCode ? statusCode === 404 ? "The page you are looking for cannot be found anywhere" : "Website Multifungsi,  Chord - Kunci Gitar dengan Transpose Auto Scroll, Baca Utas Twitter, Twitter Thread Reader, Membuat Twibbon, Pasang Twibbon, Berita Terbaru Terhangat Terkini, Download dari Youtube Twitter Soundcloud Instagram,  Buat Kuis Anda, Events, Perpendek URL" : "An error occured on client";

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
                }, {
                    name: "og:image:secure_url",
                    content: imageMeta
                }, {
                    name: "og:image:type",
                    content: "image/png"
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
                <Typography variant="h1" sx={{ color: "white" }} paragraph>{statusCode === 404 ? `Page not found!` : statusCode === 1234 ? `Our site is getting a little tune up and some love` : `Oooppss`}</Typography>
                <div style={{ marginTop: 16 }}>
                    {statusCode && statusCode === 404 ? (
                        <React.Fragment>
                            <Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>The page you are looking for cannot be found anywhere.</Typography><Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>If you feel this is a mistake, please contact us at <a href="mailto:support@portalnesia.com"><span>support@portalnesia.com</span></a>, thankyou.</Typography>
                        </React.Fragment>
                    ) : statusCode && statusCode === 1234 ? (
                        <React.Fragment>
                            <Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>We apologize for the inconvenience, but we&#39;re performing some maintenance. You can still contact us at <a href="mailto:support@portalnesia.com"><span>support@portalnesia.com</span></a>.</Typography><Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>We&#39;ll be back up soon!</Typography>
                        </React.Fragment>
                    ) : statusCode ? (
                        <React.Fragment>
                            <Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>We apologize for the inconvenience, an error occured on server-side.</Typography><Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>Please report this problem to us at <a href="mailto:support@portalnesia.com"><span>support@portalnesia.com</span></a>, thankyou.</Typography>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>We apologize for the inconvenience, an error occured on client-side.</Typography><Typography variant="h4" component="p" sx={{ color: "white", fontWeight: "normal" }} gutterBottom>Please report this problem to us at <a href="mailto:support@portalnesia.com"><span>support@portalnesia.com</span></a>, thankyou.</Typography>
                        </React.Fragment>
                    )}
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
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode }
}

export default Error;