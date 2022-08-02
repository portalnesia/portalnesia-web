import React from 'react'
import Header from 'portal/components/Header'
import Croppie from 'portal/components/Croppie'
import PaperBlock from 'portal/components/PaperBlock'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import Button from 'portal/components/Button'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import {clean,truncate as Ktruncate} from '@portalnesia/utils'
import db from 'portal/utils/db'
import {Grid,Typography,Paper,IconButton,Tooltip} from '@mui/material'
import * as gtag from 'portal/utils/gtag'
import dynamic from 'next/dynamic'

const AdsBanner1=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsBanner1),{ssr:false})
const AdsRect=dynamic(()=>import('portal/components/Ads').then(mod=>mod.AdsRect),{ssr:false})
const ShareAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.ShareAction),{ssr:false});
const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Image=dynamic(()=>import('portal/components/Image'))
const Backdrop=dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper(async({pn:data,req,res,params})=>{
    const slug=params.slug;
    const twibbon = await db.kata(`SELECT id,userid,judul as 'title',slug,deskripsi as 'description',terbit as 'publish',block FROM klekle_twibbon WHERE slug=? LIMIT 1`,[slug]);
    if(!twibbon) {
        return db.redirect();
    }
    
    const {userid,title,description,publish,block,slug:slugg}=twibbon[0];
    if(publish==0 && data?.user?.id != userid || block==1 && data?.user?.id != userid) {
        return db.redirect();
    }
    if(block==1 && data?.user?.id == userid) return {props:{meta:{err:'blocked'}}}
    twibbon[0].publish=Boolean(publish);
    const {block:_,...rest}=twibbon[0];
    const meta={
        title:title,
        description:Ktruncate(clean(description),200),
        image:`${process.env.CONTENT_URL}/img/twibbon/${slugg}`,
        twibbon:rest
    }
    return {props:{meta:meta}}
})

const styles=()=>({
    list:{
        '& li':{
            fontSize:'1rem'
        },
        '& label':{
            cursor:'pointer',
            '&:hover':{
                textDecoration:'underline'
            }
        }
    },
    rotate:{
        margin:'10px auto',
        textAlign:'center'
    }
})

const TwibbonDetail=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {slug}=router.query;
    const [imageLoaded,setImageLoaded]=React.useState(false);
    const [dialog,setDialog]=React.useState(null);
    const inputEl=React.useRef(null);
    const cropEl=React.useRef(null);
    const [loading,setLoading] = React.useState(false)

    const onImageChange=(e)=>{
        cropEl?.current?.imageLoad(e);
    }

    const onInputClick=()=>{
        inputEl?.current?.click();
    }

    const onRotate=()=>{
        cropEl?.current?.rotate(-90);
    }

    const handleRender=()=>{
        setLoading(true);
        cropEl?.current?.renderImage();
    }

    const closeDialog=()=>{
        setDialog(null)
    }

    React.useEffect(()=>{
        setTimeout(()=>{
            gtag.event({
                action:'select_content',
                content_type:'twibbon',
                item_id:meta.twibbon.id
            })
        },1000)
    },[router.query])

    const onRenderEnd=(res)=>{
        if(process.browser) {
            const image_data = atob(res.split(',')[1]);
            const arraybuffer = new ArrayBuffer(image_data.length);
            const view = new Uint8Array(arraybuffer);
            let blob;
            for (var i=0; i<image_data.length; i++) {
                view[i] = image_data.charCodeAt(i) & 0xff;
            }
            try {
                blob = new Blob([arraybuffer], {type: 'image/png'});
            } catch (e) {
                const bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
                bb.append(arraybuffer);
                blob = bb.getBlob('image/png'); // <-- Here's the Blob
            }
            const urll = (window.webkitURL || window.URL).createObjectURL(blob);
            setLoading(false)
            setDialog(urll);
        }
    }

    return(
        <Header iklan title={meta?.title} desc={meta?.description} image={`${meta?.image}?output=jpeg`} active='twibbon' subactive='twibbon_detail' canonical={`/twibbon/${slug}`}>
            <Grid container spacing={2}>
                {meta?.err === 'blocked' ? (
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant="h5">Your Twibbon Blocked</Typography>
                        </div>
                    </Grid>
                ) : (
                    <>
                    <Grid item xs={12}>
                        <Breadcrumbs routes={[{label:"Twibbon",href:"/twibbon"}]} title={meta.title} />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <PaperBlock title="Twibbon Usage Guide"
                        footer={
                            <div className='flex-header'>
                                <Link href='/twibbon/new'><a><Button disabled={loading} size='small' color='secondary' icon='add'>Create Twibbon</Button></a></Link>
                                <ShareAction campaign='twibbon' posId={meta.twibbon.id} variant='button' />
                            </div>
                        }
                        >
                            <ol type="numbered" className={classes.list}>
                                <li>Click the <label htmlFor="imageLoader"><strong>Select Image</strong></label> button.</li>
                                <li>Choose the photo.</li>
                                <li>You can edit photos by <b>sliding the slider</b></li>
                                <li>When you have finished editing, click the <label><strong>Preview</strong></label> button.</li>
                                <li>To download click <b>Download</b> button.</li>
                                <li>Done</li>
                            </ol>
                            <AdsBanner1 />
                        </PaperBlock>
                    </Grid>
                    <Grid item xs={12} lg={8}>
                        <PaperBlock title={meta?.twibbon?.title} whiteBg>
                            <div>
                                <Croppie
                                    keys={meta.twibbon.slug}
                                    ref={cropEl}
                                    background={`/content/img/twibbon/${meta.twibbon.slug}`}
                                    onRenderEnd={onRenderEnd}
                                    onImageLoaded={()=>setImageLoaded(true)}
                                />
                            </div>
                            {imageLoaded && (
                                <div className={classes.rotate}>
                                    <Button disabled={loading} sx={{backgroundColor:'yellow',color:'black'}} icon='rotate' onClick={onRotate}>Rotate</Button>
                                </div>
                            )}
                            <AdsRect />
                            <div style={{display:'flex',justifyContent:'space-evenly',marginBottom:20}}>
                                <input id="imageLoader" ref={inputEl} type='file' accept="image/*" style={{display:'none'}} onChange={onImageChange} />
                                <Button disabled={loading} outlined onClick={onInputClick} icon='addphoto'>Select Image</Button>
                                <Button disabled={loading} loading={loading} onClick={handleRender} icon='preview'>Preview</Button>
                            </div>
                            <div style={{marginTop:40}}>
                                <p style={{fontSize:12}}>Best performance using the latest version of chrome</p>
                            </div>
                        </PaperBlock>
                    </Grid>
                    <Dialog open={dialog!==null} aria-labelledby='dialog' scroll='body'>
                        <DialogTitle id='dialog title'>{meta?.twibbon?.title}</DialogTitle>
                        {dialog!==null && (
                            <DialogContent dividers>
                                <Image blured src={dialog} alt={meta?.twibbon?.title} style={{width:'100%'}} />
                            </DialogContent>
                        )}
                        {dialog!==null && (
                            <DialogActions>
                                <Button color='secondary' onClick={closeDialog} style={{marginRight:15}}>Cancel</Button>
                                <a href={dialog} download={`${meta?.twibbon?.title} - Portalnesia Twibbon.png`}><Button icon='download'>Download</Button></a>
                            </DialogActions>
                        )}
                    </Dialog>
                    </>
                )}
            </Grid>
        </Header>
    )
}

export default withStyles(TwibbonDetail,styles)