import React from 'react'
import Header from 'portal/components/Header'
import CustomButton from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import Chord,{uChord} from 'portal/components/Chord'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import useAPI from 'portal/utils/api'
import {useMousetrap,useBeforeUnload} from 'portal/utils/useKeys'
import db from 'portal/utils/db'
import {Grid,Typography,Paper,CircularProgress,TextField,FormControlLabel,FormGroup,Switch} from '@mui/material'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import ReCaptcha from 'portal/components/ReCaptcha'

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,res,params})=>{
    const slug=params.slug;
    if(data.user === null) {
        return {
            redirect:{
                destination:`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`,
                permanent:false
            }            
        }
    }
    if(slug?.[0] !== "edit" && slug?.[0] !== "new") {
        return {
            notFound:true
        }
    }
    if(slug?.[0] === "edit" && typeof slug?.[1] === "undefined" || slug?.[0] === "new" && typeof slug?.[1] !== "undefined") {
        return {
            notFound:true
        }
    }
    const meta={
        title:"New Chord",
    }
    if(slug?.[0]==='edit') {
        const chord = await db.kata(`SELECT id,userid,title,artist,text,original,publish,youtube,block,slug FROM klekle_chord WHERE slug='${slug[1]}' LIMIT 1`);
        if(!chord) {
            return {
                notFound:true
            }
        }
        chord[0].publish=Boolean(chord[0].publish);
        chord[0].block=Boolean(chord[0].block);
        const {id,userid,block,original,...rest} = chord[0];
        if((data?.user?.id !== userid) && userid !== 1 && data?.user?.id !==2) {
            return {
                notFound:true
            }
        }
        if(block) return {props:{meta:{err:'blocked'}}}
        meta.title="Edit Chord";
        meta.chord={
            ...rest,
            original:original.replace(/\\'/g,"'")
        };
    }
    return {props:{meta:meta}}
})

const styles=theme=>({
    render:{
        [theme.breakpoints.down('xl')]: {
            overflowY:'auto'
        },
        [theme.breakpoints.up('lg')]: {
            overflowY:'hidden'
        },
    },
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
    }
})

