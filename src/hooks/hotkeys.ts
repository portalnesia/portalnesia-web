import {useCallback,useState,useEffect,useRef, useMemo} from 'react'
import Router from 'next/router'
import { State } from '@type/redux'
import { useSelector,useDispatch } from '@redux/store'
import { portalUrl } from '@utils/main';

type MouseTrapKeySequence = string | Array<string>;
  
interface ExtendedKeyMapOptions  {
    sequence: MouseTrapKeySequence;
    name: string;
    button: Array<string>;
    custom: MouseTrapKeySequence
}

type KeySequences = ExtendedKeyMapOptions;
type KeyMap={ [key: string]: KeySequences }
type HandlersMap = { [key: string]: (keyEvent?: KeyboardEvent) => void }

/**
 * keyboard: keyboard hotkeys dialog
 * 
 * feedback: feedback dialog
 */
type DialogActionType=State['hotkeys']['dialog']

export function useHotKeys(register?: boolean) {
    const dispatch = useDispatch();
    const {hotkeys:{disabled,dialog}} = useSelector<Pick<State,'hotkeys'>>(s=>({hotkeys:s.hotkeys}));
    
    const setDialog = useCallback((data: DialogActionType)=>{
        dispatch({type:"CUSTOM",payload:{hotkeys:{disabled,dialog:data}}})
    },[dispatch,disabled])
    
    const onDialogChange=useCallback((data: DialogActionType)=>()=>{
        setDialog(data)
    },[]);

    const keyboardAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(dialog) setDialog(undefined)
        else setDialog('keyboard');
    },[dialog])

    const searchAction=useCallback((event?: KeyboardEvent)=>{
        if(event?.preventDefault) event.preventDefault();
        if(typeof window !== 'undefined') {
            const input=document.getElementById('search-input-home')
            if(input) input?.focus();
        }
    },[]);

    const contactAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/contact') Router.replace('/contact')
        else Router.push('/contact')
    },[]);

    const atasKeyMap = useMemo(()=>{
        let map: KeyMap = {
            KEYBOARD:{
                name:'Keyboard Shortcut',
                sequence: ['?','shift+?'], 
                custom: ['?','shift?'],
                button:['?']
            },
            SEARCH:{
                name:'Search',
                sequence:'/',
                custom:'/',
                button:['/']
            },
            SEND_FEEDBACK:{
                name:'Send Feedback',
                sequence:'shift+f',
                custom:'shiftf',
                button:['SHIFT','F']
            },
            CONTACT:{
                name:'Contact',
                sequence:'shift+c',
                custom:'shiftc',
                button:['SHIFT','C']
            }
        }
        return map;
    },[]);

    const homeAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/') Router.replace('/')
        else Router.push('/')
    },[])

    const transformCoodrinateAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/geodata/transform') Router.replace('/geodata/transform')
        else Router.push('/geodata/transform')
    },[])

    const newsAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/news') Router.replace('/news')
        else Router.push('/news')
    },[])

    const chordAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/chord') Router.replace('/chord')
        else Router.push('/chord')
    },[])

    const parseHtmlAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/parse-html') Router.replace('/parse-html')
        else Router.push('/parse-html')
    },[])

    const qrCodeAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/qr-code') Router.replace('/qr-code')
        else Router.push('/qr-code')
    },[])

    const urlAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/url') Router.replace('/url')
        else Router.push('/url')
    },[])

    const downloaderAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/downloader') Router.replace('/downloader')
        else Router.push('/downloader')
    },[])

    const blogAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/blog') Router.replace('/blog')
        else Router.push('/blog')
    },[])

    const twibbonAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/twibbon') Router.replace('/twibbon')
        else Router.push('/twibbon')
    },[])

    const randomNumberAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/random-number') Router.replace('/random-number')
        else Router.push('/random-number')
    },[])

    const imagesCheckerAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/images-checker') Router.replace('/images-checker')
        else Router.push('/images-checker')
    },[])

    const quizAction=useCallback((e?: KeyboardEvent)=>{
        if(e?.preventDefault) e.preventDefault();
        if(Router.pathname==='/quiz') Router.replace('/quiz')
        else Router.push('/quiz')
    },[])

    const bawahKeyMap = useMemo(()=>{
        return {
            HOME:{
                name:'Home',
                sequence:'g h',
                custom:'gh',
                button:['G','H']
            },
            TRANSFORM_COORDINATE:{
                name:'Transform Coordinate',
                sequence:'g g t',
                custom:'ggt',
                button:['G','G','T']
            },
            NEWS:{
                name:'News',
                sequence:'g n',
                custom:'gn',
                button:['G','N']
            },
            CHORD:{
                name:'Chord',
                sequence:'g c',
                custom:'gc',
                button:['G','C']
            },
            QRCODE_GENERATOR:{
                name:'QR Code Generator',
                sequence:'g q c',
                custom:'gqc',
                button:['G','Q','C']
            },
            PARSE_HTML:{
                name:'Parse HTML',
                sequence:'g p h',
                custom:'gph',
                button:['G','P','H']
            },
            URL_SHORTENER:{
                name:'URL Shortener',
                sequence:'g u s',
                custom:'gus',
                button:['G','U','S']
            },
            DOWNLOADER:{
                name:'Downloader',
                sequence:'g d',
                custom:'gd',
                button:['G','D']
            },
            BLOG:{
                name:'Blog',
                sequence:'g b',
                custom:'gb',
                button:['G','B']
            },
            TWIBBON:{
                name:'Twibbon',
                sequence:'g t',
                custom:'gt',
                button:['G','T']
            },
            RANDOM_NUMBER:{
                name:'Random Number Generator',
                sequence:'g r n',
                custom:'gng',
                button:['G','R','N']
            },
            IMAGES_CHECKER:{
                name:'Images Checker',
                sequence:'g i c',
                custom:'gic',
                button:['G','I','C']
            },
            QUIZ:{
                name:'Quiz',
                sequence:'g q u',
                custom:'gqy',
                button:['G','Q','U']
            }
        }
    },[])

    const keyMap: KeyMap = useMemo(()=>({
        ...atasKeyMap,
        ...bawahKeyMap,
    }),[atasKeyMap,bawahKeyMap]);

    const handlers: HandlersMap={
        KEYBOARD: keyboardAction,
        SEARCH: searchAction,
        CONTACT:contactAction,
        HOME:homeAction,
        TRANSFORM_COORDINATE:transformCoodrinateAction,
        NEWS:newsAction,
        CHORD:chordAction,
        QRCODE_GENERATOR: qrCodeAction,
        PARSE_HTML:parseHtmlAction,
        URL_SHORTENER:urlAction,
        DOWNLOADER:downloaderAction,
        BLOG:blogAction,
        TWIBBON:twibbonAction,
        RANDOM_NUMBER:randomNumberAction,
        IMAGES_CHECKER:imagesCheckerAction,
        QUIZ:quizAction
    }

    useEffect(()=>{
        const mousetrap=require('mousetrap')

        if(register && !disabled) {
            Object.keys(keyMap).forEach(key=>{
                mousetrap.bind(keyMap[key].sequence,handlers[key])
            })
        }
        

        return ()=>{
            Object.keys(keyMap).forEach(key=>{
                mousetrap.unbind(keyMap[key].sequence);
            })
        }
    },[register,handlers,keyMap,disabled]);

    return {setKeysDialog:onDialogChange,keysDialog:dialog,atasKeyMap,bawahKeyMap}
}

