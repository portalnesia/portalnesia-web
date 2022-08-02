import { alpha } from '@mui/material/styles';
//import {color} from 'portal/utils/avatar-color'
const sidebarWidth=300;
export const styleDetail=(theme,_,classes)=>{
    return {
        roottt:{
            //height:630,
            height:'calc(100% - 64px)',
            paddingBottom:'0 !important',
            zIndex:1,
            overflow:'hidden',
            position:'fixed',
            flexGrow:1,
            boxShadow:'0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
            borderRadius:2,
            [theme.breakpoints.up('sm')]: {
                display:'flex'
            },
            [theme.breakpoints.down('md')]: {
                width:'100% !important'
            }
        },
        rootttWidth:{
            [theme.breakpoints.up('md')]: {
                width:`calc(100% - 240px)`,
                marginLeft:240
            },
        },
        rootttUnWidth:{
            [theme.breakpoints.up('md')]: {
                width:`calc(100% - 66px)`,
                left:66
            },
        },
        header:{
            width:'100% !important',
            height:`${theme.spacing(8)} !important`,
            display:'flex !important',
            zIndex:'1201 !important',
            justifyContent:'center !important',
            background:`${theme.palette.mode==='dark' ? 'rgba(255,255,255,0.08)' : theme.palette.background.paper} !important`,
            color:`${theme.palette.mode==='dark' ? '#fff' : '#000'} !important`
        },
        headerIcon:{
            color:`${theme.palette.mode==='dark' ? '#fff' : '#000'} !important`
        },
        root:{
            display:'flex',
            flexGrow:1,
            flexDirection:'column',
            background:theme.custom.bgChat,
            height:`100%`,
            [theme.breakpoints.up('sm')]:{
                position:'relative',
            },
            [theme.breakpoints.down('sm')]: {
                top:0,
                left:'100vw',
                width:'100%',
                position:'absolute',
                overflow:'auto',
            },
            transition:'left .5s ease-in-out'
        },
        rootCon:{
            [theme.breakpoints.down('sm')]: {
                left:'0 !important',
                zIndex:'1200 !important',
            },
        },
        rootLight:{
            background:`${theme.palette.background.default} !important`
        },
        container:{
            height:`calc(100% - ${theme.spacing(8)})`,
            //height:580,
            //height:630,
            padding:theme.spacing(3),
            overflow:'auto',
            marginTop:theme.spacing(8),
            '& li':{
                display:'block',
                position:'relative',
                marginBottom:theme.spacing(3),
                '&:last-child':{
                    marginBottom:0,
                },
            },
            [`& .${classes.info}`]:{
                '& svg':{
                    marginRight:'.25rem',
                    fontSize:13,
                },
                [`& .${classes.read}`]:{
                    color:'#33b6f0 !important',
                },
                '& time':{
                    fontSize:12,
                },
                color:'#9e9e9e',
                display:'flex',
                alignItems:'center'
            },
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.7em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                    borderRadius:4
                },
            }
        },
        conNotif:{
            height:'100%',
            margin:0,
            marginTop:theme.spacing(8),
        },
        read:{},
        info:{},
        empty:{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
        },
        date:{
            textAlign:'center',
            margin:'20px 0',
            color:'#9e9e9e',
        },
        left:{
            [`& .${classes.chat}`]:{
                [`& > .${classes.chatP}`]:{
                    marginRight:'15%',
                    [`& .${classes.chatSpan}`]:{
                        background:theme.custom.bubbleLeftChat,
                        cursor:'pointer',
                        minWidth:150,
                    },
                    '&:first-of-type':{
                        '&::after':{
                            top:0,
                            left:'-11px',
                            content:'""',
                            position:'absolute',
                            borderBottom:'17px solid transparent',
                            borderRight:`11px solid ${theme.custom.bubbleLeftChat}`
                        },
                        [`& .${classes.chatSpan}`]:{
                            borderTopLeftRadius:0
                        }
                    },
                }
            }
        },
        right:{
            flexDirection:'row-reverse',
            [`& .${classes.chat}`]:{
                [`& > .${classes.chatP}`]:{
                    marginLeft:'15%',
                    [`& .${classes.chatSpan}`]:{
                        background:theme.custom.bubbleRightChat,
                        cursor:'pointer',
                        minWidth:150,
                    },
                    '&:first-child':{
                        '&::after':{
                            top:0,
                            right:'-11px',
                            content:'""',
                            position:'absolute',
                            borderBottom:'17px solid transparent',
                            borderLeft:`11px solid ${theme.custom.bubbleRightChat}`
                        },
                        [`& .${classes.chatSpan}`]:{
                            borderTopRightRadius:0
                        },
                    }
                },
                display:'flex',
                justifyContent:'flex-end'
            }
        },
        avatar:{
            marginRight:`${theme.spacing(1.5)} !important`
        },
        chatP:{},
        chatSpan:{
            '& a':{
                color:theme.palette.primary.link
            }
        },
        onlineStatus:{
            width:10,
            border:`1px solid #fff`,
            height:10,
            display:'inline-block',
            marginRight:5,
            borderRadius:'50%',
        },
        online:{
            background:'#CDDC39',
        },
        offline:{
            background:'#525252'
        },
        chat:{
            flex:1,
            [`& .${classes.chatP}`]:{
                position:'relative',
                marginBottom:10,
                [`& .${classes.chatSpan}`]:{
                    display:'inline-block',
                    padding:10,
                    borderRadius:10,
                    wordBreak:'break-word'
                },
            }
        },
        inputContainer:{
            display:'flex !important',
            //minHeight:55,
            maxHeight:'275px !important',
            alignItems:'center !important',
            background:`${theme.palette.mode==='dark' ? 'rgba(255,255,255,0.08)' : theme.palette.primary.light} !important`,
            bottom:'16px !important',
            margin:`0 ${theme.spacing(2)} !important`,
            position:'relative !important',
            padding:'10px !important',
        },
        iconLabel:{
            width:'100%',
            display:'flex',
            alignItems:'inherit',
            justifyContent:'inherit',
            '& svg':{
                color:theme.palette.mode==='dark' ? theme.palette.primary.main : '#fff'
            }
        },
        input:{
            width:'100% !important',
            height:'100%',
            margin:'0 !important',
            padding:`2px 20px 2px 2px !important`,
            boxSizing:'border-box !important',
            resize:'none !important',
            border:'none !important',
            boxShadow:'none !important',
            outline:'none !important',
            background:'transparent !important',
            color:`#fff !important`,
            cursor:'auto !important',
            fontFamily:'"Inter var",Inter,-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Fira Sans,sans-serif !important',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.4em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.custom.bgChat,
                    borderRadius:4
                },
            },
            '&::placeholder':{
                color:theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[100]
            },
        },
        notifSlide:{
            position:'sticky',
            top:theme.spacing(8),
            left:0,
            zIndex:1000
        },
        notif:{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            padding:'5px 15px',
            background:theme.palette.secondary.main,
            width:'100%',
            zIndex:1000,
            color:'#fff',
            '& svg':{
                color:'#fff'
            }
        },
        toBottom:{
            position:'absolute',
            bottom:theme.spacing(12),
            right:theme.spacing(2),
            background:theme.palette.getContrastText(theme.custom.bgChat),
            zIndex:1000,
            opacity:0.7,
            borderRadius:'50%',
            '&:hover':{
                opacity:1
            },
            '& svg':{
                color:theme.custom.bgChat
            }
        },
        file:{
            background:theme.custom.bgChat,
            '& svg':{
                color:theme.palette.mode==='dark' ? 'rgba(255,255,255,0.08)' : theme.palette.primary.light,
                '&:hover':{
                    color:theme.palette.mode==='dark' ? theme.palette.primary.light : theme.palette.primary.dark
                }
            },
            cursor:'pointer',
            position:'absolute',
            width:theme.spacing(3),
            height:theme.spacing(3),
            zIndex:100,
            margin:`0 ${theme.spacing(2)}`,
            transition:'bottom 0.1s'
        },
        image:{
            background:alpha(theme.palette.primary.main,0.08),
            position:'absolute',
            zIndex:90,
            margin:`0 ${theme.spacing(2)}`,
            padding:`${theme.spacing(2)} 0`,
            textAlign:'center',
            width:`calc(100% - ${theme.spacing(4)})`,
            transition:'bottom 0.5s',
            '& img':{
                width:'auto',
                maxHeight:400,
                maxWidth:`calc(100% - ${theme.spacing(5)})`,
            }
        },
        imgBtn:{
            position:'absolute',
            borderRadius:'50%',
            background:alpha(theme.palette.primary.main,0.5),
            zIndex:1001,
            '& svg':{
                color:'#fff'
            },
            top:10,
            right:27
        },
        disabled:{
            background:`${theme.palette.action.disabled} !important`
        },
    };
}

