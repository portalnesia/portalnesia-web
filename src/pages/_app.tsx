import type { AppProps } from 'next/app'
import {Provider as ReduxWrapper} from 'react-redux';
import {AppProvider,GlobalStyles} from '@design/themes'
import { wrapperRoot } from '@redux/store';
import { SnackbarProvider } from 'notistack';
import Loader from '../components/Loader';
import createEmotionCache from '@utils/emotion-cache';
import { CacheProvider, EmotionCache } from "@emotion/react";

const clientSideEmotionCache = createEmotionCache();

function App({Component,emotionCache = clientSideEmotionCache,...rest}: AppProps & {emotionCache?: EmotionCache}) {
  const {store,props}  =wrapperRoot.useWrappedStore(rest);

  return (
    <CacheProvider value={emotionCache}>
      <ReduxWrapper store={store}>
        <AppProvider>
          <GlobalStyles />
          <SnackbarProvider anchorOrigin={{horizontal:'right',vertical:'bottom'}} maxSnack={4}>
            <Component {...props.pageProps} />
            <Loader />
          </SnackbarProvider>
        </AppProvider>
      </ReduxWrapper>
    </CacheProvider>
  )
}
export default App;