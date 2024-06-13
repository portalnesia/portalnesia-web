import config from '@src/config';
import { getAnalytics as getAnalyticsOri, logEvent, setUserId } from 'firebase/analytics';
import { initializeApp } from 'firebase/app'
import { AppCheck, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth'
// import {getMessaging as getMessagingOri} from 'firebase/messaging'

export { logEvent, setUserId } from 'firebase/analytics'
export { getToken, isSupported, onMessage } from 'firebase/messaging'
export { getToken as getAppCheckToken, ReCaptchaV3Provider, initializeAppCheck, onTokenChanged } from 'firebase/app-check'
export { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'
export type { ConfirmationResult } from 'firebase/auth'

const firebaseApp = initializeApp(config.firebase)

const getAnalytics = () => getAnalyticsOri(firebaseApp);
const getFirebaseAuth = () => getAuth(firebaseApp);

let appCheck: AppCheck | undefined;
export function getAppCheck() {
    if (!appCheck) {
        if (process.env.NODE_ENV === 'development') {
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG;
        }
        const provider = new ReCaptchaV3Provider(config.recaptcha_appcheck);
        appCheck = initializeAppCheck(firebaseApp, { provider, isTokenAutoRefreshEnabled: true });
    }
    return appCheck;
}

export { getAnalytics, getFirebaseAuth }
export default firebaseApp;