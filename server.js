// GITHUB CODE e698a3349647cf6ff5be3cd676a8dbad900d363d
const express = require('express')
const next = require('next')
const cors = require('cors')
const dev = process.env.NODE_ENV !== 'production'
const hostn = "localhost";
const app = next({ dev })
const handle = app.getRequestHandler()
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet=require('helmet')
const canvasProxy = require('html2canvas-proxy');

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

app.prepare().then(() => {
    const port = process.env.PORT;
    const server = express()

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

    server.use('/user/*/photo_profile',useDataProxy)
    server.use('/email/preview/*',useDataProxy);
    server.get('/sitemap.xml', useApiProxy);
    server.use('/news/feed', useApiProxy);
    server.use('/blog/feed', useApiProxy);
    server.use('/chord/feed', useApiProxy);
    server.use('/content', useContentProxy);
    server.use('/telegram/oauth', useDataProxy);
    server.use('/line', useDataProxy);
    server.use('/print', useDataProxy);
    //server.use('/file-manager/images', exampleProxy);
    server.use('/media/embed', useDataProxy);
    
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

    server.use(handle);
    server.listen(port,hostn, (err) => {
        if (err) throw err
        console.log(`>> Ready on http://${hostn}:${port}`)
        if(process.send) process.send('ready')
    })
})