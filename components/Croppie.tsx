import React from 'react'
import Croppie from 'croppie'
import 'croppie/croppie.css'

export interface CroppieProps {
    size?: number
    canvasSize?: number
    resultType?: 'canvas'|'base64'
    onRenderStart?(): void
    onRenderEnd?(result: string): void
    onImageLoaded?(): void,
    background?: string
    keys: string
}

type CroppieState = {
    ready: boolean,
    dataUrl: string|null
}
const defaultProps = {
    size:500,
    canvasSize:1000,
    resultType:'canvas',
    onRenderStart:()=>{},
    onRenderEnd:()=>{},
    onImageLoaded:()=>{}
}

/**
 * 
 * Croppie Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export default class Crop extends React.PureComponent<CroppieProps,CroppieState>{
    croppie?: Croppie;
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;

    constructor(props: CroppieProps){
        super(props);
        this.state={
            ready:false,
            dataUrl:null
        }
        //this.drawImage=this.drawImage.bind(this);
        //this.drawTwibbon=this.drawTwibbon.bind(this);
        this.renderImage=this.renderImage.bind(this);
        this.rotate=this.rotate.bind(this);
        this.imageLoad=this.imageLoad.bind(this);
        //this.refreshImage=this.refreshImage.bind(this);
    }

    static defaultProps=defaultProps

    private drawTwibbon(){
        if(this.croppie && this.canvas) {
            if(typeof this.props.background==="string" && this.ctx) {
                let img = new Image();
                img.src= this.props.background;
                img.onload = ()=>{
                    if(this.ctx && this.canvas) {
                        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                        this.props.onRenderEnd && this.props.onRenderEnd(this.canvas.toDataURL());
                    }
                };
            } else {
                if(this.canvas && this.props.onRenderEnd) this.props.onRenderEnd(this.canvas.toDataURL());
            }
        }
    }
    private drawImage(src: any){
        if(this.canvas && this.ctx) {
            let img = new Image();
            img.src = src;
            img.onload = ()=>{
                if(this.canvas && this.ctx) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    this.drawTwibbon();
                }
            };
        }
    }
    renderImage(){
        if(this.croppie && this.canvas) {
            this.croppie.result({
                type:this.props.resultType,
                size: {
                    width: this.canvas.width,
                    height: this.canvas.height,
                } 
            }).then((res)=>{
                if(typeof this.props.onRenderStart === 'function') this.props.onRenderStart();
                this.drawImage(res);
            });
        }
        
    };
    rotate(deg: 90 | 180 | 270 | -90 | -180 | -270){
        if(this.croppie) this.croppie.rotate(deg);
    }
    imageLoad(e: React.ChangeEvent<HTMLInputElement>) {
        if(this.croppie && e?.target?.files !== null) {
            const reader = new FileReader();
            reader.onload = ((e)=>{
                if(this.croppie && e.target && e.target.result) {
                    this.setState({
                        dataUrl:e.target.result as string
                    })
                    this.croppie.bind({
                        url:e.target.result as string
                    }).then(()=>{
                        if(this.props.onImageLoaded) this.props.onImageLoaded()
                    })
                }
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    private refreshImage(){
        if(this.croppie && this.state.dataUrl !== null) {
            this.croppie.bind({
                url:this.state.dataUrl
            })
        }
    }
    private initial() {
        const {size = defaultProps.size} = this.props
        const el = document.getElementById("portalnesia-croppie") as HTMLElement;
        const lebar= el.offsetWidth < size ? el.offsetWidth : size;
        const canvasEl = document.getElementById("imageCanvas") as HTMLCanvasElement;
        const ctx= canvasEl?.getContext('2d') as CanvasRenderingContext2D;

        if(typeof this.props.background==="string"){
            const style=document.createElement('style');
            style.innerHTML=`.cr-viewport{background-image:url(${this.props.background});background-size:100%;z-index:5}`;
            el.appendChild(style);
        }
        const croppieInstance = new Croppie(el, {
            //enableExif: true,
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

    componentDidUpdate(prevProps: CroppieProps){
        if(this.props.keys !== prevProps.keys){
            if(this.croppie) this.croppie.destroy();
            this.initial();
        }
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
            <div>
                <canvas id="imageCanvas" style={{display:'none'}} width={this.props.canvasSize} height={this.props.canvasSize}></canvas>
                <div id="portalnesia-croppie"></div>
            </div>
        )
    }
}