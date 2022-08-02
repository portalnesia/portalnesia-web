import React from 'react';

export interface ParserProps {
    html: string;
    className?: string;
    style?: React.CSSProperties;
    noMargin?: boolean;
    preview?: boolean
}

export interface MarkdownProps {
    source: string;
    className?: string;
    style?: React.CSSProperties;
    skipHtml?: boolean;
    preview?: boolean
}

/**
 * 
 * Parser Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const Parser: React.FunctionComponent<ParserProps>

/**
 * 
 * Markdown Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const Markdown: React.FunctionComponent<MarkdownProps>