import { version } from "@src/version";
import { deviceDetect } from "react-device-detect";

const funcs = {
    support_canvas: () => {
      let elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },
    support_video: () => {
      return !!document.createElement('video').canPlayType;
    },
    support_svg: () => {
      return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
    },
    support_audio: () => {
      return !!document.createElement('audio').canPlayType;
    },
    support_webWorker: () => {
      return !!window.Worker;
    },
    support_css3: () => {
      let div = document.createElement('div'),
          vendors = 'Ms O Moz Webkit'.split(' '),
          len = vendors.length;
  
      return (prop: any) => {
        if (prop in div.style) return true;
  
        prop = prop.replace(/^[a-z]/, (val: any) => {
          return val.toUpperCase();
        });
  
        while (len--) {
          if (vendors[len] + prop in div.style) {
            return true;
          }
        }
        return false;
      };
    },
    support_css3_3d: () => {
      let docElement = document.documentElement;
      let support = funcs.support_css3()('perspective');
      let body = document.body;
      if (support && 'webkitPerspective' in docElement.style) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '@media (transform-3d),(-webkit-transform-3d){#css3_3d_test{left:9px;position:absolute;height:3px;}}';
        body.appendChild(style);
        let div = document.createElement('div');
        div.id = 'css3_3d_test';
        body.appendChild(div);
        support = div.offsetLeft === 9 && div.offsetHeight === 3;
        const el = document?.getElementById('css3_3d_test')
        if(el) document.getElementById('css3_3d_test')?.parentNode?.removeChild(el);
      }
      return support;
    },
    support_webSocket: () => {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    },
    support_localStorage: () => {
        try {
            if ('localStorage' in window && window['localStorage'] !== null) {
                localStorage.setItem('test_str', 'test_str');
                localStorage.removeItem('test_str');
                return true;
            }
            return false;
        }
        catch (e) {
            return false;
        }
    },
    support_sessionStorage: () => {
        try {
            if ('localStorage' in window && window['sessionStorage'] !== null) {
                localStorage.setItem('test_str', 'test_str');
                localStorage.removeItem('test_str');
                return true;
            }
            return false;
        }
        catch (e) {
            return false;
        }
    },
    support_geolocation: () => {
        return 'geolocation' in navigator;
    },
    getPluginName: () => {
        let info = "";
        let plugins = navigator.plugins;
        if (plugins.length > 0) {
            for (let i = 0; i < navigator.plugins.length; i++) {
                info += navigator.plugins[i].name + ",";
            }
        }
        return info;
    },
    support_history: () => {
        return !!(window.history && history.pushState);
    },
};

export type IBrowserInfo={
    cookieEnabled?: boolean,
    platform?: string,
    screenWidth?: number,
    screenHeight?: number,
    colorDepth?: number,
    online?: boolean,
    support_localStorage?: boolean,
    support_sessionStorage?: boolean,
    support_history?: boolean,
    support_webSocket?: boolean,
    support_webWorker?: boolean,
    support_canvas?: boolean,
    support_video?: boolean,
    support_audio?: boolean,
    support_svg?: boolean,
    support_css3_3d?: boolean,
    support_geolocation?: boolean,
    plugins?: string[],
    webVersion?: string,
    isBrowser: true,
    browserMajorVersion?: string,
    browserFullVersion?: string,
    browserName?: string,
    engineName?: string,
    engineVersion?: string,
    osName?: string,
    osVersion?: string,
    userAgent?: string
}

export default function getBrowserInfo() {
    const browser: any= deviceDetect(undefined);
    if(typeof browser.ua !== 'undefined') delete browser.ua
  
    let sysInfo: IBrowserInfo={
      ...(typeof browser==="object" ? {...browser} : {}),
      isBrowser:true,
      cookieEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      onLine: navigator.onLine,
      support_localStorage: funcs.support_localStorage(),
      support_sessionStorage: funcs.support_sessionStorage(),
      support_history: funcs.support_history(),
      support_webSocket: funcs.support_webSocket(),
      support_webWorker: funcs.support_webWorker(),
      support_canvas: funcs.support_canvas(),
      support_video: funcs.support_video(),
      support_audio: funcs.support_audio(),
      support_svg: funcs.support_svg(),
      support_css3_3d: funcs.support_css3_3d(),
      support_geolocation: funcs.support_geolocation(),
      plugins: funcs.getPluginName(),
      webVersion:version
    };
    return sysInfo;
}