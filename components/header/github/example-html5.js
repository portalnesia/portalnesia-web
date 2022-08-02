import {useRef,useEffect} from 'react'
import Plyr from './plyr'

export default function App(){
    const plyrRef=useRef(null)

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