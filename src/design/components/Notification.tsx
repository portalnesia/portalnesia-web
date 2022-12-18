import {ReactNode, forwardRef, useCallback, useState} from 'react'
import {SnackbarKey, useSnackbar} from 'notistack'
import { styled } from '@mui/material/styles';
import dynamic from 'next/dynamic'
import IconButton,{IconButtonProps} from '@mui/material/IconButton';
import { useSWRPagination } from '@design/hooks/swr';
import { PaginationResponse } from '@design/hooks/api';
import { INotifications } from '@model/message';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import { ExpandMore } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Button from '@comp/Button';
import Box from '@mui/material/Box';

const Close = dynamic(()=>import('@mui/icons-material/Close'),{ssr:false})

export type OptionSnack={
    content?:(key: string|number,message: string|React.ReactNode)=>React.ReactNode,
    action?:(key: string|number)=>React.ReactNode,
    autoHideDuration?: number|null
}
export type VariantOption= 'default' | 'error' | 'success' | 'warning' | 'info' | boolean

const CustomIconBtn = styled(IconButton,{shouldForwardProp:prop=>prop!=="variant"})<IconButtonProps & ({variant:VariantOption})>(({variant})=>({
    ...(typeof variant === 'boolean' ? {
        '& svg':{
            color:'#FFF'
        }
    } : {})
}))

export default function useNotification() {
    const {enqueueSnackbar,closeSnackbar}=useSnackbar();

    const setNotif=useCallback((msg: string|React.ReactNode,variant: VariantOption,option?: OptionSnack)=>{
        option=option||{};
        if(typeof option?.content === 'undefined') {
            option={
                ...option,
                action:(key)=>(
                    <CustomIconBtn
                        variant={variant}
                        onClick={()=>closeSnackbar(key)}
                        size="large">
                        <Close />
                    </CustomIconBtn>
                )
            }
        }
        const vari=typeof variant === 'string' ? variant : (variant===true ? 'error' : 'success');
        enqueueSnackbar(msg,{variant:vari,...option})
    },[enqueueSnackbar,closeSnackbar])
  
    return setNotif;
}

export function useNotificationSWR() {
    return useSWRPagination<PaginationResponse<INotifications,{total_unread: number}>>(`/v2/notification?per_page=15`,{
        revalidateOnMount:false
    });
}

type ContentMessageProps = {
    id: SnackbarKey
    title: string
    message: ReactNode
    onClick(): void
}
export const ContentMessage=forwardRef<HTMLDivElement,ContentMessageProps>(({id,title,message,onClick},ref)=>{
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(false);
  
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };
  
    const handleDismiss = () => {
        closeSnackbar(id);
    };
  
    return (
      <Card ref={ref} sx={{width:'100%',minWidth:{sm:344,md:500},bgcolor:'#2f6f4e'}}>
        <CardActions  className='flex-header' sx={{
            "& .MuiCardActions-root":{
                padding: '8px 8px 8px 16px',
            },
            display:'flex',
            alignItems:'center',
            justifyContent:'space-between'
        }}>
            <Typography sx={{fontWeight:'bold',color:'#fff'}}>{title}</Typography>
            <Box ml='auto'>
                <IconButton
                  aria-label="Show more"
                  onClick={handleExpandClick}
                  size="large"
                  sx={{
                    p:1,
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',transition:t=>t.transitions.create('transform',{duration:t.transitions.duration.shortest})
                  }}
                  >
                    <ExpandMore />
                </IconButton>
                <IconButton onClick={handleDismiss} size="large"
                    sx={{
                        p:1,
                    }}
                >
                    <Close />
                </IconButton>
            </Box>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Paper sx={{p:2,bgcolor:'#fafafa',borderTopLeftRadius:0,borderTopRightRadius:0}}>
                <Typography gutterBottom style={{wordBreak:'break-word',color:'#000'}}>{message}</Typography>
                <Button size='small' onClick={onClick}>Open</Button>
            </Paper>
        </Collapse>
      </Card>
    );
})
ContentMessage.displayName = "ContentMessage";