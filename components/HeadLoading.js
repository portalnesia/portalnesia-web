import dynamic from 'next/dynamic'
import loadingImage from 'portal/components/header/loading-image-base64'
const Header = dynamic(()=>import('portal/components/Header'),{
    ssr:false,
    loading:(
        <div style={{position:'absolute',height:'100%',width:'100%',background:'#2f6f4e'}}>
            <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%, -50%)'}} onContextMenu={(e)=>e.preventDefault()} className={'no-drag'} alt='Portalnesia' src={loadingImage} />
        </div>
    )
})

export default Header