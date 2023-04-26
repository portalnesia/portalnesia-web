import Script from 'next/script';
import config from '@src/config';
import Router, { useRouter } from 'next/router';
import React from 'react';
import { useSelector } from '@redux/store';


type PageViewOptions = {
    language: 'id' | 'en'
};

function pageView(pageViewOptions?: PageViewOptions): void {
    if (!window.gtag) {
        return;
    }
    window.gtag('event', 'page_view', pageViewOptions);
}

export default function GoogleAnalytics() {
    const [firstIsAdmin, setFirstIsAdmin] = React.useState<boolean | null>(null);
    const user = useSelector(s => s.user);

    React.useEffect(() => {
        const sendPageView = (url: string) => {
            if (process.env.NODE_ENV === "production" && !url.includes("admin")) {
                pageView()
            }
        }
        Router.events.on('routeChangeComplete', sendPageView);
        if (user !== undefined) {
            setTimeout(() => setFirstIsAdmin(Router.asPath.includes('/admin')), 300);
        }
        return () => {
            Router.events.off('routeChangeComplete', sendPageView);
        }
    }, [user]);

    if (firstIsAdmin === null || process.env.NODE_ENV !== 'production') return null;
    return (
        <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${config.firebase.measurementId}`} strategy={"afterInteractive"} />
            <Script id="nextjs-google-analytics">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${config.firebase.measurementId}', {
                        page_path: window.location.pathname,
                        ${firstIsAdmin ? 'send_page_view: false,' : ''}
                        ${user && user !== null ? `user_id: '${user.id}',` : ''}
                        ${process.env.NEXT_PUBLIC_PN_ENV !== "production" ? `debug_mode: true,` : ""}
                    });
                `}
            </Script>
        </>
    )
}