import Image, { ImageProps } from '@comp/Image'
import Paper, { PaperProps } from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import { ReactNode } from 'react'
import Avatar from './Avatar'
import { Div } from './Dom'

const DivAvatar = styled('div')(()=>({
    margin:'auto',
    position:'relative',
    top:'-50px',
    borderRadius: '50%',
    overflow: 'hidden',
    width: '6.25rem',
    height:'6.25rem',
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
}))

export interface ProfileWidgetProps {
    src?: string|null
    title?: ReactNode
    name?: string
    children?: ReactNode,
    image?: ImageProps
    paperProps?: PaperProps
}

export default function ProfileWidget({name,children,title,src,image,paperProps}: ProfileWidgetProps) {
    
    return (
        <Paper {...paperProps} sx={{mt:'50px',...paperProps?.sx}}>
            <DivAvatar>
                <Avatar alt="Profile Picture" sx={{width:100,height:100}}>
                    {src ? (
                        <Image src={`${src}&size=100&watermark=no`} dataSrc={`${src}&watermark=no`} fancybox webp dataFancybox='Quiz profile picture' alt="Profile picture" {...image} />
                    ) : name}
                </Avatar>
            </DivAvatar>
            
            {(title || children) && (
                <Div sx={{p:2}}>
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
                </Div>
            )}
        </Paper>
    )
}