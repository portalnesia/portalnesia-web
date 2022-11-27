import type { AppProps } from 'next/app'
import {Provider as ReduxWrapper} from 'react-redux';
import {AppProvider,GlobalStyles} from '@design/themes'
import { createEmotionSsrAdvancedApproach } from "tss-react/next";
import { wrapperRoot } from '@redux/store';
import { SnackbarProvider } from 'notistack';
import Loader from '../components/Loader';

const {
    augmentDocumentWithEmotionCache,
    withAppEmotionCache
} = createEmotionSsrAdvancedApproach({ "key": "css",prepend:true});

export { augmentDocumentWithEmotionCache };

function App({Component,...rest}: AppProps) {
  const {store,props}  =wrapperRoot.useWrappedStore(rest);

  return (
    <ReduxWrapper store={store}>
      <AppProvider>
        <GlobalStyles />
        <SnackbarProvider anchorOrigin={{horizontal:'right',vertical:'bottom'}} maxSnack={4}>
          <Component {...props.pageProps} />
          <Loader />
        </SnackbarProvider>
      </AppProvider>
    </ReduxWrapper>
  )
}
export default withAppEmotionCache(App);