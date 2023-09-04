process.env.NODE_ENV = 'production'
process.chdir(__dirname)
const path = require('path')
const NextServer = require('next/dist/server/next-server').default
const express = require('express')
const helmet = require('helmet').default
const {createProxyMiddleware} = require('http-proxy-middleware')
const canvasProxy = require('html2canvas-proxy');
const cors = require('cors')

const hostn = "127.0.0.1";

const app = new NextServer({
  hostname: 'localhost',
  dir: path.join(__dirname),
  dev: false,
  customServer: true,
  conf: {"env":{},"webpackDevMiddleware":null,"eslint":{"ignoreDuringBuilds":false},"typescript":{"ignoreBuildErrors":false,"tsconfigPath":"tsconfig.json"},"distDir":"./.next","cleanDistDir":true,"assetPrefix":"","configOrigin":"next.config.js","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["tsx","ts","jsx","js"],"target":"server","poweredByHeader":false,"compress":true,"analyticsId":"","images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":60,"formats":["image/webp"],"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","remotePatterns":[],"unoptimized":false},"devIndicators":{"buildActivity":true,"buildActivityPosition":"bottom-right"},"onDemandEntries":{"maxInactiveAge":15000,"pagesBufferLength":2},"amp":{"canonicalBase":""},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"optimizeFonts":true,"excludeDefaultMomentLocales":true,"serverRuntimeConfig":{},"publicRuntimeConfig":{},"reactStrictMode":true,"httpAgentOptions":{"keepAlive":true},"outputFileTracing":true,"staticPageGenerationTimeout":60,"swcMinify":true,"output":"standalone","experimental":{"optimisticClientCache":true,"manualClientBasePath":false,"legacyBrowsers":false,"newNextLinkBehavior":true,"cpus":7,"sharedPool":true,"profiling":false,"isrFlushToDisk":true,"workerThreads":false,"pageEnv":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"disableOptimizedLoading":false,"gzipSize":true,"swcFileReading":true,"craCompat":false,"esmExternals":true,"appDir":false,"isrMemoryCacheSize":52428800,"fullySpecified":false,"outputFileTracingRoot":"","swcTraceProfiling":false,"forceSwcTransforms":false,"largePageDataBytes":128000,"modularizeImports":{"@mui/material/styles":{"transform":"@mui/material/styles/{{member}}"},"@mui/material/colors":{"transform":"@mui/material/colors/{{member}}"},"@mui/icons-material/?(((\\w*)?/?)*)":{"transform":"@mui/icons-material/{{ matches.[1] }}/{{member}}"},"@mui/lab/?(((\\w*)?/?)*)":{"transform":"@mui/lab/{{ matches.[1] }}/{{member}}"},"@mui/styles/?(((\\w*)?/?)*)":{"transform":"@mui/styles/{{ matches.[1] }}/{{member}}"}},"enableUndici":false,"adjustFontFallbacks":false,"adjustFontFallbacksWithSizeAdjust":false,"transpilePackages":["@mui/material","@mui/x-date-pickers","@mui/lab","@mui/styles","@mui/base","@mui/system","@mui/icons-material","@fancyapps/ui"],"trustHostHeader":false},"configFileName":"next.config.js","compiler":{"reactRemoveProperties":true,"removeConsole":{"exclude":["error"]},"emotion":true}},
})

const handle = app.getRequestHandler();

const corsOrigin = [/\.portalnesia\.com$/,"https://portalnesia.com"];

const useDataProxy=(req,res,next)=>{
  const exampleProxy=createProxyMiddleware({
    target: 'https://datas.portalnesia.com',
    changeOrigin: true,
    headers:{
      host:'https://datas.portalnesia.com'
    },
    onProxyReq:function(proxy) {
      if(process.env.NODE_ENV === 'production') proxy.setHeader('X-Local-Ip',req.headers["cf-connecting-ip"]);
    },
    onProxyRes:function(proxy) {
      const type = proxy.headers['content-type'];
      if(typeof type === 'string' && (type.startsWith('image') || type.startsWith('audio') || type.startsWith('video'))) {
        proxy.headers['Cache-Control'] = 'public, max-age=86400';
      }
    },
    logLevel:'error',
  });
  return exampleProxy(req,res,next);
}

const useApiProxy=(req,res,next)=>{
  const apiProxy = createProxyMiddleware({
    target: 'https://api.portalnesia.com',
    changeOrigin: true,
    headers:{
      host:'https://api.portalnesia.com'
    },
    onProxyReq:function(proxy) {
      if(process.env.NODE_ENV === 'production') proxy.setHeader('X-Local-Ip',req.headers["cf-connecting-ip"]);
    },
    followRedirects:true,
    logLevel:'error',
  });
  return apiProxy(req,res,next);
}

const useContentProxy=(req,res,next) => {
  const apiProxy=createProxyMiddleware({
    target: 'https://content.portalnesia.com',
    changeOrigin: true,
    pathRewrite:{
      '^/content': `/`,
    },
    headers:{
      host:'https://content.portalnesia.com'
    },
    onProxyRes:function(proxy) {
      const type = proxy.headers['content-type'];
      if(typeof type === 'string' && (type.startsWith('image') || type.startsWith('audio') || type.startsWith('video'))) {
        proxy.headers['Cache-Control'] = 'public, max-age=86400';
      }
    },
    logLevel:'error',
    followRedirects:true
  });
  return apiProxy(req,res,next);
}

const accountRedirect=(path)=>(req,res)=>{
  const url = new URL(req.url,'https://accounts.portalnesia.com');
  url.pathname = path;
  url.searchParams.set('utm_source','portalnesia web')
  url.searchParams.set('utm_medium','redirect')
  url.searchParams.set('utm_campaign','v5')
  res.redirect(301,url.toString());
}


app.prepare().then(()=>{
    const port = parseInt(process.env.PORT, 10) || 3000
    const server = express();

    server.use('/canvas-proxy', canvasProxy());
    
    server.options('*', cors({origin:corsOrigin}))
    server.use(cors({origin:corsOrigin}))

    server.use(helmet.dnsPrefetchControl());
    server.use(helmet.expectCt());
    server.use(helmet.frameguard());
    server.use(helmet.hidePoweredBy());
    server.use(helmet.hsts());
    server.use(helmet.ieNoOpen());
    server.use(helmet.noSniff());
    server.use(helmet.permittedCrossDomainPolicies());
    server.use(helmet.referrerPolicy({
      policy: "strict-origin-when-cross-origin"
    }));
    server.use(helmet.xssFilter());

    server.use('/user/*/photo_profile',useApiProxy)
    server.use('/email/preview/*',useDataProxy);
    server.get('/sitemap.xml', useApiProxy);
    server.use('/news/feed', useApiProxy);
    server.use('/blog/feed', useApiProxy);
    server.use('/chord/feed', useApiProxy);
    server.use('/content', useContentProxy);
    // server.use('/telegram/oauth', useDataProxy);
    server.use('/line', useDataProxy);
    // server.use('/print', useDataProxy);
    //server.use('/file-manager/images', exampleProxy);
    // server.use('/media/embed', useDataProxy);
    
    server.use('/login', accountRedirect('/login'));
    server.use('/logout', accountRedirect('/logout'));
    server.use('/active', accountRedirect('active'));
    server.use('/forgot', accountRedirect('/forgot'));
    server.use('/unlock', accountRedirect('/unlock'));

    server.get('/ln',(req,res)=>{
      res.writeHead(302,{Location: "https://line.me/R/ti/p/%40540ytcnc"});
      res.end();
    })
    server.get('/tw',(req,res)=>{
      res.writeHead(302,{Location: "https://twitter.com/Portalnesia1"});
      res.end();
    })
    server.get('/fb',(req,res)=>{
      res.writeHead(302,{Location: "https://www.facebook.com/portalnesia"});
      res.end();
    })
    server.get('/tg',(req,res)=>{
      res.writeHead(302,{Location: "https://t.me/portalnesia_bot"});
      res.end();
    })
    server.get('/ig',(req,res)=>{
      res.writeHead(302,{Location: "https://instagram.com/portalnesia.id"});
      res.end();
    })

    server.get("/setting/:slug?",(req,res)=>{
      const slug = req.params.slug;
      let url = 'https://accounts.portalnesia.com';
      if(slug) url += '/'+slug;
      const new_url = new URL(url);
      new_url.searchParams.set('utm_source','portalnesia web')
      new_url.searchParams.set('utm_medium','redirect')
      new_url.searchParams.set('utm_campaign','v5')
      res.redirect(301,new_url.toString());
    })

    server.use(express.json());
    server.use(express.urlencoded({extended:true}));

    server.all("*",(req,res)=>{
        return handle(req,res)
    });

    server.listen(port,hostn, () => {
        console.log(`>> Ready on http://${hostn}:${port}`)
        if(process.send) process.send('ready')
    })
})
