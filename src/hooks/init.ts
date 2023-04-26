import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from '@redux/store'
import { State } from '@type/redux'
import firebase, { ReCaptchaV3Provider, initializeAppCheck, onTokenChanged, getAppCheckToken } from '@utils/firebase'
import { useRouter } from 'next/router'
import { Unsubscribe } from 'firebase/app-check';
import config from '@src/config'
import { getCookie } from 'cookies-next'
import useDarkTheme from '@design/hooks/useDarkTheme'

/**
 * GET FIREBASE APP CHECK TOKEN
 */
async function getAppToken(callback: (token: string) => void) {
    if (process.env.NODE_ENV === 'development') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG;
    }
    const provider = new ReCaptchaV3Provider(config.recaptcha);
    const appCheck = initializeAppCheck(firebase, { provider, isTokenAutoRefreshEnabled: true });

    const tokenUnsubcribe = onTokenChanged(appCheck, (token) => {
        callback(token.token);
    })

    const token = await getAppCheckToken(appCheck);

    return {
        token: token.token,
        unsubcribe: tokenUnsubcribe
    };
}

export default function useInit() {
    const router = useRouter();
    const appToken = useSelector(s => s.appToken);
    const dispatch = useDispatch();
    const [adBlock, setAdBlock] = useState(false);
    const { checkTheme, setHighlightJs } = useDarkTheme();
    const isReady = router.isReady

    useEffect(() => {
        let unsubcribe: Unsubscribe | undefined;
        function onTokenIsChanged(token: string) {
            dispatch({ type: "CUSTOM", payload: { appToken: token } })
        }

        /**
         * Init Data
         * Get Firebase App Check
         * Init Portalnesia Token to Portalnesia Instance
         */
        async function init() {
            try {
                const theme = checkTheme();
                setHighlightJs(theme.redux_theme);
                let token: { token: string, unsubcribe: Unsubscribe } | undefined;
                if (!appToken) {
                    token = await getAppToken(onTokenIsChanged);
                    unsubcribe = token.unsubcribe;
                }
                dispatch({ type: "CUSTOM", payload: { theme: theme.theme, redux_theme: theme.redux_theme, ...token ? { appToken: token.token } : {} } });
            } catch (e) {
                console.error(e);
            }
        }

        if (process.env.NODE_ENV === "production") {
            setTimeout(() => {
                const ads = document.getElementById('wrapfabtest')
                if (ads) {
                    const height = ads.clientHeight || ads.offsetHeight;
                    if (height <= 0) setAdBlock(true)
                } else {
                    setAdBlock(true)
                }
            }, 500)
        }

        init();

        return () => {
            if (unsubcribe) unsubcribe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkTheme, appToken])

    useEffect(() => {
        if (isReady) {
            /*const locale = getCookie('NEXT_LOCALE');
            if(typeof locale === "string" && (router.locale||'en')!==(locale||'en')) {
              const {pathname,query,asPath} = router;
              router.replace({pathname,query},asPath,{locale:(locale||'en')})
            }*/
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [isReady])

    return { adBlock }
}