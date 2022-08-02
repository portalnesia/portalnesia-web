import React from 'react'
import {makeStyles} from 'portal/components/styles';
import classNames from 'classnames'
import {isMobile} from 'react-device-detect'
import {generateRandom} from '@portalnesia/utils'
import dayjs from 'dayjs'
import Plyr from 'plyr';
import Hls from 'hls.js'
import 'plyr/dist/plyr.css'
import { CSSObject } from 'tss-react/tools/types/CSSObject';

type CssClasses = {
    audioPlayer:CSSObject,
    container:CSSObject,
    addBottom:CSSObject,
    left:CSSObject,
    right:CSSObject,
    center:CSSObject,
    hidden:CSSObject,
    noSupport:CSSObject,
    audioWrap:CSSObject,
    plWrap:CSSObject,
    tracks:CSSObject,
    nowPlay:CSSObject,
    npAction:CSSObject,
    npTitle:CSSObject,
    truncate:CSSObject,
    column:CSSObject
}

export interface PlayerProps {
    title?: string;
    type: 'audio'|'video';
    url: string|{url: string,type: string}[];
    provider?: string;
    autoPlay?: boolean;
    thumbnails?: string;
    stream?: boolean;
    onready?(): void;
    onended?(): void;
    onplay?(): void;
    onpause?(): void;
}

interface PlayerClassProps extends PlayerProps {
    classes: Record<keyof CssClasses,string>
}

interface PlayerState {
    npaction: React.ReactNode;
    nptitle: React.ReactNode;
    id: string
}

class PlayerComp extends React.PureComponent<PlayerClassProps,PlayerState> {
    plyr: Plyr|null = null;
    constructor(props: PlayerClassProps){
        super(props)
        this.state={
            npaction:'Loading...',
            nptitle:props.title,
            id:`player-container-${generateRandom()}`,
        }
        this.setTitle=this.setTitle.bind(this)
        this.onPause=this.onPause.bind(this)
        this.onPlay=this.onPlay.bind(this)
        this.loadPlayer=this.loadPlayer.bind(this);
    }

