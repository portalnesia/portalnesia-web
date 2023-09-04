importScripts('https://arc.io/arc-sw-core.js')

declare let self: ServiceWorkerGlobalScope

self.addEventListener('notificationclick', event => {
    console.log('Clicked background message ', event.notification);
    const url = event.notification?.data?.FCM_MSG?.notification?.click_action || event.notification.data?.click_action;
    event.notification.close()

    event.waitUntil(
        self.clients.openWindow(url)
    )
})

export { }