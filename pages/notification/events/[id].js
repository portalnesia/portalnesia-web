import React from 'react'
import Header from 'portal/components/Header'
import Image from 'portal/components/Image'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import db from 'portal/utils/db'
import {useRouter} from 'next/router'
import {Grid,Typography,Paper as Papers,Divider} from '@mui/material'
import {styled} from '@mui/material/styles'

export const getServerSideProps = wrapper(async({pn:data,req,res,params,query})=>{
    const crypto = (await import('portal/utils/crypto')).default;
    const {id:event_id}=params;
    const {token}=query
    //if(data.user === null) return redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${req.url}`)}`,res);
    if(typeof token === 'undefined') {
        db.redirect();
    }
    const tokenDecrypt=crypto.decrypt(token)
    const tokenJson=JSON.parse(tokenDecrypt);
    if(typeof tokenJson.userid !=='undefined') {
        if(tokenJson?.userid != data.user?.id) {
            db.redirect();
        }
    }
    if(tokenJson.event_id != event_id) {
        db.redirect();
    }
    const events=await db.kata(`SELECT id,text,full_text FROM klekle_hari_penting WHERE id=? LIMIT 1`,[event_id]);
    if(!events) {
        db.redirect();
    }
    const {id,text,full_text}=events[0];
    const meta={
        title:text,
        description:full_text==null ? text : full_text,
        image:`${process.env.APP_URL}/line/cover/${id}`
    }
    return {props:{meta:meta,events:events[0]}}
})

const Paper = styled(Papers)(({theme})=>({
    paddingTop: `${theme.spacing(3)} !important`,
    paddingBottom: `${theme.spacing(3)} !important`,
    marginBottom: `${theme.spacing(3)} !important`,
    '& code, & blockquote, & pre, & .code code':{
      background:`${theme.palette.action.hover} !important`
    },
    backgroundColor: `${theme.palette.background.paper} !important`,
    [theme.breakpoints.down('md')]: {
        paddingLeft:'0 !important',
        paddingRight:'0 !important'
    },
    [theme.breakpoints.up('md')]: {
        paddingLeft:`${theme.spacing(3)} !important`,
        paddingRight:`${theme.spacing(3)} !important`
    },
    backgroundColor: `${theme.palette.background.default} !important`,
    backgroundImage:'unset!important',
}))

const Title = styled(Typography)(()=>({
    fontSize: '24px !important'
}))

const DivImg = styled('div')(({theme})=>({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
    },
    [theme.breakpoints.up('md')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
    },
}))

const Container = styled('div')(({theme})=>({
    marginTop:theme.spacing(3),
    textAlign:'center'
}))

const NotifEvents=({err,meta,events})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {id}=router.query
    return(
        <Header title={meta.title} description={meta.description} image={meta.description} canonical={`/notification/events/${id}`} noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12} md={10} lg={8}>
                    <Paper elevation={0}>
                        <DivImg key={'img'}>
                            <center><Image width={300} height={300} className='image-container' fancybox src={`${process.env.APP_URL}/line/cover/${events?.id}/400`} dataSrc={`${process.env.APP_URL}/line/cover/${events.id}`} alt={events?.text} style={{maxWidth:'80%',width:300}} /></center>
                        </DivImg>
                        <Divider key='divider' />
                        <Container>
                            {events.full_text !==null && events?.full_text?.length > 0 ? events?.text?.split("\n").map((dt,i)=>{
                                if(dt?.length) return <Title key={`title-${i}`} component='h2' gutterBottom={i+1==events?.text?.split("\n")?.length}><strong>{dt}</strong></Title>
                                else return <br key={`brr-${i}`} />
                            }) : null}

                            {events.full_text === null || events.full_text !== null && events?.full_text?.length === 0 ? events?.text?.split("\n").map((dt,i)=>{
                                if(dt?.length) return <Title key={`title-${i}`} component='h2' gutterBottom={i+1==events?.text?.split("\n")?.length}><strong>{dt}</strong></Title>
                                else return <br key={`brr-${i}`} />
                            }) : events.full_text.split("\n").map((dt,i)=>{
                                if(dt?.length) return <Typography component='p' key={i}>{dt}</Typography>
                                else return <br key={`br-${i}`} />
                            })}
                        </Container>
                    </Paper>
                </Grid>
            </Grid>
        </Header>
    )
}

export default NotifEvents