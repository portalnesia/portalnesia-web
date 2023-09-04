import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from '@redux/store'
import firebase, { ReCaptchaV3Provider, initializeAppCheck, onTokenChanged, getAppCheckToken } from '@utils/firebase'
import { useRouter } from 'next/router'
import config from '@src/config'
import useDarkTheme from '@design/hooks/useDarkTheme'
import LocalStorage from '@utils/local-storage'
import { uuid } from '@portalnesia/utils'
import { LocalConfig } from '@type/general'

export default function useInit() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [adBlock, setAdBlock] = useState(false);
    const { checkTheme, setHighlightJs } = useDarkTheme();
    const isReady = router.isReady

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG;
        }
        const provider = new ReCaptchaV3Provider(config.recaptcha);
        const appCheck = initializeAppCheck(firebase, { provider, isTokenAutoRefreshEnabled: true });
        const unsubcribe = onTokenChanged(appCheck, (token) => {
            dispatch({ type: "CUSTOM", payload: { appToken: token.token } });
        });

        const localConfig = LocalStorage.get<LocalConfig>("config");
        if (!localConfig || !localConfig.sess) {
            const session = localConfig.sess || uuid();
            LocalStorage.set("config", { ...localConfig, sess: session });
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
                const token = await getAppCheckToken(appCheck);
                dispatch({ type: "CUSTOM", payload: { appToken: token.token, theme: theme.theme, redux_theme: theme.redux_theme } });
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
    }, [checkTheme])

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