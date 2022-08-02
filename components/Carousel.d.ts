import React from 'react'
import {ResponsiveType} from 'react-multi-carousel'
import {PaperBlockProps} from './PaperBlock'

export type CarouselProps = {
    /**
     * Data of carousel
     */
    data: Array<any>,
    /**
     * Title of Paperblock Components
     */
    title: string,
    /**
     * Responsive object
     */
    responsive?: ResponsiveType,
    /**
     * If true, another Carousel Components. Not recommended
     * 
     * default false
     */
    single?: boolean,
    /**
     * Link props for next/link
     */
    linkParams: string,
    /**
     * Property of `as` in Data array
     */
    asParams?: string,
    /**
     * Others PaperBlock Props
     */
    paperBlock?: PaperBlockProps
    partialVisible?:boolean,
    infinite?:boolean,
    autoPlay?:number,
    autoPlaySpeed?:number,
    transitionDuration?:number,
    type?:'news'|'chord'|'blog'|'thread'|'events'
}

/**
 * 
 * Carousel Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Carousel: React.FunctionComponent<CarouselProps>
export default Carousel