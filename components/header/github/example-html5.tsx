import {useRef,useEffect} from 'react'
import Plyr,{PlyrProps} from './plyr'

export default function App(){
    const plyrRef=useRef<Plyr>(null)

    useEffect(()=>{
        const instance=plyrRef.current?.getInstance()
    })

    return (
        <Plyr
            ref={plyrRef}
            provider="youtube"
            source="YOUR_VIDEO_URL"
        />
    )
}