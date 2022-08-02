import {useCallback,useState,useEffect,useRef} from 'react'
import Router,{useRouter,NextRouter} from 'next/router'
import {dataUserType} from 'portal/types/user'
import {State} from 'portal/types/store'
import {useDispatch,useSelector} from 'react-redux'
//import Cookies from 'js-cookie'

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

type HotKeyProps={
    //user: dataUserType,
    keyMap: { [key: string]: KeySequences },
    handlers: { [key: string]: (keyEvent?: KeyboardEvent) => void }
    //dispatch:(params: {type: 'CHANGE_THEME' | 'TOGGLE_DRAWER',action: boolean})=>void,
}

type RootState={
    user: dataUserType,
}

type DialogActionType='keyboard'|'feedback'|null

type OutputProps={
    atasKeyMap: KeyMap,
    bawahKeyMap: KeyMap,
    //keyMap: KeyMap,
    //handlers: HandlersMap,
    keyboard: boolean,
    feedback: boolean,
    setKeyboard: (params: boolean,replace?: boolean)=>void,
    setFeedback: (params: boolean,replace?: boolean)=>void,
    setNavigation: (params: DialogActionType)=>void,
}

let rout: NextRouter,keybo: DialogActionType=null,pathn: string='',preferDark: boolean=false;
let lastKeyTime = Date.now(),buffer: Array<any>=[],keyy: string='',sudah: boolean=false;
export const useHotKeys=(register?: boolean) =>{
    const {user,disableHotkeys:disabled}=useSelector<State,Pick<State,'user'|'disableHotkeys'>>(state=>({user:state?.user,disableHotkeys:state.disableHotkeys}))
    const dispatch=useDispatch();
    const router=useRouter();
    const {pathname}=router
    const [dialog,setDialog]=useState<DialogActionType>(keybo);
    //const {setNotif}=useNotif()
    useEffect(()=>{
        keybo=dialog
    },[dialog])
    useEffect(()=>{
        pathn=pathname
    },[pathname])

    const onKeyboardChange=useCallback((params: boolean,replace?: boolean)=>{
        if(params) {
            dispatch({type:'REPORT',payload:null})
            let quer={...rout}
            if(typeof quer.query.reloadedPage !== 'undefined') delete quer.query.reloadedPage;
            const asss=rout.asPath.match(/\&i\=.+?(?=\&)/) ? rout.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : rout.asPath.match(/\&/) ? rout.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : rout.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
            const asPath=(asss.match(/\?/) ? `${asss}&i=navigation` : `${asss}?i=navigation`)
            const newQ={
                pathname:rout.pathname,
                query:{...quer.query,i:'navigation'}
            }
            router.push(newQ,asPath,{shallow:true})
        } else {
            let quer={...rout}
            delete quer.query.i
            if(typeof quer.query.reloadedPage !== 'undefined') delete quer.query.reloadedPage;
            const asss=rout.asPath.match(/\&i\=.+?(?=\&)/) ? rout.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : rout.asPath.match(/\&/) ? rout.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : rout.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
            const newQ={
                pathname:rout.pathname,
                query:{...quer.query}
            }
            if(replace===true) router.replace(newQ,asss,{shallow:true})
            else router.push(newQ,asss,{shallow:true})

            /*
            setDialog(null)
            router.back()*/
        }
    },[setDialog])

    const keyboardAction=()=>{
        if(keybo!=='keyboard' || !sudah) onKeyboardChange(keybo!=='keyboard',true)
        else {
            setDialog(null)
            router.back()
        }
    }

    //const keyboardAction=()=>onKeyboardChange(keybo!=='keyboard')

    const searchAction=(event?: KeyboardEvent)=>{
        if(event?.preventDefault) event.preventDefault();
        if(typeof window !== 'undefined') {
            const input=document.getElementById('search-input-home')
            if(input) input?.focus();
        }
    }

    const onFeedbackChange=useCallback((params: boolean,replace?: boolean)=>{
        if(params) {
            dispatch({type:'REPORT',payload:null})
            let quer={...rout}
            if(typeof quer.query.reloadedPage !== 'undefined') delete quer.query.reloadedPage;
            const asss=rout.asPath.match(/\&i\=.+?(?=\&)/) ? rout.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : rout.asPath.match(/\&/) ? rout.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : rout.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
            const asPath=(asss?.match(/\?/) ? `${asss}&i=feedback` : `${asss}?i=feedback`)
            const newQ={
                pathname:rout.pathname,
                query:{...quer.query,i:'feedback'}
            }
            router.push(newQ,asPath,{shallow:true})
        } else {
            const asss=rout.asPath.match(/\&i\=.+?(?=\&)/) ? rout.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : rout.asPath.match(/\&/) ? rout.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : rout.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
            let quer={...rout}
            delete quer.query.i
            if(typeof quer.query.reloadedPage !== 'undefined') delete quer.query.reloadedPage;
            const newQ={
                pathname:rout.pathname,
                query:{...quer.query}
            }
            if(replace===true) router.replace(newQ,asss,{shallow:true})
            else router.push(newQ,asss,{shallow:true})
            
            /*setDialog(null)
            window.history.back()*/
        }
    },[setDialog])

    const feedbackAction=()=>{
        //onFeedbackChange(keybo!=='feedback')
        if(keybo!=='feedback' || !sudah) onFeedbackChange(keybo!=='feedback',true)
        else {
            setDialog(null)
            router.back()
        }
    }

    const contactAction=useCallback(()=>{
        if(pathn=='/contact') router.replace('/contact')
        else router.push('/contact')
    },[router])

    const settingAction=useCallback(()=>{
        if(user!==null) router.push('/setting/[[...slug]]','/setting',{shallow:pathn=='/setting/[[...slug]]'})
    },[user,router])

    const notificationAction=useCallback(()=>{
        if(user!==null) router.push('/notification/[[...slug]]','/notification',{shallow:pathn=='/notification/[[...slug]]'})
    },[user,router])

    const editProfileAction=useCallback(()=>{
        if(user!==null) router.push('/user/[...slug]',`/user/${user?.user_login}/edit`,{shallow:pathn=='/user/[...slug]'})
    },[])
    const profileAction=useCallback(()=>{
        if(user!==null) router.push('/user/[...slug]',`/user/${user?.user_login}`,{shallow:pathn=='/user/[...slug]'})
    },[])

    const fileManagerAction=useCallback(()=>{
        if(user!==null) {
            if(pathn=='/file-manager') router.replace('/file-manager')
            else router.push('/file-manager')
        }
    },[])

    const likeAction=useCallback(()=>{
        if(user!==null) router.push('/likes/[[...slug]]',`/likes`,{shallow:pathn=='/likes/[[...slug]]'})
    },[])

    const messageAction=useCallback(()=>{
        if(user!==null) router.push('/messages/[[...slug]]',`/messages`,{shallow:pathn=='/messages/[[...slug]]'})
    },[])

    let atasKeyMap: KeyMap={
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
        },
    }
    if(user!==null) {
        atasKeyMap.SETTING={
            name:'Settings',
            sequence:'shift+s',
            custom:'shifts',
            button:['SHIFT','S']
        }
        atasKeyMap.NOTIFICATION={
            name:'Notifications',
            sequence:'shift+n',
            custom:'shiftn',
            button:['SHIFT','N']
        }
    }
    if(user!==null) {
        atasKeyMap={
            ...atasKeyMap,
            EDIT_PROFILE:{
                name:'Edit Profile',
                sequence:'shift+p',
                custom:'shiftp',
                button:['SHIFT','P']
            },
            PROFILE:{
                name:'Profile',
                sequence:'g+p',
                custom:'gp',
                button:['G','P']
            },
            FILE_MANAGER:{
                name:'File Manager',
                sequence:'g+f',
                custom:'gf',
                button:['G','F']
            },
            LIKE:{
                name:'Likes',
                sequence:'g+l',
                custom:'gl',
                button:['G','L']
            },
            MESSAGE:{
                name:'Messages',
                sequence:'g+m',
                custom:'gm',
                button:['G','M']
            },
        }
    }

    const homeAction=useCallback(()=>{
        router.push('/')
    },[router])

    const transformCoodrinateAction=useCallback(()=>{
        if(pathn=='/geodata/transform') router.replace('/geodata/transform')
        else router.push('/geodata/transform')
    },[router])

    const threadAction=useCallback(()=>{
        router.push('/twitter/thread/[[...slug]]',`/twitter/thread`,{shallow:pathn=='/twitter/thread/[[...slug]]'})
    },[router])

    const newsAction=useCallback(()=>{
        if(pathn=='/news') router.replace('/news')
        else router.push('/news')
    },[router])

    const chordAction=useCallback(()=>{
        router.push('/chord/[[...slug]]',`/chord`,{shallow:pathn=='/chord/[[...slug]]'})
    },[router])

    const parseHtmlAction=useCallback(()=>{
        if(pathn=='/parse-html') router.replace('/parse-html')
        else router.push('/parse-html')
    },[router])

    const qrCodeAction=useCallback(()=>{
        if(pathn=='/qr-code') router.replace('/qr-code')
        else router.push('/qr-code')
    },[router])

    const urlAction=useCallback(()=>{
        if(pathn=='/url') router.replace('/url')
        else router.push('/url')
    },[router])

    const eventAction=useCallback(()=>{
        if(pathn=='/events') router.replace('/events')
        else router.push('/events')
    },[router])

    const downloaderAction=useCallback(()=>{
        if(pathn=='/downloader') router.replace('/downloader')
        else router.push('/downloader')
    },[router])

    const blogAction=useCallback(()=>{
        if(pathn=='/blog') router.replace('/blog')
        else router.push('/blog')
    },[router])

    const twibbonAction=useCallback(()=>{
        if(pathn=='/twibbon') router.replace('/twibbon')
        else router.push('/twibbon')
    },[router])

    const randomNumberAction=useCallback(()=>{
        if(pathn=='/random-number') router.replace('/random-number')
        else router.push('/random-number')
    },[router])

    const imagesCheckerAction=useCallback(()=>{
        if(pathn=='/images-checker') router.replace('/images-checker')
        else router.push('/images-checker')
    },[router])

    const quizAction=useCallback(()=>{
        if(pathn=='/quiz') router.replace('/quiz')
        else router.push('/quiz')
    },[router])

    let bawahKeyMap: KeyMap={
        HOME:{
            name:'Home',
            sequence:'g+h',
            custom:'gh',
            button:['G','H']
        },
        TRANSFORM_COORDINATE:{
            name:'Transform Coordinate',
            sequence:'g g+t',
            custom:'ggt',
            button:['G','G','T']
        },
        THREAD:{
            name:'Twitter Thread Reader',
            sequence:'g t+r',
            custom:'gtr',
            button:['G','T','R']
        },
        NEWS:{
            name:'News',
            sequence:'g+n',
            custom:'gn',
            button:['G','N']
        },
        CHORD:{
            name:'Chord',
            sequence:'g+c',
            custom:'gc',
            button:['G','C']
        },
        QRCODE_GENERATOR:{
            name:'QR Code Generator',
            sequence:'g q+g',
            custom:'gqg',
            button:['G','Q','G']
        },
        PARSE_HTML:{
            name:'Parse HTML',
            sequence:'g p+h',
            custom:'gph',
            button:['G','P','H']
        },
        URL_SHORTENER:{
            name:'URL Shortener',
            sequence:'g+u',
            custom:'gu',
            button:['G','U']
        },
        EVENT:{
            name:'Events',
            sequence:'g+e',
            custom:'ge',
            button:['G','E']
        },
        DOWNLOADER:{
            name:'Downloader',
            sequence:'g+d',
            custom:'gd',
            button:['G','D']
        },
        BLOG:{
            name:'Blog',
            sequence:'g+b',
            custom:'gb',
            button:['G','B']
        },
        TWIBBON:{
            name:'Twibbon',
            sequence:'g+t',
            custom:'gt',
            button:['G','T']
        },
        RANDOM_NUMBER:{
            name:'Random Number Generator',
            sequence:'g n+g',
            custom:'gng',
            button:['G','N','G']
        },
        IMAGES_CHECKER:{
            name:'Images Checker',
            sequence:'g i+c',
            custom:'gic',
            button:['G','I','C']
        },
        QUIZ:{
            name:'Quiz',
            sequence:'g+q',
            custom:'gq',
            button:['G','Q']
        },
    }

    const keyMap: KeyMap={
        ...atasKeyMap,
        ...bawahKeyMap,
    }

    const handlers: HandlersMap={
        KEYBOARD: keyboardAction,
        SEARCH: searchAction,
        SEND_FEEDBACK:feedbackAction,
        CONTACT:contactAction,
        SETTING:settingAction,
        NOTIFICATION:notificationAction,
        EDIT_PROFILE:editProfileAction,
        PROFILE:profileAction,
        FILE_MANAGER:fileManagerAction,
        LIKE:likeAction,
        MESSAGE:messageAction,
        HOME:homeAction,
        TRANSFORM_COORDINATE:transformCoodrinateAction,
        THREAD:threadAction,
        NEWS:newsAction,
        CHORD:chordAction,
        QRCODE_GENERATOR: qrCodeAction,
        PARSE_HTML:parseHtmlAction,
        URL_SHORTENER:urlAction,
        EVENT:eventAction,
        DOWNLOADER:downloaderAction,
        BLOG:blogAction,
        TWIBBON:twibbonAction,
        RANDOM_NUMBER:randomNumberAction,
        IMAGES_CHECKER:imagesCheckerAction,
        QUIZ:quizAction
    }

    useEffect(()=>{
        rout=router
        //preferDark=prefersDarkMode
        const onKeyDown=(event: any)=>{
            if(register===true && !disabled) {
                if(event.target !== null && event.target.closest("input,textarea,div.CodeMirror")!==null) {
                    //return;
                } else {
                    const key=event.key,currentTime=Date.now();
                    if(currentTime - lastKeyTime > 400) {
                        buffer=[];
                    }
                    buffer.push(key);
                    lastKeyTime=currentTime;
                    keyy=buffer.join('').toLowerCase();
                }
            }
        }
        const onKeyUp=(event: any)=>{
            if(register===true && !disabled) {
                if(event.target !== null && event.target.closest("input,textarea,div.CodeMirror")!==null) {
                    return;
                } else {
                    let a=keyy;
                    keyy='';
                    const find = Object.keys(keyMap).find(key=>{
                        if(typeof keyMap[key].custom==='string') return keyMap[key].custom===a
                        else return keyMap[key].custom.indexOf(a) > -1
                    })
                    if(find) {
                        if(typeof handlers[find] === 'function'){
                            const aa=handlers[find]
                            setTimeout(()=>aa(event),401);
                        }
                    }
                }
            }
        }
        if(!disabled) {
            window.addEventListener('keydown',onKeyDown)
            window.addEventListener('keyup',onKeyUp)
        }
        return ()=>{
            window.removeEventListener('keydown',onKeyDown)
            window.removeEventListener('keyup',onKeyUp)
        }
    },[disabled])

    useEffect(()=>{
        rout=router
        if(typeof router.query.i === 'undefined') sudah=true;
    },[router.query])

    return {
        atasKeyMap: atasKeyMap,
        bawahKeyMap:bawahKeyMap,
        keyboard:dialog==='keyboard',
        feedback:dialog==='feedback',
        setNavigation:(params)=>setDialog(params),
        setKeyboard:onKeyboardChange,
        setFeedback:onFeedbackChange
    }
}

