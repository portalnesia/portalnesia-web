import React from 'react'
import ErrorPage from 'portal/pages/_error'
import {connect} from 'react-redux';
import {wrapper} from 'portal/redux/store';
import { NextSeo,LogoJsonLd } from 'next-seo';
import dynamic from 'next/dynamic'
//import HomeLanding from 'portal/components/landing/HomeLanding'
//import Landing from 'portal/components/landing/Landing'

const HomeLanding = dynamic(()=>import('portal/components/landing/HomeLanding'));
const Landing = dynamic(()=>import('portal/components/landing/Landing'));

export const getServerSideProps = wrapper()

const Home=({err,user})=>{
    if(err) return <ErrorPage statusCode={err} />

    const titleMeta= "Portalnesia";
    const descMeta= `Website Multifungsi,  Chord - Kunci Gitar dengan Transpose Auto Scroll, Baca Utas Twitter, Twitter Thread Reader, Membuat Twibbon, Pasang Twibbon, Berita Terbaru Terhangat Terkini, Download dari Youtube Twitter Soundcloud Instagram,  Buat Kuis Anda, Events, Perpendek URL`;
    const imageMeta= `${process.env.URL}/icon/og_image_default.png`;
    const keywordMeta= `short url, website,  media, chord, downloader, profil, twibbon, news, berita, random number generator, number generator, soundcloud downloader, youtube downloader, twitter downloader, instagram downloader, twitter menfess, twitter thread reader, streaming, tv indonesia, quiz, kuis, events, jadwal kegiatan, kunci gitar, chord gitar, finance, keuangan`;
    
    return (
      <div>
        <NextSeo
            title={titleMeta}
            description={descMeta}
            canonical={`${process.env.URL}`}
            additionalMetaTags={[{
              key:'meta-keyword',
              property: 'keywords',
              content: keywordMeta
            },{
              key:'meta-fb-pages',
              property:'fb:pages',
              content:'105006081218628'
            },{
              key:'meta-viewport',
              name:'viewport',
              content:'width=device-width, initial-scale=1, shrink-to-fit=yes'
            }]}
            openGraph={{
              url: `${process.env.URL}`,
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
        {user === null ? <Landing /> : <HomeLanding />}
      </div>
    )
}

export default connect(state=>({user:state.user}))(Home)