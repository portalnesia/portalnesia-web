import { useEffect, useRef } from 'react'
// @ts-ignore
import NProgress from 'nprogress'
import Router from 'next/router'
import 'nprogress/nprogress.css'

NProgress.configure({ speed: 500, showSpinner: false, minimum: 0.2, trickleSpeed: 100 });

export default function Loader() {
    let popShallow = useRef(false),
        backShallow = useRef(false),
        isBack = useRef(false),
        scrollPositions = useRef<{ [url: string]: number }>({});

    useEffect(() => {
        const startLoading = () => {
            NProgress.start()
        }

        const routeChangeStart = (url: string, { shallow }: { shallow: boolean }) => {
            if (shallow || popShallow.current) {
                backShallow.current = !popShallow.current;
            } else {
                startLoading()
                backShallow.current = false;
            }
            popShallow.current = false;
            if (!/^\/support/.test(Router.asPath)) scrollPositions.current[Router.asPath] = window.scrollY;
        }

        const stopLoading = () => {
            //setOpen(false)
            NProgress.done()
        }

        const completeLoading = (url: string) => {
            stopLoading();
            if (isBack.current && typeof scrollPositions.current?.[url] === "number") {
                const scroll = scrollPositions.current?.[url];
                setTimeout(() => {
                    window.scroll({
                        top: scroll,
                        behavior: "auto",
                    })
                }, 700);
            }
            isBack.current = false
        }

        Router.events.on('routeChangeStart', routeChangeStart);
        Router.events.on('routeChangeComplete', completeLoading);
        Router.events.on('routeChangeError', stopLoading);

        Router.beforePopState(({ url, as, options }) => {
            isBack.current = true;
            if (backShallow.current && !options.shallow) {
                popShallow.current = true;
                Router.replace(url, as, { shallow: true })
                return false
            }
            popShallow.current = false;
            return true;
        })

        return () => {
            Router.events.off('routeChangeStart', routeChangeStart);
            Router.events.off('routeChangeComplete', completeLoading);
            Router.events.off('routeChangeError', stopLoading);
        }
    }, []);

    return null;
}