type RefObject=(event?: KeyboardEvent)=>void

/*type mouseTrapMap={
    handlerKey: MouseTrapKeySequence,
    handlerCallback: (event?: SyntheticEvent)=>void,
    globalBind: boolean
}
type arrayMousetrap=Array<mouseTrapMap>|mouseTrapMap*/

export const useMousetrap=(handlerKey: MouseTrapKeySequence, handlerCallback: (event?: KeyboardEvent)=>void,global: boolean=false) => {
    let actionRef= useRef<RefObject|null>(null);
    //actionRef.current = handlerCallback;
    /*const unbind=()=>{
        const mousetrap=require('mousetrap')
        mousetrap.unbind(handlerKey);
    }*/
  
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
    }, [handlerKey,handlerCallback]);

    /*useEffect(()=>{
        return ()=>mousetrap.unbind(handlerKey);
    },[])*/
    return null
};
export const useBeforeUnload=(canChange: boolean,urls: string)=>{
    const sudah = useRef(false);
    
    useEffect(()=>{
        const url = Router.asPath;
        const a = new URL(`${process.env.URL}${url}`);
        const handlerChange=(urll: string)=>{
            const b = new URL(`${process.env.URL}${urll}`);
            if(a.pathname != b.pathname && !sudah.current && !canChange) {
                if(!window.confirm("Changes you made may not be saved.")){
                    Router.events.emit('routeChangeError')
                    //router.replace({pathname:Router.pathname,query:Router.query},Router.asPath,)
                    throw 'Abort route change. Please ignore this error'
                }
            } else sudah.current=false;
        }

        if(!canChange) {
            Router.beforePopState((cb: any)=>{
                sudah.current=true;
                const b = new URL(`${process.env.URL}${cb.as}`);
                if(a.pathname != b.pathname) {
                    if(!window.confirm("Changes you made may not be saved!")){
                        window.history.forward();
                        return false
                    }
                }
                return true;
            })
            
            Router.events.on('routeChangeStart',handlerChange)
            /*window.onbeforeunload=(e: Event)=>{
                e = e || window.event;
                // For IE and Firefox prior to version 4
                if (e) {
                    e.returnValue = false;
                }
                // For Safari
                return 'Sure?';
            }*/
        }
        return ()=>{
            sudah.current=false;
            Router.beforePopState(()=>true)
            Router.events.off('routeChangeStart',handlerChange)
            window.onbeforeunload=null
        }
    },[canChange])

    /*useEffect(()=>{
        return ()=>{
            sudah=false;
            Router.beforePopState(()=>true)
            Router.events.off('routeChangeStart',handlerChange)
            window.onbeforeunload=null
        }
    },[])*/
    
    return null
}