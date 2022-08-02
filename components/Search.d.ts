import React from 'react'

export interface SearchProps {
    onsubmit?: React.FormEventHandler<HTMLFormElement>
    onremove?: React.MouseEventHandler<HTMLButtonElement>
    onchange?: React.ChangeEventHandler<HTMLInputElement>
    remove?: boolean;
    value: string;
    autosize?: boolean;
    style?: React.CSSProperties
    /**
     * Position if not autosize
     */
    position?:'left'|'right'
}

/**
 * 
 * Search Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
 const Search: React.FunctionComponent<SearchProps>
 export default Search