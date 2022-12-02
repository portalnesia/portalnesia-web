import React from "react";
import { useHotKeys } from "@hooks/hotkeys";
import Portal from "@mui/material/Portal";
import Dialog from "@design/components/Dialog";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

type Keymap = ReturnType<typeof useHotKeys>['atasKeyMap'];

export interface HotKeysProps {
    atasKeymap: Keymap
    bawahKeymap: Keymap
    open:boolean
    onClose?():void
}

const Root = styled('div')(()=>({
    WebkitBoxPack:'justify',
    justifyContent:'space-between',
    WebkitBoxDirection:'normal',
    WebkitBoxOrient:'horizontal',
    flexDirection:'row',
    display:'flex',
    flexBasis:'auto',
    position:'relative',
    marginTop:10,
    marginBottom:10,
}));

const KeyTitle = styled('div')(()=>({display:'inlune'}))

const KeyCode = styled('div')(()=>({
    display:'flex',
    WebkitBoxAlign:'center',
    alignItems:'center',
    WebkitBoxDirection:'normal',
    WebkitBoxOrient:'horizontal',
    flexDirection:'row',
}))

const KeyLabel = styled('div')(({theme})=>({
    minWidth:'1.7rem',
    textAlign:'center',
    padding:'1px 5px',
    borderRadius:5,
    border:`1px solid ${theme.palette.divider}`,
    backgroundColor:theme.palette.action.focus
}))

const KeyPlus = styled('div')(()=>({
    paddingLeft:'.25rem',
    paddingRight:'.25rem'
}))

export default function HotKeys({atasKeymap,bawahKeymap,open,onClose}: HotKeysProps) {
    
    return (
        <Portal>
            <Dialog open={open} title="Navigation" handleClose={onClose}>
                {Object.values(atasKeymap).map(data=>(
                    <Root key={`keyboard-atas-${data.name}`}>
                        <KeyTitle key='0'><Typography component='span'>{data.name}</Typography></KeyTitle>
                        <KeyCode key='1'>
                            {data.button.map((btn,i)=>(
                                <React.Fragment key={`label-${data.name}-${btn}`}>
                                    <KeyLabel><Typography component='span'>{btn}</Typography></KeyLabel>
                                    {(i+1 < data.button.length) ? (
                                        <KeyPlus><Typography component='span'>+</Typography></KeyPlus>
                                    ) : null}
                                </React.Fragment>
                            ))}
                        </KeyCode>
                    </Root>
                ))}
                
                <Divider sx={{my:2}} />

                {Object.values(bawahKeymap).map(data=>(
                    <Root key={`keyboard-bawah-${data.name}`}>
                        <KeyTitle key='0'><Typography component='span'>{data.name}</Typography></KeyTitle>
                        <KeyCode key='1'>
                            {data.button.map((btn,i)=>(
                                <React.Fragment key={`label-${data.name}-${btn}`}>
                                    <KeyLabel><Typography component='span'>{btn}</Typography></KeyLabel>
                                    {(i+1 < data.button.length) ? (
                                        <KeyPlus><Typography component='span'>+</Typography></KeyPlus>
                                    ) : null}
                                </React.Fragment>
                            ))}
                        </KeyCode>
                    </Root>
                ))}
            </Dialog>
        </Portal>
    )
}