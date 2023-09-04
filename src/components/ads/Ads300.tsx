import Stack from "@mui/material/Stack";
import { generateRandom } from "@portalnesia/utils";
import React from "react"


export default function Ads300({ deps = [] }: { deps?: any[] }) {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const html = ref.current;
        let script: HTMLScriptElement | undefined, conf: HTMLScriptElement | undefined;

        if (process.env.NODE_ENV === "production") {
            const atOptions = {
                'key': 'f4cac93b180940e9f635a61a81d1e552',
                'format': 'iframe',
                'height': 250,
                'width': 300,
                'params': {}
            };
            script = document.createElement('script');
            conf = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://www.profitablecreativeformat.com/f4cac93b180940e9f635a61a81d1e552/invoke.js`;
            script.setAttribute("data-cfasync", "false");
            script.async = true;
            conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;
            html?.append(conf, script);
        }

        return () => {
            if (html) {
                const iframes = html.querySelectorAll("iframe");
                iframes.forEach(iframe => {
                    html?.removeChild(iframe);
                })
                if (script) html.removeChild(script);
                if (conf) html.removeChild(conf);
            }
        }
    }, [ref, ...deps]);

    return (
        <Stack ref={ref} />
    )
}