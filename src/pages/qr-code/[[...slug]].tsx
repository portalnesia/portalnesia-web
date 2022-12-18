import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import { ApiError } from "@design/hooks/api";
import Button from "@comp/Button";
import TextField from "@mui/material/TextField";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import { Li, Span } from "@design/components/Dom";
import Recaptcha from "@design/components/Recaptcha";
import Image from "@comp/Image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useBeforeUnload } from "@hooks/hotkeys";
import Grid from "@mui/material/Grid";
import Hidden from "@mui/material/Hidden";
import Sidebar from "@design/components/Sidebar";
import List from "@mui/material/List";
import PasswordForm from "@design/components/PasswordForm";
import Textarea from "@design/components/Textarea";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import {Subnav, SubnavMobile} from "@layout/default/Subnav";
import useResponsive from "@design/hooks/useResponsive";
import { INavbar } from "@layout/navbar.config";

const Dialog = dynamic(()=>import('@design/components/Dialog'));

type QrCodeObj = 'url'|'text'|'vcard'|'email'|'telephone'|'sms'|'wifi'|'geographic'
const qrCodeObj: QrCodeObj[] = ['url','text','vcard','email','telephone','sms','wifi','geographic']

const navItems: INavbar[] = [{
    name:"URL",
    link:"/qr-code/url"
},{
    name:"Text",
    link:"/qr-code/text"
},{
    name:"VCard",
    link:"/qr-code/vcard"
},{
    name:"Email",
    link:"/qr-code/email"
},{
    name:"Telephone",
    link:"/qr-code/telephone"
},{
    name:"SMS",
    link:"/qr-code/sms"
},{
    name:"Wifi",
    link:"/qr-code/wifi"
},{
    name:"Geographic",
    link:"/qr-code/geographic"
}]

type QrResult = {
    id: string
    data: string
}

