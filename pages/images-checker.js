import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import PaperBlock from 'portal/components/PaperBlock'
import {useAPI,useNotif} from 'portal/utils'
import {ucwords} from '@portalnesia/utils'
import {wrapper} from 'portal/redux/store'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {Grid,Typography,TextField,Divider} from '@mui/material'
import clx from 'classnames'
import dynamic from 'next/dynamic'
import Recaptcha from 'portal/components/ReCaptcha'

const Image=dynamic(()=>import('portal/components/Image'))
const Backdrop=dynamic(()=>import('portal/components/Backdrop'))
const CombineAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.CombineAction))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableHead=dynamic(()=>import('@mui/material/TableHead'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export const getServerSideProps = wrapper()

const styles=theme=>({
    wrapper:{
        [theme.breakpoints.down('sm')]: {
            paddingLeft:theme.spacing(2),
            paddingRight:theme.spacing(2)
        },
        [theme.breakpoints.up('sm')]: {
            paddingLeft:theme.spacing(3),
            paddingRight:theme.spacing(3)
        },
        paddingTop:theme.spacing(3),
        paddingBottom:theme.spacing(3),
    },
    inputContainer:{
        textAlign:'center',
        border:`1px dashed ${theme.palette.divider}`,
        padding:0,
        position:'relative',
        borderRadius:'.375rem',
        'will-change':'border-color,background',
        transition:'border-color 250ms ease-in-out,background 250ms ease-in-out',
        '&:hover':{
            background:theme.palette.action.hover,
        },
        '& label':{
            padding:'8.75rem 15px',
            cursor:'pointer',
            display:'inline-block',
            width:'100%',
            fontSize:'1.2rem',
            fontWeight:600,
        },
    },
    inputHover:{
        background:theme.palette.action.hover,
    }
})

const ImageCheck=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const {post}=useAPI()
    const {setNotif}=useNotif()
    const [url,setUrl]=React.useState("");
    const [file,setFile]=React.useState(null);
    const [dataFile,setDataFile]=React.useState(null);
    const [backdrop,setBackdrop]=React.useState(false)
    const [progress,setProgress]=React.useState(0);
    const [hoverClass,setHoverClass]=React.useState(false)
    const [labelText,setLabelText]=React.useState("Drag images or click here to select images")
    const [result,setResult]=React.useState([])
    const resultRef=React.useRef()
    const captchaRef = React.useRef(null)

    const inputChange=(e)=>{
        setLabelText("Drag images or click here to select images")
        setHoverClass(false)
        const gambar=e?.target?.files?.[0] || e?.dataTransfer?.files?.[0] || false;
        if(gambar===false) return setNotif("Something went wrong, we couldn't find your image",true);
        if(Number(gambar.size) > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
        if(gambar?.type.toLowerCase() != 'image/jpeg' &&  gambar?.type.toLowerCase() != 'image/png' && gambar?.type.toLowerCase() != 'image/jpg'){
            setNotif("File not supported, only jpg, jpeg, png",true)
        } else {
            setFile(gambar);
            const reader = new FileReader();
            reader.onload = (function() {
                return function(e) {
                    setDataFile(e.target.result);
                };
            })(gambar);
            reader.readAsDataURL(gambar);
        }
    }

    const inputRemove=()=>{
        setFile(null);
        setDataFile(null);
        setUrl("")
        setResult([])
    }

    const handleDrop=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        inputChange(e)
    }

    const handleDrag=(e,enter)=>{
        e.preventDefault();
        if(enter){
            setLabelText("Drop your images now")
            setHoverClass(true)
        } else {
            setLabelText("Drag images or click here to select images")
            setHoverClass(false)
        }
    }

    const uploadImage=async()=>{
        setResult([])
        if(file===null && url.trim().match(/^https?\:\/\//i) === null) setNotif("Please select image first",true);
        else {
            setProgress(0)
            setBackdrop(true);
            const form=new FormData();
            if(file !==null ) form.append('image',file);
            if(url.trim().match(/^https?\:\/\//i) !== null) form.append('url',url);
            const opt={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:(progEvent)=>{
                    const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                    setProgress(complete);
                }
            }
            try {
                const recaptcha = await captchaRef.current?.execute();
                form.append('recaptcha',recaptcha);
                const [res] = await post(`/v1/tools/nsfw`,form,opt);
                setResult(res)
                const st = resultRef.current.offsetTop;
                if(typeof st ==='number') {
                    window.scrollTo({top:st,left:0,behavior:'smooth'})
                }
            } catch {

            } finally {
                setBackdrop(false);
                setProgress(0)
            }
        }
    }

    const inputBlur=()=>{
        if(url.trim().match(/^https?\:\/\//i) !== null) {
            setDataFile(url)
            setFile(null)
        } else setDataFile(null)
    }

    return (
        <Header navTitle="Images Checker" iklan title="Images Checker" desc="Online tool to check if your image contains NSFW (Not Safe To Work)"
        keyword="images,nsfw,porn,hentai,neutral,drawing,sexy,checker"
        active="tools"
        subactive="images_check"
        >
            <Grid container justifyContent='center' spacing={2}>
                <Grid item xs={12} md={10} lg={8}>
                    <PaperBlock whiteBg noPadding title="Images Checker" desc="This online tool will help you to check if your image contains NSFW (Not Safe To Work) or not. Using 5 categories: Sexy, Neutral, Porn, Drawing, or Hentai."
                    header={
                        <div>
                            <CombineAction
                                list={{
                                    share:{
                                        campaign:'images_checker'
                                    },
                                    report:true,
                                    donation:true
                                }}
                            />
                        </div>
                    }
                    footer={
                        <div className='flex-header'>
                            <Button disabled={backdrop} onClick={uploadImage} loading={backdrop} icon='submit'>Analysis</Button>
                            <Button disabled={backdrop} color='secondary' onClick={inputRemove}>Reset</Button>
                        </div>
                    }
                    >
                        <div key={0} className={clx(classes.wrapper)}>
                            {dataFile===null ? (
                                <div key='file-upload'>
                                    <div className={clx(classes.inputContainer,hoverClass && classes.inputHover)}
                                    onDragEnter={(e)=>handleDrag(e,true)}
                                    onDragOver={(e)=>e.preventDefault()}
                                    onDragLeave={(e)=>handleDrag(e,false)}
                                    onDrop={handleDrop} >
                                        <input type="file" accept="image/*" id="fileInput" style={{display:'none'}} onChange={inputChange} />
                                        <label htmlFor="fileInput">{labelText}</label>
                                    </div>
                                </div>
                            ) : (
                                <div key='file-images' className={clx(classes.wrapper)}>
                                    <center><Image src={dataFile} style={{width:'100%',maxWidth:400}} /></center>
                                </div>
                            )}
                        </div>
                        <div key={1} style={{margin:'15px 0'}}><Divider /></div>
                        <div key={2} className={clx(classes.wrapper)}>
                            <div key='url-input'>
                                <Typography gutterBottom>You can also use an image URL for analysis</Typography>
                                <TextField
                                    value={url}
                                    onChange={e=>setUrl(e.target.value)}
                                    fullWidth
                                    label="Image URL"
                                    disabled={backdrop}
                                    onBlur={inputBlur}
                                />
                            </div>
                        </div>
                        <div key='result-ref' ref={resultRef}>
                            {result.length > 0 && (
                                <React.Fragment key={3}>
                                    <div key={'result'} className={clx(classes.wrapper)} style={{paddingBottom:'1rem'}}>
                                        <Typography variant='h5' component='p' gutterBottom>Result:</Typography>
                                    </div>
                                    <div key='table-result' style={{overflowX:'auto'}}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>#</TableCell>
                                                    <TableCell>Category</TableCell>
                                                    <TableCell>Probability</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {result.map((r,i)=>(
                                                    <TableRow key={i}>
                                                        <TableCell>{i+1}</TableCell>
                                                        <TableCell>{ucwords(r?.category)}</TableCell>
                                                        <TableCell>{r?.probability}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </React.Fragment>
                            )}
                        </div>
                    </PaperBlock>
                </Grid>
            </Grid>
            <Backdrop
                open={backdrop}
                {...(progress!==0 ? {progress:progress} : {})}
            />
            <Recaptcha ref={captchaRef} />
        </Header>
    )
}

export default withStyles(ImageCheck,styles)