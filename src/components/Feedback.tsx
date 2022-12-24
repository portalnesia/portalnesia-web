import { UserPagination } from "@model/user"
import { useSelector } from "@redux/store"
import getBrowserInfo, { IBrowserInfo } from "@utils/browser"
import { portalUrl, staticUrl } from "@utils/main"
import React, { forwardRef } from "react"
import html2canvas from 'html2canvas'
import IconButton from "@mui/material/IconButton"
import Close from "@mui/icons-material/Close"
import { State } from "@type/redux"
import Box from "@mui/material/Box"
import { isMobile } from "react-device-detect"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ArrowBack, ArrowBackIosNew, ArrowForwardIos, Delete, HighlightAlt, ScreenshotMonitor, TabUnselected } from "@mui/icons-material"
import Fade from "@mui/material/Fade"
import Paper from "@mui/material/Paper"
import { alpha } from '@mui/system/colorManipulator';
import Textarea from "@design/components/Textarea"
import Button from "./Button"
import { Span } from "@design/components/Dom"
import Scrollbar from "@design/components/Scrollbar"
import Image from "./Image"
import { styled } from "@mui/material/styles"
import useNotification from "@design/components/Notification"
import useResponsive from "@design/hooks/useResponsive"
import Popover from "@design/components/Popover"
import PopoverMui from '@mui/material/Popover';
import LocalStorage from "@utils/local-storage"
import Dialog from "@design/components/Dialog"
import SimpleBarReact from 'simplebar-react';
import { BoxPagination } from "@design/components/Pagination"

type BrowserInfo = IBrowserInfo & ({
    user?: UserPagination
})

const Canvas = styled('canvas')(()=>({}))

export type IData = {sysInfo: BrowserInfo,text?: string,image?:Blob}

export interface FeedbackProps {
    disabled?:boolean,
    loading?:boolean,
    proxy?:string,
    required?:boolean,
    onSend?(data: IData): void,
    onCancel?(): void,
    title?: string
    placeholder?:string,
    license?: React.ReactNode
    loadingTip?: string
    editTip?: string
    highlightTip?: string
    hideTip?: string
    editDoneLabel?: string
    confirmLabel?: string
}

interface FeedbackClassProps {  
    setNotif: ReturnType<typeof useNotification>
    user: State['user']
    is400Down: boolean
}

const helper = [{
    title:"Click to add a screenshot",
    image:"/help/screenshot_1.png",
    desc:"You can also mark your area of concern or hide info using edit tool."
},{
    title:`Select content of “This tab”`,
    image:"/help/screenshot_2.png",
    desc:'In the popup, click the image in “This tab” to select contents.'
},{
    title:"Click “Share” button",
    image:"/help/screenshot_3.png",
    desc:"In the popup, click the enabled “Share” button to finish adding screenshot."
}]

interface FeedbackState {
    loading: boolean,
    /**
     * Show edit screenshot dialog
     */
    editMode: boolean,
    /**
     * Show dialog, false if share screen capture
     */
    showDialog: boolean
    toolBarType: 'highlight'|'hide',
    /**
     * Highlight rect items
     */
    highlightItem: ({sx: number,sy: number,width:number,height:number})[],
    /**
     * Hide rect items
     */
    blackItem: ({sx: number,sy: number,width:number,height:number})[],
    /**
     * Feedback text input
     */
    text: string,
    textError: string,
    /**
     * Show system information
     */
    showInformation: boolean;
    showScreenshotHelp: boolean;
    helperSteps: number
    helperPosition:{
        left:number
        top: number
    }
    window:{
        height:number
        width: number
    }
    screenshotImg: string|null;
    baseScreenshot: string|null;
    loadingEdit: boolean,
    legacyLoadingScreenshot: boolean
}

type FeedbackAllProps = FeedbackProps&FeedbackClassProps

