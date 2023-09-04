import './notif'
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
declare let self: ServiceWorkerGlobalScope

const app = require("firebase/app");

const firebaseApp = app.initializeApp({
    "apiKey": "AIzaSyAQ7u4UWLyPZ9dgL9cwtBbXs4GX3th00Bg",
    "authDomain": "portalnesia.firebaseapp.com",
    "databaseURL": "https://portalnesia.firebaseio.com",
    "projectId": "portalnesia",
    "storageBucket": "portalnesia.appspot.com",
    "messagingSenderId": "152584550462",
    "appId": "1:152584550462:web:9e87f640a14eb1130d796f",
    "measurementId": "G-V1ZMDC79KP"
})
const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {
    console.log('Received background message ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || "";
    const notificationOptions: NotificationOptions = {
        body: payload.notification?.body || payload.data?.content || "",
        icon: payload.notification?.icon || payload.data?.icon || "",
        image: payload.notification?.image || payload.data?.image,
        requireInteraction: true,
        data: {
            click_action: payload.fcmOptions?.link,
            ...payload.data
        }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
})