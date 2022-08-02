import React from 'react'
//import App from 'next/app';
import '../styles/globals.css'
import {getTheme,getSecondTheme} from 'portal/theme/theme'
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {wrapperRoot} from '../redux/store';
import {connect} from 'react-redux';
import {SnackbarProvider} from 'notistack'
import Loader from 'portal/components/header/Loader'
import {CacheProvider} from '@emotion/react'
import createEmotionCache from 'portal/utils/createEmotionCache'

const clientSideCache = createEmotionCache();

const MyApp=({Component,currentTheme,pageProps,emotionCache = clientSideCache})=>{
    const theme = React.useMemo(()=>getTheme(currentTheme),[currentTheme]);
    const secondTheme = React.useMemo(()=>getSecondTheme(theme),[theme]);
    return (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={secondTheme}>
          <SnackbarProvider anchorOrigin={{horizontal:'right',vertical:'bottom'}} maxSnack={4}>
            <CssBaseline />
            <Component {...pageProps} />
            <Loader />
          </SnackbarProvider>
        </ThemeProvider>
      </CacheProvider>
    );
}

export default wrapperRoot.withRedux(connect(state=>({currentTheme:state.redux_theme}))(MyApp));