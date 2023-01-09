import Pages from "@comp/Pages";
import wrapper, { BackendError, useSelector } from "@redux/store";
import { staticUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useAPI, {  } from "@design/hooks/api";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import { IPages, Without } from "@type/general";
import Recaptcha from "@design/components/Recaptcha";
import submitForm from "@utils/submit-form";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { copyTextBrowser, isURL } from "@portalnesia/utils";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import dynamic from "next/dynamic";
import PaperBlock from "@design/components/PaperBlock";
import { AppsDetail, IScopes } from "@model/developer";
import useSWR from "@design/hooks/swr";
import DeveloperLayout from "@layout/developer";
import Textarea from "@design/components/Textarea";
import Chip from "@mui/material/Chip";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import CircularProgress from "@mui/material/CircularProgress";

const Dialog = dynamic(()=>import("@design/components/Dialog"));
const FileManager = dynamic(()=>import("@comp/FileManager"));
const Image = dynamic(()=>import("@comp/Image"));

export const getServerSideProps = wrapper<AppsDetail>(async({redirect,session,params,resolvedUrl,fetchAPI})=>{
    if(!session || !session.user.isAdmin('developer')) return redirect();

    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const data: AppsDetail = await fetchAPI<AppsDetail>(`/v2/developer/apps/${slug}`);
        return {
            props:{
                data,
                meta:{
                    title:"Edit Apps - Developer"
                }
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})

const iconAutoComplete = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIconAutoComplete = <CheckBox fontSize="small" />;

const grants_arr = [
    "authorization_code",
    "refresh_token",
    "client_credentials"
];
  
type UsernameList = {
    id: number
    username: string
}
type InputData = Without<AppsDetail,'id'|'test_users'>

export default function DeveloperAppsDetail({data:{id,test_users,...data},meta}: IPages<AppsDetail>) {
    const user = useSelector(s=>s.user);
    const {put,get,post}=useAPI()
    const setNotif = useNotification();
    const [loading,setLoading]=React.useState<string>()
    const [generated,setGenerated] = React.useState<string>()
    const [dialog,setDialog]=React.useState(false)
    const [input,setInput] = React.useState<InputData>(data);
    const [testUsers,setTestUsers] = React.useState<number[]>([])
    const [openAutocomplete,setOpenAutocomplete] = React.useState<string>()
    const [loadingUsername,setLoadingUsername]=React.useState(false);
    const [option,setOption]=React.useState<UsernameList[]>([]);
    const [browser,setBrowser] = React.useState(false);
    const captchaRef = React.useRef<Recaptcha>(null);

    const {data:dataScopes,error:errorScopes} = useSWR<IScopes[]>(`/v2/developer/scopes/${id}`);

    const handleChange=React.useCallback(<K extends keyof typeof input,V = (typeof input)[K]>(name:K,val:V)=>{
        setInput({...input,[name]:val})
    },[input])

    const handleRedirectUri = React.useCallback((name: 'origin'|'redirect_uri')=>(val: string[])=>{
        const value = val.splice(0,5);
        setInput(prev=>({...prev,[name]:value}))
    },[setInput])

    const handleEditGrant=React.useCallback((name: string)=>(e: React.ChangeEvent<HTMLInputElement>)=>{
        const value = e?.target?.checked;
        if(value===true) {
          let a = [...(input.grant_types||[])];
          a.push(name)
          setInput((inp)=>({...inp,grant_types:a}))
        } else {
          const a = [...(input.grant_types||[])];
          const b = a.filter((scope) => scope !== name)
          setInput({...input,grant_types:b})
        }
    },[input])

    const handleInputChange = React.useCallback((_: any,value: string,reason: any)=>{
        if(reason === "input") {
            const filter=option.filter(item=>`${item.username}`.toLowerCase().indexOf(`${value}`.toLowerCase()) > -1);

            if(filter?.length === 0) {
                setLoadingUsername(true);
                get<UsernameList[]>(`/v2/user/list?type=all&q=${encodeURIComponent(value)}`,{success_notif:false})
                .then((res)=>{
                let b=option;
                const prevOption = Object.values(option).map(o=>o.id);
                res?.filter(r=>user && r?.username != user?.username)?.forEach((rs)=>{
                    if(prevOption.indexOf(rs.id)===-1) b=b.concat(rs)
                })
                setOption(b);
                }).catch((err)=>{
                    
                }).finally(()=>setLoadingUsername(false))
            }
        }
        //else console.log(reason)
    },[option,get,user])

    const handleAutocompleteChange=React.useCallback(<K extends 'scope'|'test_users'>(name: K)=>(_: any,newValue: K extends 'scope' ? IScopes[] : UsernameList[])=>{
        if(newValue) {
          if(name==='test_users') {
            const tmpArray = newValue as UsernameList[];
            //console.log(tmpArray);
            setTestUsers(tmpArray.slice(0,3).map(u=>u.id))
          } else {
            setInput((prev)=>({
              ...prev,
              [name]:newValue.map(a=>a.id)
            }))
          }
        }
    },[setInput])

    const handleSelectedImage=React.useCallback((url: string)=>{
        setInput(prev=>({
          ...prev,
          icon:staticUrl(`img/url?image=${encodeURIComponent(url)}`)
        }))
    },[setInput])

    const scopes = React.useMemo(()=>{
        if(dataScopes && Array.isArray(dataScopes)) {
          return dataScopes.filter(s=>s?.approved);
        }
        return undefined;
    },[dataScopes]);

    const scopesValue = React.useMemo(()=>{
        if(dataScopes) {
            const scope = dataScopes.filter(s=>(input?.scope||[]).includes(s.id));
            return scope;
        }
        return [];
    },[input?.scope,dataScopes])

    const testUsersValue = React.useMemo(()=>{
        function filtering(s: {id: number}) {
            return testUsers.includes(s.id);
        }
        if(testUsers?.length <= 0) return [];
        let test = option.filter(filtering);
        if(test.length === 0) test = test.concat(test_users?.filter(filtering).map(s=>({id:s.id,username:s.username})));
        return test;
    },[testUsers,option,test_users])

    const handleRegenarate=React.useCallback(async()=>{
        setLoading('regenerate');
        try {
          const recaptcha = await captchaRef.current?.execute();
          const r = await post<{key: string}>(`/v2/developer/apps/${id}`,{recaptcha});
          setGenerated(r?.key);
        } catch {}
        finally {
          setLoading(undefined)
        }
    },[post,id])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading('submit');
            
            const recaptcha = await captchaRef.current?.execute();
            const data = {
                ...input,
                test_users:testUsers,
                recaptcha
            }

            await put(`/v2/developer/apps/${id}`,data);
            
        } catch(e) {

        } finally {
            setLoading(undefined);
        }
    }),[put,setNotif,id,input,testUsers])

    React.useEffect(() => {
        if(openAutocomplete==='user' && option.length === 0) {
            setLoadingUsername(true)
            get<UsernameList[]>(`/v2/user/list?type=all`,{success_notif:false})
            .then((res)=>{
              const opt = res.filter(r=>user && r?.username != user.username)
              setOption(opt);
            }).catch((err)=>{
                
            }).finally(()=>setLoadingUsername(false))
        }
    }, [openAutocomplete,option,get,user]);

    return (
        <Pages title={meta?.title} canonical={`/developer/apps/${id}`} noIndex>
            <DeveloperLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Edit Apps</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} lg={8}>
                            <Box id='apps-content'>
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        <TextField
                                            value={input?.name || ''}
                                            label="Name"
                                            fullWidth
                                            onChange={event=>handleChange('name',event.target.value)}
                                            required
                                            disabled={loading!==undefined}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Textarea
                                            value={input?.description || ''}
                                            label="Description"
                                            fullWidth
                                            multiline
                                            rows={5}
                                            onChange={event=>handleChange('description',event.target.value)}
                                            disabled={loading!==undefined}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            value={input?.website || ''}
                                            label="Website URL"
                                            fullWidth
                                            onChange={event=>handleChange('website',event.target.value)}
                                            disabled={loading!==undefined}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <UriComponent
                                            value={input?.origin||[]}
                                            onChange={handleRedirectUri('origin')}
                                            disabled={loading !== undefined}
                                            label="Origin"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        value={scopesValue}
                                        clearOnBlur
                                        clearOnEscape
                                        onChange={handleAutocompleteChange('scope')}
                                        disableCloseOnSelect
                                        disabled={loading !== undefined}
                                        options={scopes||[]}
                                        isOptionEqualToValue={(option, value) => option?.id === value.id }
                                        getOptionLabel={(option) => {
                                            if (typeof option === 'string') {
                                                return option;
                                            }
                                            return option.id
                                        }}
                                        loading={!dataScopes && !errorScopes || !scopes}
                                        open={openAutocomplete==='scope'}
                                        onOpen={()=>setOpenAutocomplete('scope')}
                                        onClose={()=>setOpenAutocomplete(undefined)}
                                        renderOption={(props, option, { selected }) => (
                                            <li {...props}>
                                                <Checkbox
                                                    icon={iconAutoComplete}
                                                    checkedIcon={checkedIconAutoComplete}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                />
                                                {option.id}
                                            </li>
                                        )}
                                        renderInput={(params: any) => (
                                            <TextField
                                                {...params}
                                                label="Scopes"
                                                fullWidth
                                                disabled={loading !== undefined}
                                            />
                                        )}
                                    />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl disabled={loading !== undefined}>
                                            <FormLabel>Authorization Flows</FormLabel>
                                            <FormGroup>
                                                {grants_arr.map((dt)=>(
                                                    <FormControlLabel key={dt}
                                                        control={<Checkbox checked={input?.grant_types?.indexOf(dt) !== -1} color="primary" onChange={handleEditGrant(dt)} name={dt} />}
                                                        label={dt}
                                                    />
                                                ))}
                                            </FormGroup>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <UriComponent
                                            value={input?.redirect_uri||[]}
                                            onChange={handleRedirectUri('redirect_uri')}
                                            disabled={loading !== undefined}
                                            label="Callback URI"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            value={input?.terms_url || ''}
                                            label="Terms of Service"
                                            fullWidth
                                            onChange={event=>handleChange('terms_url',event.target.value)}
                                            required={((input?.grant_types||[])?.indexOf('authorization_code') > -1)||false}
                                            disabled={loading!==undefined}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            value={input?.privacy_url || ''}
                                            label="Privacy Policy"
                                            fullWidth
                                            onChange={event=>handleChange('privacy_url',event.target.value)}
                                            required={((input?.grant_types||[])?.indexOf('authorization_code') > -1)||false}
                                            disabled={loading!==undefined}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Autocomplete
                                            multiple
                                            value={testUsersValue}
                                            disabled={loading!==undefined}
                                            clearOnEscape
                                            onChange={handleAutocompleteChange('test_users')}
                                            onInputChange={handleInputChange}
                                            clearOnBlur
                                            disableCloseOnSelect
                                            options={option}
                                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                            getOptionLabel={(option) => option?.username}
                                            loading={loadingUsername || option.length===0 && openAutocomplete==='user'}
                                            open={openAutocomplete==='user'}
                                            onOpen={()=>setOpenAutocomplete('user')}
                                            onClose={()=>setOpenAutocomplete(undefined)}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                    icon={iconAutoComplete}
                                                    checkedIcon={checkedIconAutoComplete}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                    />
                                                    {option?.username||""}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Test Users"
                                                    variant="outlined"
                                                    fullWidth
                                                    disabled={loading !== undefined}
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
                                </Grid>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <PaperBlock title="Options" content={{sx:{px:0}}}>
                                <Stack alignItems='flex-start' spacing={3}>
                                    <Box px={2} width='100%'>
                                        <Typography variant='h6' component='h6' gutterBottom>Post Thumbnail</Typography>
                                        {input?.icon!==null && input?.icon?.length > 0 && (
                                            <Stack mb={2}><Image alt="Thumbnail" src={`${input?.icon}&size=350&watermark=no`} dataSrc={`${input?.icon}&watermark=no`} fancybox webp sx={{width:'100%',maxHeight:350,objectFit:'contain'}} /></Stack>
                                        )}
                                        <Stack direction='row' spacing={1}>
                                            <Button outlined color='inherit' sx={{width:'100%'}} onClick={()=>setBrowser(true)}>{input?.icon!==null && input?.icon?.length > 0 ? "Change" : "Select"}</Button>
                                            {input?.icon!==null && input?.icon?.length > 0 && <Button outlined color='inherit' sx={{width:'100%'}} onClick={()=>handleChange('icon','')}>Remove</Button>}
                                        </Stack>
                                    </Box>

                                    <Divider sx={{width:'100%'}} />

                                    <Box px={2} width='100%'>
                                        <TextField
                                            label="Client ID"
                                            fullWidth
                                            defaultValue={id}
                                            InputProps={{readOnly:true}}
                                            onClick={()=>copyTextBrowser(id).then(()=>setNotif("Cliend ID copied",'default'))}
                                        />
                                    </Box>

                                    <Divider sx={{width:'100%'}} />

                                    <Box px={2} width='100%'>
                                        <TextField
                                            label="Client Secret"
                                            fullWidth
                                            defaultValue={"AAAAAAAAAAAAAAAAAAAAAAAAAA"}
                                            InputProps={{readOnly:true}}
                                            type="password"
                                            disabled
                                        />
                                        <Button disabled={loading !== undefined} sx={{width:'100%',mt:1}} tooltip="Regenerate client secret" color="error" onClick={()=>setDialog(true)}>Regenerate</Button>
                                    </Box>

                                    <Divider sx={{width:'100%'}} />

                                    <Box px={2} width='100%'>
                                        <Grid item xs={12}>
                                            <FormGroup>
                                                <FormControlLabel control={
                                                    <Switch disabled={loading!==undefined} checked={input.publish} onChange={event=>handleChange('publish',event.target.checked)} color="primary" />
                                                }
                                                label="Publish" />
                                            </FormGroup>
                                        </Grid>
                                    </Box>

                                    <Divider sx={{width:'100%'}} />

                                    <Box px={2} width='100%'>
                                        <Button sx={{width:'100%'}} icon='save' type='submit' disabled={loading !== undefined} loading={loading==='submit'}>Save</Button>
                                    </Box>
                                </Stack>
                            </PaperBlock>
                        </Grid>
                    </Grid>
                </form>
            </DeveloperLayout>
            <Recaptcha ref={captchaRef} />
            <FileManager open={browser} onSelected={handleSelectedImage} handleClose={()=>setBrowser(false)} />
            <Dialog open={dialog} title={generated ? "Generated Client Secret" : "Regenerate Client Secret?"} titleWithClose={false}
                actions={generated ? (
                    <Button onClick={()=>{setGenerated(undefined),setDialog(false)}}>OK, I have saved it</Button>
                ) : (
                    <>
                        <Button onClick={()=>setDialog(false)} disabled={loading !== undefined} outlined color="inherit">Cancel</Button>
                        <Button onClick={handleRegenarate} disabled={loading !== undefined} loading={loading === 'regenerate'}>Regenerate</Button>
                    </>
                )}
            >
                {generated && (
                    <>
                        <Grid container spacing={1} alignItems='center'>
                            <Grid xs={12} sm={10}>
                                <pre>
                                    <code>{generated}</code>
                                </pre>
                            </Grid>
                            <Grid xs={12} sm={2}>
                                <Button size="small" color="inherit" sx={{width:'100%'}} outlined onClick={()=>copyTextBrowser(generated||"").then(()=>setNotif('Client secret key copied','default'))}>Copy</Button>
                            </Grid>
                        </Grid>

                        <Box mt={5}>
                            <Typography gutterBottom>Please make sure you save the client secret key securely before you close this dialog.</Typography>
                            <Typography>This secret key will not be displayed again. If you forget the code, you have to generate it again</Typography>
                        </Box>
                    </>
                )}
            </Dialog>
        </Pages>
    )
}

