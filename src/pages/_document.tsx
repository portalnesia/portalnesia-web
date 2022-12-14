import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
//import {GA_TRACKING_ID} from 'portal/utils/gtag'
import { augmentDocumentWithEmotionCache } from './_app';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta key='meta-2' httpEquiv='Content-Type' content='text/html; charset=utf-8' />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href='https://fonts.googleapis.com/css?family=Inter&display=swap' />
          
          <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png?v=2.0.0" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png?v=2.0.0" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png?v=2.0.0" />
          <link rel="manifest" href="/site.webmanifest?v=2.0.0" />
          <link rel="mask-icon" href="/icon/safari-pinned-tab.svg?v=2.0.0" color="#2f6f4e" />
          <link rel="shortcut icon" href="/favicon.ico?v=2.0.0" />
          <meta name="msapplication-TileColor" content="#2f6f4e" />
          <meta name="msapplication-config" content="/browserconfig.xml?v=2.0.0" />
          <meta name="theme-color" content="#2f6f4e" />

          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link className='higtlightjs-light' rel='stylesheet' href='/css/github.css' />
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link className='higtlightjs-dark' rel='stylesheet' href='/css/github-dark.css' />
        </Head>
        <body className='scroll-disabled'>
          <Main />
          <NextScript />
          <div id="wrapfabtest"><div className="adBanner" style={{backgroundColor: 'transparent',height: 1,width: 1}}></div></div>
        </body>
      </Html>
    );
  }
}

augmentDocumentWithEmotionCache(MyDocument)

export default MyDocument;