import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import CustomButton from 'portal/components/Button'
import {useRouter} from 'next/router'
import Popover from 'portal/components/Popover'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store';
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {ucwords} from '@portalnesia/utils'
import {Grid,Typography,TextField,FormControlLabel,FormGroup,Switch} from '@mui/material'
import {Help} from '@mui/icons-material'

export const getServerSideProps = wrapper(async({pn,resolvedUrl,res,query})=>{
    const token=query?.token;
    const crypto = (await import('portal/utils/crypto')).default
    if(token) {
        try {
            const decryptToken=crypto.decrypt(token);
            const objToken=JSON.parse(decryptToken);
            if(objToken?.login && pn?.user!==null && objToken?.userid!=pn?.user?.id) {
                return db.redirect();
            }
            if(objToken?.login && pn?.user===null) {
                return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
            }
            const not_jenis=['komentar','birthday','feature'];
            const not_type=['comment','birthday','feature'];
            const not_index=not_jenis.indexOf(objToken?.jenis);
            if(not_index === -1) {
                return db.redirect();
            }
            let email;
            if(objToken?.login) {
                email=await db.kata(`SELECT * FROM klekle_subcribe_email WHERE jenis=? AND userid=? LIMIT 1`,[objToken?.jenis,objToken?.userid]);
            } else {
                email=await db.kata(`SELECT * FROM klekle_subcribe_email WHERE jenis=? AND email=? LIMIT 1`,[objToken?.jenis,objToken?.email]);
            }
            email=email !== false ? email[0] : false;
            const type=ucwords(not_type[not_index]);
            const emaill=objToken?.login ? pn?.user?.user_email : objToken?.email;
            const name=objToken?.login ? pn?.user?.user_login : email!==false ? email?.name : objToken?.name;
            const subcribed = Boolean(email?.subcribe)===true ? true:false;
            const meta={
                login:Boolean(objToken?.login),
                type:type,
                email:emaill,
                name:name,
                subcribed:subcribed,
                input:{
                    name:name,
                    subcribe:subcribed
                }
            }
            return {props:{meta:meta}}
        } catch(err) {
            return db.redirect();
        }
    }
    return db.redirect();
})

const EmailPref=({meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {token}=router.query
    //const inputBaseStyles = shadeTextFieldStylesHook.useInputBase();
    //const inputLabelStyles = shadeTextFieldStylesHook.useInputLabel();
    const [loading,setLoading]=React.useState(false)
    const [input,setInput]=React.useState(meta?.input);
    const {post} = useAPI()
    const handleSubmit=(e)=>{
        e.preventDefault()
        setLoading(true);
        post(`/v1/setting/email-preferences?token=${token}`,input,{}).catch((err)=>{
        }).finally(()=>setLoading(false))
    }
    return(
        <Header title='Email Preferences' canonical='/email/preferences' noIndex>
            <Grid container justifyContent='center' spacing={2}>
                <Grid item xs={12} md={10} lg={8}>
                    <form onSubmit={handleSubmit}>
                        <PaperBlock title="Email Preferences" whiteBg
                        footer={
                            <CustomButton type="submit" disabled={loading} loading={loading} icon='save'>Save</CustomButton>
                        }
                        >
                            <Grid container justifyContent='center' spacing={2}>
                                <Grid item xs={12} md={10} lg={8}>
                                    <TextField
                                        key='output-text'
                                        variant='outlined'
                                        fullWidth
                                        label="Notification Type"
                                        value={meta?.type}
                                        inputProps={{readOnly:true}}
                                    />
                                </Grid>
                                <Grid item xs={12} md={10} lg={8}>
                                    <TextField
                                        key='output-text'
                                        variant='outlined'
                                        fullWidth
                                        label="Email"
                                        value={meta?.email}
                                        inputProps={{readOnly:true}}
                                    />
                                </Grid>
                                <Grid item xs={12} md={10} lg={8}>
                                    <TextField
                                        key='output-text'
                                        variant='outlined'
                                        fullWidth
                                        label={meta?.login ? "Username" : "Name"}
                                        value={input?.name}
                                        inputProps={{readOnly:(meta?.login||loading)}}
                                        required={!meta?.login}
                                        onChange={e=>setInput({...input,name:e.target.value})}
                                    />
                                </Grid>
                                <Grid item xs={12} md={10} lg={8}>
                                    <FormGroup key='output-switch'>
                                        <FormControlLabel
                                        style={{marginTop:0}}
                                        control={
                                            <Switch disabled={loading} checked={input?.subcribe} onChange={e=>setInput({...input,subcribe:e.target.checked})} color="primary" />
                                        }
                                        label={
                                            <div style={{display:'flex',alignItems:'center'}}>
                                                <Typography variant='body1' component='p' style={{marginRight:10}}>Subcribe</Typography>
                                                <Popover icon={<Help />}>Receive email notification?</Popover>
                                                
                                            </div>
                                        }
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </PaperBlock>
                    </form>
                </Grid>
            </Grid>
        </Header>
    )
}

export default EmailPref