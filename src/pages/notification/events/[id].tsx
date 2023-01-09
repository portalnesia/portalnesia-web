import React from "react";
import DefaultLayout from "@layout/default";
import wrapper from "@redux/store";
import { createToken, portalUrl, staticUrl, verifyToken } from "@utils/main";
import { IPages } from "@type/general";
import Pages from "@comp/Pages";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Calendar from "@model/calendar";
import Image from "@comp/Image";
import Divider from "@mui/material/Divider";

type IData = {
    text: string
    full_text?: string
    id: number
}

export const getServerSideProps = wrapper<IData>(async({params,redirect,query,session})=>{
    const event_id = params?.id;
    const tokenQuery = query?.token;
    if(typeof tokenQuery !== 'string') return redirect();
    if(typeof event_id !== 'string') return redirect();
    
    const token = verifyToken<{userid?:string|number,event_id?: string|number}>(tokenQuery,[1,'year']);
    if(typeof token?.userid !== 'undefined') {
        if(token.userid != session?.user?.id) return redirect();
    }
    if(token?.event_id != event_id) return redirect();

    const event: Calendar|null = await Calendar.findOne({
        where:{
            id:event_id
        }
    })
    if(!event) return redirect();

    return {
        props:{
            data:{
                id: event.id,
                text: event.text||"",
                full_text: event.full_text||undefined
            },
            meta:{
                title: event.text||"",
                desc: event.full_text ? event.full_text : (event.text||undefined),
                image: event.photo ? staticUrl(`calendar_cover/${event.id}`) : staticUrl(`img?image=notfound.png&export=twibbon`)
            }
        }
    }
})

export default function NotificationEvent({data,meta}: IPages<IData>) {

    return (
        <Pages title={meta?.title} desc={meta?.desc} image={meta?.image} canonical={`/notification/events/${data?.id}`} noIndex>
            <DefaultLayout maxWidth='sm'>
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' textAlign='center'>
                    <Image width={300} height={300} fancybox src={`${meta?.image}`} alt={meta?.title} className='image-container' />

                    <Box width='100%' my={4}><Divider /></Box>

                    <Box sx={{mb:2}}>
                        {data.full_text && data?.full_text?.length > 0 ? data?.text?.split("\n").map((dt,i)=>{
                            return <Typography sx={{fontSize:24}} key={`title-${i}`} component='h2' gutterBottom={i+1==data?.text?.split("\n")?.length}><strong>{dt}</strong></Typography>
                        }) : null}
                    </Box>
                    <Box>
                        {!data.full_text || data?.full_text?.length === 0 ? data?.text?.split("\n").map((dt,i)=>{
                            return <Typography sx={{fontSize:24}} key={`title-${i}`} component='h2' gutterBottom={i+1==data?.text?.split("\n")?.length}><strong>{dt}</strong></Typography>
                        }) : data.full_text.split("\n").map((dt,i)=>{
                            return <Typography component='p' key={i}>{dt}</Typography>
                        })}
                    </Box>
                </Box>
            </DefaultLayout>
        </Pages>
    )
}