export function useMousetrap(handlerKey: MouseTrapKeySequence, handlerCallback: (event?: KeyboardEvent)=>void,global: boolean=false) {

    useEffect(() => {
        const mousetrap=require('mousetrap')
        if(global) {
            require('mousetrap/plugins/global-bind/mousetrap-global-bind')
            mousetrap.bindGlobal(handlerKey, (evt: KeyboardEvent) => {
                typeof handlerCallback === 'function' && handlerCallback(evt);
            });
        } else {
            mousetrap.bind(handlerKey, (evt: KeyboardEvent) => {
                typeof handlerCallback === 'function' && handlerCallback(evt);
            });
        }
        return () => {
            mousetrap.unbind(handlerKey);
        };
    }, [handlerKey,handlerCallback,global]);

    return null;
}

export function useBeforeUnload(canChange: boolean,urls: string) {
    
    useEffect(()=>{
        let sudah=false;
        const url = new URL(portalUrl(Router.asPath));

        function handleChange(path: string) {
            const new_url = new URL(portalUrl(path));
            if(url.pathname !== new_url.password && !canChange && !sudah) {
                if(!window.confirm("Changes you made may not be saved.")){
                    Router.events.emit('routeChangeError')
                    throw 'Abort route change. Please ignore this error'
                }
            } else {
                sudah=false;
            }
        }

        if(!canChange) {
            Router.beforePopState((cb)=>{
                sudah=true;
                const new_url = new URL(portalUrl(cb.as));
                if(url.pathname !== new_url.pathname) {
                    if(!window.confirm("Changes you made may not be saved!")){
                        window.history.forward();
                        return false
                    }
                }
                return true;
            });
            Router.events.on('routeChangeStart',handleChange);
        }

        return ()=>{
            sudah=false;
            Router.beforePopState(() => true);
            Router.events.off('routeChangeStart',handleChange);
        }
    },[canChange]);
    return null;
}