    static defaultProps={
        autoPlay:false,
        type:'video' as 'video'|'audio',
        stream:false,
        thumbnails:'/icon/android-chrome-512x512.png'
    }
    setTitle(value: React.ReactNode,action: React.ReactNode){
        this.setState({
            nptitle:value,
            npaction:action
        })
    }
    onPlay(){
        this.setState({
            npaction:'Playing...'
        })
    }
    onPause(){
        this.setState({
            npaction:"Paused..."
        })
    }
    loadPlayer(player?: Plyr){
        const plyr=player||this.plyr;
        if(plyr !==null) {
            if(this.props.provider!=="youtube") {
                plyr.on("ready",()=>{
                    this.setState({
                        npaction:''
                    })
                    if(typeof this.props.onready==='function') this.props.onready();
                });
                plyr.on("ended",()=>{
                    if(typeof this.props.onended==='function') this.props.onended();
                });
                plyr.on("play",()=>{
                    this.onPlay();
                    if(typeof this.props.onplay==='function') this.props.onplay();
                });
                plyr.on("pause",()=>{
                    this.onPause();
                    if(typeof this.props.onpause==='function') this.props.onpause();
                });
            } else {
                plyr.on("statechange",(e)=>{
                    if(e.detail.code==0) {
                        if(typeof this.props.onended==='function') this.props.onended();
                    } else if(e.detail.code==1) {
                        this.onPlay();
                        if(typeof this.props.onplay==='function') this.props.onplay();
                    } else if(e.detail.code==2) {
                        this.onPause();
                        if(typeof this.props.onpause==='function') this.props.onpause();
                    } else if(e.detail.code==-1) {
                        if(typeof this.props.onready==='function') this.props.onready();
                    }
                });
            }
        }
    }
    componentDidMount(){
        const cont=document.getElementById(this.state.id) as HTMLMediaElement|null
        if(this.props.type==='video' && cont !== null) {
            const player = new Plyr(cont,{
                captions:{
                    active: true,
                    language: 'auto',
                    update: true
                },
                tooltips:{controls: true, seek: true },
                clickToPlay:!isMobile,
                autoplay:this.props.autoPlay,
                keyboard:{focused:true,global:true},
                /*ads:{
                    enabled:true,
                    tagUrl:'https://ackbure.pro/dom.FFzLd/GXNivwZJGbUh/mekmQ9lukZ/UDl/kDP/TXQHxXNEjVcT4_NUDaAYtqN/DKEi2/NmzOgy0JMxQp'
                }*/
            });
            if(this.props.provider && this.props.provider==='youtube' && typeof this.props.url === 'string'){
                player.source = {
                    type: 'video',
                    sources: [
                        {
                            src: this.props.url,
                            provider:'youtube',
                        }
                    ]
                };
            } else {
                const sour: Plyr.Source[]=[];
                if(typeof this.props.url === 'string') {
                    sour.push({
                        src:this.props.url,
                        type:"video/mp4"
                    })
                } else {
                    this.props.url.map((u,i)=>{
                        sour.push({
                            src:u.url,
                            type:u.type||"video/mp4"
                        })
                    })
                }
                player.source = {
                    type: 'video',
                    title: this.props.title,
                    sources: sour,
                    poster:this.props.thumbnails
                };
            }
            if(this.props.stream && typeof this.props.url === 'string'){
                if (Hls.isSupported()) {
                    let hls = new Hls();
                    hls.loadSource(this.props.url);
                    hls.attachMedia(cont);
                }
            }
            this.plyr = player;
            this.loadPlayer(player);
        } else {
            if(cont !== null && typeof this.props.url === 'string') {
                const player=new Plyr(cont,{
                    autoplay:this.props.autoPlay,
                    seekTime:5,
                    controls:["restart","play","progress","current-time","duration","mute","volume"],
                    keyboard:{focused:true,global:true}
                })
                player.source = {
                    type: 'audio',
                    title: this.props.title,
                    sources: [
                        {
                            src: this.props.url,
                            type: 'audio/mp3',
                        }
                    ]
                };
                this.plyr = player;
                this.loadPlayer(player);
            }
            
        }
    }
    componentDidUpdate(prevProps){
        if(this.props.url !== prevProps.url) {
            const cont=document.getElementById(this.state.id) as HTMLMediaElement|null;
            if(this.plyr!==null && cont !== null) {
                if(this.props.type==='video') {
                    if(this.props.provider && this.props.provider==='youtube' && typeof this.props.url === 'string'){
                        this.plyr.source = {
                            type: 'video',
                            sources: [
                                {
                                    src: this.props.url,
                                    provider:'youtube',
                                }
                            ]
                        };
                    } else if(typeof this.props.url !== 'string') {
                        const sour: Plyr.Source[]=[];
                        this.props.url.map((u,i)=>{
                            sour.push({
                                src:u.url,
                                type:u.type||"video/mp4"
                            })
                        })
                        this.plyr.source = {
                            type: 'video',
                            title: this.props.title,
                            sources: sour,
                            poster:this.props.thumbnails
                        };
                    }
                    if(this.props.stream && typeof this.props.url === 'string'){
                        if (Hls.isSupported()) {
                            let hls = new Hls();
                            hls.loadSource(this.props.url);
                            hls.attachMedia(cont);
                        }
                    }
                    //this.loadPlayer(player);
                } else {
                    if(this.props.type !== prevProps.type && typeof this.props.url === 'string') {
                        this.plyr.destroy();
                        
                        const player=new Plyr(cont,{
                            autoplay:this.props.autoPlay,
                            seekTime:5,
                            controls:["restart","play","progress","current-time","duration","mute","volume"],
                            keyboard:{focused:true,global:true}
                        })
                        player.source = {
                            type: 'audio',
                            title: this.props.title,
                            sources: [
                                {
                                    src: this.props.url,
                                    type: 'audio/mp3',
                                }
                            ]
                        };
                        this.plyr = player;
                        this.setState({
                            nptitle:this.props.title
                        })
                        this.loadPlayer(player);
                    } else {
                        if(typeof this.props.url === 'string') {
                            this.setState({
                                nptitle:this.props.title
                            })
                            this.plyr.source = {
                                type: 'audio',
                                title: this.props.title,
                                sources: [
                                    {
                                        src: this.props.url,
                                        type: 'audio/mp3',
                                    }
                                ]
                            };
                        }
                    }
                }
            }
        }
    }
    componentWillUnmount(){
        if(this.plyr!==null) this.plyr.destroy();
        this.plyr = null;
    }
    render(){
        const {classes,type}=this.props;
        if(type==='video') {

            return(
                <video key={this.state.id} id={this.state.id}></video>
            )
        } else {
            return(
                <div className={classes.audioPlayer}>
                    <div className={classes.container}>
                        <div key='main' className={classNames(classes.column,classes.addBottom)}>
                            <div>
                                <div key='action' className={classes.nowPlay}>
                                    <span key='span-action' className={classes.npAction}>{this.state.npaction}</span>
                                    <span key='span-title' className={classNames(classes.npTitle,classes.truncate)}>{this.state.nptitle}</span>
                                </div>
                                <div key='audio' className={classes.audioWrap}>
                                    <div>
                                        <audio id={this.state.id} preload="metadata" controls muted>Your browser does not support HTML5 Audio!</audio>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div key='footer' className={classNames(classes.column,classes.addBottom,classes.center)}>
                            <p style={{fontSize:13}}>© {dayjs().format("YYYY")} <a className="not_blank" style={{color:'#FFF'}} href="https://portalnesia.com/" target="_blank">Portalnesia</a> Music Player</p>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

const useStyles = makeStyles<void,'npAction'|'npTitle'>()((theme,_,classes)=>({
    audioPlayer:{
        WebkitFontSmoothing:'antialiased',
        WebkitTextSizeAdjust:'100%',
        position:'relative',
        backgroundColor:'#0665a2',
        color:'#fff',
        fontSize:'1rem',
        fontFamily:'"Inter var",Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Helvetica Neue",sans-serif',
        fontWeight:300,
        letterSpacing:'.025rem',
        lineHeight:1.618,
        padding:10,
        '& p':{
            color:'#fff',
            display:'block',
            fontSize:'.9rem',
            fontWeight:400,
            margin:'0 0 2px',
            '&a':{
                lineHeight:'inherit',
                '&:visited':{
                    lineHeight:'inherit'
                }
            }
        },
        '& a':{
            color:'#8cc3e6',
            outline:0,
            textDecoration:'underline',
            '&:visited':{
                color:'#8cc3e6',
                outline:0,
                textDecoration:'underline',
            },
            '& :focus &:hover':{
                color:'#bbdef5'
            }
        }
    },
    container:{
        position:'relative',
        margin:'0 auto',
        'max-width':800,
        width:'100%',
        padding:0,
    },
    addBottom:{marginBottom:'.5rem!important'},
    left:{float:'left'},
    right:{float:'right'},
    center:{textAlign:'center'},
    hidden:{display:'none'},
    noSupport:{
        margin:'2rem auto',
        textAlign:'center',
        width:'90%',
    },
    audioWrap:{
        margin:'0 auto'
    },
    plWrap:{
        margin:'0 auto',
    },
    tracks:{
        fontSize:0,
        position:'relative',
        textAlign:'center',
        '& a':{
            borderRadius:3,
            color:'#fff',
            cursor:'pointer',
            display:'inline-block',
            fontSize:'2rem',
            height:35,
            lineHeight:0.175,
            margin:'0 5px 30px',
            padding:'10px 15px',
            textDecoration:'none',
            transition:'background .3s ease',
            '&:last-child':{
                marginLeft:0
            },
            '&:active,&:hover':{
                backgroundColor:'rgba(0,0,0,.1)',
                color:'#fff'
            },
            '&::-moz-focus-inner':{
                border:0,
                padding:0
            }
        }
    },
    nowPlay:{
        display:'block',
        fontSize:0,
        padding:'21px 10px 0 10px',
        '& span':{
            display:'inline-block',
            fontSize:'1rem',
            verticalAlign:'top',
        },
        [`& .${classes.npAction}`]:{
            textAlign:'left',
            width:'30%',
            '@media only screen and (max-width:600px)':{
                width:'100%',
                textAlign:'center'
            }
        },
        [`& .${classes.npTitle}`]:{
            textAlign:'right',
            width:'70%',
            '@media only screen and (max-width:600px)':{
                width:'100%',
                textAlign:'center'
            }
        }
    },
    npAction:{},
    npTitle:{},
    truncate:{
        textOverflow:'ellipsis',
        overflow:'hidden',
        WebkitLineClamp:1,
        [theme.breakpoints.down('md')]:{
            lineHeight:'1.5rem',
            maxHeight:'3.1rem',
            overflow:'hidden',
            position:'relative',
            marginRight:'-1em!important',
            paddingRight:'1em',
        },
    },
    column:{
        width:'inherit'
    }
}))

const PlayerForward = React.forwardRef<PlayerComp,PlayerProps>((props,ref)=>{
    const {classes} = useStyles();
    return <PlayerComp ref={ref} classes={classes} {...props} />
})

const Player = React.memo(PlayerForward);
export default Player;