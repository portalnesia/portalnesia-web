import {HTMLProps, useMemo, useState,DragEvent, useCallback, ChangeEvent, DragEventHandler, ReactNode, useRef} from 'react'
import { styled } from '@mui/material/styles'
import { generateRandom } from '@portalnesia/utils'
import { Div } from './Dom'

const InputContainer=styled('div',{shouldForwardProp:prop=>prop!=="hover"})<{hover?:boolean}>(({hover,theme})=>({
    textAlign:'center',
    border:`1px dashed ${theme.palette.divider}`,
    padding:0,
    position:'relative',
    borderRadius:'.375rem',
    willChange:'border-color,background',
    transition:'border-color 250ms ease-in-out,background 250ms ease-in-out',
    '&:hover':{
        background:theme.palette.action.hover,
    },
    '& label':{
        padding:'8.75rem 15px',
        cursor:'pointer',
        display:'inline-block',
        width:'100%',
        fontSize:'1.2rem',
        fontWeight:600,
    },
    ...(hover ? {
        background:theme.palette.action.hover
    } : {})
}))

export type HandleChangeEvent = Pick<ChangeEvent<HTMLInputElement>,'target'>|Pick<DragEvent<HTMLDivElement>,'dataTransfer'>
export interface DragableFilesProps extends HTMLProps<HTMLInputElement> {
    id: string
    label: string
    handleChange?(event: HandleChangeEvent): void
    /**
     * Is there a file selected?
     */
    file?: boolean
    /**
     * Component if there is file selected
     */
    children?: ReactNode
}

export default function DragableFiles({id,label,handleChange:onChange,onChange:_a,file,disabled,children,...inputProps}: DragableFilesProps) {
    const [hover,setHover] = useState(false)
    const [labelText,setLabelText] = useState(label);
    const inputEl = useRef<HTMLInputElement>(null);

    const handleDrag=useCallback((enter: boolean)=>(e: DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        if(enter){
            setLabelText("Drop your images now")
            setHover(true)
        } else {
            setLabelText("Drag images or click here to select images")
            setHover(false)
        }
    },[])

    const handleChange=useCallback(async(e: ChangeEvent<HTMLInputElement>)=>{
        setLabelText(label);
        setHover(false);
        if(disabled) return;
        if(onChange) onChange(e);
        if(inputEl.current) inputEl.current.value = '';
    },[onChange,label,disabled])

    const handleDrop=useCallback((e: DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        e.stopPropagation();
        setLabelText(label);
        setHover(false);
        if(disabled) return;
        if(onChange) onChange(e);
    },[handleChange,label,disabled])

    return (
        <Div>
            {!file ? (
                <InputContainer
                    hover={hover}
                    onDragEnter={handleDrag(true)}
                    onDragOver={e=>e.preventDefault()}
                    onDragLeave={handleDrag(false)}
                    onDrop={handleDrop}
                >
                    <input ref={inputEl} style={{display:'none'}} {...inputProps} id={id} onChange={handleChange} disabled={disabled} />
                    <label htmlFor={id}>{labelText}</label>
                </InputContainer>
            ) : children}
        </Div>
    )
}