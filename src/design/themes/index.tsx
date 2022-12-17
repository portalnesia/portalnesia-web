import React from 'react'
import { CssBaseline,ThemeOptions,StyledEngineProvider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {enUS,idID} from '@mui/material/locale'
import palette from './palette';
import darkPalette from './palette-dark'
import typography from './typography';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';
import { useSelector } from '@redux/store';
import { State } from '@type/redux';

export interface AppProviderProps {
    children: React.ReactNode
    locale?: 'id'|'en'
}
export function AppProvider({ children,locale }: AppProviderProps) {
    const cookies_theme = useSelector<State['redux_theme']>(s=>s.redux_theme);
    const themeOptions = React.useMemo<ThemeOptions>(
        () => ({
            palette: cookies_theme==='dark' ? darkPalette : palette,
            shape: { borderRadius: 8 },
            typography,
            shadows,
            customShadows,
            zIndex:{
                snackbar:2000
            }
        }),
        [cookies_theme]
    );

    const themes = React.useMemo(()=>createTheme(themeOptions,(locale==='id' ? idID : enUS)),[themeOptions,locale]);
    themes.components = React.useMemo(()=>componentsOverride(themes),[themes]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </StyledEngineProvider>
    )
}

export {default as GlobalStyles} from './GlobalStyles'