import { UserPagination } from "@model/user"
import { useSelector } from "@redux/store"
import getBrowserInfo, { IBrowserInfo } from "@utils/browser"
import SvgIcon from '@mui/material/SvgIcon'
import { portalUrl } from "@utils/main"
import { OptionsObject, SnackbarKey, SnackbarMessage, useSnackbar } from "notistack"
import React, { forwardRef } from "react"
import html2canvas from 'html2canvas'
import IconButton from "@mui/material/IconButton"
import Close from "@mui/icons-material/Close"
import { State } from "@type/redux"
import Box from "@mui/material/Box"
import { isMobile } from "react-device-detect"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ArrowBack, DragIndicator } from "@mui/icons-material"
import Fade from "@mui/material/Fade"
import Paper from "@mui/material/Paper"
import { alpha } from '@mui/system/colorManipulator';
import Textarea from "@design/components/Textarea"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import Button from "./Button"
import { Span } from "@design/components/Dom"
import Scrollbar from "@design/components/Scrollbar"
import CircularProgress from "@mui/material/CircularProgress"
import Image from "./Image"
import { styled, useTheme } from "@mui/material/styles"
import ButtonBase from "@mui/material/ButtonBase"
import Tooltip from "@mui/material/Tooltip"

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
    enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject | undefined): SnackbarKey
    closeSnackbar(key?: SnackbarKey | undefined): void,
    user: State['user']
}

interface FeedbackState {
    docWidth: number,
    docHeight: number,
    winHeight: number,
    shotOpen: boolean,
    loading: boolean,
    screenshotEdit: boolean,
    editMode: boolean,
    toolBarType: 'highlight'|'hide',
    highlightItem: ({sx: number,sy: number,width:number,height:number})[],
    blackItem: ({sx: number,sy: number,width:number,height:number})[],
    text: string,
    textError: string,
    feedbackVal: number|null,
    showInformation: boolean;
}

