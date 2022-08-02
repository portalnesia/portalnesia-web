import React from 'react'
import Plyr from 'plyr';

export type PlyrProps={
    /**
     * Plyr constructor options
     * 
     * [Plyr Options](https://github.com/sampotts/plyr#options)
     */
    options?: Plyr.Options,
    /**
     * Type of media
     * 
     * Default: `video`
     */
    type?: Plyr.MediaType,
    /**
     * Provider of media
     * 
     * Default: `html5`
     */
    provider?: Plyr.Provider,
    /**
     * Source of media
     * 
     * If provider is `html` or type is `audio`
     * 
     * `String URL` or `Plyr source object`
     * 
     * [Plyr Source Object](https://github.com/sampotts/plyr#the-source-setter)
     */
    source?: Plyr.SourceInfo | string,
    /**
     * URL or video ID if provider is `youtube` or `vimeo`
     */
    videoId?: string,
    /**
     * Poster of video
     */
    poster?: string
}
export type PlyrState = {
    id:string,
    plyr: Plyr|null,
    container: HTMLElement|null
}

/**
 * 
 * React Component for Plyr Library
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
declare class Player extends React.Component<PlyrProps,PlyrState>{
    /**
     * Get Plyr Instance
     * 
     * See [Plyr API](https://github.com/sampotts/plyr#api)
     */
    getInstance():void
}

export default Player