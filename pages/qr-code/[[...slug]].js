import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import PaperBlock from 'portal/components/PaperBlock'
import {AdsBanner2,AdsRect} from 'portal/components/Ads'
import {withStyles} from 'portal/components/styles';
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import Link from 'next/link'
import classNames from 'classnames'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import {useBeforeUnload} from 'portal/utils/useKeys'
import db from 'portal/utils/db'
import {connect} from 'react-redux';
import {OutlinedInput,InputLabel,InputAdornment,Grid,Radio,RadioGroup,FormControl,
    FormLabel,Typography,TextField,IconButton,FormControlLabel,FormGroup,Switch,AppBar,
    Tabs,Tab} from '@mui/material'
import {VisibilityOff,Visibility} from '@mui/icons-material'
import dynamic from 'next/dynamic'
import ReCaptcha from 'portal/components/ReCaptcha'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Image=dynamic(()=>import('portal/components/Image'))

export const getServerSideProps = wrapper(async({req,res,params})=>{
    const slug=params?.slug;
    if(slug?.length > 1) {
        return db.redirect();
    }
    if(slug?.[0] && ['url','text','vcard','email','telephone','sms','wifi','geographic'].indexOf(slug[0]) === -1) {
        return db.redirect();
    }
    return {props:{}}
})

const styles=theme=>({
    selected:{
        color:`${theme.palette.mode=='dark' ? theme.palette.text.primary : theme.palette.primary.dark} !important`
    },
    rootTab:{
        flexGrow:1,
        maxWidth:'unset'
    },
    rootAppBar:{
        marginBottom:'1rem !important',
        position:'fixed !important',
        top:'64px !important',
        backgroundColor:`${theme.palette.background.default} !important`,
        backgroundImage:'unset !important',
        [theme.breakpoints.down('lg')]: {
            width:'100% !important',
            left:'unset !important'
        },
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 240px) !important',
            left:'240px !important'
        },
    },
    drawerClose:{
        [theme.breakpoints.up('md')]: {
            width:'calc(100% - 68px) !important',
            left:'68px !important'
        },
    },
    footer:{
        marginTop:theme.spacing(3)
    }
})

