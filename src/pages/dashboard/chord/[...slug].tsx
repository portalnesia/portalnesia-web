import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper, { BackendError } from "@redux/store";
import { accountUrl, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useAPI, { ApiError, PaginationResponse } from "@design/hooks/api";
import { ChordDetail } from "@model/chord";
import { Div } from "@design/components/Dom";
import { Fullscreen, FullscreenExit } from "@mui/icons-material";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import { CopyPartial, IPages } from "@type/general";
import Router, { useRouter } from "next/router";
import Recaptcha from "@design/components/Recaptcha";
import { useBeforeUnload, useMousetrap } from "@hooks/hotkeys";
import Autocomplete, { AutocompleteInputChangeReason, createFilterOptions } from "@mui/material/Autocomplete";
import Chord, { uChord } from "@comp/Chord";
import submitForm from "@utils/submit-form";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { parseURL } from "@portalnesia/utils";
import TextField from "@mui/material/TextField";
import { Circular } from "@design/components/Loading";
import Textarea from "@design/components/Textarea";
import { FilterOptionsState } from "@mui/material/useAutocomplete";
import Divider from "@mui/material/Divider";

type IChordEdit = Pick<CopyPartial<ChordDetail,'link'|'slug'>,'title'|'artist'|'original'|'text'|'link'|'slug'|'publish'>
const defaultText = {
    original:"#Intro\n\n\n#Verse\n\n\n\n\n#Bridge\n\n\n#Reff",
    text:"{c:Intro}\n\n\n{c:Verse}\n\n\n\n\n{c:Bridge}\n\n\n{c:Reff}"
}

export const getServerSideProps = wrapper<IChordEdit>(async({redirect,session,params,resolvedUrl,fetchAPI})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    const slug = params?.slug;
    if(!Array.isArray(slug)) return redirect();
    if(typeof slug?.[0] !== 'string') return redirect();
    
    if(slug[0] === 'new') {
        const data: IChordEdit = {
            title:"",
            artist:"",
            publish:false,
            ...defaultText
        }
        return {
            props:{
                data,
                meta:{
                    title:"New Chord"
                }
            }
        }
    } else {
        try {
            const data: ChordDetail = await fetchAPI<ChordDetail>(`/v2/chord/dashboard/${slug[0]}`);
            return {
                props:{
                    data,
                    meta:{
                        title:"Edit Chord"
                    }
                }
            }
        } catch(e) {
            if(e instanceof BackendError) {
                if(e?.status === 404) return redirect();
            }
            throw e;
        }
        
    }
})

type IArtist = {artist:string,slug_artist:string}

