import React from 'react'
import {generateRandom} from '@portalnesia/utils'
import {connect} from 'react-redux';
import {useRouter} from 'next/router';

const AAds=({ads,id})=>{
    return <script src={ads} id={id}></script>
    //return <div id={id} dangerouslySetInnerHTML={{__html:ads}}></div>
}

/*
const [idd,setId]=React.useState("");

    React.useEffect(()=>{
        const elem=document.getElementById(idd);
        const cont=document.createElement('div');
        if(elem) {
            
            const scr=document.createElement('script');
            scr.src=config
            scr.id=`${idd}-1`
            const center=document.createElement('center');
            center.appendChild(scr)
            cont.appendChild(center)
            elem.appendChild(cont)
        }

        return ()=>{
            if(elem) elem.removeChild(cont)
        }
    },[router.query,idd])

    React.useEffect(()=>{
        const iid=`ads-${generateRandom()}`
        setId(iid);

        return ()=>{
            const elem=document.getElementById(iid);
            if(elem) {
                let child=elem.lastElementChild;
                while(child){
                    elem.removeChild(child)
                    child=elem.lastElementChild;
                }
            }
        }
    },[])
*/

export const AdsRect=connect(state=>({config:state?.config?.ad300}))(({config})=>{
    //const router=useRouter();
    const idd=`ads-${generateRandom()}`;

    React.useEffect(()=>{
        const elem=document.getElementById(idd);
        const cont=document.createElement('div');

        if(elem) {
            const scr=document.createElement('script');
            scr.src=config
            scr.id=`${idd}-1`
            
            scr.type='text/javascript';
            scr.setAttribute('data-cfasync','false');
            const center=document.createElement('center');
            center.appendChild(scr)
            cont.appendChild(center)
            elem.appendChild(cont)
        }

        return ()=>{
            if(elem) elem.removeChild(cont)
        }
    },[])

    return(
        <div id={idd} style={{margin:'20px auto'}}></div>
    )
})

export const AdsBanner1=connect(state=>({config:state?.config?.ad468}))(({config})=>{
    //const router=useRouter();
    const idd=`ads-${generateRandom()}`;

    React.useEffect(()=>{
        const elem=document.getElementById(idd);
        const cont=document.createElement('div');

        if(elem) {
            const scr=document.createElement('script');
            scr.src=config
            scr.id=`${idd}-1`
            scr.type='text/javascript';
            
            scr.setAttribute('data-cfasync','false');
            const center=document.createElement('center');
            center.appendChild(scr)
            cont.appendChild(center)
            elem.appendChild(cont)
            setTimeout(()=>scr.remove(),2000,[])
        }

        return ()=>{
            if(elem) elem.removeChild(cont)
        }
    },[])

    return(
        <div id={idd} style={{margin:'20px auto'}}></div>
    )
})

export const AdsBanner2=connect(state=>({config:state?.config?.ad728}))(({config})=>{
    //const router=useRouter();
    const idd=`ads-${generateRandom()}`;

    React.useEffect(()=>{
        const elem=document.getElementById(idd);
        const cont=document.createElement('div');

        if(elem) {
            const scr=document.createElement('script');
            scr.src=config
            scr.id=`${idd}-1`
            
            scr.type='text/javascript';
            scr.setAttribute('data-cfasync','false');
            const center=document.createElement('center');
            center.appendChild(scr)
            cont.appendChild(center)
            elem.appendChild(cont)
        }

        return ()=>{
            if(elem) elem.removeChild(cont)
        }
    },[])
    
    return(
        <div id={idd} style={{margin:'20px auto'}}></div>
    )
})

export const AdsBanner3=connect(state=>({config:state?.config?.adbutton}))(({config})=>{
    //const router=useRouter();
    const idd=`ads-${generateRandom()}`;

    React.useEffect(()=>{
        const elem=document.getElementById(idd);
        const cont=document.createElement('div');

        if(elem) {
            const scr=document.createElement('script');
            scr.src=config
            scr.id=`${idd}-1`
            
            scr.type='text/javascript';
            scr.setAttribute('data-cfasync','false');
            const center=document.createElement('center');
            center.appendChild(scr)
            cont.appendChild(center)
            elem.appendChild(cont)
        }

        return ()=>{
            if(elem) elem.removeChild(cont)
        }
    },[])
    
    return(
        <div id={idd} style={{margin:'20px auto'}}></div>
    )
})