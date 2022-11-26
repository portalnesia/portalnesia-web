import {useCallback} from 'react'
import {useSelector,useDispatch} from '@redux/store'
import type {State} from '@type/redux'
import {Dispatch} from 'redux'
import useMediaQuery from '@mui/material/useMediaQuery';
import { getCookie, setCookie } from 'cookies-next';
import { getDayJs } from '@utils/main';
import { domainCookie } from '@src/config';

export default function useDarkTheme() {
    const theme = useSelector<State['theme']>(s=>s.theme);
    const dispatch = useDispatch();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const isDark=prefersDarkMode && theme==='auto'||theme==='dark';

    const sendTheme=useCallback((val1:State['theme'],val2:State['redux_theme'])=>(dispatch: Dispatch)=>{
        dispatch({type:"CHANGE_THEME",payload:val1})
        dispatch({type:"REDUX_THEME",payload:val2})
    },[])

    const setTheme = useCallback((value: State['theme'],force?:boolean)=>{
      const winDark = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
      const prefersDark = prefersDarkMode || winDark;
      const newVal:State['redux_theme'] = (prefersDark && value=='auto')||value=='dark' ? 'dark' : 'light';
      const kuki:State['theme'] = ['light','dark','auto'].indexOf(value) !== -1 ? value : 'auto';
      if(force!==true) setCookie('theme',kuki,{expires:getDayJs().add(1,"year").toDate(),domain:domainCookie});
      /*const lightStyle = document.querySelector('link.higtlightjs-light');
      const darkStyle = document.querySelector('link.higtlightjs-dark');

      if(newVal === 'light') {
          darkStyle?.setAttribute('disabled','disabled');
          lightStyle?.removeAttribute('disabled');
      } else {
          lightStyle?.setAttribute('disabled','disabled');
          darkStyle?.removeAttribute('disabled');
      }*/
      // @ts-ignore
      dispatch(sendTheme(kuki,newVal));
  },[prefersDarkMode,dispatch,sendTheme])

    const checkTheme = useCallback(()=>{
      const theme = getCookie('theme') as State['theme']|undefined;
      let result = {
        theme:"auto" as State["theme"],
        redux_theme:"light" as State['redux_theme']
      }
      if(!theme || theme === 'auto') {
        const winDark = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersDark = prefersDarkMode || winDark;
        const redux_theme = prefersDark ? 'dark' : 'light'
        result.redux_theme = redux_theme;
        if(!theme) result.theme = redux_theme
        else result.theme = theme;
      } else {
        result = {
            theme,
            redux_theme:theme
        }
      }
      return result;
    },[prefersDarkMode])

    return {theme,isDark,setTheme,prefersDarkMode,checkTheme}
}