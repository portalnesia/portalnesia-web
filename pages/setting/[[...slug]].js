import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import {useNotif} from 'portal/components/Notification'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import ErrorPage from 'portal/pages/_error'
import {useRouter} from 'next/router'
import {authenticate} from 'portal/utils/webauthn'
import {wrapper} from 'portal/redux/store'
import {getDayJs,getInstalledApps} from 'portal/utils/Main'
import {connect} from 'react-redux';
import useAPI from 'portal/utils/api'
import useSWR from 'portal/utils/swr';
import {copyTextBrowser as Kcopy,ucwords,isEmptyObj} from '@portalnesia/utils'
import { alpha } from '@mui/material/styles';
import {withStyles} from 'portal/components/styles';
import classNames from 'classnames'
import Recaptcha from 'portal/components/ReCaptcha'
import TelegramLoginButton from 'react-telegram-login'
import {
    Grid,
    Pagination,
    Typography,
    CircularProgress,
    IconButton,
    TextField,
    Popover,
    Divider,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    FormGroup,
    FormControlLabel,
    Switch,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    AppBar,
    Tabs,
    Box,
    Tab
} from '@mui/material'
import {Delete as DeleteIcon,Visibility,VisibilityOff,Help,AccountCircle,Notifications as NotifIcon,Security as SecIcon,Info as InfoIcon} from '@mui/icons-material'
import Autocomplete from '@mui/material/Autocomplete';
import clx from 'classnames'
import firebaseApp from 'portal/utils/firebase'
import {getMessaging,isSupported as firebaseIsSupported,getToken} from 'firebase/messaging'
import {getAuth,RecaptchaVerifier,signInWithPhoneNumber} from 'firebase/auth'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Backdrop = dynamic(()=>import('portal/components/Backdrop'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

const sidebarWidth=300;
export const getServerSideProps = wrapper(async({pn:data,redirect,resolvedUrl,params})=>{
    const slug=params.slug;
    if(data.user===null) return redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    const meta={title:"Setting"}
    if(typeof slug !== 'undefined') {
        if(['account','notification','security'].indexOf(slug?.[0])===-1) {
            redirect();
        }
        meta.title=`${ucwords(slug?.[0])} - Setting`
    } else {
        if(slug?.length > 1) {
            redirect()
        }
    }
    return {props:{meta:meta}}
})

const styles=theme=>({
    popover:{
        padding:theme.spacing(2),
        maxWidth:250,
        '& a':{
            color:theme.palette.primary.link,
            cursor:'pointer'
        }
    },
    selected:{
        color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.dark} !important`
    },
    rootTab:{
        flexGrow:1,
        minHeight:55,
        maxWidth:'unset'
    },
    rootAppBar:{
        marginBottom:'1rem !important',
        position:'fixed !important',
        top:'64px !important',
        backgroundColor:`${theme.palette.background.default} !important`,
        backgroundImage:'unset !important',
        [theme.breakpoints.down('lg')]: {
            width:'100%',
            left:'unset'
        },
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 240px) ',
            left:'240px'
        },
    },
    drawerClose:{
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 68px) !important',
            left:'68px !important'
        },
    },
    footer:{
        marginTop:theme.spacing(3)
    },
    div:{
        display:'flex',
        [theme.breakpoints.up('sm')]:{
            justifyContent:'space-between'
        },
        [theme.breakpoints.down('sm')]:{
            flexDirection:'column'
        }
    }
})

const push_help = {
    news:"Receive push notifications for the latest news every day",
    comment:"Receive push notifications for comments, including someone commenting on your content or someone replying to your comment",
    birthday:"Receive push notifications for the birthdays of someone you are following",
    message:"Receive push notifications for the new messages",
    feature:"Receive push notifications about new features and promotion on Portalnesia"
}
const email_help = {
    comment:"Receive email notifications for comments, including someone commenting on your content or someone replying to your comment",
    birthday:"Receive email notifications for the birthdays of someone you are following",
    feature:"Receive email notifications about new features and promotion on Portalnesia"
}
const notif_name = {
    news:"News",
    comment:"Comment",
    birthday:"Birthday",
    message:"Messages",
    feature:"Features & Promotion"
}

const Setting=({meta,err,toggleDrawer,classes})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter()
    const {slug}=router.query
    const {get,post,put} = useAPI()
    const [inputLain,setInputLain]=React.useState("")
    const [loading,setLoading]=React.useState(null)
    const [loadingList,setLoadingList]=React.useState(true)
    const [dialog,setDialog]=React.useState(null)
    const [notification,setNotification]=React.useState({})
    const [telVerify,setTelVerify]=React.useState(false);
    const [input,setInput]=React.useState({})
    const [sessPage,setSessPage] = React.useState(1);
    const [inputPass,setInputPass]=React.useState({password:'',second_password:'',new_password:''})
    const {setNotif}=useNotif()
    const [backdrop,setBackdrop]=React.useState(false)
    const [pass,setPass]=React.useState(false)
    const [passChange,setPassChange]=React.useState({a:false,b:false,c:false})
    const [openList,setOpenList]=React.useState(false)
    const [option,setOption]=React.useState([]);
    const [telephone,setTelephone]=React.useState({code:'62',number:'',label:'Indonesia (+62)'});
    const [security,setSecurity]=React.useState({})
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [popover,setPopover]=React.useState(null)
    const [session,setSession]=React.useState([])
    const [infoChange,setInfoChange]=React.useState({username:false,email:false});
    const {data,error,mutate}=useSWR(slug ? `/v1/setting/${slug?.[0] === 'security' ? 'session' : slug?.[0]}` : null);
    const {data:appSession,error:errAppSession,mutate:mutateAppSession} = useSWR(slug && slug?.[0] === 'security' ? `/v1/setting/session/apps?page=${sessPage}` : null);
    const {data: dataSecurity}=useSWR(`/v1/setting/security`);
    const [pushNot,setPushNot]=React.useState(false)
    const [tabValue,setTabValue]=React.useState(0);

    const [title,setTitle]=React.useState(meta.title||"Setting");
    const [selected,setSelected]=React.useState(slug ? slug?.[0] : null)
    const [challenge,setChallenge]=React.useState(null);
    const [tokenChallenge,setTokenChallenge]=React.useState(null);
    const [dialogSession,setDialogSession] = React.useState(null);
    const [dialogAppsSession,setDialogAppsSession] = React.useState(null);
    const [page,setPage] = React.useState(1);
    const captchaRef = React.useRef(null);

    const handleCopy=React.useCallback((e)=>{
        e.preventDefault();
        Kcopy(e.target.value).then((res)=>{
            setNotif("Text copied",'default');
        }).catch(()=>{})
    },[setNotif])

    const handlePopOver=React.useCallback((menu)=>(event)=>{
        setPopover(prev=>(prev === menu ? null : menu));
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[setPopover])

    const closePopOver=React.useCallback(()=>{
        setPopover(null)
        setAnchorEl(null)
    },[])

    const inputChange=React.useCallback((name,val)=>{
        setInput(prev=>({
            ...prev,
            [name]:val
        }))
        if(name==='email' || name==='username') {
            setInfoChange(prev=>({
                ...prev,
                [name]:true
            }))
        }
    },[setInput,setInfoChange])

    const withSecurity=React.useCallback(()=>{
        return new Promise((resp,rej)=>{
            setBackdrop(true)
            authenticate(challenge,(sukses,err)=>{
                if(sukses) resp(err)
                else rej(err)
            })
        })
    },[challenge])

    /* CHANGE PASSWORD */
    const handleChangePassword=React.useCallback((e)=>{
        e.preventDefault();
        setLoading('change_password');
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/setting/account/password`,{...inputPass,recaptcha}))
        .then(()=>{
            setLoading(null);
            setLoading(null);
            setDialog(null);
        }).catch((err)=>{
            setLoading(null);
        })
    },[post,inputPass])
    /* END CHANGE PASSWORD */

    /* DEACTIVE ACCOUNT */
    const handleDeactive=React.useCallback(()=>{
        if(inputPass?.password.match(/\S/)===null) return setNotif("Password required",true)
        setLoading('deactive_account')
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/setting/account/deactive`,{password:inputPass?.password,recaptcha}))
        .then(([res])=>{
            setLoading(null)
            setDialog(null)
            window.location.href=`${process.env.ACCOUNT_URL}/logout`
        }).catch((err)=>{
            setLoading(null)
        })
    },[inputPass.password,post,setNotif])
    /* END DEACTIVE ACCOUNT */

    /* SAVE SETTING */
    const handleSubmit=React.useCallback((value)=>{
        setInfoChange({username:false,email:false})
        setLoading('save_account')
        captchaRef.current?.execute()
        .then(recaptcha=>put(`/v1/setting/account`,{...value,recaptcha}))
        .then(([res])=>{
            setDialog(null)
            if(res==='refresh') router.replace('/setting')
        }).catch(()=>{
            
        }).finally(()=>{
            setLoading(null)
            setBackdrop(false)
        })
    },[put])

    const prepareSubmit=React.useCallback(()=>{
        console.log(challenge)
        if(challenge!==null) {
            withSecurity().then((res)=>{
                const dataInput={
                    ...input,
                    password:tokenChallenge,
                    payload:res
                }
                handleSubmit(dataInput);
            }).catch((err)=>{
                console.log(err)
                if(typeof err === 'string' || typeof err?.message === 'string') setNotif(typeof err === 'string' ? err : err?.message,true)
                setBackdrop(false)
                setDialog({type:'password',notif:'save'});
            })
        } else {
            setBackdrop(false)
            setDialog({type:'password',notif:'save'});
        }
    },[challenge,withSecurity,handleSubmit,input,tokenChallenge,setNotif])

    const preprepareSubmit=React.useCallback((type)=>(e)=>{
        e.preventDefault();
        if(type==='check') {
            if(infoChange?.username===true || infoChange?.email===true) setDialog({type:'pemberitahuan',notif:'save'})
            else prepareSubmit()
        } else if(type==='password') {
            const dataInput={
                ...input,
                password:inputPass?.password
            }
            handleSubmit(dataInput)
        }
    },[prepareSubmit,infoChange,input,inputPass.password,handleSubmit])
    /* END SAVE SETTING */

    /* SWITCH NOTIFICATION */
    const switchNotificationChange=React.useCallback((type,name)=>(e)=>{
        setNotification((prev)=>({
            ...prev,
            [type]: {
                ...prev?.[type],
                [name]:e.target.checked
            }
        }))
    },[setNotification]);

    const handleSubmitNotificationChange = React.useCallback(()=>{
        setLoading('save_notification')
        captchaRef.current?.execute()
        .then(recaptcha=>put(`/v1/setting/notification`,{...notification,recaptcha}))
        .then(()=>{
            setLoading(null);
        }).catch((err)=>{
            setLoading(null)
        })
    },[put,notification])
    /* END SWITCH NOTIFICATION */

    /* SWITCH ENABLE */
    const prepareSwitchEnable=React.useCallback((event)=>{
        const checked=event.target.checked;
        setDialog({type:'password',notif:'enable',enable:checked});
    },[])

    const switchEnableChange=React.useCallback((type,val)=>{
        setLoading('enable')
        const dataInput = {enable:dialog?.enable,password:inputPass?.password};
        put(`/v1/internal/authenticator`,dataInput).then(()=>{
            setSecurity((prev)=>({
                ...prev,
                enable:dataInput?.enable
            }))
            setLoading(null)
            setDialog(null)
        }).catch((err)=>{
            setLoading(null)
        })
    },[dialog,inputPass?.password,put,setSecurity])
    /* END SWITCH ENABLE */

    /* SWITCH APP ENABLE */
    const prepareSwitchAppEnableChange=React.useCallback((e)=>{
        const checked=e.target.checked;
        setDialog({type:'password',notif:'app_enable',enable:checked});
    },[])

    const switchAppEnableChange=React.useCallback((type,value)=>{
        setLoading('app_enable')
        const dataInput = {password:inputPass?.password};
        const url = dialog?.enable ? `/v1/internal/authenticator` : `/v1/internal/authenticator/delete`;
        post(url,dataInput,{},{success_notif:false}).then(([res])=>{
            setLoading(null)
            if(dialog?.enable && res?.secret && res?.qr_code && res?.token) {
                setDialog({type:'app_enable',secret:res.secret,qr_code:res.qr_code,token:res?.token})
            } else if(!dialog?.enable) {
                setDialog(null)
                setSecurity(prev=>({
                    ...prev,
                    app_enable:dialog?.enable
                }))
            }
        }).catch((err)=>{
            setLoading(null)
        })
    },[dialog,inputPass?.password,post,setSecurity])

    const verifyAppEnable=React.useCallback(()=>{
        setLoading('verify_app_enable')
        post(`/v1/internal/authenticator/verify`,{token:dialog?.token,code:inputLain}).then(()=>{
            setLoading(null)
            setDialog(null)
            setSecurity(prev=>({
                ...prev,
                app_enable:true
            }))
        }).catch((err)=>{
            setLoading(null)
        })
    },[post,setSecurity,dialog,inputLain])
    /* END SWITCH APP ENABLE */

    /* HANDLE TELEPHONE CHANGE */
    const telephoneCompleteChange=React.useCallback((value,newValue)=>{
        if(newValue && newValue.code) {
            setTelephone(prev=>({
                ...prev,
                code:newValue.code,
                label:newValue.label
            }))
        }
    },[setTelephone])

    const telephoneChange=React.useCallback((e)=>{
        setTelVerify(true)
        setTelephone((tel)=>({
            ...tel,
            number:`${e?.target?.value}`
        }))
    },[setTelephone])

    const prepareTelephoneVerify=React.useCallback(()=>{
        setDialog({type:'password',notif:'telephone_enable',enable:true});
    },[])

    const telephoneVerifyFirst=React.useCallback((value)=>{
        setLoading('verify_telephone')
        const dataInput={
            code:`+${telephone?.code}`,
            phone:telephone?.number,
            ...value
        }
        post(`/v1/internal/authenticator/sms`,dataInput,{},{success_notif:false}).then(([res])=>{
            setDialog({type:'send_telephone'}) //INI!!
            setTimeout(()=>{
                const auth = getAuth(firebaseApp);
                window.recaptchaVerifier = new RecaptchaVerifier('recaptchaContainer',{},auth);
                signInWithPhoneNumber(auth,res.telephone, window.recaptchaVerifier)
                .then((confirmationResult)=>{
                    setNotif("SMS sent",false);
                    window.confirmationResult = confirmationResult;
                    setDialog({type:'verify_telephone'})
                    window.recaptchaVerifier.clear()
                }).catch((error)=>{
                    console.log(error)
                    setNotif("Something went wrong. Please try again later!",true);
                    window.recaptchaVerifier.render().then((widgetId)=>{
                        window.grecaptcha.reset(widgetId);
                    })
                }).finally(()=>{
                    setLoading(null)
                    setBackdrop(false)
                });
            },500);
        }).catch((err)=>{
            
        }).finally(()=>{
            setLoading(null)
            setBackdrop(false)
        })
    },[post,setNotif,telephone])
    
    const telephoneVerifySecond=React.useCallback(()=>{
        setLoading('verify_telephone')
        window.confirmationResult.confirm(inputLain).then((result)=>{
            const dataInput={uid:result.user.uid,user:result.user.displayName,email:result.user.email}
            post(`/v1/internal/authenticator/sms/verify`,dataInput).then(([res])=>{
                setLoading(null)
                setDialog(null)
                setTelVerify(false)
                setInput(prev=>({
                    ...prev,
                    telephone:res.data
                }))
            }).catch((err)=>{
                setLoading(null)
            })
        }).catch(()=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
    },[setInput,post,inputLain])

    const prepareTelephoneRemove=React.useCallback(()=>{
        setDialog({type:'password',notif:'telephone_remove'});
    },[])
    
    const telephoneRemove=React.useCallback((value)=>{
        setLoading('remove_telephone')
        post(`/v1/internal/authenticator/sms/delete`,value).then(([res])=>{
            setLoading(null)
            setTelVerify(false)
            setDialog(null)
            setInput(prev=>({
                ...prev,
                telephone:{
                    code:"62",
                    number:"",
                    label:"Indonesia (+62)"
                }
            }))
        }).catch((err)=>{
            setLoading(null)
        })
    },[post,setInput])
    /* END HANDLE TELEPHONE CHANGE */

    /* DELETE SESSION */
    const handleDeleteSession=React.useCallback((value,index)=>{
        setLoading('delete_session')
        post(`/v1/setting/session`,value).then(([res])=>{
            setTelVerify(false)
            setDialog(null)
            const aa=[...session?.data];
            aa.splice(index,1)
            setSession({...session,data:aa})
            mutate();
        }).catch((err)=>{
            
        }).finally(()=>{
            setLoading(null)
            setBackdrop(false)
        })
    },[session,post,mutate])

    const prepareDeleteSession=React.useCallback((id,index)=>{
        const sess_id=id;
        const iindex=index;
        setDialogSession(null)
        if(challenge!==null) {
            withSecurity().then((res)=>{
                const dataInput={
                    password:tokenChallenge,
                    payload:res,
                    session_id:sess_id,
                }
                handleDeleteSession(dataInput,iindex);
            }).catch(()=>{
                setLoading(null)
                setBackdrop(false)
                setDialog({type:'password',notif:'delete_session',session_id:sess_id,index:iindex});
            })
        } else {
            setLoading(null)
            setBackdrop(false)
            setDialog({type:'password',notif:'delete_session',session_id:sess_id,index:iindex});
        }
    },[challenge,withSecurity,handleDeleteSession,tokenChallenge])
    /* END DELETE SESSION */

    /* DELETE APPS SESSION */
    const handleDeleteAppsSession=React.useCallback((value,_)=>{
        setLoading('delete_apps_session')
        post(`/v1/setting/session/apps`,value).then(([res])=>{
            setTelVerify(false)
            setDialog(null)
            mutateAppSession()
        }).catch((err)=>{
            
        }).finally(()=>{
            setLoading(null)
            setBackdrop(false)
        })
    },[post,mutateAppSession])

    const prepareDeleteAppsSession=React.useCallback((id,index)=>{
        const sess_id=id;
        const iindex=index;
        setDialogAppsSession(null)
        if(challenge!==null) {
            withSecurity().then((res)=>{
                const dataInput={
                    password:tokenChallenge,
                    payload:res,
                    session_id:sess_id,
                }
                handleDeleteAppsSession(dataInput,iindex);
            }).catch(()=>{
                setLoading(null)
                setBackdrop(false)
                setDialog({type:'password',notif:'delete_apps_session',session_id:sess_id,index:iindex});
            })
        } else {
            setLoading(null)
            setBackdrop(false)
            setDialog({type:'password',notif:'delete_apps_session',session_id:sess_id,index:iindex});
        }
    },[challenge,withSecurity,handleDeleteAppsSession,tokenChallenge])
    /* END DELETE APPS SESSION */

    React.useEffect(()=>{
        if(dataSecurity) {
            setSecurity(dataSecurity?.security)

            if(dataSecurity?.security_key && challenge===null) {
                post(`/v1/setting/security-key/prepare-login`,{},{},{error_notif:false,success_notif:false}).then(([res])=>{
                    if(res.challenge && res?.token) {
                        setChallenge(res.challenge)
                        setTokenChallenge(res?.token);
                    } else {
                        setChallenge(null);
                        setTokenChallenge(null);
                    }
                }).catch((err)=>{
                    setChallenge(null);
                    setTokenChallenge(null);
                })
            }
        }
    },[dataSecurity,challenge,post])

    React.useEffect(()=>{
        if(data) {
            const sl = slug?.[0];
            if(sl === 'account') {
                setInput(data)
                const {country,...rest} = data?.telephone
                setTelephone(data?.telephone)
            } else if(sl === 'notification') {
                setNotification(data)
            } else if(sl === 'security') {
                const sess = data?.data?.map(dt=>{
                    const date = getDayJs(dt?.timestamp);
                    const day = date.format("MMM DD, YYYY");
                    const time = date.format("HH:mm");
                    return {
                        ...dt,
                        day,
                        time
                    }
                })
                setSession({...data,data:sess})
            }
        }
    },[data,slug])

    React.useEffect(() => {
        if(option.length === 0) {
            get(`/v1/internal/list_telephone`,{error_notif:false})
            .then(([res])=>{
                setLoadingList(false)
                const list = Object.keys(res).map(k=>{
                    return {
                        code:k,
                        label:res?.[k]
                    }
                })
                setOption(list);
            }).catch((err)=>{
                setLoadingList(false)
            })
        }
    },[openList,option])

    React.useEffect(()=>{
        if(Notification.permission === 'granted') setPushNot(true);
    },[])

    React.useEffect(()=>{
        const tabsArr = ['account','notification','security'];
        if(!slug) return router.replace(`/setting/[[...slug]]`,`/setting/account`,{shallow:true})
        setTitle(`${ucwords(slug?.[0])} - Setting`)
        setSelected(slug?.[0])
        setTabValue(tabsArr.findIndex(p=>p===slug?.[0]));
        return ()=>{
            if(slug?.[0] === 'security') {
                setPage(1);
                setSessPage(1);
            }
        }
    },[slug])

    const enablePushNot=React.useCallback(()=>{
        async function registrate(registration) {
            const messaging = firebaseIsSupported() ? getMessaging(firebaseApp) : null
            if(messaging!==null) {
                const hasApps = await getInstalledApps();
                const permission = await Notification.requestPermission();
                if(permission!=='granted') return setNotif("Notification permission not granted",true);
                if(process.env.NODE_ENV === 'production') {
                    const token = await getToken(messaging,{
                        vapidKey:"BCchOVH17v-HJon-RqIZE-bWVcvVT9F2KFb73kwDwBzvlyLxG_gYMYJ_TpcCPyif4t42NSYibviJHHxjUb5nXOY",
                        serviceWorkerRegistration:registration
                    })
                    console.log("Notification permission success.");
                    post(`/v1/internal/send-notification`,{token: token,has_application:hasApps},{},{error_notif:false,success_notif:false})
                    if(typeof window !== 'undefined') {
                        window.location.reload();
                    }
                }
                setPushNot(true)
            } else {
                setNotif("Notification feature is not supported",true)
            }
        }
        if(process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.getRegistration('/')
            .then((registration)=>{
                if(registration) {
                    if(registration.active===null) {
                        navigator.serviceWorker.ready.then((reg)=>{
                            registrate(reg)
                        })
                    } else {
                        registrate(registration)
                    }
                }
            })
            .catch((err)=>{
                console.log(err)
                setNotif("Something went wrong",true);
            })
        } else {
            registrate().catch((err)=>{
                console.log(err)
                setNotif("Something went wrong",true);
            })
        }
    },[setNotif,post])

    const openInfoSession=React.useCallback((session,index)=>{
        let info = {
            ip_address:session?.ip_address,
            location: session?.location
        }
        if(typeof session?.info === 'object') {
            info = {
                ...info,
                ...session?.info
            }
        }
        const arr = Object.keys(info).map((i)=>{
            return {
                name:i,
                value:info?.[i]
            }
        })
        setDialogSession({
            id:session?.id,
            index,
            info:arr
        });
    },[])

    const openInfoAppSession = React.useCallback((session)=>{
        const date = getDayJs(session?.timestamp);
        let info = {
            'Date & Time':date.pn_format('full'),
            'IP Address':session?.ip_address,
            'Apps ID': session?.apps?.id,
            'Apps Name':session?.apps?.name,
            'Grant Types': session?.grant_types,
            'Scopes': session?.scopes
        }

        const arr = Object.keys(info).map((i)=>{
            return {
                name:i,
                value:info?.[i]
            }
        })

        setDialogAppsSession({
            id:session?.id,
            info:arr
        });
    },[])

    return (
        <Header active='setting' subactive={slug?.[0]||''} title={title} canonical={slug ? `/setting/${slug?.[0]}` : '/setting'}  noIndex>
            <AppBar position='sticky' color='default' className={classNames(classes.rootAppBar,!toggleDrawer&&classes.drawerClose)}>
                <Tabs
                    value={tabValue}
                    indicatorColor="primary"
                    aria-label="Tab Menu"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Link key='link-1' href='/setting/[[...slug]]' as={`/setting/account`} shallow={true} scroll={false} replace passHref><Tab icon={<AccountCircle />} iconPosition='start' wrapped component='a' label="Account" className={classNames('MuiTab-fullWidth',classes.rootTab,selected==='account' ? classes.selected : '')} /></Link>
                    <Link key='link-1' href='/setting/[[...slug]]' as={`/setting/notification`} shallow={true} scroll={false} replace passHref><Tab icon={<NotifIcon />} iconPosition='start' wrapped component='a' label="Notification" className={classNames('MuiTab-fullWidth',classes.rootTab,selected==='notification' ? classes.selected : '')} /></Link>
                    <Link key='link-1' href='/setting/[[...slug]]' as={`/setting/security`} shallow={true} scroll={false} replace passHref><Tab icon={<SecIcon />} iconPosition='start' wrapped component='a' label="Security" className={classNames('MuiTab-fullWidth',classes.rootTab,selected==='security' ? classes.selected : '')} /></Link>
                </Tabs>
            </AppBar>
            <div style={{paddingTop:64}}>
                <Grid container spacing={2} justifyContent='center'>
                    {selected!==null ? (
                        <>
                            {!data && !error ? (
                                <Grid item xs={12}>
                                    <PaperBlock disableSlideDown whiteBg>
                                        <div style={{textAlign:'center'}}>
                                            <CircularProgress thickness={5} size={50}/>
                                        </div>
                                    </PaperBlock>
                                </Grid>
                            ) : error ? (
                                <Grid item xs={12}>
                                    <PaperBlock disableSlideDown whiteBg>
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant='h5' component='h5'>{error}</Typography>
                                        </div>
                                    </PaperBlock>
                                </Grid>
                            ) : selected==='account' ? (
                                <Grid item xs={12}>
                                    <form onSubmit={preprepareSubmit('check')}>
                                        <PaperBlock title="Account Setting" linkColor whiteBg
                                        footer={
                                            <div className={classes.div}>
                                                <Button sx={{mb:{xs:1,sm:1,md:0,lg:0,xl:0}}} disabled={loading!==null} color='secondary' onClick={()=>setDialog({type:'pemberitahuan',notif:'deactive'})} tooltip='Deactive Account' loading={loading==='deactive_account'}>Deactive Account</Button>
                                                <Button sx={{mb:{xs:1,sm:1,md:0,lg:0,xl:0}}} disabled={loading!==null} outlined onClick={()=>setDialog({type:'change_password'})} tooltip='Change Password' loading={loading==='change_password'}>Change Password</Button>
                                                <Button disabled={loading!==null} type='submit' tooltip='Save' icon='submit' loading={loading==='save_account'}>Save</Button>
                                            </div>
                                        }
                                        >
                                            <Grid container spacing={4}>
                                                <Grid item xs={12} lg={6}>
                                                    <TextField
                                                        value={input?.username}
                                                        fullWidth
                                                        variant='outlined'
                                                        required
                                                        onChange={e=>inputChange('username',e.target.value)}
                                                        label="Username"
                                                        disabled={loading!==null}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <TextField
                                                        value={input?.email}
                                                        fullWidth
                                                        variant='outlined'
                                                        required
                                                        onChange={e=>inputChange('email',e.target.value)}
                                                        label="Email"
                                                        disabled={loading!==null}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <FormGroup>
                                                        <FormControlLabel
                                                        style={{marginTop:0}}
                                                        control={
                                                            <Switch disabled={loading!==null} checked={input?.private||false} color="primary" onChange={e=>inputChange('private',e.target.checked)} />
                                                        }
                                                        label={
                                                            <div style={{display:'flex',alignItems:'center'}}>
                                                                <Typography variant='body1' component='p' style={{marginRight:10}}>Set profile to private</Typography>
                                                                <IconButton onClick={handlePopOver('profile-private')} size="large">
                                                                    <Help />
                                                                </IconButton>
                                                                <Popover
                                                                    open={popover==='profile-private'}
                                                                    onClose={closePopOver}
                                                                    anchorReference="anchorPosition"
                                                                    anchorPosition={
                                                                        anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                                    }
                                                                >
                                                                    <Typography className={classes.popover}>Only your followers can see your profile</Typography>
                                                                </Popover>
                                                            </div>
                                                        }
                                                        />
                                                    </FormGroup>
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <FormGroup>
                                                        <FormControlLabel
                                                        style={{marginTop:0}}
                                                        control={
                                                            <Switch disabled={loading!==null} checked={input?.media_private||false} color="primary" onChange={e=>inputChange('media_private',e.target.checked)} />
                                                        }
                                                        label={
                                                            <div style={{display:'flex',alignItems:'center'}}>
                                                                <Typography variant='body1' component='p' style={{marginRight:10}}>Set media to private</Typography>
                                                                <IconButton onClick={handlePopOver('media-private')} size="large">
                                                                    <Help />
                                                                </IconButton>
                                                                <Popover
                                                                    open={popover==='media-private'}
                                                                    onClose={closePopOver}
                                                                    anchorReference="anchorPosition"
                                                                    anchorPosition={
                                                                        anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                                    }
                                                                >
                                                                    <Typography className={classes.popover}>Only your followers can see your media</Typography>
                                                                </Popover>
                                                            </div>
                                                        }
                                                        />
                                                    </FormGroup>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant='h6' component='p'>Telephone</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Autocomplete
                                                                open={openList}
                                                                disableClearable
                                                                value={telephone}
                                                                onChange={telephoneCompleteChange}
                                                                isOptionEqualToValue={(option, value) => option.code == value.code}
                                                                getOptionLabel={(option) => {
                                                                    if (typeof option === 'string') {
                                                                        return option;
                                                                    }
                                                                    return option.label
                                                                }}
                                                                options={option}
                                                                loading={loadingList || option.length===0 && openList}
                                                                onOpen={() => {
                                                                    setOpenList(true);
                                                                }}
                                                                disabled={loading!==null}
                                                                onClose={() => {
                                                                    setOpenList(false);
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        variant="outlined"
                                                                        disabled={loading!==null}
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            autoComplete: 'new-password',
                                                                            endAdornment: (
                                                                            <React.Fragment>
                                                                                {loadingList ? <CircularProgress color="inherit" size={20} /> : null}
                                                                                {params.InputProps.endAdornment}
                                                                            </React.Fragment>
                                                                            ),
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                value={telephone?.number}
                                                                fullWidth
                                                                variant='outlined'
                                                                onChange={telephoneChange}
                                                                disabled={loading!==null}
                                                                type='number'
                                                            />
                                                        </Grid>
                                                        {telVerify && (
                                                            <Grid item xs={12}>
                                                                <div className='flex-header'>
                                                                    <Button disabled={loading!==null} color='secondary' loading={loading==='remove_telephone'} onClick={prepareTelephoneRemove}>Remove</Button>
                                                                    <Button disabled={loading!==null} onClick={prepareTelephoneVerify} loading={loading==='verify_telephone'}>Verify</Button>
                                                                </div>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <TextField
                                                        value={input?.instagram === null ? "" : input?.instagram}
                                                        fullWidth
                                                        variant='outlined'
                                                        onChange={e=>inputChange('instagram',e.target.value)}
                                                        label="Instagram Username"
                                                        disabled={loading!==null}
                                                        helperText="Without '@'"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <TextField
                                                        value={input?.line === null ? "" : input?.line}
                                                        fullWidth
                                                        variant='outlined'
                                                        onChange={e=>inputChange('line',e.target.value)}
                                                        label="Line"
                                                        disabled={loading!==null}
                                                        helperText="Without '@'"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <Typography variant='h6' component='p'>Google</Typography>
                                                    {input?.google===null ? (
                                                        <a href={`${process.env.ACCOUNT_URL}/google/link`}>
                                                            <Image src={`${process.env.CONTENT_URL}/social-logo/google-sign-logo.png`} />
                                                        </a>
                                                    ) : (
                                                        <div>
                                                            <Typography>{input?.google}</Typography>
                                                            <Typography><a href={`${process.env.ACCOUNT_URL}/google/logout?redirect=${encodeURIComponent(`${process.env.URL}/setting/account`)}`}>Logout</a></Typography>
                                                        </div>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <Typography variant='h6' component='p'>Twitter</Typography>
                                                    {input?.twitter===null ? (
                                                        <a href={`${process.env.ACCOUNT_URL}/twitter/login?redirect=${encodeURIComponent(`${process.env.URL}/setting/account`)}`}>
                                                            <Image src={`${process.env.CONTENT_URL}/social-logo/twitter-sign-logo.png`} style={{width:171}} />
                                                        </a>
                                                    ) : (
                                                        <div>
                                                            <Typography>{input?.twitter}</Typography>
                                                            <Typography><a href={`${process.env.ACCOUNT_URL}/twitter/logout?redirect=${encodeURIComponent(`${process.env.URL}/setting/account`)}`}>Logout</a></Typography>
                                                        </div>
                                                    )}
                                                </Grid>
                                                <Grid item xs={12} lg={6}>
                                                    <Typography variant='h6' component='p'>Telegram</Typography>
                                                    {input?.telegram===null ? (
                                                        <TelegramLoginButton botName="portalnesia_bot" dataAuthUrl="https://portalnesia.com/telegram/oauth" requestAccess='write' buttonSize='medium' />
                                                    ) : (
                                                        <div>
                                                            <Typography>{input?.telegram}</Typography>
                                                            <Typography><a href={`${process.env.ACCOUNT_URL}/telegram/logout?redirect=${encodeURIComponent(`${process.env.URL}/setting/account`)}`}>Logout</a></Typography>
                                                        </div>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </PaperBlock>
                                    </form>
                                </Grid>
                            ) : selected==='notification' ? (
                                <Grid item xs={12}>
                                    <PaperBlock title="Notification Setting" whiteBg
                                    footer={
                                        <div>
                                            <Button disabled={loading!==null} loading={loading !== null} sx={{mr:1,height:'100%'}} onClick={handleSubmitNotificationChange} tooltip='Save' icon='submit'>Save</Button>
                                        </div>
                                    }
                                    >
                                        <div style={{marginBottom:20}}>
                                            <div className="flex-header">
                                                <Typography variant='h6' component='p'>Push Notification</Typography>
                                                {!pushNot && (
                                                    <FormGroup>
                                                        <FormControlLabel
                                                            style={{marginTop:0}}
                                                            control={
                                                                <Switch disabled={loading!==null} checked={pushNot} onChange={enablePushNot} color="primary" />
                                                            }
                                                            label={
                                                                <div></div>
                                                            }
                                                        />
                                                    </FormGroup>
                                                )}
                                            </div>
                                            
                                            <div style={{margin:'10px 0'}}><Divider /></div>
                                            {pushNot ? 
                                                notification?.push && typeof notification?.push === 'object' && !isEmptyObj(notification?.push) ? Object.keys(notification?.push).map((dt,i)=>(
                                                    <div key={`push-${i}`} className='flex-header'>
                                                        <div style={{display:'flex',alignItems:'center'}}>
                                                            <Typography variant='body1' component='p' style={{marginRight:10}}>{notif_name?.[dt]}</Typography>
                                                            <IconButton onClick={handlePopOver(`push-${dt}`)} size="large">
                                                                <Help />
                                                            </IconButton>
                                                            <Popover
                                                                open={popover===`push-${dt}`}
                                                                onClose={closePopOver}
                                                                anchorReference="anchorPosition"
                                                                anchorPosition={
                                                                    anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                                }
                                                            >
                                                                <Typography className={classes.popover}>{push_help?.[dt]}</Typography>
                                                            </Popover>
                                                        </div>
                                                        <FormGroup>
                                                            <FormControlLabel
                                                            style={{marginTop:0}}
                                                            control={
                                                                <Switch disabled={loading!==null} checked={notification?.push?.[dt]||false} onChange={switchNotificationChange('push',dt)} color="primary" />
                                                            }
                                                            label={
                                                                <div></div>
                                                            }
                                                            />
                                                        </FormGroup>
                                                    </div>
                                                )) : null
                                            : (
                                                <Typography>Please enable notification permission.</Typography>
                                            )}
                                            
                                        </div>
                                        <div style={{margin:'10px 0'}}>
                                            <Typography variant='h6' component='p'>Email Notification</Typography>
                                            <div style={{margin:'10px 0'}}><Divider /></div>
                                            {notification?.email && typeof notification?.email === 'object' && !isEmptyObj(notification?.email) ? Object.keys(notification?.email).map((dt,i)=>(
                                                <div key={`email-${i}`} className='flex-header'>
                                                    <div style={{display:'flex',alignItems:'center'}}>
                                                        <Typography variant='body1' component='p' style={{marginRight:10}}>{notif_name?.[dt]}</Typography>
                                                        <IconButton onClick={handlePopOver(`email-${dt}`)} size="large">
                                                            <Help />
                                                        </IconButton>
                                                        <Popover
                                                            open={popover===`email-${dt}`}
                                                            onClose={closePopOver}
                                                            anchorReference="anchorPosition"
                                                            anchorPosition={
                                                                anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                            }
                                                        >
                                                            <Typography className={classes.popover}>{email_help?.[dt]}</Typography>
                                                        </Popover>
                                                    </div>
                                                    <FormGroup>
                                                        <FormControlLabel
                                                        style={{marginTop:0}}
                                                        control={
                                                            <Switch disabled={loading!==null} checked={(notification?.email?.[dt])||false} onChange={switchNotificationChange('email',dt)} color="primary" />
                                                        }
                                                        label={
                                                            <div></div>
                                                        }
                                                        />
                                                    </FormGroup>
                                                </div>
                                            )) : null}
                                        </div>
                                    </PaperBlock>
                                </Grid>
                            ) : selected==='security' ? (
                                <>
                                    <Grid item xs={12}>
                                        <PaperBlock title="Two Factor Authentication" whiteBg
                                        action={
                                            <FormGroup>
                                                <FormControlLabel
                                                style={{marginTop:0}}
                                                control={
                                                    <Switch disabled={loading!==null} checked={security?.enable||false} onChange={prepareSwitchEnable} color="primary" />
                                                }
                                                label={
                                                    <div></div>
                                                }
                                                />
                                            </FormGroup>
                                        }
                                        >
                                            <div className='flex-header'>
                                                <div style={{display:'flex',alignItems:'center'}}>
                                                    <Typography variant='h6' component='p' style={{marginRight:10}}>Security Key</Typography>
                                                    <IconButton onClick={handlePopOver('security-key')} size="large">
                                                        <Help />
                                                    </IconButton>
                                                    <Popover
                                                        open={popover==='security-key'}
                                                        onClose={closePopOver}
                                                        anchorReference="anchorPosition"
                                                        anchorPosition={
                                                            anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                        }
                                                    >
                                                        <Typography className={classes.popover}>Login with devices security (fingerprint). <a href='/blog/cara-login-menggunakan-security-key' target='_blank' className='a-blank underline'>Learn more</a></Typography>
                                                    </Popover>
                                                </div>
                                                <Button onClick={()=>router.push('/setting/security-key')}>Manage</Button>
                                            </div>
                                            <div style={{margin:'10px 0'}}><Divider /></div>
                                            <Typography variant='h6' component='p'>Mobile App Authentication</Typography>
                                            <FormGroup>
                                                <FormControlLabel
                                                style={{marginTop:0}}
                                                control={
                                                    <Switch disabled={loading!==null} checked={security?.app_enable||false} onChange={prepareSwitchAppEnableChange} color="primary" />
                                                }
                                                label={
                                                    <div style={{display:'flex',alignItems:'center'}}>
                                                        <Typography variant='body1' component='p' style={{marginRight:10}}>Two Factors Authentication</Typography>
                                                        <IconButton onClick={handlePopOver('mobile-auth')} size="large">
                                                            <Help />
                                                        </IconButton>
                                                        <Popover
                                                            open={popover==='mobile-auth'}
                                                            onClose={closePopOver}
                                                            anchorReference="anchorPosition"
                                                            anchorPosition={
                                                                anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                                            }
                                                        >
                                                            <Typography className={classes.popover}>Login with one time password from google authenticator or other authenticator applications. <a href='/blog/cara-mengaktifkan-verifikasi-dua-langkah' target='_blank' className='a-blank underline'>Learn more</a></Typography>
                                                        </Popover>
                                                    </div>
                                                }
                                                />
                                            </FormGroup>
                                        </PaperBlock>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <PaperBlock title="Sessions Login" noPadding whiteBg
                                            footer={
                                                <Pagination color='primary' count={(session?.total_page||1)} page={Number(page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={(_,e)=>setPage(e)} />
                                            }
                                        >
                                            <List>
                                                {session?.data?.map((s,i)=>(
                                                    <ListItemButton
                                                        key={`list-session-${i}`}
                                                        onClick={()=>openInfoSession(s,i)}
                                                        disabled={loading!==null}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant='body1'>
                                                                    {s?.browser}
                                                                    &nbsp;
                                                                    {s?.this_browser && <span style={{fontWeight:'bold'}}>(This Device)</span>}
                                                                </Typography>
                                                            }
                                                            secondary={<Typography variant='body2'>{`${s?.day}, ${s?.time}`}</Typography>}
                                                        />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </PaperBlock>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <PaperBlock title="Apps & Website" noPadding whiteBg
                                            footer={
                                                <Pagination color='primary' count={(appSession?.total_page||1)} page={Number(sessPage||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={(_,e)=>setSessPage(e)} />
                                            }
                                        >
                                            <List>
                                                {(!appSession && errAppSession) || appSession?.data?.length === 0 ? (
                                                    <ListItem>
                                                        <ListItemText primary="No Data" />
                                                    </ListItem>
                                                ) : appSession?.data?.map((s,i)=>(
                                                    <ListItemButton
                                                        key={`list-apps-session-${i}`}
                                                        onClick={()=>openInfoAppSession(s)}
                                                        disabled={loading!==null}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant='body1'>
                                                                    {s?.apps?.name}
                                                                </Typography>
                                                            }
                                                            secondary={<Typography variant='body2'>{`${getDayJs(s?.timestamp).pn_format('full')}`}</Typography>}
                                                        />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </PaperBlock>
                                    </Grid>
                                </>
                            ) : null}
                        </>
                    ) : null}
                </Grid>
            </div>
            <Backdrop open={backdrop} />
            <Dialog onClose={()=>setDialogSession(null)} open={dialogSession !== null} aria-labelledby='dialog' maxWidth='md' fullWidth scroll='body'>
                <DialogTitle>Session Detail</DialogTitle>
                <DialogContent dividers>
                    <div style={{overflowX:'auto'}}>
                        <Table>
                            <TableBody>
                                {dialogSession?.info?.map(d=>(
                                    <TableRow key={d?.name}>
                                        <TableCell>{d?.name}</TableCell>
                                        <TableCell>{d?.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' sx={{mr:1}} disabled={loading!==null} loading={loading==='delete_session'} icon='delete' onClick={()=>prepareDeleteSession(dialogSession?.id,dialogSession?.index)}>Delete Session</Button>
                    <Button disabled={loading!==null} onClick={()=>setDialogSession(null)}>OK</Button>
                </DialogActions>
            </Dialog>

            <Dialog onClose={()=>setDialogAppsSession(null)} open={dialogAppsSession !== null} aria-labelledby='dialog' maxWidth='md' fullWidth scroll='body'>
                <DialogTitle>Apps Session Detail</DialogTitle>
                <DialogContent dividers>
                    <div style={{overflowX:'auto'}}>
                        <Table>
                            <TableBody>
                                {dialogAppsSession?.info?.map(d=>{
                                    if(d?.name !== 'Scopes') {
                                        return (
                                            <TableRow key={d?.name}>
                                                <TableCell>{d?.name}</TableCell>
                                                <TableCell>{d?.value}</TableCell>
                                            </TableRow>
                                        )
                                    } else {
                                        return (
                                            <TableRow key={d?.name}>
                                                <TableCell>{d?.name}</TableCell>
                                                <TableCell>
                                                    {d?.value?.map(s=>(
                                                        <Box mt={2} key={s?.id}>
                                                            <Typography>{s?.id}</Typography>
                                                            <ul>
                                                                {s?.description?.map(d=>(
                                                                    <li key={`${s?.id}-${d}`}>{d}</li>
                                                                ))}
                                                            </ul>
                                                        </Box>
                                                    ))}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' sx={{mr:1}} disabled={loading!==null} loading={loading==='delete_apps_session'} icon='delete' onClick={()=>prepareDeleteAppsSession(dialogAppsSession?.id)}>Delete Apps</Button>
                    <Button disabled={loading!==null} onClick={()=>setDialogAppsSession(null)}>OK</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialog?.type==='pemberitahuan'} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>Warning</DialogTitle>
                <DialogContent dividers>
                    {dialog?.notif==='save' ? (
                        <>
                            {infoChange?.username && (
                                <Typography gutterBottom>Change username?</Typography>
                            )}
                            {infoChange?.email && (
                                <Typography gutterBottom>Change email?</Typography>
                            )}
                        </>
                    ) : dialog?.notif==='deactive' ? (
                        <ul>
                            <li><Typography>Please make sure that you will make a request to deactivate your account.</Typography></li>
                            <li><Typography>You can reactivate your account at any time. We will give instructions via email. Please check your inbox and spam folder.</Typography></li>
                            <li><Typography>You will not be able to access your account until you reactivate it.</Typography></li>
                        </ul>
                    ) :null}
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading!==null} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                    {dialog?.notif==='save' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>{setDialog(null),prepareSubmit()}}>OK</Button>
                    ) : dialog?.notif==='deactive' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>setDialog({...dialog,type:'password'})}>Understand</Button>
                    ) : null}
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialog?.type==='password'}
                aria-labelledby='dialog'
                TransitionProps={{
                    onExited: ()=>{setInputPass({second_password:"",password:'',new_password:''}),setPass(false)}
                }}>
                <DialogTitle>Type Your Password</DialogTitle>
                <DialogContent dividers>
                    <FormControl variant="outlined" disabled={loading!==null} fullWidth>
                        <InputLabel htmlFor="outlined-adornment1">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment1"
                            type={pass ? 'text' : 'password'}
                            value={inputPass?.password}
                            onChange={(e)=>setInputPass({...inputPass,password:e.target.value})}
                            autoFocus
                            labelWidth={80}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={()=>setPass(!pass)}
                                    onMouseDown={e=>e.preventDefault()}
                                    edge="end"
                                    size="large">
                                    {pass ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                            }
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    {dialog?.notif==='save' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={preprepareSubmit('password')} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='enable' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>switchEnableChange('password')} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='app_enable' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>switchAppEnableChange('password')} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='deactive' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>handleDeactive()} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='telephone_remove' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>telephoneRemove({password:inputPass?.password})} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='delete_session' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>handleDeleteSession({password:inputPass?.password,session_id:dialog?.session_id},dialog?.index)} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='delete_apps_session' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>handleDeleteAppsSession({password:inputPass?.password,session_id:dialog?.session_id})} icon='submit'>Submit</Button>
                    ) : dialog?.notif==='telephone_enable' ? (
                        <Button disabled={loading!==null} loading={loading!==null} onClick={()=>telephoneVerifyFirst({password:inputPass?.password})} icon='submit'>Submit</Button>
                    ) : null}
                    <Button disabled={loading!==null} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialog?.type==='change_password'}
                aria-labelledby='dialog'
                TransitionProps={{
                    onExited: ()=>{setInputPass({second_password:"",password:'',new_password:''}),setPassChange({a:false,b:false,c:false})}
                }}>
                <form onSubmit={handleChangePassword}>
                    <DialogTitle>Type Your Password</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl variant="outlined" disabled={loading!==null} fullWidth>
                                    <InputLabel htmlFor="outlined-adornment2">Old Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment2"
                                        type={passChange?.a ? 'text' : 'password'}
                                        value={inputPass?.password}
                                        onChange={(e)=>setInputPass({...inputPass,password:e.target.value})}
                                        autoFocus
                                        labelWidth={105}
                                        autoComplete='new-password'
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={()=>setPassChange({...passChange,a:!passChange?.a})}
                                                    onMouseDown={e=>e.preventDefault()}
                                                    edge="end"
                                                    size="large">
                                                    {passChange?.a ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl variant="outlined" disabled={loading!==null} fullWidth>
                                    <InputLabel htmlFor="outlined-adornment3">New Password</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment3"
                                        type={passChange?.b ? 'text' : 'password'}
                                        value={inputPass?.new_password}
                                        onChange={(e)=>setInputPass({...inputPass,new_password:e.target.value})}
                                        labelWidth={115}
                                        autoComplete='new-password'
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={()=>setPassChange({...passChange,b:!passChange?.b})}
                                                    onMouseDown={e=>e.preventDefault()}
                                                    edge="end"
                                                    size="large">
                                                    {passChange?.b ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl variant="outlined" disabled={loading!==null} fullWidth required>
                                    <InputLabel htmlFor="outlined-adornment4">New Password Again</InputLabel>
                                    <OutlinedInput
                                        id="outlined-adornment4"
                                        type={passChange?.c ? 'text' : 'password'}
                                        value={inputPass?.second_password}
                                        onChange={(e)=>setInputPass({...inputPass,second_password:e.target.value})}
                                        labelWidth={175}
                                        autoComplete='new-password'
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={()=>setPassChange({...passChange,c:!passChange?.c})}
                                                    onMouseDown={e=>e.preventDefault()}
                                                    edge="end"
                                                    size="large">
                                                    {passChange?.c ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={loading!==null} loading={loading!==null} type='submit'>Submit</Button>
                        <Button color='secondary' disabled={loading!==null} onClick={()=>setDialog(null)}>Cancel</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog
                open={dialog?.type==='app_enable'}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInputLain("")
                }}>
                <DialogTitle>Verify</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                {dialog?.qr_code && <Image src={dialog?.qr_code} style={{width:'100%',maxWidth:300,marginBottom:15}} />}
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography gutterBottom>Scan QR code above with your authenticator application, or copy this code:</Typography>
                            <TextField
                                value={dialog?.secret}
                                onClick={handleCopy}
                                multiline
                                rows={1}
                                maxRows={2}
                                fullWidth
                                variant='outlined'
                                disabled
                                inputProps={{style:{cursor:'pointer'}}}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={inputLain}
                                fullWidth
                                variant='outlined'
                                required
                                inputProps={{max:999999}}
                                type="number"
                                label="Code from authenticator app"
                                onChange={e=>setInputLain(e.target.value)}
                                disabled={loading!==null}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading!==null} loading={loading!==null} onClick={verifyAppEnable}>Verify</Button>
                    <Button disabled={loading!==null} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialog?.type==='verify_telephone'}
                aria-labelledby='dialog'
                maxWidth='sm'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInputLain("")
                }}>
                <DialogTitle>Verify</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        value={inputLain}
                        fullWidth
                        variant='outlined'
                        required
                        inputProps={{max:999999}}
                        type="number"
                        label="Verification code"
                        onChange={e=>setInputLain(e.target.value)}
                        disabled={loading!==null}
                    />
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading!==null} loading={loading!==null} onClick={telephoneVerifySecond}>Verify</Button>
                    <Button disabled={loading!==null} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={dialog?.type==='send_telephone'}
                keepMounted
                aria-labelledby='dialog'
                maxWidth='sm'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setInputLain("")
                }}>
                <DialogTitle>Please complete reCaptcha</DialogTitle>
                <DialogContent dividers>
                    <div style={{textAlign:'center'}}>
                        <center><div id="recaptchaContainer"></div></center>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading!==null} color='secondary' onClick={()=>setDialog(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Recaptcha ref={captchaRef} />
        </Header>
    );
}
const MaptoProps=state=>({
    toggleDrawer:state.toggleDrawer
})
export default connect(MaptoProps)(withStyles(Setting,styles))