import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import PaperBlock from 'portal/components/PaperBlock'
import Select from 'portal/components/Select'
import Unlayer from 'portal/components/Unlayer'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store';
import db from 'portal/utils/db'
import useAPI from 'portal/utils/api'
import useSWR from 'portal/utils/swr'
import {useRouter} from 'next/router'
import {Typography,Grid,TextField,Autocomplete,Checkbox,FormGroup,FormControlLabel,CircularProgress,IconButton,Hidden} from '@mui/material'
import {ucwords} from '@portalnesia/utils'
import {useMousetrap,useBeforeUnload} from 'portal/utils/useKeys'
import dynamic from 'next/dynamic'
import {isMobile} from 'react-device-detect'
import ReCaptcha from 'portal/components/ReCaptcha'
import {Close as CloseIcon,Cancel as CancelIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,CheckBox as CheckBoxIcon,TextSnippet,ContentCopy} from '@mui/icons-material'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export const getServerSideProps = wrapper(async({pn,params})=>{
    const slug = params?.slug;
    if(pn?.user === null || !pn?.user?.admin) return db.redirect();

    if(slug?.[0] !== "edit" && slug?.[0] !== "new") return db.redirect();

    if(slug?.[0] === "edit" && typeof slug?.[1] === "undefined" || slug?.[0] === "new" && typeof slug?.[1] !== "undefined" || ['new','edit'].indexOf(slug?.[0]) === -1) {
        return db.redirect();
    }

    const crypto = require('crypto');
    const signature = crypto.createHmac("sha256","mYqKDY7vi1ePcjhP8LFf86E54L0UyJKG5PSAkjBithzQvyFd7D95otMlf4ZCZ15d").update(`${pn.user.id}`).digest('hex');

    const meta={
        title:"New Mailing List",
        signature
    }

    if(slug?.[0]==='edit') {
        const milis = await db.get("mailing",{id:slug[1]},{limit:1});
        if(!milis) return db.redirect();

        const {next_send,datetime,html,userid,email,pn_user,...rest} = milis;
        meta.title = "Edit Mailing List";
        meta.milis = {
            ...rest,
            email,
            pn_user
        };
        let chipVal;
        if(pn_user === null) chipVal=[];
        else {
            let em = pn_user.split("\n");
            const ask = em.map(()=>"?");
            const user = await db.kata(`SELECT id,user_login as 'username' FROM klekle_users WHERE id IN (${ask.join(",")})`,em);
            chipVal = user||[]
        }
        meta.chipVal = chipVal;
    }
    return {props:{meta}}
});

const iconAutoComplete = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIconAutoComplete = <CheckBoxIcon fontSize="small" />;

function getDefaultValue(meta) {
    if(meta?.milis) {
        const {log,sended,sended_to,...rest} = meta?.milis;
        return rest
    } else {
        return {
            name:"",
            send_from:0,
            send_to:0,
            email:null,
            pn_user:null,
            subject:"",
            reply_to: null,
            design:"",
            subcribe_type: null
        }
    }
}

