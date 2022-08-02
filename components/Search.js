import React from 'react'
import {withStyles} from 'portal/components/styles';
import { alpha,styled } from '@mui/material/styles';
import {IconButton,Popover as Popov} from '@mui/material'
import classNames from 'classnames'
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const Popover = styled(Popov)(()=>({
    '.MuiPaper-root':{
        overflow:'hidden'
    }
}))

const stylesMy=(theme,_,classes)=>{
    return {
        wrapper:{
            fontFamily: theme.typography.fontFamily,
            position: 'relative',
            borderRadius: 2,
            background: alpha(theme.palette.text.primary, 0.05),
            display: 'inline-block',
            '&:hover': {
                background: alpha(theme.palette.text.primary, 0.15),
            },
        },
        autosize:{
            marginRight: theme.spacing(1),
            marginLeft: theme.spacing(1),
            [`& .${classes.input}`]: {
                transition: theme.transitions.create('width'),
                width: 180,
                '&:focus': {
                    width: 350,
                },
            }
        },
        notAutosize:{
            [`& .${classes.input}`]:{
                width: '100%'
            }
        },
        search:{
            width: theme.spacing(5),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        delete:{
            width: theme.spacing(5),
            height: '100%',
            position: 'absolute',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            right:0,
            cursor:'pointer'
        },
        focused:{
            display:'flex'
        },
        input:{
            font: 'inherit',
            padding: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(5)}`,
            border: 0,
            display: 'block',
            verticalAlign: 'middle',
            whiteSpace: 'normal',
            background: 'none',
            margin: 0, // Reset for Safari
            color: 'inherit',
            '&:focus': {
                outline: 0,
            },
        },
        removeInput:{
            padding: `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(5)}`,
        }
    }
}

const Search=({classes,onsubmit,onremove,onchange,remove,value,autosize,style})=>{
    const [anchor,setAnchor] = React.useState(null);

    const inputRef = React.useRef();

    const handleDivClick=React.useCallback(e=>{
        if(anchor === null) {
            setAnchor({top:e.clientY,left:15});
            setTimeout(()=>inputRef.current?.focus(),100);
        } else {
            setAnchor(null)
        }
    },[anchor]);

    const handleRemove=React.useCallback((e)=>{
        if(onremove) onremove(e)
        setTimeout(()=>inputRef.current?.focus(),100);
    },[onremove])

    const handleSubmit=React.useCallback((e)=>{
        setAnchor(null)
        if(onsubmit) onsubmit(e);
    },[onsubmit])

    return (
        <>
            {autosize ? (
                <form onSubmit={onsubmit}>
                    <div className={classNames(classes.wrapper,classes.autosize)}>
                        <div className={classes.search}>
                            <SearchIcon />
                        </div>
                        {remove && (
                            <div className={classNames(classes.delete,value?.length > 0 && classes.focused)}>
                                <IconButton onClick={handleRemove} size="large">
                                    <ClearIcon />
                                </IconButton>
                            </div>
                        )}
                        <input ref={inputRef} style={style} className={classNames(classes.input,remove && value?.length > 0 ? classes.removeInput : '')} placeholder="Search" value={value} onChange={onchange} />
                    </div>
                </form>
            ) : (
                <div>
                    <IconButton onClick={handleDivClick}>
                        <SearchIcon />
                    </IconButton>

                    <Popover
                        open={anchor!==null}
                        anchorReference='anchorPosition'
                        anchorPosition={anchor !== null ? anchor : undefined}
                        onClose={handleDivClick}
                        anchorOrigin={{
                            vertical:'center',
                            horizontal:'center'
                        }}
                        transformOrigin={{
                            vertical:'center',
                            horizontal:'right'
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className={classNames(classes.wrapper,classes.notAutosize)} style={{width:`calc(100vw - 30px)`}}>
                                <div className={classes.search}>
                                    <SearchIcon />
                                </div>
                                {remove && (
                                    <div className={classNames(classes.delete,value?.length > 0 && classes.focused)}>
                                        <IconButton onClick={handleRemove} size="large">
                                            <ClearIcon />
                                        </IconButton>
                                    </div>
                                )}
                                <input ref={inputRef} style={style} className={classNames(classes.input,remove && value?.length > 0 ? classes.removeInput : '')} placeholder="Search" value={value} onChange={onchange} />
                            </div>
                        </form>
                    </Popover>
                </div>
            )}
            
        </>
    );
}

Search.defaultProps={
    autofocus:false,
    remove:false,
    autosize:false
}

export default withStyles(Search,stylesMy);