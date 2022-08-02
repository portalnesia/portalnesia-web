// GITHUB CODE e698a3349647cf6ff5be3cd676a8dbad900d363d
const express = require('express')
const next = require('next')
const cors = require('cors')
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.NODE_ENV === 'production' ? 3000 : 3503;
const hostn = "localhost";
const app = next({ dev })
const handle = app.getRequestHandler()
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet=require('helmet')
const canvasProxy = require('html2canvas-proxy');
const path = require('path');

const corsOrigin = [/\.portalnesia\.com$/,"https://portalnesia.com"];

const useExampleProxy=(req,res,next)=>{
  const exampleProxy=createProxyMiddleware({
    target: 'https://datas.portalnesia.com',
    changeOrigin: true,
    headers:{
      host:'https://datas.portalnesia.com'
    },
    onProxyReq:function(proxy) {
      proxy.setHeader('X-Local-Ip',req.headers["cf-connecting-ip"]);
    }
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
      proxy.setHeader('X-Local-Ip',req.headers["cf-connecting-ip"]);
    }
  });
  return apiProxy(req,res,next);
}

app.prepare().then(() => {
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

    //server.use('/design/*/edit/*',exampleProxy);
    //server.use('/user/*/resume',exampleProxy)
    server.use('/user/*/photo_profile',useExampleProxy)
    server.use('/email/preview/*',useExampleProxy);
    server.get('/sitemap.xml', useApiProxy);
    server.use('/news/feed', useApiProxy);
    server.use('/blog/feed', useApiProxy);
    server.use('/chord/feed', useApiProxy);
    server.use('/content', useExampleProxy);
    server.use('/telegram/oauth', useExampleProxy);
    server.use('/line', useExampleProxy);
    server.use('/print', useExampleProxy);
    //server.use('/file-manager/images', exampleProxy);
    server.use('/media/embed', useExampleProxy);
    
    server.use('/login', useExampleProxy);
    server.use('/logout', useExampleProxy);
    server.use('/authentication', useExampleProxy);
    server.use('/active', useExampleProxy);
    server.use('/forgot', useExampleProxy);
    server.use('/unlock', useExampleProxy);

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

    server.use(express.json());
    server.use(express.urlencoded({extended:true}));

    server.use(handle);
    server.listen(port,hostn, (err) => {
        if (err) throw err
        console.log(`>> Ready on http://${hostn}:${port}`)
        if(process.send) process.send('ready')
    })
})