class FeedbackClass extends React.Component<FeedbackAllProps,FeedbackState> {
    /**
     * For base screenshot
     */
    baseCtx: CanvasRenderingContext2D | null=null;
    /**
     * For rect
     */
    ctx: CanvasRenderingContext2D | null=null;
    /**
     * Is Dragged
     */
    dragRect: boolean
    startX: number
    startY: number
    baseCanvas = React.createRef<HTMLCanvasElement>()
    canvas = React.createRef<HTMLCanvasElement>()
    tmpCanvas = React.createRef<HTMLCanvasElement>()
    highlight = React.createRef<HTMLDivElement>()
    black = React.createRef<HTMLDivElement>()
    simpleBar = React.createRef<HTMLElement>()
    hasHelper=false;
    imageBlob?: Blob;
    screenshotBtn = React.createRef<HTMLButtonElement>()
    textarea = React.createRef<HTMLTextAreaElement>()
    timer?: NodeJS.Timeout
    sysInfo?: IBrowserInfo

    constructor(props: FeedbackAllProps) {
        super(props);
        this.state= {
          loading: false,
          editMode: false,
          toolBarType: 'highlight',
          showDialog:true,
          highlightItem: [],
          blackItem: [],
          text: '',
          textError: '',
          showInformation: false,
          showScreenshotHelp:false,
          helperSteps:0,
          helperPosition:{
            left:0,top:0
          },
          window:{
            height:0,
            width:0
          },
          screenshotImg:null,
          baseScreenshot:null,
          loadingEdit:false,
          legacyLoadingScreenshot:false
        }
        this.dragRect = false;
        this.startX = 0;
        this.startY = 0;
        
        this.shareScreenCapture = this.shareScreenCapture.bind(this);
    }

    componentDidMount(): void {
        this.setState({
            window:{
                height:window.innerHeight,
                width:window.innerWidth
            }
        })

        this.sysInfo = getBrowserInfo();
        let baseCanvas = this.baseCanvas.current;
        if(baseCanvas) {
            this.baseCtx = baseCanvas.getContext('2d');
        }
        if(this.screenshotBtn.current) {
            const isAlreadyHelper = LocalStorage.get<{done:boolean}>("screenshot_helper")
            if(!isAlreadyHelper?.done && !isMobile) {
                this.setState({
                    helperPosition:{
                        left:window.innerWidth - 780,
                        top:this.screenshotBtn.current.offsetTop - 50
                    },
                    showScreenshotHelp:true
                })
            }
        }
    }

    handleGotItHelper() {
        LocalStorage.set('screenshot_helper',{done:true})
        this.setState({showScreenshotHelp:false});
    }

    showInformation(){
        this.setState({
            showInformation:!this.state.showInformation
        })
    }

    removeScreenCapture() {
        this.setState({screenshotImg:null})
    }

    legacyShotScreen() {
        if(this.props.disabled) return;
        if (this.state.loading)return;
        this.setState({legacyLoadingScreenshot:true});

        html2canvas(document.body, {
            allowTaint:true,
            proxy: this.props.proxy || '',
            width: window.innerWidth,
            height: window.outerHeight,
            x: document.body.scrollLeft || document.documentElement.scrollLeft,
            y: document.body.scrollTop || document.documentElement.scrollTop,
            backgroundColor:null,
            onclone:(doc)=>{
                doc.body.classList.remove('scroll-disabled');
                return doc;
            }
        }).then((canvas) => {
            canvas.toBlob((blob)=>{
                this.imageBlob = blob||undefined;
                let src = canvas.toDataURL('image/png');

                this.setState({legacyLoadingScreenshot:false,screenshotImg:src});
            },'image/png')
        }).catch((e) => {
            this.setState({
                legacyLoadingScreenshot: false,
            });
        });
    }

