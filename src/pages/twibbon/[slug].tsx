import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import { TwibbonDetail } from "@model/twibbon";
import List from "@mui/material/List";
import { Li, Span } from "@design/components/Dom";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Croppie from "@comp/Croppie";
import dynamic from "next/dynamic";
import useNotification from "@design/components/Notification";
import { ShareAction } from "@comp/Action";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"))
const Dialog = dynamic(()=>import("@design/components/Dialog"))
const Image = dynamic(()=>import("@comp/Image"))

export const getServerSideProps = wrapper<TwibbonDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();

    try {
        const url = `/v2/twibbon/${slug}`;
        const data = await fetchAPI<TwibbonDetail>(url);

        const desc = truncate(clean(data?.description||""),200);

        return {
            props:{
                data:data,
                meta:{
                    title: data?.title,
                    desc
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

export default function TwibbonPages({data:twibbon,meta}: IPages<TwibbonDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<TwibbonDetail>(`/v2/twibbon/${slug}`,{fallbackData:twibbon});
    const croppie = React.useRef<Croppie>(null);
    const inputEl = React.useRef<HTMLInputElement>(null)
    const [dialog,setDialog] = React.useState(false);
    const [cropData,setCropData] = React.useState("");
    const [imageLoaded,setImageLoaded] = React.useState(false);
    const [loading,setLoading] = React.useState(false);
    const setNotif = useNotification();

    const handleRotate=React.useCallback(()=>{
        croppie.current?.rotate(-90);
    },[])

    const handleLoadImage=React.useCallback(async(e: React.ChangeEvent<HTMLInputElement>)=>{
        if(e?.target?.files?.[0]) {
            await croppie?.current?.loadImage(e);
            setImageLoaded(true);
        }
        if(inputEl.current) inputEl.current.value = '';
    },[])

    const handleCrop = React.useCallback(async()=>{
        try {
            setLoading(true)
            const canvas = await croppie.current?.cropImage();
            canvas?.toBlob(blob=>{
                if(blob) {
                    const url = (window.webkitURL || window.URL).createObjectURL(blob);
                    setCropData(url)
                    setDialog(true);
                    setLoading(false)
                } else {
                    setNotif("Something went wrong",true);
                    setLoading(false)
                }
            })
        } catch(err) {
            if(err instanceof Error) setNotif(err.message,true)
            setLoading(false)
        }
    },[setNotif])

    return (
        <Pages title={meta?.title} desc={meta?.desc}>
            <DefaultLayout>
                <SWRPages loading={!data&&!error} error={error}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Sidebar id='twibbon-content'>
                                <PaperBlock title="Twibbon Usage Guide"
                                    footer={
                                        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                                            <Button color='inherit' outlined icon='add'>Create Twibbon</Button>
                                            {data && <ShareAction campaign="twibbon" variant='button' posId={data.id} buttonProps={{outlined:true,color:'inherit'}} />}
                                        </Stack>
                                    }
                                >
                                    <List component="ol" sx={{listStyle:'numeric',listStylePosition:'inside'}}>
                                        <Li>Click the <Span className='underline' sx={{color:'customColor.link',fontWeight:'bold'}} onClick={()=>inputEl.current?.click()}>Select Image</Span> button.</Li>
                                        <Li>Choose the photo.</Li>
                                        <Li>You can edit photos by <Span sx={{fontWeight:'bold'}}>sliding the slider</Span>.</Li>
                                        <Li>When you have finished editing, click the <Span sx={{fontWeight:'bold'}}>Preview</Span> button.</Li>
                                        <Li>To download click <Span sx={{fontWeight:'bold'}}>Download</Span> button.</Li>
                                        <Li>Done</Li>
                                    </List>
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box id='twibbon-content'>
                                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                                    <Typography variant='h3' component='h1'>{data?.title||meta?.title}</Typography>
                                </Box>

                                <Box>
                                    <Croppie
                                        ref={croppie}
                                        background={data ? `/content/img/twibbon/${data.slug}` : undefined}
                                    />
                                    
                                    
                                    {imageLoaded && (
                                        <Box mt={1} textAlign='center'>
                                            <Button tooltip="Rotate" color="inherit" outlined onClick={handleRotate} icon='rotate'>Rotate</Button>
                                        </Box>
                                    )}

                                    <Stack sx={{mt:4}} direction='row' justifyContent='space-between' alignItems='center'>
                                        <Button outlined color='inherit' icon='addphoto' onClick={()=>inputEl.current?.click()}>Select Image</Button>
                                        <Button icon='preview' onClick={handleCrop}>Preview</Button>
                                    </Stack>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
            <input ref={inputEl} type='file' accept="image/*" style={{display:'none'}} onChange={handleLoadImage} />
            <Backdrop open={loading} />
            <Dialog open={dialog} handleClose={()=>setDialog(false)} title={data?.title||meta?.title} maxWidth='sm' fullScreen={false}
                actions={
                    <Button component='a' href={cropData} download={`${data?.title||meta?.title} - Portalnesia Twibbon.png`} icon='download'>Download</Button>
                }
            >
                <Image src={cropData} alt={data?.title||meta?.title||""} sx={{width:'100%'}} />
            </Dialog>
        </Pages>
    )
}