import React from 'react'
import io,{Socket} from 'socket.io-client'
import {useSelector,useDispatch} from 'react-redux'
import {Avatar,Image} from 'portal/components'
import {useNotif} from 'portal/utils'
import {Portal,Fab,Tooltip} from '@mui/material'
import withStyles from '@mui/styles/withStyles';
import {CallEnd,Call,VolumeOff,VolumeUp,Videocam,VideocamOff,ScreenShare as ScreenShareIcon} from '@mui/icons-material'
import {isMobile} from 'react-device-detect'
import clx from 'classnames'
import Peer from 'simple-peer'
import {dataUserType} from 'portal/types/user'
import useAPI from 'portal/utils/api'

let socket: Socket|undefined=undefined,peer: Peer.Instance|undefined=undefined;

export const useSocket=()=>{
    const {get} = useAPI();
    const [mySocket,setSocket] = React.useState<Socket|undefined>(socket);
    
    React.useEffect(()=>{
        async function getSocket() {
            if(!socket && process.browser) {
                try {
                    const [token] = await get<string>("/v1/internal/socket",{error_notif:false,success_notif:false});
                    socket = io(`${process.env.API_URL}/v1?token=${token}`,{transports: ['websocket']});
                    const reconnect=(soc: Socket)=>()=>{
                        soc.emit("konek");
                    }
                    socket.emit("konek");
                    socket.on('reconnect',reconnect(socket));
                    setSocket(socket);
                } catch {
                    
                }
            }
        }
        getSocket();
    },[get])
    
    return mySocket;
}
export default useSocket;
/*const useVar=()=>{
    const call=useSelector(state=>state?.call)
    const {isCall,interval,callType,callPerson,dialer,callStatus,volume,callShow} = call;
    const dispatch = useDispatch()
    

    const setIsCal=(val)=>dispatch({type:"CALL",payload:{...call,isCall:val}})
    const setInterva=(val)=>dispatch({type:"CALL",payload:{...call,interval:val}})
    const setCallType=(val)=>dispatch({type:"CALL",payload:{...call,callType:val}})
    const setCallPerson=(val)=>dispatch({type:"CALL",payload:{...call,callPerson:val}})
    const setDialer=(val)=>dispatch({type:"CALL",payload:{...call,dialer:val}})
    const setCallStatus=(val)=>dispatch({type:"CALL",payload:{...call,callStatus:val}})
    const setVolume=(val)=>dispatch({type:"CALL",payload:{...call,volume:val}})
    const setCallShow=(val)=>dispatch({type:"CALL",payload:{...call,callShow:val}})


    return {isCal:isCall,setIsCal,interval:interval,setInterva,
        callType:callType,setCallType,callPerson:callPerson,setCallPerson,dialer:dialer,setDialer,
        callStatus:callStatus,setCallStatus,volume:volume,setVolume,callShow:callShow,setCallShow}
}*/

let audio: any=null,isCalling=false,callAccepted=false;
export const playAudio=()=>{

    const play=(type: string)=>{
        if(audio!==null) audio.pause(),audio.remove(),audio=null;
        let t=type==='incoming'?process.env.CONTENT_URL+'/audio/incoming.mp3':type==="dial"?process.env.CONTENT_URL+'/audio/dialer.mp3':process.env.CONTENT_URL+'/audio/disconnect.mp3';
        audio = document.createElement('audio')
        audio.src=t;
        audio.volume=1;
        audio.loop=type=='disconnect'?false:true;
        audio.play();
       
    }

    const pause=()=>{
        if(audio !== null) audio.pause()
    }
    
    return {play,pause}
}

export const openStream=(type: string)=>{
    const config: any = { audio: true };
    config.video=type=='video'?true:false;
    return navigator.mediaDevices.getUserMedia(config);
}
  
export const playStream=(idVideoTag: string, stream: MediaStream)=>{
    const video = document.getElementById(idVideoTag) as HTMLVideoElement;
    if(video) {
        if(idVideoTag==='remoteStream') video.volume=1;
        else video.volume=0;

        video.srcObject = stream;
        video.play();
    }
}

