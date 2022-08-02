import {logEvent,setUserId,getAnalytics} from 'firebase/analytics'
import firebaseApp from './firebase'
//export const GA_TRACKING_ID = 'UA-168209161-1' // This is your GA Tracking ID

export function pageview(url: string) {
  const analytics = getAnalytics(firebaseApp);
  logEvent(analytics,"page_view",{
    page_title:document.title,
    page_path:url
  })
}

type EventArgs = {action: string,[key: string]:any}

export function event(args: EventArgs) {
  const {action,...other} = args;
  const analytics = getAnalytics(firebaseApp);
  logEvent(analytics,action,{...other});
}

export function setPortalUserId(userid: number|string) {
  const analytics = getAnalytics(firebaseApp);
  setUserId(analytics,`${userid}`);
}