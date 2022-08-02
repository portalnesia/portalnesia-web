import React,{useState} from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import getTheme from './theme'

export const CustomThemeContext=React.createContext({
    currentTheme:'light',
    setTheme:null
});

const CustomProvider=({children})=>{

    const currentTheme = localStorage?.getItem('theme') || 'light';
    const [themeName,_setThemeName]=useState(currentTheme);
    const theme=getTheme[themeName];
    const setThemeName=(name)=>{
        localStorage?.setItem('theme',name);
        _setThemeName(name);
    }
    const contexValue={
        currentTheme:themeName,
        setTheme:setThemeName
    }
    return (
        <CustomThemeContext.Provider value={contextValue}>
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    {children}
                </ThemeProvider>
            </StyledEngineProvider>
        </CustomThemeContext.Provider>
    );
}

export default CustomProvider;