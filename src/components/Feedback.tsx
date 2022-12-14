import { UserPagination } from "@model/user"
import { useDispatch } from "@redux/store"
import getBrowserInfo, { IBrowserInfo } from "@utils/browser"
import { portalUrl } from "@utils/main"
import { OptionsObject, SnackbarKey, SnackbarMessage } from "notistack"
import React from "react"
import html2canvas from 'html2canvas'
import IconButton from "@mui/material/IconButton"
import Close from "@mui/icons-material/Close"
import { State } from "@type/redux"
import Box from "@mui/material/Box"
import { isMobile } from "react-device-detect"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { ArrowBack } from "@mui/icons-material"
import Fade from "@mui/material/Fade"

type BrowserInfo = IBrowserInfo & ({
    user?: UserPagination
})

export type IData = {sysInfo: BrowserInfo,text?: string,screenshot?:string,rating?:number|null}
export interface FeedbackProps {
    disabled?:boolean,
    loading?:boolean,
    proxy?:string,
    required?:boolean,
    rating?: string,
    onSend?(data: IData): void,
    onCancel?(): void,
    title?: string
    placeholder?:string,
    license?: React.ReactNode
}

interface FeedbackClassProps {  
    enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject | undefined): SnackbarKey
    closeSnackbar(key?: SnackbarKey | undefined): void,
    theme?: any
    user: State['user'],
    dispatch: ReturnType<typeof useDispatch>
}

interface FeedbackState {
    docWidth: number,
    docHeight: number,
    winHeight: number,
    shotOpen: boolean,
    loading: boolean,
    screenshotEdit: boolean,
    editMode: boolean,
    toolBarType: string,
    hightlightItem: any[],
    blackItem: any[],
    text: string,
    textError: string,
    feedbackVal: number|null,
    showInformation: boolean;
}