type UriComponentProps = Partial<Without<InputBaseProps,'value'|'onChange'>> & {
    value: string[]
    onChange?(value: string[]): void
    label: string
}
function UriComponent({value,onChange,label,...props}: UriComponentProps) {
    const setNotif = useNotification();
    const [input,setInput] = React.useState('');

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        if(e?.keyCode === 13 && /\S/.test(input)) {
          if(e?.stopPropagation) e?.stopPropagation();
          if(e?.preventDefault) e?.preventDefault();

          try {
            new URL(input);
          } catch {
            return setNotif("Please provide a valid URI",true);
          }

          const a = [...(value||[])]
          a.push(input);
          setInput("")
          if(onChange) onChange(a);
        }
    },[onChange,input,value,setNotif])

    const handleRemove = React.useCallback((i: number)=>()=>{
        const data = [...(value||[])];
        data.splice(i,1);
        setInput("")
        if(onChange) onChange(data)
    },[onChange,value])

    return (
        <>
            

            <Box position='relative' border={t=>`1px solid ${t.palette.divider}`} borderRadius={1} p={1} mb={0.5}>
                <Box position='absolute' left={8} top={-14} px={1} bgcolor="background.default">
                    <Typography color="text.secondary" variant='caption'>{label}</Typography>
                </Box>
                
                <Box mt={1} mb={1}>
                    <Grid container spacing={1}>
                        {value?.map((v,i)=>(
                            <Grid key={`chil-${i}`} item xs="auto" zeroMinWidth>
                                <Chip label={v} onDelete={handleRemove(i)} />
                            </Grid>
                        ))}
                        {value.length < 5 && (
                            <Grid key={`textarea`} item xs="auto" zeroMinWidth>
                                <InputBase
                                    value={input || ''}
                                    onChange={e=>setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    size="small"
                                    sx={{
                                        ...props?.sx,
                                        mt:0.5
                                    }}
                                    placeholder="Press enter to add uri"
                                    {...props}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Box>
        </>
    )
}