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
            type="audio"
            source={{
                type: 'audio',
                title: 'Example title',
                sources: [
                  {
                    src: '/path/to/audio.mp3',
                    type: 'audio/mp3',
                  },
                  {
                    src: '/path/to/audio.ogg',
                    type: 'audio/ogg',
                  },
                ],
            }}
        />
    )
}