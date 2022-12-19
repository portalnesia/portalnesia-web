import React from 'react'
import { styled, SxProps,Theme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import Popov from '@mui/material/Popover'
import { alpha } from '@mui/system/colorManipulator';

const Popover = styled(Popov)(()=>({
  '.MuiPaper-root':{
    overflow:'hidden'
  }
}))

const Wrapper = styled('div',{shouldForwardProp:prop=>prop!=='autoresize'})<{autoresize?:boolean}>(({theme,autoresize})=>({
    position: 'relative',
    borderRadius: 10,
    background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.15),
    display: 'inline-block',
    '&:hover': {
        background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.15 : 0.18),
    },
    ...(autoresize ? {
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
    }:{})
}))

const SearchStyle = styled('div')(({theme})=>({
    width: theme.spacing(5),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}))
  
  const DeleteStyle = styled('div',{shouldForwardProp:prop=>prop!=='focused'})<{focused?:boolean}>(({theme,focused})=>({
    width: theme.spacing(5),
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    cursor:'pointer',
    display:'dlex'
}))
  
  const InputStyle = styled('input',{
    shouldForwardProp:prop=>!['removed','autoresize'].includes(String(prop))
  })<{removed?:boolean,autoresize?:boolean}>(({theme,removed,autoresize})=>({
    font: 'inherit',
    padding: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(5)}`,
    border: 0,
    display: 'block',
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    background: 'none',
    margin: 0, // Reset for Safari
    height:'100%',
    color: 'inherit',
    '&:focus-visible':{
        outline:'unset'
    },
    ...(autoresize ? {
        transition: theme.transitions.create('width'),
        width: 180,
        '&:focus': {
            width: 350,
        },
    } : {width: '100%','&:focus': {outline: 0}}),
    ...(removed ? {padding: `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(5)}`} : {})
}))

export interface SearchProps {
    onsubmit?: React.FormEventHandler<HTMLFormElement>
    onremove?: React.MouseEventHandler<HTMLButtonElement>
    onchange?: React.ChangeEventHandler<HTMLInputElement>
    remove?: boolean;
    value: string;
    autosize?: boolean;
    sx?: SxProps<Theme>;
    wrapperSx?: SxProps<Theme>;
    /**
     * Position if not autosize
     */
    position?:'left'|'right'
  }
  
  export default function Search({onsubmit,onremove,onchange,remove=false,value,autosize=false,sx,wrapperSx}: SearchProps) {
    const [open,setOpen] = React.useState(false);
  
    const inputRef = React.useRef<HTMLInputElement>(null);
    const buttonRef = React.useRef(null)
  
    const handleDivClick=React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
        setOpen(e=>!e)
        setTimeout(()=>inputRef.current?.focus(),100);
    },[setOpen]);
  
    const handleRemove=React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
        if(e?.stopPropagation) e.stopPropagation();
        if(onremove) onremove(e)
        setTimeout(()=>inputRef.current?.focus(),100);
    },[onremove])
  
    const handleSubmit=React.useCallback((e: React.FormEvent<HTMLFormElement>)=>{
      if(e?.preventDefault) e.preventDefault();
      if(onsubmit) {
        setOpen(false)
        onsubmit(e);
      }
    },[onsubmit])
  
    return (
        <>
            {autosize ? (
                <form onSubmit={handleSubmit}>
                    <Wrapper autoresize sx={{...wrapperSx}}>
                        {remove && value?.length > 0? (
                            <DeleteStyle focused={value?.length > 0 }>
                                <IconButton onClick={handleRemove} size="small">
                                    <ClearIcon />
                                </IconButton>
                            </DeleteStyle>
                        ) : (
                            <SearchStyle>
                                <SearchIcon />
                            </SearchStyle>
                        )}
                        <InputStyle ref={inputRef} sx={sx} autoresize removed={remove && value?.length > 0} placeholder={`Search...`} value={value} onChange={onchange} />
                    </Wrapper>
                </form>
            ) : (
                <div>
                    <IconButton ref={buttonRef} onClick={handleDivClick}>
                        <SearchIcon />
                    </IconButton>
  
                    <Popover
                        open={open}
                        anchorEl={buttonRef.current}
                        onClose={handleDivClick}
                        anchorOrigin={{
                            vertical:'top',
                            horizontal:'center'
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <Wrapper sx={{width:`calc(100vw - 30px)`,height:45,...wrapperSx}}>
                                {remove && value?.length > 0? (
                                    <DeleteStyle focused={value?.length > 0 }>
                                        <IconButton onClick={handleRemove} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </DeleteStyle>
                                ) : (
                                    <SearchStyle>
                                        <SearchIcon />
                                    </SearchStyle>
                                )}
                                <InputStyle ref={inputRef} sx={sx} removed={remove && value?.length > 0} placeholder={`Search...`} value={value} onChange={onchange} />
                            </Wrapper>
                        </form>
                    </Popover>
                </div>
            )}
            
        </>
    );
  }