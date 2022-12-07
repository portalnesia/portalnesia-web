import React from "react";
import DefaultLayout from "@layout/default";
import wrapper, { useSelector } from "@redux/store";
import { accountUrl, portalUrl, verifyToken } from "@utils/main";
import { SubscribeEmail } from "@model/session";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import Pages from "@comp/Pages";
import { ucwords } from "@portalnesia/utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import submitForm from "@utils/submit-form";
import useNotification from "@design/components/Notification";
import useAPI, { ApiError } from "@design/hooks/api";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Popover from "@design/components/Popover";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Recaptcha from "@design/components/Recaptcha";

type IData = {
    email: string
    input:{
        name: string,
        subcribe: boolean
    }
    login: boolean
    type: string
}

export const getServerSideProps = wrapper<IData>(async({resolvedUrl,redirect,query,session})=>{
    const tokenQuery = query?.token;
    if(typeof tokenQuery !== 'string') return redirect();
    const token = verifyToken<{login?:boolean,jenis?: string, slug?: string,userid?:string,name?:string,email?:string}>(tokenQuery,[1,'year']);

    if(token?.login && !session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    
    if(token?.login && session?.user?.id !== token.userid) return redirect();

    const not_jenis=['komentar','birthday','feature'];
    const not_type=['comment','birthday','feature'];
    const not_index=not_jenis.indexOf(token?.jenis||"");

    let subs: SubscribeEmail|undefined;
    if(token?.login) {
        const data = await SubscribeEmail.findOne({
            where:{
                jenis:token?.jenis,
                userid:session?.user?.id
            }
        })
        subs = data||undefined;
    } else {
        const data = await SubscribeEmail.findOne({
            where:{
                jenis:token?.jenis,
                email: token?.email
            }
        })
        subs = data||undefined;
    }
    const subcribe: boolean = subs ? subs.subcribe : true;
    const email = (token?.login ? session?.user?.user_email : token?.email) as string
    const name = (token?.login ? session?.user?.user_nama : token?.name) as string
    const type=ucwords(not_type[not_index]);
    return {
        props:{
            data:{
                email,
                input:{
                    name,
                    subcribe
                },
                login:Boolean(token?.token),
                type
            }
        }
    }
})

export default function EmailSubsPages({data}: IPages<IData>) {
    const router = useRouter();
    const token = router.query?.token;
    const user = useSelector(s=>s.user)
    const [input,setInput] = React.useState(data.input);
    const [loading,setLoading] = React.useState(false)
    const setNotif = useNotification();
    const {post} = useAPI();
    const captchaRef = React.useRef<Recaptcha>(null)

    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true);
            const recaptcha = await captchaRef.current?.execute();
            await post(`/v2/setting/email-preferences?token=${token}`,{...input,recaptcha});
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    }),[token,setNotif,post,token,input])

    return (
        <Pages title="Email Preferences" canonical="/email/preferences" noIndex>
            <DefaultLayout maxWidth='sm'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Email Notification</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <TextField
                                label="Notification Type"
                                value={data?.type}
                                inputProps={{readOnly:true}}
                                fullWidth
                                disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                label="Email"
                                value={data?.email}
                                inputProps={{readOnly:true}}
                                fullWidth
                                disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                label="Name"
                                value={input?.name}
                                onChange={e=>{!user && setInput({...input,name:e.target.value})}}
                                {...(user ? {inputProps:{readOnly:true}} : {})}
                                fullWidth
                                disabled={loading}
                                required={!user}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box display='flex'>
                                    <FormGroup key='output-switch'>
                                        <FormControlLabel
                                            control={
                                                <Switch disabled={loading} checked={input?.subcribe} onChange={e=>setInput({...input,subcribe:e.target.checked})} color="primary" />
                                            }
                                            label={
                                                <Stack direction='row' spacing={2}>
                                                    <Typography variant='body1' component='p'>Subcribe</Typography>
                                                    <Popover paperSx={{width:'unset'}} icon={'ic:outline-help-outline'}>Receive email notification?</Popover>
                                                </Stack>
                                            }
                                        />
                                    </FormGroup>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={5}>
                        <Button disabled={loading} loading={loading} icon='save' type='submit'>Save</Button>
                    </Box>
                </form>
            </DefaultLayout>
            <Recaptcha ref={captchaRef} />
        </Pages>
    )
}