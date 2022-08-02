import React from 'react'
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {useRouter} from 'next/router'
import PaperBlock from 'portal/components/PaperBlock'
import {wrapper} from 'portal/redux/store'
import {slugFormat as Kslug,toBlob} from '@portalnesia/utils'
import db from 'portal/utils/db'
import useAPI from 'portal/utils/api'
import {Grid,TextField,Portal} from '@mui/material'
import ReCaptcha from 'portal/components/ReCaptcha'
import Croppie from 'portal/components/Croppie'
import dynamic from 'next/dynamic';

const Backdrop = dynamic(()=>import('portal/components/Backdrop'))
export const getServerSideProps = wrapper('login')

const TwibbonNew=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const [imageLoaded,setImageLoaded]=React.useState(false);
    const [loading,setLoading]=React.useState(false);
    const [value,setValue]=React.useState({title:'',description:''});
    const {post} = useAPI()
    const [backdrop,setBackdrop]=React.useState(false);
    const [progress,setProgress]=React.useState(0)
    const inputEl=React.useRef(null);
    const cropEl=React.useRef(null);
    const captchaRef=React.useRef(null)
    const [fileName,setFileName] = React.useState("");

    const onImageChange=(e)=>{
        const file=e?.target?.files?.[0];
        setFileName(file?.name);
        cropEl?.current?.imageLoad(e);
    }

    const onInputClick=()=>{
        inputEl?.current?.click();
    }

    const onRotate=()=>{
        cropEl?.current?.rotate(-90);
    }

    const handleForm=(e)=>{
        e.preventDefault();
        if(value?.title?.length) {
            setLoading(true);
            setBackdrop(true);
            cropEl?.current?.renderImage();
        }
    }

    const onRenderEnd=async(res)=>{
        if(process.browser && res.length) {
            try {
                const block = res.split(";");
                // Get the content type of the image
                const contentType = block[0].split(":")[1];
                const realData = block[1].split(",")[1];
                const blob = toBlob(realData, contentType);
                const formData = new FormData();
                formData.append("title",value.title);
                formData.append("description",value.description);
                formData.append("image",blob,fileName);

                const opt={
                    headers:{
                        'Content-Type':'multipart/form-data'
                    },
                    onUploadProgress:(progEvent)=>{
                        const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                        setProgress(complete)
                    }
                }
                const recaptcha = await captchaRef.current?.execute();
                formData.append("recaptcha",recaptcha);
                await post(`/v1/twibbon`,formData,opt)
                setTimeout(()=>{
                    router.push('/twibbon/dashboard');
                },1000)
            } catch {

            } finally {
                setLoading(false);
                setBackdrop(false);
                setProgress(0)
            }
        }
    }

    return (
        <Header title="Create Twibbon" desc="Make twibbon automaticaly" active='twibbon' subactive='twibbon_new' canonical='/twibbon/new'>
            <Grid container justifyContent='center'>
                <Grid item xs={12} md={10} lg={8}>
                    <Breadcrumbs routes={[{label:"Twibbon",href:"/twibbon"}]} title="Create Twibbon" />
                    <form onSubmit={handleForm}>
                        <PaperBlock title='Create Twibbon' whiteBg
                        footer={
                            <Button disabled={loading} loading={loading} type='submit' icon='save'>Save</Button>
                        }
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Title'
                                        disabled={loading}
                                        autoFocus
                                        fullWidth
                                        required
                                        value={value?.title}
                                        onChange={(e)=>setValue({...value,title:e.target.value})}
                                        variant='outlined'
                                        error={value?.title?.length===0}
                                        helperText={`${process.env.URL}/twibbon/${Kslug(value?.title)}`}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Description'
                                        rows={10}
                                        maxRows={30}
                                        fullWidth
                                        value={value?.description}
                                        onChange={(e)=>setValue({...value,description:e.target.value})}
                                        variant='outlined'
                                        multiline
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <div>
                                        <Croppie
                                            keys='cropper-new'
                                            ref={cropEl}
                                            onRenderEnd={onRenderEnd}
                                            onImageLoaded={()=>setImageLoaded(true)}
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <input id="imageLoader" ref={inputEl} type='file' accept="image/*" style={{display:'none'}} onChange={onImageChange} />
                                    <div style={{display:'flex',justifyContent:'space-evenly'}}>
                                        {imageLoaded && <Button sx={{backgroundColor:'yellow',color:'black'}} icon='rotate' onClick={onRotate}>Rotate</Button>}
                                        <Button outlined onClick={onInputClick} icon='addphoto'>Select Image</Button>
                                    </div>
                                </Grid>
                            </Grid>
                        </PaperBlock>
                    </form>
                </Grid>
            </Grid>
            {backdrop && <Portal><Backdrop open={backdrop} {...(progress!==0 ? {progress:progress} : {})} /></Portal> }
            <ReCaptcha ref={captchaRef} />
        </Header>
    );
}

export default TwibbonNew