export default function EditChordPages({data,meta}: IPages<IChordEdit>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const captchaRef = React.useRef<Recaptcha>(null);
    const [value,setValue]=React.useState(data);
    const [option,setOption]=React.useState<string[]>([]);
    const [openArtist,setOpenArtist]=React.useState(false);
    const [loadingArtist,setLoadingArtist]=React.useState(true)
    const [loading,setLoading]=React.useState(false)
    const [fullscreen,setFullscreen]=React.useState(false)
    const {get,post,put} = useAPI()
    const setNotif = useNotification();
    const editorRef = React.useRef<HTMLDivElement>(null)
    const resultRef = React.useRef<HTMLDivElement>(null)
    const [canChange,setCanChange]=React.useState(true)
    const [rows,setRows] = React.useState(30);
    useBeforeUnload(canChange,`/dashboard/chord/${slug?.[0]}`)
    const filter = createFilterOptions<string>();
    const loadingRef = React.useRef(false);

    const handleChange=React.useCallback(<K extends keyof IChordEdit,V = IChordEdit[K]>(name: K,val: V)=>{
        setCanChange(false)
        setValue({
            ...value,
            [name]:val
        })
    },[value])

    const handleEditorChange=React.useCallback((val: string)=>{
        const res = uChord(val,false);
        setValue({
            ...value,
            original:val,
            text:res
        })
    },[value])

    const handleArtistChange=React.useCallback((_:any, newValue: string|null) => {
        if(slug?.[0]==='new') {
            console.log(newValue)
            setCanChange(false)
            let val = ""
            if(typeof newValue === 'string') {
                setValue({
                    ...value,
                    artist:"",
                });
                val = newValue
            } else {
                setValue({
                    ...value,
                    artist:"",
                });
            }
        }
    },[value,slug])

    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            const recaptcha = await captchaRef.current?.execute();
            if(slug?.[0] !== "new") {
                await put(`/v2/chord/${data.slug}`,{...value,recaptcha},{},{success_notif:true});
                setCanChange(true)
            } else {
                const res = await post<{slug?:string}>("/v2/chord",{...value,recaptcha},{},{success_notif:true});
                setCanChange(true)
                if(res?.slug) {
                    setTimeout(()=>{
                        Router.push(`/dashboard/chord/${res.slug}`);
                    },500)
                }
            }
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    }),[slug,post,put,setNotif,value,data])

    const handleInputArtistChange = React.useCallback((e:any,value:string,reason:AutocompleteInputChangeReason)=>{
        if(reason === 'input' && slug?.[0] === 'new' && !loadingRef.current) {
            loadingRef.current = true;
            setTimeout(()=>{
                const filtered=option.filter(item=>item.toLowerCase().indexOf(value.toLowerCase()) > -1);
                if(filtered?.length === 0) {
                    get<PaginationResponse<IArtist>>(`/v2/chord/artist/list?per_page=10&q=${encodeURIComponent(value)}`,{success_notif:false})
                    .then(res=>{
                        if(res?.data?.length > 0) {
                            let newOptions = [...option];
                            const artist = res?.data?.map(a=>a?.artist);
                            artist.forEach((a)=>{
                                if(!option.includes(a)) {
                                    console.log(a);
                                    newOptions = newOptions.concat(a);
                                }
                            })
                            setOption(newOptions);
                        }
                    }).finally(()=>{
                        setLoadingArtist(false)
                        loadingRef.current = false;
                    });
                } else loadingRef.current = false;
            },1000)
        }
    },[slug,option,get])

    const filterOptions = React.useCallback((options: string[],params: FilterOptionsState<string>)=>{
        const filtered = filter(options, params);
        // Suggest the creation of a new value
        if (params.inputValue !== '' && filtered.length === 0) {
            filtered.push(params.inputValue);
        }
        return filtered;
    },[filter])

    React.useEffect(()=>{
        const height = document.body.clientHeight-200;
        const maxRows = Math.ceil(height/19.5);
        setRows(maxRows)
        if(editorRef.current && resultRef.current) resultRef.current.style.height=`${editorRef.current.clientHeight}px`
        const onEditorScroll=()=>{
            if(editorRef.current && resultRef.current) {
                resultRef.current.style.height=`${editorRef.current.clientHeight}px`
                const editorTop = editorRef.current.scrollTop,
                editH=editorRef.current.scrollHeight,resuH=resultRef.current.scrollHeight;
                resultRef.current.scrollTop=editorTop*(resuH/editH);
            }
        }
        if(editorRef.current && resultRef.current) editorRef.current.addEventListener('scroll',onEditorScroll);
        return ()=>{
            if(editorRef.current && resultRef.current) editorRef.current.removeEventListener('scroll',onEditorScroll);
        }
    },[])

    React.useEffect(() => {
        if(openArtist && option.length<=0 && slug?.[0]==='new') {
            setLoadingArtist(true)
            get<PaginationResponse<IArtist>>(`/v2/chord/artist/list?per_page=400`,{success_notif:false})
            .then((res)=>{
                setLoadingArtist(false)
                const artist = res?.data?.map(a=>a.artist);
                setOption(artist);
            }).catch((err)=>{
                setLoadingArtist(false)
            })
        } else {
            setLoadingArtist(false)
        }
    }, [openArtist,slug,get]);

    const handleFullscreen = React.useCallback(()=>{
        setFullscreen(!fullscreen)
    },[fullscreen])

    React.useEffect(()=>{
        if(slug?.[0] !== "new") {
            setValue(data);
        }
    },[slug,data])

    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        handleSubmit()
    },true)

    return (
        <Pages title={meta?.title} noIndex canonical={'slug' in data ? `/dashboard/chord/${data?.slug}` : '/dashboard/chord/new'}>
            <DashboardLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>{'slug' in data ? "Edit Chord" : "New Chord"}</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {(typeof slug?.[0] === 'string' && slug?.[0]!=='new') && (
                            <>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel control={
                                            <Switch disabled={loading} checked={value.publish} onChange={event=>handleChange('publish',event.target.checked)} color="primary" />
                                        }
                                        label="Publish" />
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <a href={`/chord/${slug?.[0]}`} target="_blank"><Typography>{parseURL(portalUrl(`/chord/${slug[0]}`))}</Typography></a>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} lg={8}>
                            <TextField
                                value={value?.title || ''}
                                label="Song Title"
                                fullWidth
                                onChange={event=>handleChange('title',event.target.value)}
                                required
                                disabled={loading||slug?.[0]!=='new'}
                            />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <Autocomplete
                                open={openArtist}
                                value={value?.artist}
                                onChange={handleArtistChange}
                                onInputChange={handleInputArtistChange}
                                filterOptions={filterOptions}
                                selectOnFocus
                                freeSolo
                                disabled={loading||slug?.[0]!=='new'}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                options={option}
                                loading={loadingArtist || option.length===0 && openArtist}
                                onOpen={() => {
                                    slug?.[0]==='new' && setOpenArtist(true);
                                }}
                                onClose={() => {
                                    setOpenArtist(false);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label="Artist"
                                    required
                                    disabled={loading||slug?.[0]!=='new'}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                        <React.Fragment>
                                            {loadingArtist ? <Circular color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                        ),
                                    }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{my:5}} />

                    <Box {...(fullscreen ? {
                        position:'fixed',
                        zIndex:5000,
                        top:0,
                        left:0,
                        bgcolor:'background.default',
                        width:'100vw',
                        height:'100vh',
                        p:2,
                    } : {})}
                        sx={fullscreen ? {overflowY:{xs:'auto',lg:'hidden'}} : undefined}
                    >
                        <Box mb={2}>
                            <Button outlined color='inherit' onClick={handleFullscreen}>{!fullscreen ? <Fullscreen /> : <FullscreenExit />}</Button>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} lg={6}>
                                <Typography paragraph>use "#" to add comments</Typography>
                                <Textarea
                                    inputRef={editorRef}
                                    InputProps={{
                                        sx:{
                                            fontSize:13,fontFamily:'monospace',
                                            whiteSpace:'nowrap',
                                            WebkitColumnBreakInside:'avoid',
                                            pageBreakInside:'avoid',
                                            breakInside:'avoid-column',
                                            lineHeight:1.5,
                                        },
                                    }}
                                    value={value?.original || ''}
                                    label="Chord Editor"
                                    fullWidth
                                    multiline
                                    rows={rows}
                                    onChange={event=>handleEditorChange(event.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Typography variant='h6' component='h6'>Result</Typography>
                                <Div sx={{padding:'16.5px 14px',overflowY:'unset'}}>
                                    <Div ref={resultRef} sx={{overflowY:{xs:'auto',lg:'hidden'}}}>
                                        <Chord template={value?.text||''} transpose={0} style={{fontSize:13}} margin={false}/>
                                    </Div>
                                </Div>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box mt={5}>
                        <Button icon='save' type='submit' disabled={loading} loading={loading}>Save</Button>
                    </Box>
                </form>
            </DashboardLayout>
            <Recaptcha ref={captchaRef} />
        </Pages>
    )
}