export default function QrCodePages() {
    const router=useRouter();
    const slug=router.query?.slug;
    const {title,fullTitle} = React.useMemo(()=>{
        if(typeof slug?.[0] === 'string') {
            if(qrCodeObj.includes(slug[0].toLowerCase() as QrCodeObj)) {
                const item = navItems.find(i=>i.name.toLowerCase() === slug[0]);
                if(item) return {fullTitle:`${item.name} - QR Code Generator`,title:item.name} 
            }
        }
        return {fullTitle:'QR Code Generator',title:"URL"}
    },[slug]);
    const selected = React.useMemo(()=>{
        if(typeof slug?.[0] === 'string') {
            if(qrCodeObj.includes(slug[0].toLowerCase() as QrCodeObj)) return slug[0] as QrCodeObj
        }
        return 'url' as QrCodeObj
    },[slug]);
    const isMdDown = useResponsive('down','md')
    const setNotif = useNotification();

    const [input,setInput] = React.useState<Record<string,any>>({});
    const [loading,setLoading]=React.useState(false);
    const [dialog,setDialog]=React.useState<QrResult|null>(null)
    const [downloadLoading,setDownloadLoading] = React.useState(false);
    const {post} = useAPI()
    const captchaRef=React.useRef<Recaptcha>(null)
    const [canChange,setCanChange]=React.useState(true)

    useBeforeUnload(canChange,router.asPath);

    const handleChange=React.useCallback((name: string,value: any)=>{
        setCanChange(false)
        setInput({
            ...input,
            [name]:value
        })
    },[input])

    const match = React.useCallback((path: INavbar) => {
        return path ? path.link.indexOf(selected) > -1 : false
      },[selected]);

    React.useEffect(()=>{
        const sl=slug?.[0]||'url'
        if(sl==='url') {
            const defaultVal={
                type:'url',
                url:'',
            }
            setInput(defaultVal)
        } else if(sl==='text'){
            const defaultVal={
                type:'text',
                text:'',
            }
            setInput(defaultVal)
        } else if(sl==='vcard'){
            const defaultVal={
                type:'vcard',
                first_name:'',
                last_name:'',
                telephone:'',
                website:'',
                company:'',
                position:'',
                address:'',
                city:'',
                post_code:'',
                country:''
            }
            setInput(defaultVal)
        } else if(sl==='email'){
            const defaultVal={
                type:'email',
                telephone:'',
                subject:'',
                email_content:''
            }
            setInput(defaultVal)
        } else if(sl==='telephone'){
            const defaultVal={
                type:'telephone',
                telephone:''
            }
            setInput(defaultVal)
        } else if(sl==='sms'){
            const defaultVal={
                type:'sms',
                telephone:'',
                sms_content:''
            }
            setInput(defaultVal)
        } else if(sl==='wifi'){
            const defaultVal={
                type:'wifi',
                hidden:false,
                encryption:'nopass',
                ssid:'',
                password:''
            }
            setInput(defaultVal)
        } else if(sl==='geographic'){
            const defaultVal={
                type:'geographic',
                latitude:'',
                longitude:''
            }
            setInput(defaultVal)
        }
        setCanChange(true)
    },[slug])

    const handleDownload=React.useCallback((data: QrResult)=>()=>{
        setDownloadLoading(true)
        const aTag = document.createElement('a');
        aTag.href=data.data;
        aTag.download=`[portalnesia.com] QR Code ${data?.id}.png`;
        aTag.click();
        aTag.remove();
        setTimeout(()=>setDownloadLoading(false),1000)
    },[])

    const handleSubmit=React.useCallback(async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            setLoading(true);
            const recaptcha = await captchaRef?.current?.execute();
            const result = await post<QrResult>(`/v2/tools/qr-code-generator`,{...input,recaptcha},undefined,{success_notif:false});
            setDialog(result);
            setCanChange(true)
        } catch(e) {
            if(e instanceof ApiError) {
                setNotif(e.message,true)
            }
        } finally {
            setLoading(false)
        }
    },[input,post,setNotif])

    return (
        <Pages title={fullTitle} canonical={`/qr-code${slug?.[0] ? `/${slug?.[0]}` : ''}`}>
            <DefaultLayout maxWidth={false}>
                <Box pt={isMdDown ? 6 : 0}>
                    <Grid container spacing={4}>
                        <Hidden mdDown>
                            <Grid item xs={12} md={2}>
                                <Sidebar id='page-content'>
                                    <Box>
                                        <Subnav title="Navigation" items={navItems} active={match} linkProps={{shallow:true,scroll:true}} rootSx={{pl:3}} />
                                    </Box>
                                </Sidebar>
                            </Grid>
                        </Hidden>
                        <Grid item xs={12} md={10}>
                            <Box id='page-content' px={{xs:0,md:3,lg:4}}>
                                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={3}>
                                    <Typography variant='h4' component='h1'><Span>QR Code Generator</Span>&nbsp;&nbsp;&nbsp;<Span>—</Span>&nbsp;&nbsp;&nbsp;<Span>{title}</Span></Typography>
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    {selected === 'url' ? (
                                        <QrUrl input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'text' ? (
                                        <QrText input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'vcard' ? (
                                        <QrVcard input={input} onChange={handleChange} disabled={loading} />
                                    ): selected === 'email' ? (
                                        <QrEmail input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'telephone' ? (
                                        <QrTelephone input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'sms' ? (
                                        <QrSms input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'wifi' ? (
                                        <QrWifi input={input} onChange={handleChange} disabled={loading} />
                                    ) : selected === 'geographic' ? (
                                        <QrGeographic input={input} onChange={handleChange} disabled={loading} />
                                    ) : null}

                                    <Box mt={3}>
                                        <Typography variant='h6' component='h5' gutterBottom>Note: </Typography>
                                        <List component="ul" sx={{listStyle:'circle',listStylePosition:'inside'}}>
                                            <Li>* Required</Li>
                                            <Li>Please make sure the QR code works before you download it by scanning it yourself.</Li>
                                            <Li>Information you provide will not be stored on our server.</Li>
                                        </List>
                                    </Box>

                                    <Box mt={3}>
                                        <Button disabled={loading} loading={loading} type='submit' icon='submit'>Generate</Button>
                                    </Box>
                                </form>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </DefaultLayout>
            <Hidden mdUp>
                <SubnavMobile title="Navigation" items={navItems} linkProps={{shallow:true,scroll:true}} active={match} rootSx={{pl:3}} />
            </Hidden>
            <Recaptcha ref={captchaRef} />
            <Dialog open={dialog!==null} loading={downloadLoading} handleClose={()=>setDialog(null)} title={`#${dialog?.id}`}
                actions={
                    dialog && <Button disabled={downloadLoading} loading={downloadLoading} icon='download' onClick={handleDownload(dialog)}>Download</Button>
                }
            >
                {dialog && <Image src={dialog?.data} sx={{width:'100%'}} alt={dialog?.id} />}
            </Dialog>
        </Pages>
    )
}

type SubCompProps = {
    input: Record<string, any>
    onChange: (name: string,value: any)=>void
    disabled?: boolean
}

function QrUrl({onChange,input,disabled}: SubCompProps) {
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.url||''}
                    onChange={(e)=>onChange('url',e.target.value)}
                    fullWidth
                    required
                    label='URL'
                    disabled={disabled}
                    placeholder="https://"
                />
            </Grid>
        </Grid>
    )
}

function QrText({onChange,input,disabled}: SubCompProps) {
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <Textarea
                    value={input?.text||''}
                    onChange={(e)=>onChange('text',e.target.value)}
                    fullWidth
                    required
                    multiline
                    minRows={10}
                    maxRows={20}
                    label='Text'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

function QrVcard({onChange,input,disabled}: SubCompProps) {
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <Typography variant='h6' component='h4'>Your Profile Data</Typography>
            </Grid>
            <Grid key='grid-1' item xs={12} sm={6}>
                <TextField
                    value={input?.first_name||''}
                    onChange={(e)=>onChange('first_name',e.target.value)}
                    fullWidth
                    required
                    label='First Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-2' item xs={12} sm={6}>
                <TextField
                    value={input?.last_name||''}
                    onChange={(e)=>onChange('last_name',e.target.value)}
                    fullWidth
                    label='Last Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-3' item xs={12} sm={6}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onChange('telephone',e.target.value)}
                    fullWidth
                    required
                    label='Telephone Number'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-4' item xs={12} sm={6}>
                <TextField
                    value={input?.website||''}
                    onChange={(e)=>onChange('website',e.target.value)}
                    fullWidth
                    label='Website'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-5' item xs={12}>
                <Typography variant='h6' component='h4'>Company Data</Typography>
            </Grid>
            <Grid key='grid-6' item xs={12} sm={6}>
                <TextField
                    value={input?.company||''}
                    onChange={(e)=>onChange('company',e.target.value)}
                    fullWidth
                    label='Company Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-7' item xs={12} sm={6}>
                <TextField
                    value={input?.position||''}
                    onChange={(e)=>onChange('position',e.target.value)}
                    fullWidth
                    label='Position'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-8' item xs={12}>
                <Typography variant='h6' component='h4'>Address Data</Typography>
            </Grid>
            <Grid key='grid-9' item xs={12}>
                <TextField
                    value={input?.address||''}
                    onChange={(e)=>onChange('address',e.target.value)}
                    fullWidth
                    label='Street'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-10' item xs={12} sm={7} md={8} lg={5}>
                <TextField
                    value={input?.city||''}
                    onChange={(e)=>onChange('city',e.target.value)}
                    fullWidth
                    label='City'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-11' item xs={12} sm={5} md={4} lg={2}>
                <TextField
                    value={input?.post_code||''}
                    onChange={(e)=>onChange('post_code',e.target.value)}
                    fullWidth
                    label='Post Code'
                    type='number'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-12' item xs={12} lg={5}>
                <TextField
                    value={input?.country||''}
                    onChange={(e)=>onChange('country',e.target.value)}
                    fullWidth
                    label='Country'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}

function QrEmail({onChange,input,disabled}: SubCompProps) {
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.email||''}
                    onChange={(e)=>onChange('email',e.target.value)}
                    fullWidth
                    required
                    label='Email'
                    type='email'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <TextField
                    value={input?.subject||''}
                    onChange={(e)=>onChange('subject',e.target.value)}
                    fullWidth
                    label='Subject'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-2' item xs={12}>
                <Textarea
                    value={input?.email_content||''}
                    onChange={(e)=>onChange('email_content',e.target.value)}
                    fullWidth
                    multiline
                    rows={10}
                    maxRows={20}
                    label='Email Content'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

function QrTelephone({onChange,input,disabled}: SubCompProps) {
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onChange('telephone',e.target.value)}
                    fullWidth
                    required
                    label='Telephone'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}

function QrSms({onChange,input,disabled}: SubCompProps) {
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onChange('telephone',e.target.value)}
                    fullWidth
                    required
                    label='Telephone'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <Textarea
                    value={input?.sms_content||''}
                    onChange={(e)=>onChange('sms_content',e.target.value)}
                    fullWidth
                    multiline
                    rows={10}
                    maxRows={20}
                    label='SMS Content'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

function QrWifi({onChange,input,disabled}: SubCompProps) {
    const [pass,setPass]=React.useState(false)
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <FormGroup key='input-switch'>
                    <FormControlLabel control={
                        <Switch
                            disabled={disabled}
                            checked={input?.hidden||false}
                            onChange={e=>onChange('hidden',e.target.checked)}
                            color="primary" 
                        />
                    }
                    label="Hidden" />
                </FormGroup>
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <FormControl component='fieldset' disabled={disabled} required>
                    <FormLabel component="legend">Encryption</FormLabel>
                    <RadioGroup aria-label="gender" name="gender1" value={input?.encryption||"nopass"} onChange={e=>onChange('encryption',e.target.value)}>
                        <FormControlLabel value="nopass" control={<Radio />} label="None" />
                        <FormControlLabel value="WPA" control={<Radio />} label="WPA/WPA2" />
                        <FormControlLabel value="WEP" control={<Radio />} label="WEP" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid key='grid-2' item xs={12} sm={6}>
                <TextField
                    value={input?.ssid||''}
                    onChange={(e)=>onChange('ssid',e.target.value)}
                    fullWidth
                    required
                    label='SSID'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-3' item xs={12} sm={6}>
                <PasswordForm
                    label="Password"
                    value={input?.password||''}
                    onChange={(e)=>onChange('password',e.target.value)}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
}

function QrGeographic({onChange,input,disabled}: SubCompProps) {
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12} sm={6}>
                <TextField
                    value={input?.latitude||''}
                    onChange={(e)=>onChange('latitude',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Latitude'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12} sm={6}>
                <TextField
                    value={input?.longitude||''}
                    onChange={(e)=>onChange('longitude',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Longitude'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}