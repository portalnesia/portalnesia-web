import React from 'react'
import NativeCroppie from 'croppie'
import 'croppie/croppie.css'
import { ApiError } from '@design/hooks/api'
import Box from '@mui/material/Box'
import { Circular } from '@design/components/Loading'
import { Theme,SxProps,styled } from '@mui/material/styles'
import { Div } from '@design/components/Dom'

const DivCroppie = styled('div',{shouldForwardProp:prop=>prop!=="background"})<{background?:string}>(({background})=>({
    '.cr-viewport':{
        ...(background ? {
            backgroundImage:`url(${background})`,
            backgroundSize:'100%',
            zIndex:5
        } : {})
    },
    '.cr-boundary': {
        backgroundImage:'url(https://content.portalnesia.com/transparent.jpg)'
      }
}))

export interface CroppieProps {
    /**
     * Size of html
     */
    size?: number
    /**
     * Size of canvas (rendered image)
     */
    canvasSize?: number
    background?: string
    sx?: SxProps<Theme>
}
type CroppieState = {
    ready: boolean,
    dataUrl: string|null
}
const defaultProps = {
    size:500,
    canvasSize:1000,
    onRenderStart:()=>{},
    onRenderEnd:()=>{},
    onImageLoaded:()=>{}
}
export default class Croppie extends React.PureComponent<CroppieProps,CroppieState> {
    croppie?: NativeCroppie;
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;

    constructor(props: CroppieProps){
        super(props);
        this.state={
            ready:false,
            dataUrl:null
        }
        this.cropImage=this.cropImage.bind(this);
        this.rotate=this.rotate.bind(this);
        this.loadImage=this.loadImage.bind(this);
    }
    static defaultProps=defaultProps

    private async drawTwibbon(){
        return new Promise<HTMLCanvasElement>((res,rej)=>{
            if(this.croppie && this.canvas) {
                if(typeof this.props.background==="string" && this.ctx) {
                    let img = new Image();
                    img.src= this.props.background;
                    img.onload = ()=>{
                        if(this.ctx && this.canvas) {
                            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                            res(this.canvas)
                        }
                    };
                } else {
                    res(this.canvas)
                }
            } else rej(new Error("Croppie instance not loaded"));
        })
    }

    private drawImage(src: any){
        return new Promise<HTMLCanvasElement>((res,rej)=>{
            if(this.canvas && this.ctx) {
                let img = new Image();
                img.src = src;
                img.onload = ()=>{
                    if(this.canvas && this.ctx) {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                        this.drawTwibbon()
                        .then(result=>{
                            res(result)
                        }).catch(rej)
                    }
                };
            } else rej(new Error("Croppie instance not loaded"))
        })
    }

    async cropImage(){
        try {
            if(this.croppie && this.canvas) {
                const result = await this.croppie.result({
                    size: {
                        width: this.canvas.width,
                        height: this.canvas.height,
                    } 
                });

                const base64 = await this.drawImage(result);
                return base64;
            } else throw new ApiError("Croppie instance not loaded");
        } catch(e) {
            console.log(e)
            throw new ApiError("Croppie instance not loaded");
        }
    };
    /**
     * Rotate images
     * @param {90 | 180 | 270 | -90 | -180 | -270} degree 
     */
    rotate(degree: 90 | 180 | 270 | -90 | -180 | -270){
        if(this.croppie) this.croppie.rotate(degree);
    }

    /**
     * Load image event from input html
     * @param event 
     * @returns {Promise<void>}
     */
    loadImage(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        return new Promise<void>((res)=>{
            if(this.croppie && event?.target?.files !== null) {
                const reader = new FileReader();
                reader.onload = ((e)=>{
                    if(this.croppie && e.target && e.target.result) {
                        this.setState({
                            dataUrl:e.target.result as string
                        })
                        this.croppie.bind({
                            url:e.target.result as string
                        }).then(()=>{
                            res();
                        })
                    }
                });
                reader.readAsDataURL(event.target.files[0]);
            } else res();
        })
    }

    private initial() {
        const {size = defaultProps.size} = this.props
        const el = document.getElementById("portalnesia-croppie") as HTMLElement;
        const lebar= el.offsetWidth < size ? el.offsetWidth : size;
        const canvasEl = document.getElementById("imageCanvas") as HTMLCanvasElement;
        const ctx= canvasEl?.getContext('2d') as CanvasRenderingContext2D;

        const croppieInstance = new NativeCroppie(el, {
            viewport: {
                height: lebar,
                width: lebar,
            },
            boundary: {
                height: lebar,
                width: lebar,
            },
            enableOrientation: true,
            enforceBoundary: false,
            mouseWheelZoom: 'ctrl',
        });
        this.croppie = croppieInstance;
        this.canvas = canvasEl;
        this.ctx = ctx;
        this.setState({
            ready:true
        })
    }

    componentDidMount(){
        this.initial();
    }

    componentDidUpdate(prevProps: Readonly<CroppieProps>, prevState: Readonly<CroppieState>, snapshot?: any): void {
        if(
            prevProps.background !== this.props.background
        ) {
            this.reset();
        }
    }

    reset(): void {
        if(this.croppie) {
            this.croppie.destroy();
            this.croppie = undefined;
            this.canvas = undefined;
            this.ctx = undefined;
            this.setState({
                dataUrl:null,
                ready:false
            })
        }
        this.initial();
    }

    componentWillUnmount(){
        if(this.croppie) {
            this.croppie.destroy();
            this.croppie = undefined;
            this.canvas = undefined;
            this.ctx = undefined;
            this.setState({
                dataUrl:null,
                ready:false
            })
        }
    }

    render(){
        return(
            <Div sx={{position:"relative",...this.props.sx}}>
                {!this.state.ready && (
                    <Box position={"absolute"} top={0} left={0} width={this.props.size} height={this.props.size} display="flex" justifyContent="center" alignItems="center">
                        <Circular />
                    </Box>
                )}
                <canvas id="imageCanvas" style={{display:'none'}} width={this.props.canvasSize} height={this.props.canvasSize}></canvas>
                <DivCroppie id="portalnesia-croppie" background={this.props.background} />
            </Div>
        )
    }
}

/**
 * Types only. Alias for class Croppie
 */
export type {Croppie as CroppieRef}