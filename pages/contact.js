import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import {useNotif} from 'portal/components/Notification'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import ErrorPage from 'portal/pages/_error'
import {useRouter} from 'next/router' 
import Link from 'next/link'
import {wrapper} from 'portal/redux/store'
import {connect} from 'react-redux';
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import ReCaptcha from 'portal/components/ReCaptcha'
import {withStyles} from 'portal/components/styles';
import {
    Grid,
    Typography,
    TextField,
} from '@mui/material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper()

const styles=theme=>({
    dialog:{
        '& a':{
          color:theme.palette.primary.link
        },
    },
})

const Contact=({classes,err,user})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter()
    const {subject}=router?.query
    const {post} = useAPI()
    const [input,setInput]=React.useState({name:user===null ?'':user?.user_nama,email:user===null ? '' : user.user_email,subject:'',message:''})
    const [loading,setLoading]=React.useState(false)
    const [dialog,setDialog]=React.useState(false)
    const captchaRef=React.useRef(null)

    const dataContact=[
        {
            icon:"social-logo/email_logo.png",
            link:"mailto:support@portalnesia.com",
            label:'support@portalnesia.com',
            target:true
        },
        {
            icon:"social-logo/facebook-logo.png",
            link:"/fb",
            label:'Portalnesia'
        },
        {
            icon:"social-logo/twitter-logo.png",
            link:"/tw",
            label:'@Portalnesia1'
        },
        {
            icon:"social-logo/line-logo.png",
            link:"/ln",
            label:'@540ytcnc',
            bot:true
        },
        {
            icon:"social-logo/telegram-logo.png",
            link:"/tg",
            label:'@portalnesia_bot',
            bot:true
        }
    ]

    const handleChange=(name,val)=>{
        setInput({
            ...input,
            [name]:val
        })
    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        setLoading(true)
        if(user===null) {
            window.localStorage.setItem('pn_name', input?.name);
            window.localStorage.setItem('pn_email', input?.email);
        }
        captchaRef?.current?.execute()
        .then(recaptcha=>{
            return{
                ...input,
                recaptcha
            }
        }).then((dtInput)=>{
            return post(`/v1/support`,dtInput)
        }).then(()=>{
            setInput({...input,subject:'',message:''})
            setDialog(true)
        }).catch((err)=>{
            
        }).finally(()=>{
            setLoading(false)
        })
    }

    React.useEffect(()=>{
        if(user!==null){
            setInput({
                ...input,
                name:user.user_nama,
                email:user.user_email
            })
        } else {
            setInput({
                ...input,
                name:(window.localStorage.getItem('pn_name')||""),
                email:(window.localStorage.getItem('pn_email')||"")
            })
        }
        if(subject) {
            setInput({
                ...input,
                subject:decodeURIComponent(subject)
            })
        }
    },[])

    return (
        <Header navTitle="Contact" title="Contact" canonical="/contact">
            <Grid container justifyContent='center'>
                <Grid item xs={12} md={10} lg={8}>
                    <form onSubmit={handleSubmit}>
                        <PaperBlock title="Contact" linkColor whiteBg
                        footer={
                            <div style={{textAlign:'center'}}>
                                <Button disabled={loading} loading={loading} type='submit' icon='submit'>Send</Button>
                            </div>
                        }
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    
                                    <Typography gutterBottom>If you have questions, criticisms, or suggestions, you can contact us at our official accounts:</Typography>
                                    {dataContact.map((dt,i)=>(
                                        <div key={`info-${i}`} style={{display:'flex',alignItems:'center',margin:'5px 0'}}>
                                            <div style={{height:24,marginRight:15}}><Image width={24} height={24} src={`${process.env.CONTENT_URL}/${dt?.icon}`} style={{width:24,height:24}} /></div>
                                            <Typography><a className='underline' href={dt?.link} {...(dt?.target ? {} : {target:'_blank'})}>{dt?.label}</a>{dt?.bot ? ' (BOT)' :''}</Typography>
                                        </div>
                                    ))}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography>For a faster response, you should contact us via email or please fill out the form bellow:</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        onChange={e=>handleChange('name',e.target.value)}
                                        value={input?.name}
                                        label="Name"
                                        fullWidth
                                        required
                                        variant='outlined'
                                        disabled={loading}
                                        {...(user!==null ? {inputProps:{readOnly:true}} : {})}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        onChange={e=>handleChange('email',e.target.value)}
                                        value={input?.email}
                                        label="Email"
                                        fullWidth
                                        required
                                        variant='outlined'
                                        type='email'
                                        disabled={loading}
                                        {...(user!==null ? {inputProps:{readOnly:true}} : {})}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        onChange={e=>handleChange('subject',e.target.value)}
                                        value={input?.subject}
                                        label="Subject"
                                        fullWidth
                                        required
                                        disabled={loading}
                                        variant='outlined'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        onChange={e=>handleChange('message',e.target.value)}
                                        value={input?.message}
                                        label="Message contents"
                                        fullWidth
                                        required
                                        rows={6}
                                        maxRows={15}
                                        multiline
                                        disabled={loading}
                                        variant='outlined'
                                    />
                                </Grid>
                                <ReCaptcha
                                    ref={captchaRef}
                                />
                            </Grid>
                        </PaperBlock>
                    </form>
                </Grid>
            </Grid>
            <Dialog open={dialog} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>Message Sent</DialogTitle>
                <DialogContent dividers className={classes.dialog}>
                    {user!==null ? (
                        <Typography>You can see your message anytime in <Link href='/support' passHref><a>support pages</a></Link>.</Typography>
                    ) : (
                        <Typography>Please check your email for message detail.<br />If you don't see an email from us, please check your spam folder.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setDialog(false)}>OK</Button>
                </DialogActions>
            </Dialog>
        </Header>
    );
}

export default connect(state=>({user:state.user}))(withStyles(Contact,styles))