const QRgeographic=({onchange,input,disabled})=>{
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12} lg={6}>
                <TextField
                    value={input?.latitude||''}
                    onChange={(e)=>onchange('latitude',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Latitude'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12} lg={6}>
                <TextField
                    value={input?.longitude||''}
                    onChange={(e)=>onchange('longitude',e.target.value)}
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

const QRwifi=({onchange,input,disabled})=>{
    const [pass,setPass]=React.useState(false)
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <FormGroup key='input-switch'>
                    <FormControlLabel control={
                        <Switch
                            disabled={disabled}
                            checked={input?.hidden||false}
                            onChange={e=>onchange('hidden',e.target.checked)}
                            color="primary" 
                        />
                    }
                    label="Hidden" />
                </FormGroup>
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <FormControl component='fieldset' disabled={disabled} required>
                    <FormLabel component="legend">Encryption</FormLabel>
                    <RadioGroup aria-label="gender" name="gender1" value={input?.encryption||"nopass"} onChange={e=>onchange('encryption',e.target.value)}>
                        <FormControlLabel value="nopass" control={<Radio />} label="None" />
                        <FormControlLabel value="WPA" control={<Radio />} label="WPA/WPA2" />
                        <FormControlLabel value="WEP" control={<Radio />} label="WEP" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid key='grid-2' item xs={12}>
                <TextField
                    value={input?.ssid||''}
                    onChange={(e)=>onchange('ssid',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='SSID'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-3' item xs={12}>
                <FormControl variant="outlined" disabled={disabled} fullWidth>
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={pass ? 'text' : 'password'}
                        value={input?.password||''}
                        onChange={(e)=>onchange('password',e.target.value)}
                        labelWidth={80}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={()=>setPass(!pass)}
                                onMouseDown={e=>e.preventDefault()}
                                edge="end"
                                size="large">
                                {pass ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                        }
                    />
                </FormControl>
            </Grid>
        </Grid>
    );
}

const QRsms=({onchange,input,disabled})=>{
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onchange('telephone',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Telephone'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <TextField
                    value={input?.sms_content||''}
                    onChange={(e)=>onchange('sms_content',e.target.value)}
                    fullWidth
                    variant='outlined'
                    multiline
                    rows={20}
                    maxRows={50}
                    label='SMS Content'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

const QRtelephone=({onchange,input,disabled})=>{
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onchange('telephone',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Telephone'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}

const QRemail=({onchange,input,disabled})=>{
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.email||''}
                    onChange={(e)=>onchange('email',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Email'
                    type='email'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-1' item xs={12}>
                <TextField
                    value={input?.subject||''}
                    onChange={(e)=>onchange('subject',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Subject'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-2' item xs={12}>
                <TextField
                    value={input?.email_content||''}
                    onChange={(e)=>onchange('email_content',e.target.value)}
                    fullWidth
                    variant='outlined'
                    multiline
                    rows={20}
                    maxRows={50}
                    label='Email Content'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

const QRvcard=({onchange,input,disabled})=>{
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <Typography variant='h6' component='h4'>Your Profile Data</Typography>
            </Grid>
            <Grid key='grid-1' item xs={12} lg={6}>
                <TextField
                    value={input?.first_name||''}
                    onChange={(e)=>onchange('first_name',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='First Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-2' item xs={12} lg={6}>
                <TextField
                    value={input?.last_name||''}
                    onChange={(e)=>onchange('last_name',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Last Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-3' item xs={12} lg={6}>
                <TextField
                    value={input?.telephone||''}
                    onChange={(e)=>onchange('telephone',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='Telephone Number'
                    inputProps={{pattern:"^[+0-9]+$"}}
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-4' item xs={12} lg={6}>
                <TextField
                    value={input?.website||''}
                    onChange={(e)=>onchange('website',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Website'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-5' item xs={12}>
                <Typography variant='h6' component='h4'>Company Data</Typography>
            </Grid>
            <Grid key='grid-6' item xs={12} lg={6}>
                <TextField
                    value={input?.company||''}
                    onChange={(e)=>onchange('company',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Company Name'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-7' item xs={12} lg={6}>
                <TextField
                    value={input?.position||''}
                    onChange={(e)=>onchange('position',e.target.value)}
                    fullWidth
                    variant='outlined'
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
                    onChange={(e)=>onchange('address',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Street'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-10' item xs={12} md={8} lg={5}>
                <TextField
                    value={input?.city||''}
                    onChange={(e)=>onchange('city',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='City'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-11' item xs={12} md={4} lg={2}>
                <TextField
                    value={input?.post_code||''}
                    onChange={(e)=>onchange('post_code',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Post Code'
                    type='number'
                    disabled={disabled}
                />
            </Grid>
            <Grid key='grid-12' item xs={12} lg={5}>
                <TextField
                    value={input?.country||''}
                    onChange={(e)=>onchange('country',e.target.value)}
                    fullWidth
                    variant='outlined'
                    label='Country'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}

const QRtext=({onchange,input,disabled})=>{
    return (
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.text||''}
                    onChange={(e)=>onchange('text',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    multiline
                    rows={20}
                    maxRows={50}
                    label='Text'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    );
}

const QRurl=({onchange,input,disabled})=>{
    return(
        <Grid container spacing={2}>
            <Grid key='grid-0' item xs={12}>
                <TextField
                    value={input?.url||''}
                    onChange={(e)=>onchange('url',e.target.value)}
                    fullWidth
                    required
                    variant='outlined'
                    label='URL'
                    disabled={disabled}
                />
            </Grid>
        </Grid>
    )
}

const QRcode=({classes,err,toggleDrawer})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {slug}=router.query
    const type=['url','text','vcard','email','telephone','sms','wifi','geographic']
    const index=type.indexOf(slug?.[0]||"url");
    const [value,setValue]=React.useState(index);
    const [input,setInput]=React.useState({});
    const [loading,setLoading]=React.useState(false);
    const [dialog,setDialog]=React.useState(null)
    const [downloadLoading,setDownloadLoading] = React.useState(false);
    const {post} = useAPI()
    const captchaRef=React.useRef(null)
    const [canChange,setCanChange]=React.useState(true)
    useBeforeUnload(canChange,'/qr-code')
    const handleChange=(name,val)=>{
        setCanChange(false)
        setInput({
            ...input,
            [name]:val
        })
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        setLoading(true);
        captchaRef?.current?.execute()
        .then((recaptcha)=>post(`/v1/tools/qr-code-generator`,{...input,recaptcha},{},{error_notif:true,success_notif:false}))
        .then(([res])=>{
            setCanChange(true)
            setDialog(res)
            setLoading(false)
        }).catch((err)=>{
            setLoading(false)
        })
    }

    const handleDownload=()=>{
        if(process.browser) {
            setDownloadLoading(true)
            const aTag = document.createElement('a');
            aTag.href=dialog?.data;
            aTag.download=`[portalnesia.com] QR Code ${dialog?.id}.png`;
            aTag.click();
            aTag.remove();
            setTimeout(()=>setDownloadLoading(false),1000)
        }
    }

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
        const index=type.indexOf(sl);
        setValue(index)
        setCanChange(true)
    },[router.query])

    return(
        <Header iklan navTitle="QR Code" active='tools' subactive='qr_code' title='QR Code Generator' desc="Free Online QR Code Generator to make your own QR Codes. Supports many types of QR codes." canonical="/qr-code">
            <AppBar position='sticky' color='default' className={classNames(classes.rootAppBar,!toggleDrawer&&classes.drawerClose)}>
                <Tabs
                value={value}
                indicatorColor="primary"
                aria-label="Tab Menu"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                >
                    <Link key='link-1' href='/qr-code/[[...slug]]' as={`/qr-code/url`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="URL" className={classNames('MuiTab-fullWidth',classes.rootTab,value==0 ? classes.selected : '')} /></Link>
                    <Link key='link-2' href='/qr-code/[[...slug]]' as={`/qr-code/text`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="TEXT" className={classNames('MuiTab-fullWidth',classes.rootTab,value==1 ? classes.selected : '')} /></Link>
                    <Link key='link-3' href='/qr-code/[[...slug]]' as={`/qr-code/vcard`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="vCARD" className={classNames('MuiTab-fullWidth',classes.rootTab,value==2 ? classes.selected : '')} /></Link>
                    <Link key='link-4' href='/qr-code/[[...slug]]' as={`/qr-code/email`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="EMAIL" className={classNames('MuiTab-fullWidth',classes.rootTab,value==3 ? classes.selected : '')} /></Link>
                    <Link key='link-5' href='/qr-code/[[...slug]]' as={`/qr-code/telephone`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="TELEPHONE" className={classNames('MuiTab-fullWidth',classes.rootTab,value==4 ? classes.selected : '')} /></Link>
                    <Link key='link-6' href='/qr-code/[[...slug]]' as={`/qr-code/sms`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="SMS" className={classNames('MuiTab-fullWidth',classes.rootTab,value==5 ? classes.selected : '')} /></Link>
                    <Link key='link-7' href='/qr-code/[[...slug]]' as={`/qr-code/wifi`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="WIFI" className={classNames('MuiTab-fullWidth',classes.rootTab,value==6 ? classes.selected : '')} /></Link>
                    <Link key='link-8' href='/qr-code/[[...slug]]' as={`/qr-code/geographic`} shallow={true} scroll={false} replace passHref><Tab wrapped component='a' label="GEOGRAPHIC" className={classNames('MuiTab-fullWidth',classes.rootTab,value==7 ? classes.selected : '')} /></Link>
                </Tabs>
            </AppBar>
            <form onSubmit={handleSubmit}>
                <PaperBlock title="QR Code Generator" marginPlus whiteBg
                footer={
                    <Button disabled={loading} loading={loading} type='submit' icon='submit'>Generate</Button>
                }
                >
                    <AdsBanner2 />
                    {value===0 ? (
                        <QRurl disabled={loading} onchange={handleChange} input={input} />
                    ) : value===1 ? (
                        <QRtext disabled={loading} onchange={handleChange} input={input} />
                    ) : value===2 ? (
                        <QRvcard disabled={loading} onchange={handleChange} input={input} />
                    ) : value===3 ? (
                        <QRemail disabled={loading} onchange={handleChange} input={input} />
                    ) : value===4 ? (
                        <QRtelephone disabled={loading} onchange={handleChange} input={input} />
                    ) : value===5 ? (
                        <QRsms disabled={loading} onchange={handleChange} input={input} />
                    ) : value===6 ? (
                        <QRwifi disabled={loading} onchange={handleChange} input={input} />
                    ) : value===7 ? (
                        <QRgeographic disabled={loading} onchange={handleChange} input={input} />
                    ) : null}
                    <div className={classes.footer}>
                        <AdsRect />
                        <Typography variant='h6' component='h5' gutterBottom>Note: </Typography>
                        <ul>
                            <li><Typography variant='body1' component='p'>* Required</Typography></li>
                            <li><Typography variant='body1' component='p'>Please make sure the QR code works before you download it by scanning it yourself.</Typography></li>
                            <li><Typography variant='body1' component='p'>Information you provide will not be stored on our server.</Typography></li>
                        </ul>
                    </div>
                </PaperBlock>
            </form>
            <Dialog open={dialog!==null} aria-labelledby='dialog' scroll='body'>
                <DialogTitle id='dialog title'>{dialog?.id}</DialogTitle>
                {dialog!==null && (
                    <DialogContent dividers>
                        <Image blured src={dialog?.data} alt={dialog?.id} style={{width:'100%'}} />
                    </DialogContent>
                )}
                {dialog!==null && (
                    <DialogActions>
                        <Button key='btn-cancel' color='secondary' disabled={downloadLoading} onClick={()=>setDialog(null)}>Cancel</Button>
                        <Button key='btn-download' onClick={handleDownload} disabled={downloadLoading} loading={downloadLoading} icon='download'>Download</Button>
                    </DialogActions>
                )}
            </Dialog>
            <ReCaptcha ref={captchaRef} />
        </Header>
    )
}

export default connect(state=>state)(withStyles(QRcode,styles))