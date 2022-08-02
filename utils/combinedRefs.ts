import React from 'react'

type Writeable<T> = {
    -readonly [P in keyof T]: T[P]
}

export default function useCombinedRefs<D>(...refs: (React.LegacyRef<D>|React.MutableRefObject<D>|React.ForwardedRef<D>)[]) {
    const targetRef = React.useRef<D>(null);

    React.useEffect(()=>{
        refs.forEach((ref)=>{
            if(!ref) return;

            if(typeof ref === 'function') {
                ref(targetRef.current)
            } else if(typeof ref ==='string') {

            } else {
                (ref as Writeable<React.RefObject<D>>).current = targetRef.current;
            }
        })
    },[refs])

    return targetRef;
}