    shareScreenCapture() {
        const baseCanvas=this.baseCanvas.current,baseCtx=this.baseCtx;
        if(isMobile) return this.legacyShotScreen();

        if(baseCtx && baseCanvas) {
            baseCtx.clearRect(0,0,baseCanvas.width,baseCanvas.height);
            this.setState({
                showDialog:false
            },async()=>{
                const video = document.createElement("video");
                try {
                    // @ts-ignore
                    const captureStream = await navigator.mediaDevices.getDisplayMedia({video:true,preferCurrentTab:true});
                    video.srcObject = captureStream;
                    video.play();
                    setTimeout(()=>{
                        this.setState({
                            window:{
                                height:window.innerHeight,
                                width:window.innerWidth
                            }
                        },()=>{
                            baseCtx.drawImage(video,0,0,baseCanvas.width,baseCanvas.height);
                            baseCanvas.toBlob(blob=>{
                                if(blob) {
                                    const frame = (window.webkitURL || window.URL).createObjectURL(blob);
                                    captureStream.getTracks().forEach(track => track.stop());
                                    video.remove();
                                    this.imageBlob = blob;
                                    this.setState({showDialog:true,screenshotImg:frame,baseScreenshot:frame});
                                } else {
                                    captureStream.getTracks().forEach(track => track.stop());
                                    video.remove();
                                    this.setState({showDialog:true});
                                    this.props.setNotif("Something went wrong",true);
                                }
                            })
                        })
                    },500)
                } catch(e) {
                    if(e instanceof Error && e.message !== "Permission denied") this.props.setNotif(e.message,true);
                    video.remove();
                    this.setState({showDialog:true});
                }
            })
        }
    }

    openEditMode() {
        this.setState({
            editMode:true
        },()=>{
            if(this.canvas.current) {
                this.ctx = this.canvas.current.getContext("2d");
                this.drawEditableComponent();
            }
        })
    }

    closeEditMode() {
        const baseCanvas = this.baseCanvas.current
        const canvas = this.tmpCanvas.current;
        if(!canvas || !baseCanvas) return;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        this.setState({loadingEdit:false});

        ctx.clearRect(0,0,window.innerHeight,window.innerWidth);
        ctx.drawImage(baseCanvas,0,0,baseCanvas.width,baseCanvas.height);
        this.state.highlightItem.forEach(d=>{
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#FEEA4E';
            ctx.strokeRect(d.sx, d.sy, d.width, d.height);
        })
        this.state.blackItem.forEach(d=>{
            ctx.fillStyle = "#000";
            ctx.fillRect(d.sx, d.sy, d.width, d.height);
        })

        canvas.toBlob(blob=>{
            if(blob) {
                this.imageBlob = blob;
                const frame = (window.webkitURL || window.URL).createObjectURL(blob);
                this.setState({editMode:false,screenshotImg:frame,loadingEdit:false});
            } else {
                this.props.setNotif("Something went wrong",true);
                this.setState({loadingEdit:false});
            }
        });
    }

    drawEditableComponent() {
        this.state.highlightItem.forEach(d=>{
            if(this.ctx) {
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = '#FEEA4E';
                this.ctx.rect(d.sx, d.sy, d.width, d.height);
                this.ctx.stroke();
            }
        })
        this.state.blackItem.forEach(d=>{
            if(this.ctx) {
                this.ctx.fillStyle = 'rgba(0,0,0,.4)';
                this.ctx.fillRect(d.sx, d.sy, d.width, d.height);
            }
        })
    }

    canvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        this.dragRect = true;
        this.startX = e.clientX + (this.simpleBar.current?.scrollLeft||0);
        this.startY = e.clientY + (this.simpleBar.current?.scrollTop||0) - 72;
    }

    canvasMouseLeave(e: React.MouseEvent<HTMLCanvasElement>) {
        this.dragRect = false;
    }

    canvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        console.log(this.dragRect)
        if(this.dragRect) {
            let toolBarType = this.state.toolBarType;
            let clientX = e.clientX + (this.simpleBar.current?.scrollLeft||0),
                clientY = e.clientY + (this.simpleBar.current?.scrollTop||0) - 72,
                width =(this.startX - clientX),
                height = (this.startY - clientY);

            if(this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            if (toolBarType == 'highlight') {
                if(this.ctx) {
                    this.ctx.lineWidth = 5;
                    this.ctx.strokeStyle = '#FEEA4E';
                    this.ctx.strokeRect(clientX, clientY, width, height);
                }
            } else {
                if(this.ctx) {
                    this.ctx.fillStyle = 'rgba(0,0,0,.4)';
                    this.ctx.fillRect(clientX, clientY, width, height);
                }
            }
        } else if(this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    canvasMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
        if(this.dragRect) {
            this.dragRect=false;
            let clientX = e.clientX + (this.simpleBar.current?.scrollLeft||0),
                clientY = e.clientY + (this.simpleBar.current?.scrollTop||0) - 72,
                width = this.startX - clientX,
                height = this.startY - clientY;

            if (Math.abs(width) < 6 || Math.abs(height) < 6) {
                return;
            }

            let toolBarType = this.state.toolBarType,
                highlightItem = this.state.highlightItem,
                blackItem = this.state.blackItem,
                obj = {
                    sx: clientX,
                    sy: clientY,
                    width: width,
                    height: height
                };
            if (width < 0) {
                obj.sx = obj.sx + width;
                obj.width = Math.abs(width);
            }
            if (height < 0) {
                obj.sy = obj.sy + height;
                obj.height = Math.abs(height);
            }
            if(this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            if (toolBarType == 'highlight') {
                highlightItem.push(obj);
                this.setState({
                    highlightItem: highlightItem,
                });
            } else if (toolBarType == 'hide') {
                blackItem.push(obj);
                this.setState({
                    blackItem: blackItem,
                })
            }
        }
    }

    clearHighlight(k: number) {
        let highlightItem = this.state.highlightItem;
        highlightItem.splice(k, 1);
        this.setState({
            highlightItem: highlightItem,
        });
    }
    
    clearBlack(k: number) {
        let blackItem = this.state.blackItem;
        blackItem.splice(k, 1);
        this.setState({
            blackItem: blackItem,
        });
    }

    send() {
        if(this.props.disabled) return;
        const text = this.state.text;
        if(this.props.required && text.length === 0) {
            this.setState({
              textError: "Description must be added",
            });
            this.textarea.current?.focus();
            return;
        }
        if (typeof this.props.onSend === 'function') {
          let data: IData = {
            sysInfo: getBrowserInfo(),
            text: text,
          };
          if(this.imageBlob) {
            data.image = this.imageBlob;
          }
          console.log(data);
          //this.props.onSend(data);
        }
    }

    render(): React.ReactNode {
        const state = this.state
        const props = this.props;

        return (
            <>
                <Fade in={state.showDialog}>
                    <Box
                        data-test="Feedback Root"
                        sx={{
                            height: `100%`,
                            width:'100%',
                            position:'fixed',
                            left:0,
                            top:0,
                            zIndex:1600
                        }}
                    >
                        <Box>
                            <Box position='absolute' top={0} left={0} width='100%' height='100%' bgcolor={alpha('#000000',0.3)} />
                            <Box data-html2canvas-ignore="true" position='relative' width='100%' height='100%' data-test="BoxRelative">
                                <Paper elevation={3} data-test='dialog' data-html2canvas-ignore="true" sx={{position:'fixed',zIndex:20,width:props.is400Down ? '100%' : 400,right:0,top:0,height:'100%'}}>
                                    <Box position='absolute' top={0} left={0} bgcolor='background.paper' borderBottom={theme=>`2px solid ${theme.palette.divider}`} p={2} height={70} zIndex={1} width="100%">
                                        <Stack direction="row" spacing={2}>
                                            <Stack direction="row" spacing={2} flexGrow={1}>
                                                {state.showInformation && (
                                                    <IconButton disabled={props.disabled} onClick={()=>this.showInformation()}>
                                                        <ArrowBack />
                                                    </IconButton>
                                                )}
                                                <Typography variant='h6' component='h1'>{state.showInformation ? "Additional Info" : props.title}</Typography>
                                            </Stack>
                                            <IconButton disabled={props.disabled} onClick={props.onCancel}>
                                                <Close />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                    <Fade in={this.sysInfo!==undefined && state.showInformation} unmountOnExit>
                                        <Box position='absolute' {...(isMobile ? {overflow:'auto'} : {})} zIndex={5} top={69} left={0} height='calc(100% - 69px)' width='100%'>
                                            <Scrollbar>
                                                <Stack px={2} alignItems='flex-start' spacing={2} bgcolor='background.paper' py={2}>
                                                    {props.user && (
                                                        <Box key='user' borderBottom={t=>`1px solid ${t.palette.divider}`} pb={2} width="100%">
                                                            <Typography>User</Typography>
                                                            <Stack alignItems='flex-start' spacing={2} bgcolor='background.paper'>
                                                                {Object.entries(props.user||{}).filter(([key])=>['id','name','username','email'].includes(key)).map(([key,val])=>(
                                                                    <Box key={`user-${key}`}>
                                                                        <Typography sx={{fontSize:14}}>{`${key}:`}</Typography>
                                                                        <Typography sx={{fontWeight:'bold'}}>{String(val)}</Typography>
                                                                    </Box>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                                    {Object.keys(this.sysInfo||{}).map((dt)=>{
                                                        const value = (this.sysInfo||{})[dt as keyof IBrowserInfo];
                                                        const val = Array.isArray(value) ? value.join(",") : String(value)
                                                        return (
                                                            <Box key={dt}>
                                                                <Typography sx={{fontSize:14}}>{`${dt}:`}</Typography>
                                                                <Typography sx={{fontWeight:'bold'}}>{val}</Typography>
                                                            </Box>
                                                        )
                                                    })}
                                                </Stack>
                                            </Scrollbar>
                                        </Box>
                                    </Fade>
                                    <Stack pt={'70px'} alignItems='flex-start' height='100%' width='100%'>
                                        <Box height='100%' width='100%' {...(isMobile ? {overflow:'auto'} : {})}>
                                            <Scrollbar>
                                                <Stack px={3} py={2} alignItems={'flex-start'} spacing={1}>
                                                    <Textarea
                                                        label="Describe your issue or suggestion"
                                                        inputRef={this.textarea}
                                                        value={state.text}
                                                        disabled={props.disabled}
                                                        placeholder={props.placeholder}
                                                        fullWidth
                                                        multiline
                                                        helperText={state.textError || undefined}
                                                        error={state.textError.length > 0}
                                                        rows={7}
                                                        onChange={(e) => {
                                                            this.setState({
                                                            text: e.target.value,
                                                            textError: '',
                                                            })
                                                        }}
                                                    />

                                                    <Stack direction="row" spacing={1}>
                                                        <Typography variant='caption'>Please don&apos;t include any sensitive information</Typography>
                                                        <Popover icon="ic:outline-help-outline" disablePortal>Sensitive information is any data that should be protected. For example, don&apos;t include passwords, credit card numbers, and personal details.</Popover>
                                                    </Stack>

                                                    <Box width="100%">
                                                        {state.screenshotImg === null ? <Typography>A screenshot will help us better understand the issue</Typography> : <Typography>Attached screenshot</Typography> }

                                                        <Stack width="100%" justifyContent="center" minHeight={state.screenshotImg === null ? 200 : 100}>
                                                            {state.legacyLoadingScreenshot ? (
                                                                <BoxPagination loading maxHeight={200} />
                                                            ) : state.screenshotImg === null ? (
                                                                <Button ref={this.screenshotBtn} size="large" sx={{width:'100%'}} outlined color="inherit" startIcon={<ScreenshotMonitor />} onClick={()=>this.shareScreenCapture()}>Capture screenshot</Button>
                                                            ) : (
                                                                <Box position='relative' border={t=>`2px solid ${t.palette.divider}`} borderRadius={1} sx={{":hover":{border:t=>`2px solid ${t.palette.primary.main}`}}}>
                                                                    <Box borderRadius={5} bgcolor="error.lighter" position="absolute" right={-10} top={-10} zIndex={1}>
                                                                        <IconButton onClick={()=>this.removeScreenCapture()}>
                                                                            <Delete sx={{color:'error.main'}} />
                                                                        </IconButton>
                                                                    </Box>

                                                                    {!isMobile && (
                                                                        <Box zIndex={2} display="flex" justifyContent="center" left={0} position="absolute" right={0} top="45%">
                                                                            <Button color="inherit" sx={{width:'70%'}} onClick={()=>this.openEditMode()}>Highlight or Hide Info</Button>
                                                                        </Box>
                                                                    )}

                                                                    <Box position="relative">
                                                                        <Image src={state.screenshotImg} alt={"Screenshot"} sx={{width:'100%',borderRadius:1}} />
                                                                        <Box  sx={{content:'""',background:"linear-gradient(0deg,rgba(0,0,0,.1),rgba(0,0,0,.1))"}} display="inline-block" height="100%" width="100%" left={0} top={0} position="absolute" />
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant='caption'>Some <Span onClick={()=>!props.disabled && this.showInformation()} sx={{color: props.disabled ? 'text.disabled' : 'customColor.link',cursor:"pointer",':hover':{textDecoration:'underline'}}}>system information</Span> may be sent to Portalnesia. We will use the information that give us to help address technical issues and to improve our services.</Typography>
                                                    </Box>
                                                </Stack>

                                                <Box flexGrow={1} />

                                                <Box px={2} pt={2} mb={2} borderTop={t=>`2px solid ${t.palette.divider}`} width='100%'>
                                                    <Button sx={{width:'100%'}} disabled={props.disabled} loading={props.disabled} onClick={()=>this.send()}>{props.confirmLabel}</Button>
                                                </Box>
                                            </Scrollbar>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Box>
                        <PopoverMui
                            open={state.showScreenshotHelp}
                            PaperProps={{sx:{width:374}}}
                            anchorReference="anchorPosition"
                            anchorPosition={{top:state.helperPosition.top,left:state.helperPosition.left}}
                            sx={{
                                zIndex:2000
                            }}
                        >
                            <Box p={2}>
                                <Box key={helper[state.helperSteps].title}>
                                    <Stack mb={2}><Image webp={false} withPng={false} src={staticUrl(helper[state.helperSteps].image)} alt={helper[state.helperSteps].title} sx={{maxWidth:350}} /></Stack>
                                    
                                    <Typography variant="h6" gutterBottom>{helper[state.helperSteps].title}</Typography>
                                    <Typography>{helper[state.helperSteps].desc}</Typography>
                                </Box>

                                <Stack direction="row"justifyContent="space-between" spacing={1} mt={2}>
                                    <Stack direction="row"  spacing={1}>
                                        <IconButton disabled={state.helperSteps === 0} onClick={()=>this.setState({helperSteps:state.helperSteps-1})}>
                                            <ArrowBackIosNew />
                                        </IconButton>

                                        <Typography >{`${state.helperSteps+1} / ${helper.length}`}</Typography>

                                        <IconButton disabled={state.helperSteps === helper.length-1} onClick={()=>this.setState({helperSteps:state.helperSteps+1})}>
                                            <ArrowForwardIos />
                                        </IconButton>
                                    </Stack>
                                    <Button text onClick={()=>this.handleGotItHelper()}>Ok, Got it</Button>
                                </Stack>
                            </Box>
                        </PopoverMui>
                    </Box>
                </Fade>
                <Canvas ref={this.baseCanvas} height={state.window.height} width={state.window.width} />
                <Canvas ref={this.tmpCanvas} height={state.window.height} width={state.window.width} />
                <Dialog keepMounted sx={{zIndex:2000}} fullScreen open={Boolean(state.editMode && state.baseScreenshot)} scroll="paper" title={"Highlight or Hide info on your screenshot"} content={{dividers:true,sx:{overflow:"hidden",p:0}}} titleWithClose={false}
                    actions={
                        <Stack direction="row" justifyContent="space-between" width="100%" borderTop={t=>`1px solid ${t.palette.divider}`} px={2} py={1}>
                            <Stack direction="row" spacing={1}>
                                <Button outlined sx={{...(state.toolBarType === "highlight" ? {bgcolor:t=>alpha(t.palette.primary.main,0.1)} : {})}} color={state.toolBarType === "highlight" ? "primary" : "inherit"} onClick={()=>this.setState({toolBarType:'highlight'})} startIcon={<HighlightAlt />}>Highlight</Button>
                                <Button outlined sx={{...(state.toolBarType === "hide" ? {bgcolor:t=>alpha(t.palette.primary.main,0.1)} : {})}} color={state.toolBarType === "hide" ? "primary" : "inherit"} onClick={()=>this.setState({toolBarType:'hide'})} startIcon={<TabUnselected />}>Hide</Button>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button onClick={()=>this.closeEditMode()}>Save</Button>
                            </Stack>
                        </Stack>
                    }
                    actionsProps={{sx:{p:0}}}
                >
                    <SimpleBarReact timeout={500} clickOnTrack={false} scrollableNodeProps={{ref:this.simpleBar}} style={{maxHeight:'100%'}}>
                        <Box position="relative">

                            <Image src={state.baseScreenshot||""} alt="Screenshot" sx={{width:'auto',height:'100%',objectFit:'contain',mx:'auto'}} />

                            <Canvas ref={this.canvas} height={state.window.height} width={state.window.width} onMouseDown={(e)=>this.canvasMouseDown(e)} onMouseMove={e=>this.canvasMouseMove(e)} onMouseUp={e=>this.canvasMouseUp(e)} onMouseLeave={e=>this.canvasMouseLeave(e)} sx={{
                                width:`${state.window.width}px`,
                                height:`${state.window.height}px`,
                                position:'absolute',
                                left:0,
                                top:0,
                                zIndex: 5,
                                cursor:'crosshair'
                            }} />

                            {state.highlightItem.map((data,k)=>(
                                <Box zIndex={6} key={`highlight-${k}`} width={data.width} height={data.height} left={data.sx} top={data.sy} position='absolute' border={`5px solid #FEEA4E`} bgcolor='none' sx={{":hover":{
                                    bgcolor:'rgba(55, 131, 249, 0.2)',
                                    "& .clear-icon":{
                                        opacity:1
                                    }
                                }}}>
                                    <IconButton className="clear-icon" sx={{
                                        position:'absolute',
                                        top:-20,
                                        right:-20,
                                        zIndex:1,
                                        opacity:0
                                    }} onClick={()=>this.clearHighlight(k)}>
                                        <Box width={24} height={24} bgcolor='error.main' borderRadius={5}>
                                            <Close fontSize="small" />
                                        </Box>
                                    </IconButton>
                                </Box>
                            ))}

                            {state.blackItem.map((data,k)=>(
                                <Box key={`hide-${k}`} zIndex={6} width={data.width} height={data.height} left={data.sx} top={data.sy} position='absolute' bgcolor='#000'  sx={{":hover":{
                                    bgcolor:'rgba(0, 0, 0, 0.8)',
                                    "& .clear-icon":{
                                        opacity:1
                                    }
                                }}}>
                                    <IconButton className="clear-icon" sx={{
                                        position:'absolute',
                                        top:-20,
                                        right:-20,
                                        zIndex:2,
                                        opacity:0
                                    }} onClick={()=>this.clearBlack(k)}>
                                        <Box width={24} height={24} bgcolor='error.main' borderRadius={5}>
                                            <Close fontSize="small" />
                                        </Box>
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </SimpleBarReact>
                </Dialog>
            </>
        )
    }
}

// @ts-ignore
FeedbackClass.defaultProps = {
    title:'Send Feedback',
    placeholder:'Please explain your problem or share your thoughts',
    checkboxLabel:'Include screenshots',
    loadingTip:'Loading screenshots...',
    editTip:'Highlight or hide information',
    cancelLabel:'Cancel',
    confirmLabel:'Send',
    highlightTip:'Highlight the problem',
    hideTip:'Hide sensitive information',
    requiredTip:'Description must be added',
    editDoneLabel:'Done',
    disabled:false,
    required : false,
    proxy:portalUrl('canvas-proxy')
}

const Feedback = forwardRef<FeedbackClass,FeedbackProps>((props,ref)=>{
    const setNotif = useNotification();
    const user = useSelector(s=>s.user);
    const is400Down = useResponsive('down',500);

    return (
        <FeedbackClass ref={ref} is400Down={is400Down} setNotif={setNotif} user={user} {...props} />
    )
})
Feedback.displayName="Feedback";

export default Feedback;