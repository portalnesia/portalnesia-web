import React from 'react'
import Av from '@mui/material/Avatar'
import type {AvatarProps as AvaProps} from '@mui/material'
import {styled} from '@mui/material/styles' 
import {acronym} from '@portalnesia/utils'
import { deepOrange, deepPurple,green,pink,red,blue,indigo,brown,grey,cyan,teal,blueGrey } from '@mui/material/colors';
import clx from 'classnames'

const classes = {
    orange: 'avaOrange',
    purple: 'avaPurple',
    pink: 'avaPink',
    green: 'avaGreen',
    red: 'avaRed',
    blue: 'avaBlue',
    indigo: 'avaIndigo',
    brown: 'avaBrown',
    grey: 'avaGrey',
    cyan: 'avaCyan',
    teal: 'avaTeal',
    blueGrey: 'avaBlueGray'
}

const Ava = styled(Av,{shouldForwardProp:prop=>prop!=="withTop"})<{withtop?:boolean}>(({children,theme})=>({
    ...(typeof children !== 'string' ? {
        '&.MuiAvatar-root':{
            paddingTop:2
        }
    } : {}),
    [`&.${classes.orange}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${deepOrange[200]},${deepOrange[500]})`,
    },
    [`&.${classes.purple}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${deepPurple[200]},${deepPurple[500]})`,
    },
    [`&.${classes.pink}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${pink[200]},${pink[500]})`,
    },
    [`&.${classes.green}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${green[200]},${green[500]})`,
    },
    [`&.${classes.red}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${red[200]},${red[500]})`,
    },
    [`&.${classes.blue}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${blue[200]},${blue[500]})`,
    },
    [`&.${classes.indigo}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${indigo[200]},${indigo[500]})`,
    },
    [`&.${classes.brown}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${brown[200]},${brown[500]})`,
    },
    [`&.${classes.grey}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${grey[200]},${grey[500]})`,
    },
    [`&.${classes.cyan}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${cyan[200]},${cyan[500]})`,
    },
    [`&.${classes.teal}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${teal[200]},${teal[500]})`,
    },
    [`&.${classes.blueGrey}`]: {
        color: '#fff',
        background: `linear-gradient(33deg,${blueGrey[200]},${blueGrey[500]})`,
    },
}))

const randomArr=['orange','purple','pink','green','red','blue','indigo','brown','grey','cyan','teal','blueGrey'];

export interface AvatarProps extends AvaProps {
    withTop?:boolean
}

/**
 * 
 * Custom Avatar Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 */
export default function Avatar(props: AvatarProps){
    const {children,className,style,withTop=undefined,...other}=props
    const select: keyof typeof classes = React.useMemo(()=>{
        const i = Math.floor(Math.random() * randomArr.length);
        return randomArr[i] as keyof typeof classes
    },[])

    const child=React.useMemo(()=>{
        if(typeof children==='string') return acronym(children)
        else return children
    },[children])

    return (
        <Ava withtop={withTop} className={clx(className,typeof children==='string' ? classes[select] : '' )} {...(React.isValidElement(children) ? {style:{...style}} : {style:{...style,paddingTop:0}})} {...other}>{child}</Ava>
    )
}