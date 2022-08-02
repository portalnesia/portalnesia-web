import React from 'react'
import Plyr from 'plyr';

const generateRandom=()=>{
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

class Player extends React.Component {
    constructor(props){
        super(props)
        this.state={
            id:`portalnesia-player-${generateRandom()}`,
            plyr:null,
            container:null
        }
        this.getInstance=this.getInstance.bind(this)
    }
    static defaultProps={
        type:'video',
        provider:'html5'
    }

    /**
     * Get Plyr Instance
     * 
     * See [Plyr API](https://github.com/sampotts/plyr#api)
     */
    getInstance(){
        return this.state.plyr
    }

    initial(){
        const cont=document.getElementById(this.state.id)
        if(cont) {
            this.setState({container:cont})
            const player = new Plyr(cont,this.props.options);
            if(this.props.type==='video'){
                if(this.props.provider==='html5'){
                    if(typeof this.props.source==='object'){
                        player.source = this.props.source
                    }
                }
            } else {
                if(typeof this.props.source==='string') {
                    player.source = {
                        type: 'audio',
                        sources: [{
                            src:this.props.source,
                            type:"audio/mp3"
                        }]
                    };
                } else if(typeof this.props.source==='object'){
                    player.source = this.props.source
                }
            }
            this.setState({plyr:player})
        }
    }

    componentDidMount(){
        this.initial()
    }
    componentDidUpdate(prevProps){
        if(prevProps.source !== this.props.source) {
            if(this.state.plyr!==null){
                if(this.props.type==='video'){
                    if(this.props.provider==='html5'){
                        if(typeof this.props.source==='string') {
                            this.state.plyr.source = {
                                type: 'video',
                                sources: [{
                                    src:this.props.source,
                                    type:"video/mp4"
                                }],
                                poster:this.props.poster
                            };
                        } else if(typeof this.props.source==='object'){
                            this.state.plyr.source = this.props.source
                        }
                    } else {
                        this.state.plyr.source = {
                            type: 'video',
                            sources: [
                                {
                                    src:this.props.videoId||"",
                                    provider:this.props.provider,
                                }
                            ]
                        };
                    }
                } else {
                    if(typeof this.props.source==='string') {
                        this.state.plyr.source = {
                            type: 'audio',
                            sources: [{
                                src:this.props.source,
                                type:"audio/mp3"
                            }]
                        };
                    } else if(typeof this.props.source==='object'){
                        this.state.plyr.source = this.props.source
                    }
                }
            } else {
                this.initial()
            }
        }
    }
    componentWillUnmount(){
        if(this.state.plyr!==null) this.state.plyr.destroy();
        this.setState({
            plyr:null,
        })
    }

    renderWithVideoId(){
        return (
            <div key={this.state.id} id={this.state.id} data-plyr-provider={this.props.provider} data-plyr-embed-id={this.props.videoId}></div>
        )
    }
    renderWithSRC(){
        if(this.props.source && typeof this.props.source==='object'){
            return (
                <video key={this.state.id} id={this.state.id}></video>
            );
        } else if(typeof this.props.source==='string') {
            return (
                <video
                    key={this.state.id}
                    id={this.state.id}
                    src={this.props.source}
                    poster={this.props.poster}
                />
            );
        } else return null
    }
    renderAudio(){
        return (
            <audio key={this.state.id} id={this.state.id} preload="auto" controls>Your browser does not support HTML5 Audio!</audio>
        )
    }
    render(){
        if(this.props.type==='video' && this.props.provider && ['youtube','vimeo'].indexOf(this.props.provider)!==-1 && typeof this.props.videoId==='string') return this.renderWithVideoId()
        else if(this.props.type==='video') return this.renderWithSRC()
        else return this.renderAudio()
    }
}
export default Player