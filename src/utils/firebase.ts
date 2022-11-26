import config from '@src/config';
import { getAnalytics as getAnalyticsOri,logEvent,setUserId } from 'firebase/analytics';
import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth'
// import {getMessaging as getMessagingOri} from 'firebase/messaging'

export {logEvent,setUserId} from 'firebase/analytics'
export {getToken,isSupported,onMessage} from 'firebase/messaging'
export {getToken as getAppCheckToken,ReCaptchaV3Provider,initializeAppCheck,onTokenChanged} from 'firebase/app-check'
export {signInWithPhoneNumber,RecaptchaVerifier} from 'firebase/auth'
export type {ConfirmationResult} from 'firebase/auth'

const firebaseApp = initializeApp(config.firebase)

const getAnalytics = ()=>getAnalyticsOri(firebaseApp);
const getFirebaseAuth = ()=>getAuth(firebaseApp);

export {getAnalytics,getFirebaseAuth}
export default firebaseApp;