const styles=(theme: any)=>({
    callContainer:{
        background:theme.palette.background.paper,
        width:'100%',
        height:'100%',
        zIndex:9000,
        position:'fixed',
        top:0,
        display:'none'
    },
    callAnim:{
        background:theme.custom.dasarText,
        width:135,
        height:135,
        position:'relative',
        margin:'4rem auto',
        borderRadius:'100%',
        border:`solid ${theme.custom.dasarText}`,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        'backface-visibility': 'hidden',
        '-webkit-backface-visibility': 'hidden',
        '-moz-backface-visibility': 'hidden',
        '-ms-backface-visibility': 'hidden',
    },
    remoteStream:{
        position:'absolute',
        backgroundSize:'100%',
        left:0,
        width:'100%',
        height:'100%'
    },
    localStream:{
        zIndex:50,
        position:'absolute',
        right:0,
        backgroundSize:'100%',
        width:'35vw',
        height:'25vw',
        maxWidth:380,
        border:`solid ${theme.palette.divider}`,
        bottom:0
    },
    audio:{
        zIndex:50,
        position:'absolute',
        left:10,
        backgroundSize:'100%',
        top:10,
        '& svg':{
            fontSize:40
        }
    },
    tooltip:{fontSize:15}
})
let gStream: MediaStream|undefined,gCall: any=null,gRemoteStream: MediaStream|undefined,inactivityTimeout: NodeJS.Timeout|undefined;
const disconnect=()=>{
    const {play,pause}=playAudio();
    const call=useSelector<any,any>(state=>state?.call)
    const dispatch = useDispatch()
    //const $ = require('jquery')

    const endCall=(reason?:string)=>{
        play('disconnect');
        socket?.off('acceptCall')
        document.body.classList.remove('call-container')
        if(gStream) {
            const tracks = gStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        if(gRemoteStream) {
            const tracks = gRemoteStream.getTracks();
            tracks.forEach(track => track.stop());
        }
        if(inactivityTimeout) {
            clearTimeout(inactivityTimeout)
            inactivityTimeout = undefined
        }

        gCall=null;
        gStream=undefined;
        gRemoteStream=undefined;
        isCalling=false;
        callAccepted=false;
        callPers = {}
        dispatch({type:"CALL",payload:{...call,isCall:false,callShow:false,interval:false,callPerson:{},dialer:false,callType:null}})
    }
    return {endCall}
}


const callevent=(st: MediaStream,rm: MediaStream)=>{
    //setTimeout(()=>{$('#callPlayer').find("#controls").hide('slide', {direction: 'down'}, 200)},2000);
    setTimeout(()=>{
        playStream('localStream',st)
        playStream('remoteStream',rm);
    },500)
    /*const resetDelay = ()=>{
        $('#callPlayer').find("#controls").show('slide', {direction: 'down'}, 200);
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(function(){
            $('#callPlayer').find("#controls").hide('slide', {direction: 'down'}, 200);
        }, 2000);
    };
    if(isMobile) {
        $('#remoteStream').click(function(){
            resetDelay();
        });
    } else {
        $('#remoteStream').mousemove(function(){
            resetDelay();
        });
    }*/
}

/* MENELPON */
export const callSomeone=()=>{
    const calll=useSelector<any,any>(state=>state?.call)
    const {isCall:isCal} = calll;
    const user=useSelector<any,any>(state=>state?.user)
    const {play,pause}=playAudio()
    const {endCall}=disconnect()
    const dispatch = useDispatch()
    const {onDisconnect} = onDisconnected()
    const {setNotif}=useNotif()
    
    const call=(person: any,type: any)=>{
        let wait=0,intervl: NodeJS.Timer|undefined;
        if(isCalling) {
            socket?.emit('close call',{from:socket?.id,to:person.ws_id,reason:`${user.user_login} is making another call`});
        } else {
            if(peer) peer.destroy()
            openStream(type).then(stream=>{
                socket?.on('user disconnect',onDisconnect(user));
                gStream=stream;
                const per = new Peer({
                    initiator:true,
                    stream:stream,
                    config:{
                        iceServers: [
                            {urls: "stun:stun.l.google.com:19302"},
                            {urls: "stun:stun.services.mozilla.com"},
                            {urls: "stun:stun.stunprotocol.org:3478"},
                        ]
                    },
                    trickle:false
                })
                peer = per

                per.on('signal',data=>{
                    if(!isCalling) {
                        isCalling=true;
                        play('dial');
                        document.body.classList.add('call-container')
                        callPers = {...person,type:type}
                        dispatch({type:"CALL",payload:{...calll,dialer:true,callPerson:callPers,callType:'calling',callShow:true,isCall:true}})
                        /*intervl=setInterval(()=>{
                            wait++;
                            if(wait>15) {
                                clearInterval(intervl);
                                wait=0;
                                socket.emit('close call',{from:socketId,to:person.ws_id,reason:``});
                                setNotif(`${callPers.user_login} doesn't answer`)
                                endCall("Timeout");
                            }
                        },1000);*/
                        socket?.emit('call user',{from:socket?.id,to:person.ws_id,signalData:data,metadata:{type:type,ws_id:socket?.id,id:user.id,username:user.user_login,picture:Boolean(user?.gambar=='images/avatar.png' || user?.gambar===null) ? null : `${process.env.CONTENT_URL}/img/profile?image=${user.gambar}&watermark=no`}})
                    }
                })
                per.on('stream',remote=>{
                    gRemoteStream=remote;
                    wait=0;
                    if(intervl) clearInterval(intervl);
                    dispatch({type:"CALL",payload:{...calll,callPerson:callPers,callShow:true,callType:'oncall',interval:true,dialer:!Boolean(type==='video')}})
                    callevent(stream,remote)
                })
                const onError=(err: any)=>{
                    console.warn(err)
                    socket?.emit('close call',{from:socket?.id,to:person.ws_id,reason:`Error with ${user.user_login}'s client side`});
                    endCall("Peer error");
                    per.off('error',onError)
                }
                per.on('error',onError)

                socket?.on('accept call',data=>{
                    pause()
                    callAccepted=true;
                    per.signal(data.signalData)
                })
            }).catch(err=>{
                console.warn(err)
                socket?.emit('close call',{from:socket?.id,to:person.ws_id,reason:`Error with ${user.user_login}'s client side`});
                endCall("Media error");
            })
        }
        
    }
    return {call}
}

const onDisconnected=()=>{
    const {endCall}=disconnect()

    const onDisconnect=(meta: any)=>(data: any)=>{
        if(isCalling && data?.id == meta?.id) {
            socket?.emit('close call',{from:socket?.id,to:data.ws_id,reason:``});
            endCall("User disconnect");
        }
    }
    return {onDisconnect}
}
let inter: NodeJS.Timer|undefined,callPers: Record<string,any>={};
const CallContainerr=({classes}: any)=>{
    const {setNotif}=useNotif()
    const user=useSelector<any,any>(state=>state?.user)
    const [signal,setSignal]=React.useState<Peer.SignalData>()
    const [status,setStatus]=React.useState("");
    const [volume,setVolume]=React.useState(true)
    const [videoOn,setVideoOn]=React.useState(true)
    const [streamVideo,setStreamVideo]=React.useState(true)
    const [streamAudio,setStreamAudio]=React.useState(true)
    const [isShow,setShow]=React.useState(false)
    const {play,pause}=playAudio()
    const {endCall}=disconnect()
    const dispatch = useDispatch()
    const {onDisconnect} = onDisconnected()

    const call=useSelector<any,any>(state=>state?.call)
    const {callType,callPerson,dialer,callShow,interval} = call;

    const handleAnswerCalled=()=>{
        pause();
        if(peer !== null) peer?.destroy()
        openStream(callPers.type).then(stream=>{
            gStream=stream;
            const per = new Peer({
                initiator:false,
                stream:stream,
                trickle:false
            })
            
            per.on('signal',data=>{
                if(!callAccepted) {
                    callAccepted=true;
                    socket?.emit('accept call',{from:socket?.id,to:callPers.ws_id,signalData:data}) //Sinyal dari yang ditelpon
                }
            })
            per.on('stream',remote=>{
                gRemoteStream=remote;
                dispatch({type:"CALL",payload:{...call,callShow:true,callType:'oncall',interval:true,dialer:!Boolean(callPers?.type==='video')}})
                callevent(stream,remote);
            })
            const onError=(err: any)=>{
                console.warn(err)
                socket?.emit('close call',{from:socket?.id,to:callPers.ws_id,reason:`Error with ${user.user_login}'s client side`});
                endCall("Peer error");
                per.off('error',onError)
            }
            per.on('error',onError)
            peer = per
            if(signal) per.signal(signal)
        }).catch(err=>{
            console.warn(err)
            socket?.emit('close call',{from:socket?.id,to:callPers.ws_id,reason:`Error with ${user.user_login}'s client side`});
            endCall("Media error");
        })
    }

    const handleRejectCalled=()=>{
        socket?.emit('close call',{from:socket?.id,to:callPers?.ws_id,reason:""});
        endCall("Reject");
    }

    const handleEndCall=()=>{
        socket?.emit('close call',{from:socket?.id,to:callPers?.ws_id,reason:""});
        endCall("End call");
    }

    const handleVolume=()=>{
        if(gStream && gStream!==null) {
            gStream.getAudioTracks()[0].enabled = !volume
            socket?.emit("call setting",{to:callPers.ws_id,video:videoOn,audio:!volume})
            setVolume(!volume)
            
        }
    }
    const handleVideo=()=>{
        if(gStream) {
            socket?.emit("call setting",{to:callPers.ws_id,video:!videoOn,audio:volume})
            gStream.getVideoTracks()[0].enabled = !videoOn
            setVideoOn(!videoOn)
        }
    }

    const handleCancelCall=()=>{
        socket?.emit('close call',{from:socket?.id,to:callPers?.ws_id,reason:""});
        endCall("Cancel call");
        //console.log("CALER CANCEL");
    }

    const handleShareScreen=()=>{
        if(typeof gStream !== 'undefined' && typeof gRemoteStream !== 'undefined') {
            navigator.mediaDevices.getDisplayMedia()
            .then((screenStream)=>{
                peer?.replaceTrack((gStream as MediaStream).getVideoTracks()[0],screenStream.getVideoTracks()[0],gStream as MediaStream)
                callevent(gRemoteStream as MediaStream,screenStream)
                screenStream.getTracks()[0].onended = ()=>{
                    peer?.replaceTrack(screenStream.getVideoTracks()[0],(gStream as MediaStream).getVideoTracks()[0],gStream as MediaStream)
                    callevent(gStream as MediaStream,gRemoteStream as MediaStream)
                }
            })
        }
    }

    React.useEffect(()=>{
        /* Ditelpon */
        const onPeerCall=(data: any)=>{
            if(isCalling) {
                socket?.emit('close call',{from:socket?.id,to:data.metadata.ws_id,reason:`${user.user_login} is making another call`});
            } else {
                isCalling=true;
                setSignal(data.signalData)
                play('incoming')
                callPers = data?.metadata
                dispatch({type:"CALL",payload:{...call,isCall:true,callPerson:callPers,dialer:true,callType:'called',callShow:true}})
                document.body.classList.add('call-container')
                socket?.on('user disconnect',onDisconnect(data.metadata));
            }
        }
        const onCloseCall=(from: any)=>{
            socket?.off('user disconnect',onDisconnect(from));
            endCall("Close call");
            setSignal(undefined)
            const {reason}=from;
            if(reason.length > 0) setNotif(reason,true);
            setTimeout(()=>{
                if(peer !== null) peer?.destroy()
            },2000)
        }

        const onCallSetting=(data: any)=>{
            if(isCalling) {
                const {video,audio}=data
                setStreamVideo(Boolean(video))
                setStreamAudio(Boolean(audio))
            }
        }
        
        if(socket) {
            socket.on('call user',onPeerCall)
            socket.on('close call',onCloseCall)
            socket.on('call setting',onCallSetting)
        }
        return ()=>{
            if(socket) {
                socket.off('call user',onPeerCall)
                socket.off('close call',onCloseCall)
                socket.off('call setting',onCallSetting)
            }
        }
    },[])

    React.useEffect(()=>{
        if(interval===true) {
            let s=0,h=0,m=0,sT='',mT='',hT='',inactivityTimeout: NodeJS.Timer|undefined;
            const setTiming=()=>{
                s++;
                if(s>59) {
                    m++;
                    s=0;
                }
                if(m>59){
                    h++;
                    m=0;
                }
                if(s<10) sT=`0${s}`;
                else sT=`${s}`
                if(m<10) mT=`0${m}`;
                else mT=`${m}`
                if(h<10) hT=`0${h}`;
                else hT=`${h}`;
                setStatus(`${hT}:${mT}:${sT}`)
            }


            const resetDelay = ()=>{
                setShow(true)
                if(inactivityTimeout) clearTimeout(inactivityTimeout);
                inactivityTimeout = setTimeout(function(){
                    setShow(false)
                }, 2000);
            };

            //if(callPers?.type=='video') {
                if(isMobile) {
                    document.getElementById('callContainer')?.addEventListener('click',resetDelay)
                } else {
                    document.getElementById('callContainer')?.addEventListener('mousemove',resetDelay)
                }
                resetDelay()
            //} else {
            //    setShow(true)
            //}
            
            inter = setInterval(setTiming,1000)
            
        } else {
            setStatus("")
            setVideoOn(true)
            setVolume(true)
            setStreamVideo(true)
            setStreamAudio(true)
            setShow(false)
            if(inter) clearInterval(inter)
        }
    },[interval])

    return (
        <Portal>
            <div id='callContainer' className={clx(classes.callContainer,'call-container',dialer || (callType=='oncall' && !streamVideo)  && 'dialer')} {...(callShow ? {style:{display:'block'}} : {style:{display:'none'}})}>
                {callShow && callType=='called' ? (
                    <>
                    <div className={clx(classes.callAnim,'call-animation','animation')}>
                        <Avatar alt={callPerson?.username} sx={{width:135,height:135}} {...(callPerson?.picture && callPerson?.picture !== null ? {children:<Image id="imgCallContainer" lazy={false} src={callPerson?.picture} alt={callPerson?.name} style={{width:135,height:135}} />} : {children:callPerson?.name})} />
                    </div>
                    <div className='call-status' style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                        <h2 id='callStatus'>{`Incoming call from ${callPerson?.username}`}</h2>
                    </div>
                    <div className='call-action'>
                        <div style={{display:'flex',justifyContent:'center'}}>
                            <div style={{display:'flex'}}>
                                <div style={{marginRight:'3rem'}}>
                                    <Tooltip arrow title='Answer'enterTouchDelay={50}>
                                        <Fab color="primary" title='Answer' onClick={handleAnswerCalled}>
                                            <Call />
                                        </Fab>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip arrow title='Reject'enterTouchDelay={50}>
                                        <Fab color='secondary' title='Reject' onClick={handleRejectCalled}>
                                            <CallEnd />
                                        </Fab>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                ) : callShow && callType=='oncall' ? (
                    <>
                        {callPerson?.type=='video' ? (
                            <div id='callPlayer'>
                                <div id='callHeader'>
                                    <h1>{callPerson?.username}</h1>
                                </div>
                                <video id='remoteStream' className={classes.remoteStream} style={{display:streamVideo ? 'block' : 'none'}}></video>
                                {!streamVideo && (
                                    <div className={clx(classes.callAnim,'call-animation')}>
                                        <Avatar alt={callPerson?.name} sx={{width:135,height:135}} {...(callPerson?.picture && callPerson?.picture !== null ? {children:<Image id="imgCallContainer" lazy={false} src={callPerson?.picture} alt={callPerson?.name} style={{width:135,height:135}} />} : {children:callPerson?.name})} />
                                    </div>
                                )}
                                <div id='controls' {...(!isShow ? {style:{bottom:'-4rem'}} : {})}>
                                    <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                                        <div><h3 id='callStatus' style={{marginBottom:'1rem'}}>{status}</h3></div>
                                        <div>
                                            <Tooltip arrow title='Disconnect' enterTouchDelay={50}><Fab style={{marginRight:'1rem'}} title="Disconnect" color='secondary' onClick={handleEndCall}><CallEnd /></Fab></Tooltip>
                                            <Tooltip arrow title={videoOn ? "Disable Camera" : "Enable Camera"} enterTouchDelay={50}><Fab color='default' title={videoOn ? "Disable Camera" : "Enable Camera"} onClick={handleVideo} style={{marginRight:'1rem'}}>{videoOn ? <Videocam /> : <VideocamOff />}</Fab></Tooltip>
                                            <Tooltip arrow title={volume ? "Mute" : "Unmute"} enterTouchDelay={50}><Fab color='default' title={volume ? "Mute" : "Unmute"} onClick={handleVolume} {...(!isMobile ? {style:{marginRight:'1rem'}} : {})}>{volume ? <VolumeUp /> : <VolumeOff />}</Fab></Tooltip>
                                            {!isMobile && <Tooltip key='screen' title='Share Screen' enterTouchDelay={50}><Fab color='primary' title="Share Screen" onClick={handleShareScreen}><ScreenShareIcon /></Fab></Tooltip> }
                                        </div>
                                    </div>
                                </div>
                                {!streamAudio && (
                                    <div className={classes.audio} title={`${callPerson.username}'s audio is muted`}>
                                        <VolumeOff />
                                    </div>
                                )}
                                <video id="localStream" className={classes.localStream} style={{display:videoOn ? 'block' : 'none'}}></video>
                            </div>
                        ) : callPerson?.type=='audio' ? (
                            <div id='callPlayer'>
                                <div className={clx(classes.callAnim,'call-animation')}>
                                    <Avatar alt={callPerson?.name} sx={{width:135,height:135}} {...(callPerson?.picture && callPerson?.picture !== null ? {children:<Image id="imgCallContainer" lazy={false} src={callPerson?.picture} alt={callPerson?.name} style={{width:135,height:135}} />} : {children: callPerson?.name})} />
                                </div>
                                <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}><h3 id='callStatus' style={{marginBottom:'1rem'}}>{status}</h3></div>
                                <div id='controls' {...(!isShow ? {style:{bottom:'-4rem'}} : {})}>
                                    <div style={{display:'flex',justifyContent:'center'}}>
                                        <div>
                                            <Tooltip arrow title='Disconnect' enterTouchDelay={50}><Fab style={{marginRight:'1rem'}} title="Disconnect" color='secondary' onClick={handleEndCall}><CallEnd /></Fab></Tooltip>
                                            <Tooltip arrow title={volume ? "Mute" : "Unmute"} enterTouchDelay={50}><Fab color='default' title={volume ? "Mute" : "Unmute"} onClick={handleVolume}>{volume ? <VolumeUp /> : <VolumeOff />}</Fab></Tooltip>
                                        </div>
                                    </div>
                                </div>
                                {!streamAudio && (
                                    <div className={classes.audio} title={`${callPerson.username}'s audio is muted`}>
                                        <VolumeOff />
                                    </div>
                                )}
                                <audio id="remoteStream"></audio>
                            </div>
                        ) : null}
                    </>
                ) : callShow && callType=='calling' ? (
                    <>
                        <div className={clx(classes.callAnim,'call-animation','animation')}>
                            <Avatar alt={callPerson?.username} sx={{width:135,height:135}} {...(callPerson?.picture && callPerson?.picture !== null ? {children:<Image id="imgCallContainer" lazy={false} src={callPerson?.picture} alt={callPerson?.name} style={{width:135,height:135}} />} : {})} />
                        </div>
                        <div className='call-status' style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                            <h1 id="callStatus">{`Calling ${callPerson?.username}...`}</h1>
                        </div>
                        <div className='call-action'>
                            <div style={{display:'flex',justifyContent:'center'}}>
                                <Tooltip arrow title='Disconnect' enterTouchDelay={50}>
                                    <Fab color='secondary' title='Disconnect' onClick={handleCancelCall}>
                                        <CallEnd />
                                    </Fab>
                                </Tooltip>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </Portal>
    )
}

export const CallContainer=withStyles(styles as any)(CallContainerr)