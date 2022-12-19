import {useEffect, useState} from 'react'


export default function useBottomPage(ref?: HTMLDivElement,offsetBottom=100) {
    const [isBottom,setIsBottom] = useState(false);

    useEffect(()=>{
        
        const element = ref ? ref : document.documentElement;
        const footer = document.getElementById('footer');
        function onScroll() {
            const scrollHeight = element.scrollHeight;
            const elementHeight = element.offsetHeight || element.clientHeight
            const scrollTop = element.scrollTop;
            
            if((scrollTop + elementHeight) > (scrollHeight - offsetBottom - (footer?.offsetHeight||0))) {
                setIsBottom(true);
            } else {
                setIsBottom(false);
            }
        }

        if(ref) ref.addEventListener('scroll',onScroll);
        else window.addEventListener('scroll',onScroll);

        return ()=>{
            if(ref) ref.removeEventListener('scroll',onScroll);
            else window.removeEventListener('scroll',onScroll);
        }
    },[ref,offsetBottom])

    return isBottom
}