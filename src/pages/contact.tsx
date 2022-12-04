import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Link from "@design/components/Link";
import { useSelector } from "@redux/store";
import useAPI, { ApiError } from "@design/hooks/api";
import { Span } from "@design/components/Dom";
import { useRouter } from "next/router";
import Recaptcha from "@design/components/Recaptcha";
import Iconify from "@design/components/Iconify";
import submitForm from "@utils/submit-form";
import TextField from "@mui/material/TextField";
import Textarea from "@design/components/Textarea";
import Backdrop from "@design/components/Backdrop";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";

const Dialog = dynamic(()=>import("@design/components/Dialog"));

type IContact = {
    icon: string
    link: string
    label: string
    notarget?: boolean
    bot?: boolean
}

const dataContact: IContact[] = [
    {
        icon:"ic:baseline-email",
        link:"mailto:support@portalnesia.com",
        label:'support@portalnesia.com',
        notarget:true
    },
    {
        icon:"uil:facebook",
        link:"/fb",
        label:'Portalnesia'
    },
    {
        icon:"mdi:twitter",
        link:"/tw",
        label:'@Portalnesia1'
    },
    {
        icon:"ri:line-fill",
        link:"/ln",
        label:'@540ytcnc',
        bot:true
    },
    {
        icon:"ic:sharp-telegram",
        link:"/tg",
        label:'@portalnesia_bot',
        bot:true
    }
]

export default function ContactPages() {
    const router=useRouter()
    const subject=router?.query?.subject
    const {post} = useAPI()
    const setNotif = useNotification();
    const user = useSelector(s=>s.user);
    const [input,setInput]=React.useState({name: user ? user?.name : '',email:user ? user.email : '',subject:'',message:''})
    const [loading,setLoading]=React.useState(true)
    const [dialog,setDialog]=React.useState(false)
    const captchaRef=React.useRef<Recaptcha>(null)
    
    const handleChange=React.useCallback((name: keyof typeof input)=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setInput({
            ...input,
            [name]:e.target.value
        })
    },[input]);

    const handleSubmit=React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            const recaptcha = await captchaRef.current?.execute();
            await post(`/v2/support`,{...input,recaptcha},undefined,{success_notif:false});
            setDialog(true);
            setInput({...input,subject:'',message:''})
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    }),[input,post,setNotif])

    React.useEffect(()=>{
        if(user !== undefined) {
            const name = user ? user.name : ''
            const email = user ? user.email : ''
            const sub = typeof subject === 'string' ? decodeURIComponent(subject) : ''
            setInput({
                subject:sub,
                message:"",
                name,
                email
            })
            setLoading(false)
        }
    },[user,subject])

    return (
        <Pages title="Contact">
            <DefaultLayout maxWidth='md'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>Contact</Typography>
                </Box>
                <Box>
                    <Typography gutterBottom>If you have questions, criticisms, or suggestions, you can contact us at our official accounts:</Typography>
                    <Box mb={4}>
                        {dataContact.map(c=>(
                            <Stack sx={{mb:0.5}} key={c.label} direction='row' spacing={1}>
                                <Iconify icon={c.icon} height={24} width={24} />
                                <a href={c.link} {...(c.notarget ? {} : {target:'_blank'})} className='no-blank'><Typography>{c.label}</Typography></a>
                            </Stack>
                        ))}
                    </Box>
                    <Box mb={3}>
                        <Typography>For a faster response, you should contact us via email or please fill out the form bellow:</Typography>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Grid container sx={{mb:4}} spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Name"
                                    value={input.name}
                                    onChange={handleChange('name')}
                                    autoComplete='name'
                                    fullWidth
                                    required
                                    {...user ? {
                                        InputProps:{
                                            readOnly:true
                                        }
                                    } : {}}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    value={input.email}
                                    onChange={handleChange('email')}
                                    type='email'
                                    autoComplete="email"
                                    fullWidth
                                    required
                                    {...user ? {
                                        InputProps:{
                                            readOnly:true
                                        }
                                    } : {}}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Subject"
                                    value={input.subject}
                                    onChange={handleChange('subject')}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Textarea
                                    label="Message"
                                    value={input.message}
                                    onChange={handleChange('message')}
                                    fullWidth
                                    required
                                    multiline
                                    minRows={10}
                                    maxRows={20}
                                />
                            </Grid>
                        </Grid>
                        <Box mb={4}>
                            <Button type='submit' icon='submit'>Submit</Button>
                        </Box>
                    </form>
                </Box>
            </DefaultLayout>
            <Backdrop open={loading} />
            <Recaptcha ref={captchaRef} />
            <Dialog open={dialog} handleClose={()=>setDialog(false)} title="Message Sent" fullScreen={false}>
                {user ? (
                    <Typography>You can see your message anytime in <Link href='/support'><Span sx={{color:'customColor.link'}}>support pages</Span></Link>.</Typography>
                ) : (
                    <>
                        <Typography>Please check your email for message detail.</Typography>
                        <Typography>If you don't see an email from us, please check your spam folder.</Typography>
                    </>
                )}
            </Dialog>
        </Pages>
    )
}