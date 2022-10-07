import dynamic from 'next/dynamic'
import {CircularProgress} from '@mui/material'
import loadingImage from 'portal/components/header/loading-image-base64'
const Header = dynamic(()=>import('portal/components/Header'),{
    ssr:false,
    loading:(
        <div style={{position:'fixed',top:0,left:0,height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img style={{position:'fixed',top:'35%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
            <CircularProgress size={60} sx={{color:'white',position:'fixed',top:'60%',left:'calc(50% - 30px)'}} />
        </div>
    )
})

export default Header