type FeedbackAllProps = FeedbackProps&FeedbackClassProps
const highLightEl = ['button','td','th','code','pre','blockquote','li', 'a', 'span','em','i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'small', 'sub', 'sup', 'b', 'time', 'img', 'video', 'input', 'label', 'select', 'textarea', 'article', 'summary', 'section'];

class FeedbackClass extends React.Component<FeedbackAllProps,FeedbackState> {
    move: boolean
    eX: number
    eY: number
    ctx: CanvasRenderingContext2D | null=null;
    dragRect: boolean
    startX: number
    startY: number
    shadowCanvas = React.createRef<HTMLCanvasElement>()
    canvas = React.createRef<HTMLCanvasElement>()
    highlight = React.createRef<HTMLDivElement>()
    black = React.createRef<HTMLDivElement>()
    hasHelper=false;
    imageBlob?: Blob;
    /**
     * Shadow Canvas
     */
    sctx: CanvasRenderingContext2D|null=null
    toolBar = React.createRef<HTMLDivElement>()
    screenshotPrev = React.createRef<HTMLImageElement>()
    textarea = React.createRef<HTMLTextAreaElement>()
    container = React.createRef<HTMLDivElement>();
    canvasMD=false
    timer?: NodeJS.Timeout
    sysInfo?: IBrowserInfo

    constructor(props: FeedbackAllProps) {
        super(props);
        this.state= {
          docWidth: document.body.clientWidth,
          docHeight: document.body.clientHeight,
          winHeight: window.innerHeight,
          shotOpen: true,
          loading: false,
          screenshotEdit: false,
          editMode: false,
          toolBarType: 'highlight',
          highlightItem: [],
          blackItem: [],
          text: '',
          textError: '',
          feedbackVal: null,
          showInformation: false
        }
        this.move = false;
        this.eX = 0;
        this.eY = 0;
        this.ctx = null;
        this.dragRect = false;
        this.startX = 0;
        this.startY = 0;
        this.documentMouseMove = this.documentMouseMove.bind(this);
        this.elementHelperClick = this.elementHelperClick.bind(this);
        this.windowResize = this.windowResize.bind(this);
        this.shotScreen = this.shotScreen.bind(this);
        this.clearBlack = this.clearBlack.bind(this);
        this.clearHighlight = this.clearHighlight.bind(this);
        this.drawElementHelper = this.drawElementHelper.bind(this);
        this.send = this.send.bind(this);
    }

    switchCanvasVisible(visible?: boolean) {
        if (visible) {
            this.shadowCanvas?.current?.removeAttribute('data-html2canvas-ignore');
        } else {
            this.shadowCanvas?.current?.setAttribute('data-html2canvas-ignore', 'true');
        }
    }

    inElement(e: MouseEvent) {
        let x = e.clientX, y = e.clientY;
        const el = document.elementsFromPoint(x, y)[3],
        scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft,
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if (el && highLightEl.indexOf(el.nodeName.toLocaleLowerCase()) > -1) {
            let rect = el.getBoundingClientRect();
            let rectInfo = {
              sx: rect.x + (scrollLeft),
              sy: rect.y + (scrollTop) - 2,
              width: rect.width,
              height: rect.height+10
            };
            return rectInfo;
        } else {
            return false;
        }
    }

    elementHelper(e: MouseEvent) {
        let rectInfo = this.inElement(e);
        if (rectInfo) {
          this.drawElementHelper(rectInfo);
          this.hasHelper = true;
        } else {
          if (this.hasHelper) {
            this.hasHelper = false;
            this.initCanvas();
            this.drawHighlightBorder();
            this.drawHighlightArea()
          }
        }
    }

    elementHelperClick(e: MouseEvent) {
        if (this.dragRect) return;
        // @ts-ignore
        let nodeName = e.target?.nodeName;
        if (nodeName != 'CANVAS') return;
        let rectInfo = this.inElement(e);
        if (rectInfo) {
            let toolBarType = this.state.toolBarType;
            if (toolBarType == 'highlight') {
                let highlightItem = this.state.highlightItem;
                highlightItem.push(rectInfo);
                this.setState({
                    highlightItem: highlightItem,
                })
            } else if (toolBarType == 'hide') {
                let blackItem = this.state.blackItem;
                blackItem.push(rectInfo);
                this.setState({
                    blackItem: blackItem,
                })
            }
        }
    }

    drawElementHelper(info: {
        sx: number;
        sy: number;
        width: number;
        height: number;
    }) {
        this.initCanvas();
        if(this.ctx) {
            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = '#FEEA4E';
            this.ctx.rect(info.sx, info.sy, info.width, info.height);
            this.ctx.stroke();
            this.ctx.clearRect(info.sx, info.sy, info.width, info.height);
        }
        this.drawHighlightBorder();
        this.drawHighlightArea();
        this.sctx?.clearRect(info.sx, info.sy, info.width, info.height);
    }

    documentMouseMove(e: MouseEvent) {
        if(this.state.editMode) {
            if (this.canvasMD) {
                if (!this.dragRect) {
                    this.dragRect = true;
                }
                let toolBarType = this.state.toolBarType;
                let clientX = e.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft),
                    clientY = e.clientY + (document.documentElement.scrollTop + document.body.scrollTop),
                    width = this.startX - clientX,
                    height = this.startY - clientY;
                this.initCanvas();
                this.drawHighlightBorder();
                if (toolBarType == 'highlight') {
                    if(this.ctx) {
                        this.ctx.lineWidth = 5;
                        this.ctx.strokeStyle = '#FEEA4E';
                        this.ctx.rect(clientX, clientY, width, height);
                        this.ctx.stroke();
                        this.ctx.clearRect(clientX, clientY, width, height);
                    }
                    
                    this.drawHighlightArea();
                    this.sctx?.clearRect(clientX, clientY, width, height);
                } else if (toolBarType == 'hide') {
                    this.drawHighlightArea();
                    if(this.ctx) {
                        this.ctx.fillStyle = 'rgba(0,0,0,.4)';
                        this.ctx.fillRect(clientX, clientY, width, height);
                    }
                }
            } else {
                this.elementHelper(e);
            }
        }
    }

    windowResize() {
        this.calcHeight();
    }
    
    addEventListener() {
        this.container.current?.addEventListener('mousemove', this.documentMouseMove, false);
        this.container.current?.addEventListener('click', this.elementHelperClick, false);
        window.addEventListener('resize', this.windowResize, false);
    }
    removeEventListener() {
        this.container.current?.removeEventListener('mousemove', this.documentMouseMove, false);
        this.container.current?.removeEventListener('click', this.elementHelperClick, false);
        window.removeEventListener('resize', this.windowResize, false);
    }

    componentDidMount(): void {
        this.sysInfo = getBrowserInfo();
        this.initCanvas(true);
        this.addEventListener();
        if (this.state.shotOpen) {
            this.shotScreen()
        }
    }

    calcHeight(initCanvas=true) {
        let docWidth = document.body.clientWidth,
            docHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        docHeight = document.body.scrollTop + docHeight;
        let windowHeight = window.innerHeight;
        this.setState({
            docWidth: docWidth,
            docHeight: docHeight,
            winHeight: windowHeight,
        });
        if(initCanvas) {
            setTimeout(() => {
                this.initCanvas(true);
            });
        }
    }

    componentWillUnmount() {
        if(this.timer) {
          clearTimeout(this.timer);
        }
        this.removeEventListener();
    }

    initCanvas(init?: boolean) {
        this.calcHeight(false);
        let canvas = this.canvas?.current;
        if(canvas) {
            let shadowCanvas = this.shadowCanvas.current;
            if(shadowCanvas) {
                let docWidth = this.state.docWidth,
                docHeight = this.state.docHeight;
                if (!this.ctx) {
                    this.ctx = canvas.getContext('2d');
                }
                if(!this.sctx) {
                    this.sctx = shadowCanvas.getContext('2d');
                }
                
                canvas.style.width = `${docWidth}px`;
                canvas.style.height = `${docHeight}px`;
                shadowCanvas.style.width = `${docWidth}px`;
                shadowCanvas.style.height = `${docHeight}px`;
                canvas.width = docWidth;
                canvas.height = docHeight;
                shadowCanvas.width = docWidth;
                shadowCanvas.height = docHeight;
                if(this.sctx) this.sctx.fillStyle = 'rgba(0,0,0,0.38)';
                this.sctx?.fillRect(0, 0, docWidth, docHeight);
            }
        }
    }

    drawHighlightBorder() {
        this.state.highlightItem.map((data, k) => {
            if(this.ctx) {
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = '#FEEA4E';
                this.ctx.rect(data.sx, data.sy, data.width, data.height);
                this.ctx.stroke();
            }
        });
    }
    
    drawHighlightArea() {
        this.state.highlightItem.map((data, k) => {
            this.sctx?.clearRect(data.sx, data.sy, data.width, data.height);
            if(this.ctx) this.ctx.clearRect(data.sx, data.sy, data.width, data.height);
        });
    }

    loadingState(state: boolean) {
        this.setState({
            loading: state,
        })
    }

    checkboxHandle() {
        if(this.props.disabled) return;
        this.setState({
            shotOpen: !this.state.shotOpen,
        });
        if (!this.state.shotOpen) {
            this.shotScreen();
        }
    }

    toEditMode() {
        if(this.props.disabled) return;
        document.body.classList.remove("scroll-disabled")
        this.setState({
            editMode: true,
        });
        setTimeout(() => {
            let toolBar = this.toolBar.current,
            windowWidth = window.innerWidth,
            windowHeight = window.innerHeight;
            if(toolBar) toolBar.style.left = `${windowWidth * 0.5}px`;
            if(toolBar) toolBar.style.top = `${windowHeight * 0.6}px`;
        });
    }

    editCancel() {
        document.body.classList.add("scroll-disabled")
        this.setState({
          editMode: false,
        });
        setTimeout(() => {
          this.shotScreen();
        },100)
    }

    handleMoveMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        this.move = true;
        this.eX = e.clientX + window.scrollX;
        this.eY = e.clientY + window.scrollY;
    }
    
    handleMoveMouseUp(e: React.MouseEvent<HTMLDivElement>) {
        this.move = false;
        this.canvasMD = false;
        if (this.dragRect) {
            let clientX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft),
            clientY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop),
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
            setTimeout(() => {
                this.dragRect = false;
                this.drawHighlightBorder();
                this.drawHighlightArea();
            });
        }
    }

    handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.move)return;
        let toolBar = this.toolBar.current;
        let eX = this.eX;
        let eY = this.eY;
        let newEX = e.clientX + window.scrollX;
        let newEY = e.clientY + window.scrollY;
        let oX = newEX - eX;
        let oY = newEY - eY;
        let curL = parseFloat(toolBar?.style.left||'0');
        let curT = parseFloat(toolBar?.style.top||'0');
        if(toolBar) toolBar.style.left = `${curL + oX}px`;
        if(toolBar) toolBar.style.top = `${curT + oY}px`;
        this.eX = newEX;
        this.eY = newEY;
    }

    handleVideo(parent: HTMLElement, resolve: ()=>void, reject: (reason?: any) => void) {
        /*let videoItem = parent.getElementsByTagName('video');
        if(videoItem.length === 0) {
          resolve();
          return;
        }
        for(let i = 0; i < videoItem.length; i ++) {
          let video = videoItem[0];
          if(!video.style.backgroundImage) {
            let w = video.clientWidth
            let h = video.clientHeight
            $(video).after('<canvas width="'+ w +'" height="'+ h +'"></canvas>');
            let canvas = $(video).next('canvas').css({display: 'none'});
            let ctx = canvas.get(0).getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);
            try {
              video.style.backgroundImage = "url("+ canvas.get(0).toDataURL('image/png') +")";
            }catch (e) {
              console.log(e)
            }finally {
              canvas.remove();
            }
          }
        }*/
        resolve();
    }

    shotScreen() {
        if(this.props.disabled) return;
        if (this.state.loading)return;
        this.loadingState(true);
        let highlightItem = this.state.highlightItem;
        this.switchCanvasVisible(highlightItem.length > 0);
        /*const videoPromise = new Promise<void>((resolve, reject) => {
            this.handleVideo(document.body, resolve, reject);
        });
        videoPromise.then(() => {*/
            html2canvas(document.body, {
                allowTaint:true,
                proxy: this.props.proxy || '',
                width: window.innerWidth,
                height: window.outerHeight,
                x: document.body.scrollLeft || document.documentElement.scrollLeft,
                y: document.body.scrollTop || document.documentElement.scrollTop,
                backgroundColor:null,
                onclone:(doc)=>{
                    doc.body.classList.remove('scroll-disabled')
                    /*const svgEl=doc?.body?.querySelectorAll('svg')
                    if(svgEl){
                        svgEl.forEach((item)=>{
                            item.setAttribute("width",`${item.getBoundingClientRect()?.width}`)
                            item.setAttribute("height",`${item.getBoundingClientRect()?.height}`)
                            item.style.width='null';
                            item.style.height='null';
                        })
                    }*/
                    /*let menu=doc?.getElementById('sidebar-menu-content')
                    if(menu) {
                        menu.style.zIndex='1';
                        const sidebar=doc?.getElementById('sidebar-menu')
                        const parent=sidebar?.parentNode;
                        parent?.insertBefore(menu,sidebar)
                    }*/
                    return doc;
                }
            }).then((canvas) => {
                canvas.toBlob((blob)=>{
                    this.imageBlob = blob||undefined;
                    let src = canvas.toDataURL('image/png');
                    if(this.screenshotPrev.current) {
                        this.screenshotPrev.current.src = src;
                        this.screenshotPrev.current.onload = () => {
                            this.setState({
                                screenshotEdit: true,
                            })
                        };
                        this.loadingState(false);
                    }
                },'image/png')
            }).catch((e) => {
                this.setState({
                    screenshotEdit: false,
                });
                this.loadingState(false);
            });
        //});
    }

    clearHighlight(k: number) {
        let highlightItem = this.state.highlightItem;
        highlightItem.splice(k, 1);
        this.setState({
            highlightItem: highlightItem,
        });
        setTimeout(() => {
            this.initCanvas();
            this.drawHighlightBorder();
            this.drawHighlightArea();
        });
    }
    
    clearBlack(k: number) {
        let blackItem = this.state.blackItem;
        blackItem.splice(k, 1);
        this.setState({
            blackItem: blackItem,
        });
    }

    canvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        this.canvasMD = true;
        this.startX = e.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
        this.startY = e.clientY + (document.documentElement.scrollTop + document.body.scrollTop);
    }

    send() {
        if(this.props.disabled) return;
        if(this.state.loading && this.state.shotOpen) {
            this.props.enqueueSnackbar("Loading screenshots...",{
                variant:'error',
                action:(key)=>(
                    <IconButton
                        className={'snackbarIcon'}
                        onClick={()=>this.props.closeSnackbar(key)}
                        >
                        <Close />
                    </IconButton>
                )
            });
            return;
        }
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
          if(this.state.shotOpen && this.screenshotPrev.current) {
            data.image = this.imageBlob;
          }
          this.props.onSend(data);
        }
    }

    cancel() {
        if(this.props.disabled) return;
        if (typeof this.props.onCancel === 'function') this.props.onCancel();
    }
    
    showInformation(){
        this.setState({
            showInformation:!this.state.showInformation
        })
    }

    render(): React.ReactNode {
        const state = this.state,
        props = this.props;

        return (
            <Box
                ref={this.container}
                data-test="Feedback Root"
                sx={{
                    height: `${state.docHeight}px`,
                    width:'100%',
                    position:'absolute',
                    left:0,
                    top:0,
                    zIndex:1600
                }} onMouseMove={(e)=>this.handleMouseMove(e)} onMouseUp={(e)=>this.handleMoveMouseUp(e)}
            >
                
                <Fade in={!state.editMode}>
                    <Box>
                        <Box position='absolute' top={0} left={0} width='100%' height='100%' bgcolor={alpha('#000000',0.3)} />
                        <Box data-html2canvas-ignore="true" position='relative' width='100%' height='100%' data-test="BoxRelative">
                            <Paper elevation={3} data-test='dialog' data-html2canvas-ignore="true" sx={{position:'fixed',zIndex:20,width:isMobile ? '100%' : 400,right:0,top:0,height:'100%'}}>
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
                                    <Box position='absolute' {...(isMobile ? {overflow:'auto'} : {})} zIndex={1} top={70} left={0} height='calc(100% - 70px)' width='100%'>
                                        <Scrollbar sx={{maxHeight:'calc(100% - 70px)'}}>
                                            <Stack px={2} alignItems='flex-start' spacing={2} bgcolor='background.paper' py={2}>
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
                                            <Stack px={2} py={2} alignItems={'flex-start'} spacing={1}>
                                                <Textarea
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

                                                <FormControlLabel
                                                    label="Include screenshots (beta)"
                                                    control={<Checkbox disabled={props.disabled} checked={state.shotOpen} color="primary" onChange={()=>this.checkboxHandle()} />}
                                                />

                                                <Fade in={state.shotOpen} unmountOnExit>
                                                    <Box width='100%' minHeight={200} height={'100%'}>
                                                        <Box data-test="Screenshot area" width='100%' minHeight={200} height={'100%'} bgcolor="background.default" position='relative'>
                                                            {state.loading && (
                                                                <Stack justifyContent='center' position='absolute' top={0} left={0} minHeight={200} height={'100%'} width='100%'>
                                                                    <CircularProgress size={50} />
                                                                    <Typography sx={{mt:2}}>{props.loadingTip}</Typography>
                                                                </Stack>
                                                            )}

                                                            {(state.screenshotEdit && !state.loading && !props.disabled && !isMobile) && (
                                                                <Stack onClick={()=>this.toEditMode()} justifyContent='center' position='absolute' top={0} left={0} minHeight={200} height={'100%'} width='100%' sx={{cursor:'pointer',":hover":{".edit-area":{visibility:"visible",bgcolor:t=>alpha(t.palette.common.white,0.9)}}}}>
                                                                    <Stack borderRadius={1} justifyContent='center' className='edit-area' visibility='hidden' p={2} py={4} spacing={2} border={t=>`1px solid ${t.palette.primary.main}`}>
                                                                        <EditSvg />
                                                                        <Typography variant='h6' sx={{color:'primary.main'}}>{props.editTip}</Typography>
                                                                    </Stack>
                                                                </Stack>
                                                            )}

                                                            <Fade in={state.screenshotEdit && !state.loading}>
                                                                <Box data-test='screenshot' minHeight={200} height={'100%'} visibility={state.screenshotEdit ? "visible" : "hidden"}>
                                                                    <Image alt="Screenshot" lazy={false} ref={this.screenshotPrev} sx={{width:'100%',height:'100%'}} />
                                                                </Box>
                                                            </Fade>
                                                        </Box>
                                                    </Box>
                                                </Fade>

                                                <Box>
                                                    <Typography variant='caption'>Some <Span onClick={()=>!props.disabled && this.showInformation()} sx={{color: props.disabled ? 'text.disabled' : 'customColor.link',cursor:"pointer",':hover':{textDecoration:'underline'}}}>system information</Span> may be sent to Portalnesia. We will use the information that give us to help address technical issues and to improve our services.</Typography>
                                                </Box>
                                            </Stack>

                                            <Box flexGrow={1} />

                                            <Box px={2} pt={2} mb={2} borderTop={t=>`2px solid ${t.palette.divider}`} width='100%'>
                                                <Button sx={{width:'100%'}} onClick={()=>this.send()} disabled={props.disabled} loading={props.disabled}>{props.confirmLabel}</Button>
                                            </Box>
                                        </Scrollbar>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>
                    </Box>
                </Fade>
                <Fade in={state.editMode}>
                    <Paper elevation={2} ref={this.toolBar} className="tool-bar clearfix"
                        sx={{
                            p:0,
                            position:"fixed",
                            left:'50%',
                            top:'60%',
                            minWidth:200,
                            maxWidth:'60%',
                            bgcolor:'background.paper',
                            height:56,
                            borderRadius:1,
                            zIndex:10
                        }}
                    >
                        <Stack direction='row'>
                            <Stack justifyContent='center' width={40} height={56} p={1} sx={{cursor:'move'}} onMouseDown={(e)=>this.handleMoveMouseDown(e)}>
                                <DragIndicator sx={{width:30,height:30}} />
                            </Stack>

                            <Tooltip title={props.highlightTip}>
                                <ButtonBase disabled={props.disabled} onClick={() => this.setState({toolBarType: 'highlight'})} sx={{justifyContent:'center',alignItems:'center',display:'flex',height:56,p:1,':hover':{bgcolor:'action.hover'},...(state.toolBarType==='highlight' ? {bgcolor:'action.hover'} : {})}}>
                                    <HighlightHideSvg />
                                </ButtonBase>
                            </Tooltip>

                            <Tooltip title={props.hideTip}>
                                <ButtonBase disabled={props.disabled} onClick={() => this.setState({toolBarType: 'hide'})} sx={{justifyContent:'center',alignItems:'center',display:'flex',height:56,p:1,':hover':{bgcolor:'action.hover'},...(state.toolBarType==='hide' ? {bgcolor:'action.hover'} : {})}}>
                                    <HighlightHideSvg hide />
                                </ButtonBase>
                            </Tooltip>

                            <Stack justifyContent='center' px={1} height={56}>
                                <Button disabled={props.disabled} text onClick={()=>this.editCancel()}>{props.editDoneLabel}</Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Fade>

                <Box data-test='highlight-feedback' ref={this.highlight} width={0} height={0} position='absolute' left={0} top={0} zIndex={7}>
                    {state.highlightItem.map((data,k)=>(
                        <Box key={`${k}`} width={data.width} height={data.height} left={data.sx} top={data.sy} position='absolute' bgcolor='none' sx={{":hover":{
                            bgcolor:'rgba(55, 131, 249, 0.2)'
                        }}}>
                            <IconButton sx={{
                                position:'absolute',
                                top:-22,
                                left:-22,
                                zIndex:1
                            }} onClick={()=>this.clearHighlight(k)}>
                                <Box width={24} height={24} bgcolor='error.main' borderRadius={5}>
                                    <Close fontSize="small" />
                                </Box>
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                <Box data-test='hide-feedback' ref={this.black} width={0} height={0} position='absolute' left={0} top={0} zIndex={8}>
                    {state.blackItem.map((data,k)=>(
                        <Box key={`${k}`} width={data.width} height={data.height} left={data.sx} top={data.sy} position='absolute' bgcolor='#000' sx={{":hover":{
                            bgcolor:'rgba(0, 0, 0, 0.8)'
                        }}}>
                            <IconButton sx={{
                                position:'absolute',
                                top:-22,
                                left:-22,
                                zIndex:1
                            }} onClick={()=>this.clearBlack(k)}>
                                <Box width={24} height={24} bgcolor='error.main' borderRadius={5}>
                                    <Close fontSize="small" />
                                </Box>
                            </IconButton>
                        </Box>
                    ))}
                </Box>
                <Canvas ref={this.canvas} width={`${state.docWidth}px`} height={`${state.docHeight}px`} data-html2canvas-ignore="true" onMouseDown={(e)=>this.canvasMouseDown(e)} sx={{
                    width:`${state.docWidth}px`,
                    height:`${state.docHeight}px`,
                    position:'absolute',
                    left:0,
                    top:0,
                    zIndex:6,
                    ...(state.editMode ? {cursor:'crosshair'} : {})
                }} />
                <Canvas ref={this.shadowCanvas} width={`${state.docWidth}px`} height={`${state.docHeight}px`} sx={{
                    width:`${state.docWidth}px`,
                    height:`${state.docHeight}px`,
                    position:'absolute',
                    left:0,
                    top:0,
                    zIndex: 5,
                    ...(state.editMode ? {cursor:'crosshair'} : {})
                }} />
            </Box>
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

function EditSvg() {
    const theme = useTheme();
    return (
        <SvgIcon sx={{color:'primary.main',fontSize:50}} focusable="false" aria-label="" fill={theme.palette.customColor.linkIcon} viewBox="0 0 24 24" height="48" width="48">
            <path d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path>
        </SvgIcon>
    )
}

function HighlightHideSvg({hide}: {hide?:boolean}) {

    if(!hide) return <SvgIcon sx={{fontSize:36,color:"#FFEB3B"}} viewBox="0 0 24 24" height="36" width="36" fill="#FFEB3B"><path d="M3 3h18v18H3z"></path></SvgIcon>
    else return <SvgIcon sx={{fontSize:36,color:'common.black'}} viewBox="0 0 24 24" height="36" width="36" fill="#000"><path d="M3 3h18v18H3z"></path></SvgIcon>
}

const Feedback = forwardRef<FeedbackClass,FeedbackProps>((props,ref)=>{
    const {enqueueSnackbar,closeSnackbar}=useSnackbar();
    const user = useSelector(s=>s.user);

    return (
        <FeedbackClass ref={ref} enqueueSnackbar={enqueueSnackbar} closeSnackbar={closeSnackbar} user={user} {...props} />
    )
})

export default Feedback;