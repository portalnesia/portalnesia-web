import { Div } from "@design/components/Dom";
import React from "react";
import Ads300 from "./Ads300";

const nativeID = "04a10ebe270972c707f71b3131d5a85f";
export default function AdsNative({ deps = [] }: { deps?: any[] }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [notLoaded, setIsNotloaded] = React.useState(false);

    React.useEffect(() => {
        const html = ref.current;
        let script: HTMLScriptElement | undefined, div: HTMLDivElement | undefined, timeout: NodeJS.Timer;
        const divID = `container-${nativeID}`;

        function checkIsNotLoadedAgain() {
            const div = document.getElementById(divID);
            if (div) {
                if (!div.firstChild) {
                    console.log("Not loaded")
                    setIsNotloaded(true);
                }
            }
        }

        if (process.env.NODE_ENV === "production") {
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://www.highcpmrevenuegate.com/${nativeID}/invoke.js`;
            script.setAttribute("data-cfasync", "false");
            script.async = true;

            div = document.createElement("div");
            div.id = divID;

            html?.append(script, div);
            timeout = setTimeout(checkIsNotLoadedAgain, 3000);
        }

        return () => {
            if (script) html?.removeChild(script);
            if (div) html?.removeChild(div);
            clearTimeout(timeout);
            setIsNotloaded(false);
        }
    }, [ref, ...deps]);
    return (
        <>
            {notLoaded && <Ads300 deps={deps} />}
            <Div ref={ref} sx={{
                "& a::after": {
                    display: "none !important"
                }
            }} />
        </>

    )
}