export const styleList=theme=>{

    return {
        root:{
            //height:630,
            position:'relative !important',
            //paddingBottom:theme.spacing(6),
            [theme.breakpoints.up('md')]: {
                width:`${sidebarWidth}px !important`
            },
            [theme.breakpoints.down('lg')]: {
                width:'200px !important'
            },
            [theme.breakpoints.down('sm')]: {
                width:'100% !important'
            },
            background:`${theme.palette.background.default} !important`,
        },
        docked:{
            height:'100% !important'
        },
        header:{
            display:'flex',
            padding:theme.spacing(1),
            position:'relative',
            alignItems:'center',
            justifyContent:'center',
            height:theme.spacing(8),
            background:theme.palette.mode==='dark' ? 'rgba(255,255,255,0.08)' : theme.palette.background.paper
        },
        headerContainer:{
            flex:1,
            height:'100%'
        },
        list:{
            height:`calc(100% - ${theme.spacing(14)})`,
            overflowY:'auto'
        },
        inputContainer:{
            display:'block',
            position:'relative',
            background: theme.palette.mode==='dark' ? alpha(theme.palette.common.white, 0.15) : alpha(theme.palette.grey[500], 0.15),
            borderRadius:2,
            height:'100%',
            '&:hover':{
                background: theme.palette.mode==='dark' ? alpha(theme.palette.common.white, 0.25) : alpha(theme.palette.grey[500], 0.25),
            }
        },
        search:{
            top:0,
            left:theme.spacing(1),
            width:'auto',
            height:'100%',
            display:'flex',
            position:'absolute',
            alignItems:'center',
            pointerEvents:'none',
            justifyContent:'center',
            color:theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]
        },
        closeSearch:{
            top:'0 !important',
            right:`${theme.spacing(1)} !important`,
            width:'auto !important',
            height:'100% !important',
            display:'flex',
            position:'absolute !important',
            alignItems:'center',
            justifyContent:'center',
            color:`${theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]} !important`,
            cursor:'pointer !important'
        },
        input:{
            width:'100% !important',
            border:'0 !important',
            margin:'0 !important',
            display:'block',
            padding:`${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(5)} !important`,
            background:'none !important',
            whiteSpace:'normal !important',
            verticalAlign:'middle !important',
            height:'100% !important',
            '&::placeholder':{
                color:`${theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]} !important`
            },
            color:`${theme.palette.mode==='dark' ? '#fff' : '#000'} !important`
        },
        selected:{
            background:`${alpha(theme.palette.primary.light,0.25)} !important`,
            borderLeft:`8px solid ${theme.palette.primary.dark} !important`,
            paddingLeft:`${theme.spacing(2)} !important`
        },
        listItem:{
            paddingLeft:`${theme.spacing(3)} !important`
        },
        read:{
            width:15,
            border:`1px solid #fff`,
            height:15,
            display:'inline-block',
            borderRadius:'50%',
            background:'#CDDC39'
        },
        new:{
            height:theme.spacing(6),
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            zIndex:2000,
            bottom:0,
            width:'100%',
            padding:`${theme.spacing(1)} 0`,
            borderTop:`1px solid ${theme.palette.divider}`
        },
    };
}

export const styles=theme=>({
    root:{
        //height:630,
        height:'calc(100% - 64px)',
        paddingBottom:'0 !important',
        zIndex:1,
        overflow:'hidden',
        position:'fixed',
        flexGrow:1,
        boxShadow:'0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        borderRadius:2,
        [theme.breakpoints.up('sm')]: {
            display:'flex'
        },
        [theme.breakpoints.down('md')]: {
            width:'100% !important',
        }
    },
    rootWidth:{
        [theme.breakpoints.up('md')]: {
            width:`calc(100% - 240px)`,
            marginLeft:240
        },
    },
    rootUnWidth:{
        [theme.breakpoints.up('md')]: {
            width:`calc(100% - 66px)`,
            left:66
        },
    },
    image:{
        position:'fixed',
        zIndex:1500,
        background:'rgba(255,255,255,0.5)',
        justifyContent:'center',
        alignItems:'center',
        padding:'1rem',
        '& h4':{
            color:'#000'
        },
        opacity:0,
        display:'none'
    },
    show:{
        opacity:1,
        display:'flex'
    }
})