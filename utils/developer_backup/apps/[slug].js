import React from 'react'
import Header from 'portal/components/developer/Header'
import {Image,Button,PaperBlock,Sidebar} from 'portal/components'

import Image from 'portal/components/Image'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import Sidebar from 'portal/components/Sidebar'
import {useNotif} from 'portal/components/Notification'
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {useMousetrap} from 'portal/utils/useKeys'
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import CancelIcon from '@mui/icons-material/Cancel';
import useSWR from 'portal/utils/swr'
import {
    Grid,
    Typography,
    IconButton,
    TextField,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    Chip,
    Paper,
    CircularProgress
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete';

export const getServerSideProps = wrapper(async({pn:data,req,resolvedUrl,params})=>{
    const slu=params.slug
    const crypto = (await import('portal/utils/crypto')).default
    if(data.user === null || !data?.user?.admin) {
        return db.redirect();
    }
    if(data.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    const apps = await db.kata(`SELECT name,description,block,user_id as userid,client_id,redirect_uri,grant_types,website,icon,unik as id,terms_url,privacy_url FROM klekle_oauth_clients WHERE unik = ? AND BINARY(unik) = BINARY(?) LIMIT 1`,[slu,slu]);
    if(!apps) {
        return db.redirect();
    }
    if(apps[0].userid==1 && data?.user?.id!==2) {
        return db.redirect();
    } else if(apps[0].userid!=1 && apps[0].userid != data?.user?.id) {
        return db.redirect();
    }
    if(apps[0].block==1) return {props:{meta:{err:'blocked'}}}

    const grant_types = apps[0]?.grant_types?.length > 0 ? apps[0].grant_types.split(" ") : [];

    apps[0].grant_types = grant_types.filter((grant) => grant !== 'refresh_token');
    //apps[0].scope = apps[0]?.scope?.length > 0 ? apps[0].scope.split(" ") : [];

    /*
    apps[0].authorization_code = Boolean(grant_types.indexOf('authorization_code') !== -1)
    apps[0].client_credentials = Boolean(grant_types.indexOf('client_credentials') !== -1)
    apps[0].implicit = Boolean(grant_types.indexOf('implicit') !== -1)

    apps[0].basic = Boolean(scope.indexOf('basic') !== -1)
    apps[0].email = Boolean(scope.indexOf('email') !== -1)
    apps[0].description = apps[0].description===null ? "" : apps[0].description

    delete apps[0].grant_types;
    delete apps[0].scope;
    */
    
    delete apps[0].userid;
    const meta={
        apps:apps[0]
    }
    return {props:{meta:meta}}
})

const styles=theme=>({
    scrollBar:{
        '& textarea':{
            cursor:'auto',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.7em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                    borderRadius:4
                },
            }
        }
    },
    wrapper:{
        [theme.breakpoints.down('sm')]: {
            paddingLeft:theme.spacing(2),
            paddingRight:theme.spacing(2)
        },
            [theme.breakpoints.up('sm')]: {
            paddingLeft:theme.spacing(3),
            paddingRight:theme.spacing(3)
        },
        paddingBottom:`${theme.spacing(2)} !important`,
        paddingTop:`${theme.spacing(2)} !important`,
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        listStyle: 'none',
        padding: theme.spacing(0.5),
        margin: 0,
        marginTop:15,
        backgroundColor: theme.palette.background.default
    },
    chip: {
        margin: theme.spacing(0.5),
    },
    code:{
        '& pre code':{
            background:theme.palette.action.hover,
            borderRadius:'.5rem',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    height:8,
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    //background:theme.palette.mode=='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                    background:'rgba(255,255,255,.2)',
                    borderRadius:4,
                    '&:hover':{
                        background:'rgba(255,255,255,.4)'
                    }
                },
            }
        },
    }
})

const grantArr = ['authorization_code','implicit','client_credentials'];
//const scopeArr = [['basic','Basic'],['email','Email']]

