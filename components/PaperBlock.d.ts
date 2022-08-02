import React from 'react'

export interface PaperBlockProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    /**
     * Main Element if true, otherwise, Sidebar
     */
    main?: boolean;
    /**
     * ID element for Sticky 'Sidebar' components
     */
    id?: string;
    /**
     * Title of Components
     */
    title?: string|JSX.Element;
    /**
     * Description of Components
     */
    desc?: string|JSX.Element;
    children: React.ReactNode;
    /**
     * Default background color instead Paper background
     * @default false
     */
    whiteBg?: boolean;
    /**
     * Primary background color
     * @default false
     */
    colorMode?: boolean;
    /**
     * If true, children will have no padding.
     * @default false
     */
    noPadding?: boolean,
    /**
     * If true, header will have no padding
     * @default false
     */
    noPaddingHeader?: boolean,
    /**
     * If true, footer will have no padding
     * @default false
     */
    noPaddingFooter?: boolean,
    /**
     * If true, footer will have no margin top
     * @default false
     */
    noMarginFooter?: boolean,
    /**
     * If true, children will have no margin top
     * @default false
     */
    noMargin?: boolean,
    /**
     * Add marginTop and paddingTop
     * @default false
     */
    marginPlus?: boolean,
    /**
     * Add overflowX: auto and width: 100% CSS in children components
     * @default false
     */
    overflowX?: boolean,
    /**
     * Add blue color to link html tag
     * @default false
     */
    linkColor?: boolean,
    /**
     * Action components, flex to title
     */
    action?: React.ReactNode,
    /**
     * Header components, in the bottom of title
     */
    header?: React.ReactNode,
    /**
     * Footer components
     */
    footer?: React.ReactNode,
    style?: React.CSSProperties,
    /**
     * Add toggle card variant
     * @default false
     */
    toggle?: boolean,
    /**
     * If toggle = true, Initial toggle will show the components
     * @default true
     */
    initialShow?: boolean,
    /**
     * Add divider in the bottom of footer
     */
    divider?: boolean,
    enableSlideDown?: boolean
}

/**
 * 
 * Card Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const PaperBlock: React.FunctionComponent<PaperBlockProps>
export default PaperBlock