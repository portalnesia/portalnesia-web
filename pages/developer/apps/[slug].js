import React from 'react'
import Header from 'portal/components/developer/Header'
import Image from 'portal/components/Image'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import Sidebar from 'portal/components/Sidebar'
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {useMousetrap} from 'portal/utils/useKeys'
import {staticUrl} from 'portal/utils/Main'
import {useNotif} from 'portal/components/Notification'
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import ErrorPage from 'portal/pages/_error'
import {makeStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr'
import Recaptcha from 'portal/components/ReCaptcha'
import {useSelector} from 'react-redux'
import {Cancel as CancelIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,CheckBox as CheckBoxIcon} from '@mui/icons-material'
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
  Chip,
  Switch,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Browser=dynamic(()=>import('portal/components/Browser'))

export const getServerSideProps = wrapper(async({pn,req,resolvedUrl,params})=>{
  const slu=params.slug

  if(pn.user === null || !pn?.user?.admin) {
    return db.redirect();
  }

  if(pn.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);

  const apps = await db.kata(`SELECT block,user_id as userid,unik as id FROM klekle_oauth_clients WHERE unik = ? AND BINARY(unik) = BINARY(?) LIMIT 1`,[slu,slu]);
  
  if(!apps) {
    return db.redirect();
  }
  if(apps[0].userid==1 && pn?.user?.id!==2) {
    return db.redirect();
  } else if(apps[0].userid!=1 && apps[0].userid != pn?.user?.id) {
    return db.redirect();
  }

  if(apps[0].block==1) return {props:{meta:{err:'blocked'}}}

  const meta={
    apps:{
      id:apps[0].id
    }
  }
  return {props:{meta:meta}}
})

const iconAutoComplete = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIconAutoComplete = <CheckBoxIcon fontSize="small" />;

const useStyles = makeStyles()((theme)=>({
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
  code:{
    '& pre code':{
      background:theme.palette.action.hover,
      color:`${theme.palette.text.primary} !important`,
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
  },
  list:{
    marginBottom:10
  },
  component:{
    border:`1px solid ${theme.palette.divider}`,
    borderRadius:5,
    padding:5,
    marginTop:5
  }
}))

const grants_arr = [
  "authorization_code",
  "refresh_token",
  "client_credentials"
];
export default function DevAppsDetail({err,meta}) {
  if(err) return <ErrorPage statusCode={err} />

  const user = useSelector(state=>state?.user)
  const {classes} = useStyles();
  const {setNotif} = useNotif();
  const {put,get,post}=useAPI()
  const [input,setInput]=React.useState(null);
  const [loading,setLoading]=React.useState(null)
  const [generated,setGenerated] = React.useState(null)
  const [dialog,setDialog]=React.useState(false)
  const [openAutocomplete,setOpenAutocomplete] = React.useState(null)
  const [loadingUsername,setLoadingUsername]=React.useState(false);
  const [option,setOption]=React.useState([]);
  const [browser,setBrowser] = React.useState(false);
  const captchaRef = React.useRef();

  const {data:dataServer,error,mutate}=useSWR((meta?.apps?.id ? `/v1/developer/apps/${meta.apps.id}` : null));
  const {data:dataScopes,error:errorScopes} = useSWR(`/v1/developer/scopes`);

  const handleEdit=React.useCallback((name,value)=>{
    setInput(prev=>({...prev,[name]:value}))
  },[setInput])

  const handleRedirectUri=React.useCallback((name)=>(val)=>{
    setInput(prev=>({...prev,[name]:val.splice(0,5)}))
  },[setInput])

  const handleEditGrant=React.useCallback((name)=>(e)=>{
    const value = e?.target?.checked;
    if(value===true) {
      let a = [...input.grant_types];
      a.push(name)
      setInput((inp)=>({...inp,grant_types:a}))
    } else {
      const a = [...input.grant_types];
      const b = a.filter((scope) => scope !== name)
      setInput({...input,grant_types:b})
    }
  },[input])

  const handleAutocompleteChange=React.useCallback((name)=>(e,newValue)=>{
    if(newValue) {
      if(name==='test_users') {
        setInput((prev)=>({
          ...prev,
          [name]:newValue.slice(0,3)
        }))
      } else {
        setInput((prev)=>({
          ...prev,
          [name]:newValue.map(a=>a.id)
        }))
      }
    }
  },[setInput])

  const handleSelectedImage=React.useCallback((url)=>{
    setInput(prev=>({
      ...prev,
      icon:staticUrl(`img/url?image=${encodeURIComponent(url)}`)
    }))
  },[setInput])

  const handleRegenarate=React.useCallback(async()=>{
    setLoading('regenerate');
    try {
      const recaptcha = await captchaRef.current?.execute();
      const [r] = await post(`/v1/developer/apps/${meta?.apps?.id}`,{recaptcha});
      setGenerated(r?.key);
    } catch {}
    finally {
      setLoading(null)
    }
  },[post,meta])

  const handleSubmit = React.useCallback(async(e)=>{
    if(e && e?.preventDefault) e?.preventDefault();
    setLoading('submit');
    let cek_grant=[...(input?.grant_types||[])]
    cek_grant.forEach((g,i)=>{

      if(grants_arr.indexOf(g) < 0) {
        cek_grant.splice(i,1);
      }
    })
    const test_users_filter = input.test_users === null ? [] : input.test_users?.map(u=>u.id);
    const test_users = test_users_filter?.length > 0 ? test_users_filter : null
    const data = {...input,grant_types:cek_grant,test_users}
    try {
      const recaptcha = await captchaRef.current?.execute();
      await put(`/v1/developer/apps/${meta?.apps?.id}`,{...data,recaptcha});
    } catch {} 
    finally {
      setLoading(null);
    }

  },[input,put,meta])

  React.useEffect(()=>{
    if(dataServer && input === null) {
      const {client_id,id,user_id,...rest} = dataServer;
      setInput(rest);
    }
  },[dataServer,input])

  const scopes = React.useMemo(()=>{
    if(dataScopes && Array.isArray(dataScopes)) {
      return dataScopes.filter(s=>s?.approved);
    }
    return undefined;
  },[dataScopes])

  const handleInputChange=(e,value,reason)=>{
    if(reason==="input") {
      const filter=option.filter(item=>`${item.username}`.toLowerCase().indexOf(`${value}`.toLowerCase()) > -1);
      if(filter?.length === 0){
        setLoadingUsername(true)
        get(`/v1/user/list?type=all&q=${encodeURIComponent(value)}`,{error_notif:false,success_notif:false})
        .then(([res])=>{
          let b=option;
          const prevOption = Object.values(option).map(o=>o.id);
          res?.filter(r=>r?.username != user?.user_login)?.forEach((rs)=>{
              if(prevOption.indexOf(rs.id)===-1) b=b.concat(rs)
          })
          setOption(b);
        }).catch((err)=>{
            
        }).finally(()=>setLoadingUsername(false))
      }
    }
  }

  React.useEffect(() => {
    if(openAutocomplete==='user' && option.length === 0) {
        setLoadingUsername(true)
        get(`/v1/user/list?type=all`,{error_notif:false,success_notif:false})
        .then(([res])=>{
          const opt = res.filter(r=>r?.username != user?.user_login)
          setOption(opt);
        }).catch((err)=>{
            
        }).finally(()=>setLoadingUsername(false))
    }
  }, [openAutocomplete,option,get,user]);

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
              {!dataServer && !error ? (
                <Grid item xs={12}>
                  <div style={{margin:'20px auto',textAlign:'center'}}>
                    <CircularProgress thickness={5} size={50}/>
                  </div>
                </Grid>
              ) : error ? (
                <Grid item xs={12}>
                  <div style={{margin:'20px auto',textAlign:'center'}}>
                    <Typography variant="h6">{error}</Typography>
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
                            value={input?.name||""}
                            onChange={(e)=>handleEdit('name',e.target.value)}
                            variant='outlined'
                            fullWidth
                            required
                            disabled={loading !== null}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label='App Description'
                            value={input?.description||""}
                            onChange={(e)=>handleEdit('description',e.target.value)}
                            InputProps={{
                                className:classes.scrollBar
                            }}
                            variant='outlined'
                            fullWidth
                            multiline
                            rows={5}
                            disabled={loading !== null}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label='Website URL'
                            value={input?.website||""}
                            onChange={(e)=>handleEdit('website',e.target.value)}
                            variant='outlined'
                            fullWidth
                            disabled={loading !== null}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <RedirectUriComp
                            value={input?.origin||[]}
                            onChange={handleRedirectUri('origin')}
                            disabled={loading !== null}
                            label="Origin"
                            placeholder="https://"
                            helperText="Press 'enter' to submit urls"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            value={input?.scope||[]}
                            clearOnBlur
                            clearOnEscape
                            onChange={handleAutocompleteChange('scope')}
                            disableCloseOnSelect
                            disabled={loading !== null}
                            options={scopes||[]}
                            isOptionEqualToValue={(option, value) => option?.id == value }
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') {
                                  return option;
                              }
                              return option.id
                            }}
                            loading={!dataScopes && !errorScopes || !scopes}
                            open={openAutocomplete==='scope'}
                            onOpen={()=>setOpenAutocomplete('scope')}
                            onClose={()=>setOpenAutocomplete(null)}
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
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Scopes"
                                variant="outlined"
                                fullWidth
                                disabled={loading !== null}
                              />
                            )}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl disabled={loading !== null} component="fieldset">
                              <FormLabel component="legend">Authorization Flows</FormLabel>
                              <FormGroup>
                                {grants_arr.map((dt,i)=>(
                                  <FormControlLabel key={`grant-${i}`}
                                    control={<Checkbox checked={input?.grant_types?.indexOf(dt) !== -1} color="primary" onChange={handleEditGrant(dt)} name={dt} />}
                                    label={dt}
                                  />
                                ))}
                              </FormGroup>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <RedirectUriComp
                            value={input?.redirect_uri||[]}
                            onChange={handleRedirectUri('redirect_uri')}
                            disabled={loading !== null}
                            label="Callback URI"
                            placeholder="https://"
                            helperText="Press 'enter' to submit urls"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label='Terms of Service'
                            value={input?.terms_url||""}
                            onChange={(e)=>handleEdit('terms_url',e.target.value)}
                            variant='outlined'
                            fullWidth
                            required={(input?.grant_types?.indexOf('authorization_code') > -1)||false}
                            disabled={loading !== null}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label='Privacy Policy'
                            value={input?.privacy_url||""}
                            onChange={(e)=>handleEdit('privacy_url',e.target.value)}
                            variant='outlined'
                            fullWidth
                            required={(input?.grant_types?.indexOf('authorization_code') > -1)||false}
                            disabled={loading !== null}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Autocomplete
                            multiple
                            value={input?.test_users||[]}
                            disabled={loading!==null}
                            clearOnEscape
                            onChange={handleAutocompleteChange('test_users')}
                            onInputChange={handleInputChange}
                            clearOnBlur
                            disableCloseOnSelect
                            options={option}
                            isOptionEqualToValue={(option, value) => option?.id == value.id}
                            getOptionLabel={(option) => option.username}
                            loading={loadingUsername || option.length===0 && openAutocomplete==='user'}
                            open={openAutocomplete==='user'}
                            onOpen={()=>setOpenAutocomplete('user')}
                            onClose={()=>setOpenAutocomplete(null)}
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
                                label="Test Users"
                                variant="outlined"
                                fullWidth
                                disabled={loading !== null}
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
                    </PaperBlock>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Sidebar id='cardContent'>
                      <PaperBlock noPadding>
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
                          <Button disabled={loading !== null} outlined onClick={()=>setBrowser(true)}>Select Icon</Button>
                        </div>
                        <Divider key={1} />
                        <div key={2} className={classes.wrapper}>
                          <Grid container spacing={3} justifyContent='center'>
                            <Grid item xs={12}>
                              <TextField
                                label='Client ID'
                                onClick={()=>Kcopy(dataServer.client_id).then(()=>setNotif('Client ID copied',false))}
                                value={dataServer.client_id}
                                variant='outlined'
                                fullWidth
                                inputProps={{style:{cursor:'pointer'}}}
                                InputProps={{readOnly:true}}
                                disabled={loading !== null}
                                helperText="Click to copy"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label='Client Secret'
                                value={"AAAAAAAAAAAAAAAAAAAAAAAAAA"}
                                variant='outlined'
                                fullWidth
                                InputProps={{readOnly:true}}
                                type='password'
                                disabled
                              />
                            </Grid>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel control={
                                        <Switch disabled={loading !== null} checked={input?.publish||false} onChange={event=>handleEdit('publish',event.target.checked)} color="primary" />
                                    }
                                    label="Publish" />
                                </FormGroup>
                            </Grid>
                          </Grid>
                        </div>
                        <Divider key={3} />
                        <div key={12} className={classes.wrapper} style={{paddingBottom:0}}>
                          <div className="flex-header">
                            <Button disabled={loading !== null} onClick={()=>setDialog(true)} color='secondary'>Regenerate</Button>
                            <Button tooltip='Ctrl + S' type="submit" disabled={loading !== null} loading={loading === 'submit'} icon='save'>Save</Button>
                          </div>
                      </div>
                      </PaperBlock>
                    </Sidebar>
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </form>
      <Dialog open={dialog} aria-labelledby='dialog' maxWidth='md' scroll='body' {...(generated!==null ? {fullWidth:true} : {})}>
        <DialogTitle>{generated!==null ? 'Generated Client Secret' : `Regenerate Client Secret?`}</DialogTitle>
        {generated !== null && (
          <DialogContent dividers>
            <Grid container spacing={2} justifyContent='center'>
              <Grid item xs={12}>
                <div style={{marginBottom:15}} className={classes.code}>
                  <center>
                      <pre><code>
                      {generated}
                      </code></pre>
                      <Button outlined onClick={()=>Kcopy(generated).then(()=>setNotif('Client secret key copied',false))}>Copy</Button>
                  </center>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Typography>*Please make sure you save the client secret key securely before you close this dialog.</Typography>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          {generated !== null ? (
            <Button onClick={()=>{setGenerated(null),setDialog(false)}}>OK, I have saved it</Button>
          ) : (
            <>
              <Button onClick={()=>setDialog(false)} disabled={loading !== null} outlined>Cancel</Button>
              <Button onClick={handleRegenarate} disabled={loading !== null} loading={loading === 'regenerate'}>Regenerate</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
      <Recaptcha ref={captchaRef} />
    </Header>
  )
}

function RedirectUriComp({value=[],onChange,label,...rest}){
  const {classes} = useStyles();
  const [input,setInput] = React.useState('');

  const handleKeyDown = React.useCallback((e)=>{
    if(e?.keyCode === 13 && /\S/.test(input)) {
      if(e?.stopPropagation) e?.stopPropagation();
      if(e?.preventDefault) e?.preventDefault();
      const a = [...(value||[])]
      a.push(input);
      setInput("")
      if(onChange) onChange(a);
    }
  },[onChange,input,value])

  const handleRemove = React.useCallback((i)=>()=>{
    const data = [...(value||[])];
    data.splice(i,1);
    setInput("")
    if(onChange) onChange(data)
  },[onChange,value])

  return (
    <>
      <Typography color='text.secondary' variant='caption'>{label}</Typography>
      <div className={classes.component}>
        <div className={`${classes.list}`}>
          <Grid container spacing={1}>
            {value?.map((v,i)=>(
              <Grid key={`chip-${i}`} item xs="auto" zeroMinWidth>
                <Chip key={`chip-${i}`} label={v} onDelete={handleRemove(i)} />
              </Grid>
            ))}
          </Grid>
        </div>
        <TextField
          value={input}
          onChange={(e)=>setInput(e?.target?.value)}
          multiple
          onKeyDown={handleKeyDown}
          variant='outlined'
          fullWidth
          size='small'
          {...rest}
        />
      </div>
    </>
  )
}