const AppDetail=({meta,err,classes})=>{
    if(err) return <ErrorPage statusCode={err} />

    const {post}=useAPI()
    const {setNotif}=useNotif()
    const [input,setInput]=React.useState(meta?.apps);
    const [loading,setLoading]=React.useState(false)
    const [dialog,setDialog]=React.useState(null)
    const [dialogNew,setDialogNew]=React.useState(false)
    const [scope,setScope]=React.useState([]);
    const [listScope,setListScope]=React.useState([])
    const [openList,setOpenList]=React.useState(false)

    const {data:dataScope}=useSWR((meta?.apps?.id ? `${process.env.API}/developer/apps/${meta.apps.id}/permissions` : null))

    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit(e)
    },true)

    const handleEdit=(name,value)=>{
        setInput({...input,[name]:value})
    }

    const handleEditGrant=(name,value)=>{
        if(value===true) {
            let a = [...input.grant_types];
            a.push(name)
            setInput((inp)=>({...inp,grant_types:a}))
        } else {
            const a = [...input.grant_types];
            const b = a.filter((scope) => scope !== name)
            setInput({...input,grant_types:b})
        }
    }

    const handleSubmit=(e)=>{
        if(e && e.preventDefault) e.preventDefault()
        /*setLoading(true)
        const data = {
            ...input,
            grant_types:input.grant_types.join(" "),
            scope:scope.join(" ")
        }
        PNpost(`${process.env.API}/developer/apps/${meta?.apps?.id}`,data)
        .then((res)=>{
            setNotif(res?.msg,Boolean(res?.error))
        })
        .catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
        .finally(()=>setLoading(false))*/
    }

    const handleRegenarate=()=>{
        /*setLoading(true)
        PNpost(`${process.env.API}/developer/apps/${meta?.apps?.id}/regenerate`,{})
        .then((res)=>{
            setNotif(res?.msg,Boolean(res?.error))
            if(!res.error) {
                try {
                    const decr = crypto.decrypt(res.key)
                    setDialog(decr)
                } catch(err) {
                    console.log(err)
                    setNotif("Something went wrong",true)
                }
            }
        })
        .catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
        .finally(()=>setLoading(false))*/
    }

    const openFileManager=()=>{
        window.open(`/file-manager/images?type=post_image`, "", "width=1000, height=600");
    }

    const handleDeleteScope=(scopeToDelete)=>()=>{
        setScope((scopes) => scopes.filter((scope) => scope !== scopeToDelete));
    }

    const handleSelectScope=(value,newValue)=>{
        if(newValue) {
            if(scope?.indexOf(newValue) === -1) {
                let a = [...scope];
                a.push(newValue)
                setScope(a)
            }
        }
    }

    React.useEffect(()=>{
        if(dataScope && dataScope.scopes) {
            setScope(dataScope.scopes.selected)
            setListScope(dataScope.scopes.approved)
        }
    },[dataScope])

    React.useEffect(()=>{
        const onMessage=(e)=>{
            if(e.origin!==process.env.URL) return;
            if(typeof e.data.type === 'undefined' || e?.data?.type !== 'use' || typeof e.data.src !== 'string') return;
            handleEdit('icon',e.data.src)
        }
        window.addEventListener('message',onMessage)
        return ()=>window.removeEventListener('message',onMessage)
    },[])

    return (
        <Header title='Application Detail' active='apps' canonical={`/developer/apps/${meta?.apps?.id}`} noIndex>
            <form onSubmit={handleSubmit}>
                <Grid container justifyContent="center" spacing={2}>
                    {meta.err==='blocked' ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h6">Your Apps is Blocked</Typography>
                            </div>
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12} lg={8}>
                                <PaperBlock id="cardContent" whiteBg>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='App Name'
                                                value={input.name}
                                                onChange={(e)=>handleEdit('name',e.target.value)}
                                                variant='outlined'
                                                fullWidth
                                                required
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='App Description'
                                                value={input.description||""}
                                                onChange={(e)=>handleEdit('description',e.target.value)}
                                                InputProps={{
                                                    className:classes.scrollBar
                                                }}
                                                variant='outlined'
                                                fullWidth
                                                multiline
                                                rows={5}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label='Oranization URL'
                                                value={input.website}
                                                onChange={(e)=>handleEdit('website',e.target.value)}
                                                variant='outlined'
                                                fullWidth
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl disabled={loading} component="fieldset">
                                                <FormLabel component="legend">Authorization Flows</FormLabel>
                                                <FormGroup>
                                                    {grantArr.map((dt,i)=>(
                                                        <FormControlLabel key={`grant-${i}`}
                                                            control={<Checkbox checked={input?.grant_types?.indexOf(dt) !== -1} color="primary" onChange={(e)=>handleEditGrant(dt,e.target.checked)} name={dt} />}
                                                            label={dt}
                                                        />
                                                    ))}
                                                </FormGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormLabel component="legend" style={{marginBottom:15}}>Scope</FormLabel>
                                            <Autocomplete
                                                open={openList}
                                                value={null}
                                                disableClearable
                                                onChange={handleSelectScope}
                                                options={listScope}
                                                loading={listScope?.length===0}
                                                getOptionDisabled={(option) => scope.indexOf(option) !== -1}
                                                onOpen={() => {
                                                    setOpenList(true);
                                                }}
                                                onClose={() => {
                                                    setOpenList(false);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="outlined"
                                                        disabled={loading}
                                                        label="Select Scope"
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            autoComplete: 'new-password',
                                                            endAdornment: (
                                                            <React.Fragment>
                                                                {listScope?.length===0 ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </React.Fragment>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                            />
                                            {scope?.length > 0 && (
                                                <Paper component="ul" className={classes.root} variant='outlined'>
                                                    {scope.map((dt,i)=>(
                                                        <li key={`scope-${i}`}>
                                                            <Chip
                                                                label={dt}
                                                                onDelete={loading ? undefined : handleDeleteScope(dt)}
                                                                className={classes.chip}
                                                            />
                                                        </li>
                                                    ))}
                                                </Paper>
                                            )}
                                        </Grid>
                                        {input?.grant_types?.indexOf('authorization_code') !== -1||input?.grant_types?.indexOf('implicit') !== -1 ? (
                                            <>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label='Callback URL'
                                                    value={input.redirect_uri}
                                                    onChange={(e)=>handleEdit('redirect_uri',e.target.value)}
                                                    variant='outlined'
                                                    fullWidth
                                                    required
                                                    disabled={loading}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label='Terms of Service'
                                                    value={input.terms_url}
                                                    onChange={(e)=>handleEdit('terms_url',e.target.value)}
                                                    variant='outlined'
                                                    fullWidth
                                                    required
                                                    disabled={loading}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label='Privacy Policy'
                                                    value={input.privacy_url}
                                                    onChange={(e)=>handleEdit('privacy_url',e.target.value)}
                                                    variant='outlined'
                                                    fullWidth
                                                    required
                                                    disabled={loading}
                                                />
                                            </Grid>
                                            </>
                                        ) : null}
                                    </Grid>
                                </PaperBlock>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                                <Sidebar id='cardContent'>
                                    <PaperBlock>
                                        <div key={0} className={classes.wrapper}>
                                            <Typography variant='h6' component='h6'>App Icon</Typography>
                                            {input?.icon!==null && input?.icon?.length > 0 ? (
                                                <div style={{position:'relative',margin:'15px auto',textAlign:'center'}}>
                                                    <IconButton
                                                        style={{position:'absolute',top:5,right:5}}
                                                        onClick={()=>handleEdit('icon',null)}
                                                        size="large">
                                                        <CancelIcon fontSize='large' style={{color:'red'}} />
                                                    </IconButton>
                                                    <Image src={`${input?.icon}&size=100&watermark=no`} dataSrc={`${input?.icon}&watermark=no`} fancybox style={{width:'100%',maxWidth:100,margin:'auto'}} />
                                                </div>
                                            ) : <div style={{margin:'15px 0'}}>No icon</div>}
                                            <Button disabled={loading} outlined onClick={openFileManager}>Select Icon</Button>
                                        </div>
                                        <Divider key={1} />
                                        <div key={2} className={classes.wrapper}>
                                            <Grid container spacing={3} justifyContent='center'>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label='Client ID'
                                                        onClick={()=>Kcopy(meta.apps.client_id).then(()=>setNotif('Client ID copied',false))}
                                                        value={meta.apps.client_id}
                                                        variant='outlined'
                                                        fullWidth
                                                        inputProps={{style:{cursor:'pointer'}}}
                                                        InputProps={{readOnly:true}}
                                                        disabled={loading}
                                                        helperText="Click to copy"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label='Client Secret'
                                                        value={"AAAAAAAAAAAAAAAAAAAAAA"}
                                                        variant='outlined'
                                                        fullWidth
                                                        InputProps={{readOnly:true}}
                                                        type='password'
                                                        disabled={loading}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </div>
                                        <Divider key={4} />
                                        <div key={12} className={classes.wrapper} style={{paddingBottom:0}}>
                                            <div className="flex-header">
                                                <Button disabled={loading} onClick={()=>setDialogNew(true)} color='secondary'>Regenerate</Button>
                                                <Button tooltip='Ctrl + S' type="submit" disabled={loading} isloading={loading}>Save</Button>
                                            </div>
                                        </div>
                                    </PaperBlock>
                                </Sidebar>
                            </Grid>
                        </>
                    )}
                </Grid>
            </form>
            <Dialog open={dialogNew} aria-labelledby='dialog' scroll='body'>
                <DialogTitle>Regenerate Client Secret?</DialogTitle>
                <DialogActions>
                    <Button onClick={()=>setDialogNew(false)} disabled={loading} outlined>Cancel</Button>
                    <Button onClick={handleRegenarate} disabled={loading} isloading={loading}>Regenerate</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialog!==null && !loading} aria-labelledby='dialog' maxWidth='md' fullWidth scroll='body'>
                <DialogTitle>Generated Token</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} justifyContent='center'>
                        <Grid item xs={12}>
                            <div style={{marginBottom:15}} className={classes.code}>
                                <center>
                                    <pre><code>
                                    {dialog}
                                    </code></pre>
                                    <Button style={{marginTop:7}} outlined onClick={()=>Kcopy(dialog).then(()=>setNotif('Client secret key copied',false))}>Copy</Button>
                                </center>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography><strong>*Please make sure you save the client secret key securely before you close this dialog.</strong></Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{setDialog(null),setDialogNew(false)}}>OK, I have saved it</Button>
                </DialogActions>
            </Dialog>
        </Header>
    );
}

export default withStyles(AppDetail,styles)