type FeedbackAllProps = FeedbackProps&FeedbackClassProps
const hightLightEl = ['button','td','th','code','pre','blockquote','li', 'a', 'span','em','i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'small', 'sub', 'sup', 'b', 'time', 'img', 'video', 'input', 'label', 'select', 'textarea', 'article', 'summary', 'section'];

class FeedbackClass extends React.PureComponent<FeedbackAllProps,FeedbackState> {
    move: boolean
    eX: number
    eY: number
    ctx: any
    dragRect: boolean
    startX: number
    startY: number
    shadowCanvas = React.createRef<HTMLCanvasElement>()
    canvas = React.createRef<HTMLCanvasElement>()
    hightlight = React.createRef<HTMLDivElement>()
    black = React.createRef<HTMLDivElement>()
    hasHelper=false;
    sctx: CanvasRenderingContext2D|null=null
    toolBar = React.createRef<HTMLDivElement>()
    screenshotPrev = React.createRef<HTMLImageElement>()
    textarea = React.createRef<HTMLTextAreaElement>()
    canvasMD=false
    timer?: NodeJS.Timeout

    constructor(props: FeedbackAllProps) {
        props = {
          ...props,
          title: props.title||"Send Feedback",
          placeholder:props.placeholder||"Please explain your problem or share your thoughts",
        }
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
          hightlightItem: [],
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
        //this.documentMouseMove = this.documentMouseMove.bind(this);
        //this.elementHelperClick = this.elementHelperClick.bind(this);
        //this.windowResize = this.windowResize.bind(this);
    }
    static defaultProps: Partial<FeedbackAllProps>={
        disabled:false,
        required : false,
        proxy:portalUrl(`/canvas-proxy`)
    }

    switchCanvasVisible(visible?: boolean) {
        if (visible) {
            this.shadowCanvas?.current?.removeAttribute('data-html2canvas-ignore');
        } else {
            this.shadowCanvas?.current?.setAttribute('data-html2canvas-ignore', 'true');
        }
    }

    inElement(e:any) {
        let x = e.clientX, y = e.clientY;
        let el = document.elementsFromPoint(x, y)[3];
        if(this.canvas?.current) this.canvas.current.style.cursor = 'crosshair';
        if (el && hightLightEl.indexOf(el.nodeName.toLocaleLowerCase()) > -1 || el && el?.classList.contains("MuiInputBase-root") || el && el?.classList.contains("MuiSelect-root") || el && el?.classList.contains("pn-sort")) {
            let rect = el.getBoundingClientRect();
            let rectInfo = {
              sx: rect.left + (document.documentElement.scrollLeft + document.body.scrollLeft),
              sy: rect.top + (document.documentElement.scrollTop + document.body.scrollTop),
              width: rect.width,
              height: rect.height
            };
            return rectInfo;
        } else {
            return false;
        }
    }

    elementHelper(e: any) {
        let rectInfo = this.inElement(e);
        if (rectInfo) {
          if(this.canvas?.current) this.canvas.current.style.cursor = 'pointer';
          this.drawElementHelper(rectInfo);
          this.hasHelper = true;
        } else {
          if (this.hasHelper) {
            this.hasHelper = false;
            this.initCanvas();
            this.drawHightlightBorder();
            this.drawHightlightArea()
          }
        }
    }

    elementHelperClick(e: any) {
        if (this.dragRect) return;
        let nodeName = e.target.nodeName;
        if (nodeName != 'CANVAS') return;
        let rectInfo = this.inElement(e);
        if (rectInfo) {
            let toolBarType = this.state.toolBarType;
            if (toolBarType == 'hightlight') {
                let hightlightItem = this.state.hightlightItem;
                hightlightItem.push(rectInfo);
                this.setState({
                    hightlightItem: hightlightItem,
                })
            } else if (toolBarType == 'black') {
                let blackItem = this.state.blackItem;
                blackItem.push(rectInfo);
                this.setState({
                    blackItem: blackItem,
                })
            }
        }
    }

    drawElementHelper(info: any) {
        this.initCanvas();
        let toolBarType = this.state.toolBarType;
        if (toolBarType == 'hightlight') {
            this.ctx.lineWidth = '5';
            this.ctx.strokeStyle = '#FEEA4E';
            this.ctx.rect(info.sx, info.sy, info.width, info.height);
            this.ctx.stroke();
            this.drawHightlightBorder();
            this.drawHightlightArea();
            this.ctx.clearRect(info.sx, info.sy, info.width, info.height);
            this.sctx?.clearRect(info.sx, info.sy, info.width, info.height);
        } else if (toolBarType == 'black') {
            this.drawHightlightBorder();
            this.drawHightlightArea();
            this.ctx.fillStyle = 'rgba(0,0,0,.4)';
            this.ctx.fillRect(info.sx, info.sy, info.width, info.height);
        }
    }

    documentMouseMove(e: any) {
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
            this.drawHightlightBorder();
            if (toolBarType == 'hightlight') {
                this.ctx.lineWidth = '5';
                this.ctx.strokeStyle = '#FEEA4E';
                this.ctx.rect(clientX, clientY, width, height);
                this.ctx.stroke();
                this.drawHightlightArea();
                this.ctx.clearRect(clientX, clientY, width, height);
                this.sctx?.clearRect(clientX, clientY, width, height);
            } else if (toolBarType == 'black') {
                this.drawHightlightArea();
                this.ctx.fillStyle = 'rgba(0,0,0,.4)';
                this.ctx.fillRect(clientX, clientY, width, height);
            }
        } else {
            this.elementHelper(e);
        }
    }

    windowResize() {
        this.calcHeight();
    }
    
    addEventListener() {
        document.addEventListener('mousemove', this.documentMouseMove, false);
        document.addEventListener('click', this.elementHelperClick, false);
        window.addEventListener('resize', this.windowResize, false);
    }
    removeEventListener() {
        document.removeEventListener('mousemove', this.documentMouseMove, false);
        document.removeEventListener('click', this.elementHelperClick, false);
        window.removeEventListener('resize', this.windowResize, false);
    }

    componentDidMount(): void {
        this.initCanvas(true);
        this.addEventListener();
        if (this.state.shotOpen) {
            this.shotScreen()
        }
    }

    calcHeight(initCanvas=true) {
        let docWidth = document.body.clientWidth,
            docHeight = document.body.clientHeight;
        let windowHeight = window.innerHeight;
        if(docHeight < windowHeight) {
            docHeight = windowHeight;
        }
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
                if(init) {
                    canvas.style.width = `${docWidth}px`;
                    canvas.style.height = `${docHeight}px`;
                    shadowCanvas.style.width = `${docWidth}px`;
                    shadowCanvas.style.height = `${docHeight}px`;
                }
                canvas.width = docWidth;
                canvas.height = docHeight;
                shadowCanvas.width = docWidth;
                shadowCanvas.height = docHeight;
                if(this.sctx) this.sctx.fillStyle = 'rgba(0,0,0,0.38)';
                this.sctx?.fillRect(0, 0, docWidth, docHeight);
            }
        }
    }

    drawHightlightBorder() {
        let hightlightItem = this.state.hightlightItem;
        hightlightItem.map((data, k) => {
            this.ctx.lineWidth = '5';
            this.ctx.strokeStyle = '#FEEA4E';
            this.ctx.rect(data.sx, data.sy, data.width, data.height);
            this.ctx.stroke();
        });
    }
    
    drawHightlightArea() {
        let hightlightItem = this.state.hightlightItem;
        hightlightItem.map((data, k) => {
            this.sctx?.clearRect(data.sx, data.sy, data.width, data.height);
            this.ctx.clearRect(data.sx, data.sy, data.width, data.height);
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
        this.setState({
          editMode: false,
        });
        setTimeout(() => {
          this.shotScreen();
        })
    }

    handleMoveMouseDown(e: any) {
        this.move = true;
        this.eX = e.clientX + window.scrollX;
        this.eY = e.clientY + window.scrollY;
    }
    
    handleMoveMouseUp(e: any) {
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
                hightlightItem = this.state.hightlightItem,
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
            if (toolBarType == 'hightlight') {
                hightlightItem.push(obj);
                this.setState({
                    hightlightItem: hightlightItem,
                });
            } else if (toolBarType == 'black') {
                blackItem.push(obj);
                this.setState({
                    blackItem: blackItem,
                })
            }
            setTimeout(() => {
                this.dragRect = false;
                this.drawHightlightBorder();
                this.drawHightlightArea();
            });
        }
    }

    handleMouseMove(e: any) {
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

    handleVideo(parent: any, resolve: any, reject: any) {
        const $ =require('jquery')
        let videoItem = parent.getElementsByTagName('video');
        if(videoItem == 0) {
          resolve();
          return;
        }
        for(let i = 0; i < videoItem.length; i ++) {
          let video = videoItem[0];
          if(!video.style.backgroundImage) {
            let w = $(video).width();
            let h = $(video).height();
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
        }
        resolve();
    }

    shotScreen() {
        if(this.props.disabled) return;
        if (this.state.loading)return;
        this.loadingState(true);
        let hightlightItem = this.state.hightlightItem;
        this.switchCanvasVisible(hightlightItem.length > 0);
        const videoPromise = new Promise((resolve, reject) => {
            this.handleVideo(document.body, resolve, reject);
        });
        videoPromise.then(() => {
            html2canvas(document.body, {
                allowTaint:true,
                proxy: this.props.proxy || '',
                width: window.innerWidth,
                height: window.innerHeight,
                x: document.documentElement.scrollLeft || document.body.scrollLeft,
                y: document.documentElement.scrollTop || document.body.scrollTop,
                onclone:(doc)=>{
                const svgEl=doc?.body?.querySelectorAll('svg')
                if(svgEl){
                    svgEl.forEach((item)=>{
                    item.setAttribute("width",`${item.getBoundingClientRect()?.width}`)
                    item.setAttribute("height",`${item.getBoundingClientRect()?.height}`)
                    item.style.width='null';
                    item.style.height='null';
                    })
                }
                let menu=doc?.getElementById('sidebar-menu-content')
                if(menu) {
                    menu.style.zIndex='5';
                    const sidebar=doc?.getElementById('sidebar-menu')
                    const parent=sidebar?.parentNode;
                    parent?.insertBefore(menu,sidebar)
                }
                return doc;
                }
            }).then((canvas) => {
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
            }).catch((e) => {
                this.setState({
                screenshotEdit: false,
                });
                this.loadingState(false);
                console.log(e)
            });
        });
    }

    clearHightlight(k: number, e: any) {
        let hightlightItem = this.state.hightlightItem;
        hightlightItem.splice(k, 1);
        this.setState({
            hightlightItem: hightlightItem,
        });
        setTimeout(() => {
            this.initCanvas();
            this.drawHightlightBorder();
            this.drawHightlightArea();
        });
    }
    
    clearBlack(k: number, e: any) {
        let blackItem = this.state.blackItem;
        blackItem.splice(k, 1);
        this.setState({
            blackItem: blackItem,
        });
    }

    canvasMouseDown(e: any) {
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
        if(this.props.rating && this.state.feedbackVal===null) {
            this.props.enqueueSnackbar("Error: You have not provided your feedback",{
              variant:'error',
              action:(key)=>(
                <IconButton
                  className={'snackbarIcon'}
                  onClick={()=>this.props.closeSnackbar(key)}
                  size="large">
                  <Close />
                </IconButton>
              )
            });
            return;
        }
        if (typeof this.props.onSend === 'function') {
          let data: IData = {
            sysInfo: getBrowserInfo(),
            text: text,
          };
          if(this.state.shotOpen && this.screenshotPrev.current) {
            data.screenshot = this.screenshotPrev.current.src || '';
          }
          if(this.props.rating) {
            data.rating = this.state.feedbackVal
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
                sx={{
                    height: `${state.docHeight}px`,
                    width:'100%',
                    position:'absolute',
                    left:0,
                    top:0,
                    zIndex:2200
                }} onMouseMove={this.handleMouseMove.bind(this)} onMouseUp={this.handleMoveMouseUp.bind(this)}>
                    <Box position='relative' width='100%' height='100%'>
                        <Fade in={!state.editMode}>
                            <Box>
                                <Box position='absolute' zIndex={100} width='100%' height='100%' left={0} top={0} bgcolor="none" sx={{cursor:'default'}} />
                                <Box data-test='dialog' data-html2canvas-ignore="true" position='relative'>
                                    <Stack position='fixed' top={0} left={0} width='100%' bgcolor='background.paper' direction="row" spacing={2} borderBottom={theme=>`2px solid ${theme.palette.divider}`} p={2} height={63} zIndex={1}>
                                        {state.showInformation && (
                                            <IconButton>
                                                <ArrowBack />
                                            </IconButton>
                                        )}
                                        <Typography variant='h6' component='h1'>{state.showInformation ? "Additional Info" : props.title}</Typography>
                                    </Stack>
                                </Box>
                            </Box>
                            
                        </Fade>
                    </Box>
            </Box>
        )
    }
}