const EditChord=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {slug}=router.query;
    const defaul={
        original:"#Intro\n\n\n#Verse\n\n\n\n\n#Bridge\n\n\n#Reff",
        text:"{c:Intro}\n\n\n{c:Verse}\n\n\n\n\n{c:Bridge}\n\n\n{c:Reff}"
    }
    const captchaRef=React.useRef(null)
    const artistAwal=slug[0]==='edit' ? [meta?.chord?.artist] : [''];
    const [value,setValue]=React.useState(meta?.chord||{title:'',artist:'',text:defaul.text,original:defaul.original,youtube:'',publish:false});
    const [option,setOption]=React.useState(artistAwal);
    const [openArtist,setOpenArtist]=React.useState(false);
    const [loadingArtist,setLoadingArtist]=React.useState(true)
    const [loading,setLoading]=React.useState(false)
    const {get,post,put} = useAPI()
    const [canChange,setCanChange]=React.useState(true)
    useBeforeUnload(canChange,`/chord/dashboard/${slug[0]}${slug?.[1] ? `/${slug[1]}` : ''}`)
    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit(e)
    },true)
    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        if(slug?.[0] !=='new') router.push('/chord/dashboard/[...slug]','/chord/dashboard/new');
    },false)

    const filter = createFilterOptions();
    const handleChange=(name,val)=>{
        setCanChange(false)
        setValue({
            ...value,
            [name]:val
        })
    }

    const handleEditorChange=(val)=>{
        uChord(val,(res)=>{
            setValue({
                ...value,
                original:val,
                text:res
            })
        },false)
    }

    const handleArtistChange=(event, newValue) => {
        if(slug?.[0]!=='edit') {
            setCanChange(false)
            let val;
            if (typeof newValue === 'string') {
                val=newValue;
                setValue({
                    ...value,
                    artist: newValue,
                });
            } else if (newValue && newValue.inputValue) {
                // Create a new value from the user input
                val=newValue.inputValue;
                setValue({
                    ...value,
                    artist: newValue.inputValue,
                });
            } else if(newValue && newValue.artist) {
                setValue({
                    ...value,
                    artist:newValue.artist,
                });
            } else {
                setValue({
                    ...value,
                    artist:"",
                });
            }
        }
    }

    const handleSubmit=async(e)=>{
        if(e.preventDefault) e.preventDefault()
        setLoading(true);
        try {
            if(slug?.[0]==='edit') {
                const recaptcha = await captchaRef?.current?.execute()
                const [res] = await put(`/v1/chord/${meta.chord.slug}`,{...value,recaptcha},{},{success_notif:true});
                setCanChange(true)
            } else {
                const recaptcha = await captchaRef?.current?.execute()
                const [res] = await post("/v1/chord",{...value,recaptcha},{},{success_notif:true});
                setTimeout(()=>{
                    router.push('/chord/dashboard/[...slug]',`/chord/dashboard/edit/${res.slug}`);
                },1000)
            }
        } catch {} finally {
            setLoading(false);
        }
    }

    const handleInputArtistChange=(e,value,reason)=>{
        if(reason==="input" && slug?.[0]!=='edit') {
            const filte=option.filter(item=>item.toLowerCase().indexOf(value) > -1);
            if(filte?.length === 0){
                setLoadingArtist(true)
                get(`/v1/chord/artist/list?per_page=10&q=${encodeURIComponent(value)}`,{error_notif:false})
                .then(([res])=>{
                    setLoadingArtist(false)
                    let b=option;
                    res?.map((rs)=>{
                        const artis = rs?.data?.map(a=>a?.artist);
                        if(option.indexOf(artis)===-1) b=b.concat(artis)
                    })
                    setOption(b);
                }).catch((err)=>{
                    setLoadingArtist(false)
                })
            }
        }
    }

    React.useEffect(()=>{
        const editor=document.getElementById('editorContainer'),
        resu=document.getElementById('resultRenderContainer');
        if(editor && resu) resu.style.height=`${editor.offsetHeight}px`
        const onEditorScroll=()=>{
            const editorTop = editor.pageYOffset || editor.scrollTop,
            editH=editor.scrollHeight,resuH=resu.scrollHeight;
            resu.scrollTop=editorTop*(resuH/editH);
        }
        if(editor) editor.addEventListener('scroll',onEditorScroll);
        return ()=>{
            if(editor) editor.removeEventListener('scroll',onEditorScroll);
        }
    })

    React.useEffect(() => {
        if(openArtist && option.length<=1 && slug?.[0]!=='edit') {
            setLoadingArtist(true)
            get(`/v1/chord/artist/list?per_page=100`,{error_notif:false})
            .then(([res])=>{
                setLoadingArtist(false)
                const artis = res?.data?.map(a=>a?.artist);
                setOption(artis);
            }).catch((err)=>{
                setLoadingArtist(false)
            })
        } else {
            setLoadingArtist(false)
        }
    }, [openArtist,slug]);

    return (
        <Header title={meta.title} active='chord' subactive='dashboard' canonical={`/chord/dashboard/${slug[0]}${slug?.[1] ? `/${slug[1]}` : ''}`} noIndex>
            {meta?.err==='blocked' ? (
                <Paper><div style={{margin:'20px auto',textAlign:'center'}}><Typography variant="h6">Your Chord is Blocked</Typography></div></Paper>
            ) : (
                <PaperBlock title={slug?.[0]==='edit' ? 'Edit Chord' : 'New Chord'} linkColor whiteBg>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={4}>
                            {slug?.[0]==='edit' && (
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
                                    <Typography><a className="underline" href={`/chord/${slug?.[1]}`} target="_blank">{`${process.env.URL}/chord/${slug?.[1]}`}</a></Typography>
                                </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    value={value?.title || ''}
                                    variant='outlined'
                                    label="Song Title"
                                    fullWidth
                                    onChange={event=>handleChange('title',event.target.value)}
                                    required
                                    disabled={loading||slug?.[0]==='edit'}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Autocomplete
                                    open={openArtist}
                                    value={value?.artist || ""}
                                    onChange={handleArtistChange}
                                    onInputChange={handleInputArtistChange}
                                    filterOptions={(options, params) => {
                                        const filtered = filter(options, params);
                                        // Suggest the creation of a new value
                                        if (params.inputValue !== '') {
                                            filtered.push({
                                                inputValue: params.inputValue,
                                                artist: `Add "${params.inputValue}"`,
                                            });
                                        }
                                        return filtered;
                                    }}
                                    selectOnFocus
                                    disabled={loading||slug?.[0]==='edit'}
                                    clearOnBlur
                                    id="artistInput"
                                    freeSolo
                                    //renderOption={(option) => option}
                                    isOptionEqualToValue={(option, value) => {
                                        if(typeof option === 'string') return option===value
                                        if (option.inputValue) return option?.inputValue === value
                                    }}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        if (option.inputValue && option.artist) {
                                            return option.artist;
                                        }
                                    }}
                                    options={option}
                                    loading={loadingArtist || option.length===0 && openArtist}
                                    onOpen={() => {
                                        slug?.[0]!=='edit' && setOpenArtist(true);
                                    }}
                                    onClose={() => {
                                        setOpenArtist(false);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Artist"
                                        variant="outlined"
                                        required
                                        disabled={loading||slug?.[0]==='edit'}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                            <React.Fragment>
                                                {loadingArtist ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                            ),
                                        }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <TextField
                                    value={value?.youtube || ''}
                                    variant='outlined'
                                    label="Youtube URL"
                                    fullWidth
                                    disabled={loading}
                                    onChange={event=>handleChange('youtube',event.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <p>use "#" to add comments</p>
                                <TextField
                                    id='editorContainer'
                                    InputProps={{
                                        style:{
                                            fontSize:13,fontFamily:'monospace',whiteSpace:'nowrap',WebkitColumnBreakInside:'avoid',
                                            pageBreakInside:'avoid',
                                            breakInside:'avoid-column',lineHeight:1.5
                                        },
                                        className:classes.scrollBar
                                    }}
                                    value={value?.original || ''}
                                    variant='outlined'
                                    label="Chord Editor"
                                    fullWidth
                                    multiline
                                    rows={40}
                                    onChange={event=>handleEditorChange(event.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} lg={6}>
                            <Typography variant='h6' component='h6'>Result</Typography>
                                <div style={{marginTop:15,padding:'18.5px 14px',height:'unset',overflowY:'unset'}}>
                                    <div id='resultRenderContainer' className={classes.render}>
                                        <Chord template={value?.text||''} transpose={0} style={{fontSize:13}} margin={false}/>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <CustomButton tooltip='Ctrl + S' type='submit' disabled={loading} loading={loading} icon="save">Save</CustomButton>
                            </Grid>
                        </Grid>
                    </form>
                </PaperBlock>
            )}
            <ReCaptcha ref={captchaRef} />
        </Header>
    );
}

export default withStyles(EditChord,styles);