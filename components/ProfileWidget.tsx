import {memo} from 'react'
import Image from './Image'
import {Paper as Paperr} from '@mui/material'
import {styled} from '@mui/material/styles'
import Avatar from 'portal/components/Avatar'
import {ImageProps} from 'portal/components/Image'

const Paper = styled(Paperr,{shouldForwardProp:prop=>prop!=="linkColor"})<{linkColor?:boolean}>(({theme,linkColor})=>({
    position:'relative',
    marginTop: '4.125rem !important',
    zIndex: 1,
    padding:`${theme.spacing(2)} !important`,
    backgroundColor: `${theme.palette.background.paper} !important`,
    backgroundImage:'unset !important',
    //boxShadow:'0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
    marginBottom: `${theme.spacing(3)} !important`,
    boxShadow:'unset!important',
    ...(linkColor ? {
        '& a':{
            color:`${theme.custom.link} !important`
        }
    } : {})
}))

const DivAvatar = styled('div')(()=>({
    margin:'auto',
    position:'relative',
    top:'-4.125rem',
    borderRadius: '50%',
    overflow: 'hidden',
    width: '6.25rem',
    height:'6.25rem',
    //boxShadow: '0 2px 0 rgba(90, 97, 105, .11), 0 4px 8px rgba(90, 97, 105, .12), 0 10px 10px rgba(90, 97, 105, .06), 0 7px 70px rgba(90, 97, 105, .1)',
    '& img':{
        width:'100%'
    }
}))

const DivChildren = styled('div')(()=>({
    marginTop:'1rem'
}))

const DivTitle = styled('div')(()=>({
    marginTop:'-3rem',
    position:'relative',
    '& h2':{
        fontSize: 28,
    }
}))

export interface ProfileWidgetProps {
    src?: string,
    dataSrc?: string,
    title?: React.ReactNode,
    children?: React.ReactNode,
    linkColor?: boolean,
    imageProps?: ImageProps,
    name?: string
}

const Widget=(props: ProfileWidgetProps)=>{
    const {src,dataSrc,title,children,linkColor,imageProps,name} = props
    return(
        <Paper linkColor={linkColor}>
            <DivAvatar>
                <Avatar
                    alt="Profile Picture"
                    sx={{width:100,height:100}}
                    {...(src && dataSrc || name ? {
                        children: src && dataSrc ? <Image width={100} height={100} webp fancybox dataFancybox='profile' dataSrc={dataSrc} src={src} {...imageProps} /> : name
                    } : {})} 
                />
            </DivAvatar>

            {title && (
                <DivTitle>
                    {title}
                </DivTitle>
            )}
            {children && (
                <DivChildren>
                    {children}
                </DivChildren>
            )}
        </Paper>
    )
}
const ProfileWidget = memo(Widget);
export default ProfileWidget