const email_opt=[["Portalnesia Support","support@portalnesia.com","Portalnesia Support"],["Portalnesia Info","info@portalnesia.com","Portalnesia"]];
const subcribe_type = [[null,'null'],['feature',"Feature"]]
export default function MailingListDetail({meta,err}){
    if(err) return <ErrorPage statusCode={err} />
    const router = useRouter();
    const slug = router?.query?.slug
    const isEditPost = React.useMemo(()=>slug?.[0]!=='new',[slug]);

    const {post,put,get} = useAPI();

    const [value,setValue]=React.useState(getDefaultValue(meta));
    const [loading,setLoading]=React.useState(null);
    const [canChange,setCanChange]=React.useState(true)
    const [sendToAllUser,setSendToAllUser]=React.useState(meta?.milis && (meta?.milis?.pn_user !== null && meta?.milis?.pn_user?.length > 0) ? false : true)
    const [openUsername,setOpenUsername]=React.useState(false)
    const [loadingUsername,setLoadingUsername]=React.useState(false);
    const [option,setOption]=React.useState(['']);
    const [chipVal,setChipVal]=React.useState(meta?.chipVal||[]);
    const [isSending,setIsSending]=React.useState(meta?.milis && meta?.milis?.sended === false && meta?.milis?.sended_to !== null ? true : false);
    const [openLog,setOpenLog] = React.useState(false)

    const {data:log,error:errorLog,mutate:mutateLog,isValidating:isValidatingLog} = useSWR(isEditPost ? `/v1/admin/mailing/${slug?.[1]}/logs` : null)
    
    const captchaRef=React.useRef(null);
    const editorRef = React.useRef(null);

    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit(e)
    },true)

    useBeforeUnload(canChange,`/admin/mailing-list/${slug[0]}${slug?.[1] ? `/${slug[1]}` : ''}`);

    const handleChange=React.useCallback((name,val)=>{
        setCanChange(false)
        setValue(prev=>({
            ...prev,
            [name]:val
        }))
    },[setValue])

    const handleUsernameChange=React.useCallback((event, newValue) => {
        if(newValue) {
            setCanChange(false)
            const pn_user = newValue.map(n=>n.id).join("\n");
            setValue({
                ...value,
                pn_user
            })
            setChipVal(newValue);
        }
    },[value,setChipVal])

    const handleSendToPortalnesiaUser=React.useCallback((_,checked)=>{
        setCanChange(false)
        if(checked) {
            setSendToAllUser(true);
            setValue(prev=>({...prev,send_to:1}))
        } else {
            setValue(prev=>({...prev,send_to:0}))
        }
    },[setValue])

    const handleSendToAllPortalnesiaUser=React.useCallback((_,checked)=>{
        setCanChange(false)
        if(checked) {
            setChipVal([])
            setSendToAllUser(true)
            setValue(prev=>({
                ...prev,
                pn_user:null,
            }))
        } else {
            setSendToAllUser(false);
            setValue(prev=>({
                ...prev,
                pn_user:""
            }))
        }
    },[setValue])

    const handleInputChange=(e,value,reason)=>{
        if(reason==="input") {
            const filter=option.filter(item=>item.id.toString().indexOf(value.toString()) > -1);
            if(filter?.length === 0){
                setLoadingUsername(true)
                get(`/v1/user/list?type=all&q=${encodeURIComponent(value)}`,{error_notif:false,success_notif:false})
                .then(([res])=>{
                    let b=option;
                    const prevOption = Object.values(option).map(o=>o.id);
                    res?.forEach((rs)=>{
                        if(prevOption.indexOf(rs.id)===-1) b=b.concat(rs)
                    })
                    setOption(b);
                }).catch((err)=>{
                    
                }).finally(()=>setLoadingUsername(false))
            }
        }
    }

    const onEditorLoad = React.useCallback((e)=>{
        if(editorRef.current && isEditPost && meta?.milis?.design !== null) {
            editorRef.current?.loadDesign(meta?.milis?.design);
        }
    },[meta,isEditPost])

    const handleCloseDialog=React.useCallback((type)=>(e,reason)=>{
        if(!reason || reason === 'escapeKeyDown') {
            if(type === 'log') {
                setOpenLog(false);
            }
        }
    },[])

    const handleSubmit=async(e)=>{
        if(e?.preventDefault) e?.preventDefault();
        setLoading('submit');
        editorRef.current?.exportHtml(async(data)=>{
            const {html,design} = data;
            try {
                const recaptcha = await captchaRef?.current?.execute()
                const req = {
                    ...value,
                    html,
                    design,
                    recaptcha
                }
                if(isEditPost) {
                    const [r] = await put(`/v1/admin/mailing/${slug[1]}`,req,{},{success_notif:true});
                    setCanChange(true);

                } else {
                    const [r] = await post(`/v1/admin/mailing`,req,{success_notif:true});
                    setTimeout(()=>{
                        router.push('/admin/mailing-list/[...slug]',`/admin/mailing-list/edit/${r.id}`);
                    },1000)
                }
            } catch {

            } finally {
                setLoading(null);
            }
        })
    }

    const handleSendMailingList=React.useCallback(async()=>{
        if(isEditPost) {
            setLoading('send');
            try {
                if(isSending) {
                    await post(`/v1/admin/mailing/${slug?.[1]}/cancel`);
                    setIsSending(false);
                } else {
                    await post(`/v1/admin/mailing/${slug?.[1]}`);
                    setIsSending(true);
                }
            } catch {

            } finally {
                setLoading(null);
            }
        }
    },[isEditPost,slug,post,isSending])

    const handleDuplicateMailingList=React.useCallback(async()=>{
        if(isEditPost) {
            setLoading('duplicate');
            try {
                const [r] = await post(`/v1/admin/mailing/${slug?.[1]}/duplicate`);
                setTimeout(()=>{
                    router.push('/admin/mailing-list/[...slug]',`/admin/mailing-list/edit/${r.id}`);
                },1000)
            } catch {

            } finally {
                setLoading(null);
            }
        }
    },[isEditPost,slug,post])

    React.useEffect(() => {
        if(openUsername && option.length<=1) {
            setLoadingUsername(true)
            get(`/v1/user/list?type=all`,{error_notif:false,success_notif:false})
            .then(([res])=>{
                setOption(res);
            }).catch((err)=>{
                
            }).finally(()=>setLoadingUsername(false))
        }
    }, [openUsername,option,get]);

    React.useEffect(()=>{
        setValue(getDefaultValue(meta));
        setSendToAllUser(meta?.milis && (meta?.milis?.pn_user !== null && meta?.milis?.pn_user?.length > 0) ? false : true);
        setChipVal(meta?.chipVal||[])
        setIsSending(meta?.milis && meta?.milis?.sended === false && meta?.milis?.sended_to !== null ? true : false)
    },[meta])

    return (
        <Header title={meta.title} canonical={slug?.[1] ? `/admin/mailing-list/edit/${slug?.[1]}` : '/admin/mailing-list/new'} noIndex active='admin' subactive='admin_milis_detail'>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <PaperBlock title="Setting" whiteBg
                            footer={
                                <div>
                                    {isEditPost && (
                                        <div class="flex-header">
                                            <Button sx={{mb:1}} outlined disabled={loading !== null} tooltip="View mailing list logs" endIcon={<TextSnippet />} onClick={()=>setOpenLog(true)}>Logs</Button>
                                            <Button sx={{mb:1}} outlined disabled={loading !== null} loading={loading==='duplicate'} tooltip="Duplicate mailing list" endIcon={<ContentCopy />} onClick={handleDuplicateMailingList}>Duplicate</Button>
                                        </div>
                                    )}
                                    <div class="flex-header">
                                        {isEditPost && <Button sx={{mb:1}} color="secondary" disabled={loading !== null} loading={loading==='send'} tooltip={isSending ? "Cancel sending mailing list" : "Send mailing list"} {...(isSending ? {endIcon:<CancelIcon />} : {icon:'send'})} onClick={handleSendMailingList}>{isSending ? "Cancel sending" : "Send"}</Button> }
                                        <Button disabled={loading !== null} loading={loading==='submit'} type="submit" tooltip="Save" icon='save'>Save</Button>
                                    </div>
                                </div>
                            }
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        value={value?.name||""}
                                        label="Name Mailing List"
                                        onChange={(e)=>handleChange('name',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        required
                                        disabled={loading !== null}
                                        helperText="Name of the mailing list"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={value?.subject||""}
                                        label="Subject Mailing List"
                                        onChange={(e)=>handleChange('subject',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        required
                                        disabled={loading !== null}
                                        helperText="Subject of the mailing list"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        value={value?.reply_to||""}
                                        label="Reply To Email"
                                        onChange={(e)=>handleChange('reply_to',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        disabled={loading !== null}
                                        helperText="Email ID, leave empty if not reply to an email"
                                    />
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <TextField
                                        select
                                        label="Send From"
                                        value={value?.send_from||0}
                                        onChange={(e)=>handleChange("send_from",Number(e.target.value))}
                                        SelectProps={{native:isMobile}}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        disabled={loading !== null}
                                        helperText="Email address used to send the mailing list"
                                    >
                                        {email_opt.map((cat,i)=><Select key={`${cat[1]}`} value={i}>{cat[1]}</Select>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <TextField
                                        select
                                        label="Mailing List"
                                        value={value?.subcribe_type||null}
                                        onChange={(e)=>handleChange("subcribe_type",e.target.value)}
                                        SelectProps={{native:isMobile}}
                                        variant="outlined"
                                        fullWidth
                                        disabled={loading !== null}
                                    >
                                        {subcribe_type.map((cat,i)=><Select key={`${cat[1]}-${i}`} value={cat[0]}>{cat[1]}</Select>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <FormGroup row>
                                        <FormControlLabel control={<Checkbox checked={value?.send_to===1} onChange={handleSendToPortalnesiaUser} />} label="Send to Portalnesia User" disabled={loading !== null} />
                                    </FormGroup>
                                </Grid>
                                {value?.send_to===1 && (
                                    <>
                                        <Grid item xs={12} lg={6}>
                                            <FormGroup row>
                                                <FormControlLabel control={<Checkbox checked={sendToAllUser} onChange={handleSendToAllPortalnesiaUser} />} label="Send to ALL Portalnesia User" disabled={loading !== null} />
                                            </FormGroup>
                                        </Grid>
                                        {!sendToAllUser && (
                                            <>
                                                <Grid item xs={12}>
                                                    <Autocomplete
                                                        multiple
                                                        open={openUsername}
                                                        value={chipVal}
                                                        onChange={handleUsernameChange}
                                                        onInputChange={handleInputChange}
                                                        clearOnBlur
                                                        disableCloseOnSelect
                                                        isOptionEqualToValue={(option, value) => option?.id == value.id}
                                                        getOptionLabel={(option) => option.username}
                                                        options={option}
                                                        loading={loadingUsername || option.length===0 && openUsername}
                                                        onOpen={() => {
                                                            setOpenUsername(true);
                                                        }}
                                                        onClose={() => {
                                                            setOpenUsername(false);
                                                        }}
                                                        disabled={loading||sendToAllUser}
                                                        renderOption={(props, option, { selected }) => (
                                                            <li {...props}>
                                                            <Checkbox
                                                                icon={iconAutoComplete}
                                                                checkedIcon={checkedIconAutoComplete}
                                                                style={{ marginRight: 8 }}
                                                                checked={selected}
                                                            />
                                                            {option.username}
                                                            </li>
                                                        )}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Portalnesia Username"
                                                                variant="outlined"
                                                                fullWidth
                                                                disabled={loading||sendToAllUser}
                                                                placeholder="Username"
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                    <React.Fragment>
                                                                        {loadingUsername ? <CircularProgress color="inherit" size={20} /> : null}
                                                                        {params.InputProps.endAdornment}
                                                                    </React.Fragment>
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </>
                                )}
                                <Grid item xs={12}>
                                    <TextField
                                        multiline
                                        label={`${value?.send_to===1 ? "Additional ":""}Email List`}
                                        value={value?.email||""}
                                        onChange={(e)=>handleChange("email",e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                        required={value?.send_to!==1}
                                        disabled={loading !== null}
                                        placeholder="example@portalnesia.com&#13;&#10;[Name](example@portalnesia.com)"
                                        helperText="Mailing list is sending to?&#13;&#10;Separate by new lines"
                                    />
                                </Grid>
                            </Grid>
                        </PaperBlock>
                    </Grid>
                    <Grid item xs={12}>
                        <PaperBlock title="Design" whiteBg>
                            <Hidden mdDown>
                                <Unlayer
                                    ref={editorRef}
                                    onReady={onEditorLoad}
                                    signature={meta?.signature}
                                    disabled={loading !== null}
                                    loading={loading === 'submit'}
                                    onSave={handleSubmit}
                                />
                            </Hidden>
                            <Hidden mdUp>
                                <Typography>Please use devices with bigger screen to edit your design!</Typography>
                            </Hidden>
                        </PaperBlock>
                    </Grid>
                </Grid>
            </form>
            <ReCaptcha ref={captchaRef} />
            <Dialog open={openLog} onClose={handleCloseDialog('log')} scroll='body' maxWidth='md' fullWidth>
                <DialogTitle>
                    <div className='flex-header'>
                        <Typography component='h2' variant='h6'>Mailing List Logs</Typography>
                        <IconButton onClick={handleCloseDialog('log')} size="large">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    {!log && !errorLog ? (
                        <div style={{margin:'20px auto',textAlign:'center'}}>
                            <CircularProgress thickness={5} size={50}/>
                        </div>
                    ) : errorLog ? (
                        <div>
                            <Typography>{errorLog}</Typography>
                        </div>
                    ) : log?.log === null || log?.log?.length === 0 ? (
                        <div>
                            <Typography>No data</Typography>
                        </div>
                    ) : (
                        <div>
                            {log?.log.split("\n").map((l,i)=>(
                                <Typography key={`log-${i}`}>{l}</Typography>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button disabled={isValidatingLog} loading={isValidatingLog} onClick={()=>mutateLog()}>Refresh</Button>
                </DialogActions>
            </Dialog>

        </Header>
    )
}