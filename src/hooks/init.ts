import { useState, useEffect } from 'react'
import { useDispatch } from '@redux/store'
import { useRouter } from 'next/router'
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
                dispatch({ type: "CUSTOM", payload: { ready: true, theme: theme.theme, redux_theme: theme.redux_theme } });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkTheme])

    return { adBlock }
}