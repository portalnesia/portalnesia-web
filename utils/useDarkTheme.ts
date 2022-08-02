import React from 'react'
import Cookies from 'js-cookie'
import useMediaQuery from '@mui/material/useMediaQuery';
import {useDispatch,useSelector} from 'react-redux'
import {Dispatch} from 'redux'
import {State} from 'portal/types'

export const useDarkTheme=()=>{
    const {theme}=useSelector<State,Pick<State,'theme'>>(state=>({theme:state.theme}))
    const dispatch=useDispatch()
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    //const [prefersDarkMode,setPrefersDarkMode]=React.useState(false)
    const isDark=prefersDarkMode && theme==='auto'||theme==='dark';

    const setTheme=(value: State['theme'],force?: boolean)=>{
        const winDark = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersDark = prefersDarkMode || winDark;
        const newVal:State['redux_theme'] = (prefersDark && value=='auto')||value=='dark' ? 'dark' : 'light';
        const kuki:State['theme'] = ['light','dark','auto'].indexOf(value) !== -1 ? value : 'auto';
        if(force!==true) Cookies.set('theme',kuki,{expires:(30*12),...(process.env.NODE_ENV === 'production' ? {domain:'.portalnesia.com'} : {domain:'localhost'})})
        const lightStyle = document.querySelector('link.higtlightjs-light');
        const darkStyle = document.querySelector('link.higtlightjs-dark');
        if(newVal === 'light') {
            darkStyle?.setAttribute('disabled','disabled');
            lightStyle?.removeAttribute('disabled');
        } else {
            lightStyle?.setAttribute('disabled','disabled');
            darkStyle?.removeAttribute('disabled');
        }
        dispatch(sendTheme(kuki,newVal));
    }
    
    const sendTheme=(val1:State['theme'],val2:State['redux_theme'])=>{
        return function (dispatch: Dispatch){
            dispatch({type:"CHANGE_THEME",payload:val1})
            dispatch({type:"REDUX_THEME",payload:val2})
        }
    }

    return {theme,isDark,setTheme,prefersDarkMode}
}