import Pages from "@comp/Pages";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Router from "next/router";
import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Croppie from "@comp/Croppie";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";
import DashboardLayout from "@layout/dashboard";
import submitForm from "@utils/submit-form";
import useAPI, { ApiError } from "@design/hooks/api";
import Recaptcha from "@design/components/Recaptcha";
import { AxiosRequestConfig } from "axios";
import TextField from "@mui/material/TextField";
import Textarea from "@design/components/Textarea";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"))

export default function NewTwibbonPage() {
    const [loading,setLoading]=React.useState(false);
    const [value,setValue]=React.useState({title:'',description:''});
    const [progress,setProgress]=React.useState(0)
    const croppie = React.useRef<Croppie>(null);
    const [imageLoaded,setImageLoaded] = React.useState(false);
    const inputEl = React.useRef<HTMLInputElement>(null)
    const setNotif = useNotification();
    const {post} = useAPI();
    const captchaRef = React.useRef<Recaptcha>(null);
    const fileRef = React.useRef<File>();

    const handleRotate=React.useCallback(()=>{
        croppie.current?.rotate(-90);
    },[])

    const handleLoadImage=React.useCallback(async(e: React.ChangeEvent<HTMLInputElement>)=>{
        if(e?.target?.files?.[0]) {
            fileRef.current = e.target.files[0];
            await croppie?.current?.loadImage(e);
            setImageLoaded(true);
        }
        if(inputEl.current) inputEl.current.value = '';
    },[])

    const handleSubmit = React.useCallback(submitForm((async()=>{
        try {
            if(!fileRef.current) return setNotif("You haven't selected an image",true);
            setLoading(true)
            const canvas = await croppie.current?.cropImage();
            canvas?.toBlob(async(blob)=>{
                if(blob) {
                    try {
                        const recaptcha = await captchaRef.current?.execute();
                        const form = new FormData();
                        form.append('title',value.title)
                        form.append('description',value.description)
                        form.append('recaptcha',recaptcha||"");
                        form.append('image',blob,fileRef.current?.name);
                        
                        const opt: AxiosRequestConfig={
                            headers:{
                                'Content-Type':'multipart/form-data'
                            },
                            onUploadProgress:(progEvent)=>{
                                const complete=Math.round((progEvent.loaded * 100) / (progEvent?.total||0));
                                setProgress(complete)
                            }
                        }

                        await post(`/v2/twibbon`,form,opt);
                        setTimeout(()=>{
                            Router.push(`/dashboard/twibbon`);
                        },1000)
                    } catch(e) {
                        if(e instanceof ApiError) setNotif(e.message,true)
                        setLoading(false);
                    }
                } else {
                    setNotif("Something went wrong",true);
                    setLoading(false)
                }
            })
        } catch(err) {
            if(err instanceof Error) setNotif(err.message,true)
            setLoading(false)
        }
    })),[setNotif,post,value])


    return (
        <Pages title="New Twibbon" noIndex canonical={`/dashboard/twibbon/new`}>
            <DashboardLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>New Twibbon</Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4} justifyContent='center'>
                        <Grid item xs={12} md={10}>
                            <TextField
                                label="Title"
                                value={value.title}
                                onChange={e=>setValue({...value,title:e.target.value})}
                                required
                                fullWidth
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12} md={10}>
                            <Textarea
                                label="Description"
                                value={value.description}
                                onChange={e=>setValue({...value,description:e.target.value})}
                                fullWidth
                                disabled={loading}
                                multiline
                                rows={10}
                            />
                        </Grid>
                        <Grid item xs={12} md={10}>
                            <Croppie ref={croppie} />
                            <Stack mt={2} direction='row' justifyContent='space-between'>
                                <Button outlined color='inherit' icon='addphoto' onClick={()=>inputEl.current?.click()}>Select Image</Button>
                                {imageLoaded && (
                                    <Button tooltip="Rotate" color="inherit" outlined onClick={handleRotate} icon='rotate'>Rotate</Button>
                                )}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={10}>
                            <Box textAlign='center'>
                                <Button icon='save' type='submit' disabled={!imageLoaded}>Save</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </DashboardLayout>
            <input ref={inputEl} type='file' accept="image/*" style={{display:'none'}} onChange={handleLoadImage} />
            <Recaptcha ref={captchaRef} />
            <Backdrop open={loading} progress={progress} />
        </Pages>
    )
}