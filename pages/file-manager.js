import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Image from 'portal/components/Image'
import Search from 'portal/components/Search'
import {useNotif} from 'portal/components/Notification'
import Skeleton from 'portal/components/Skeleton'
import Button from 'portal/components/Button'
import Avatar from 'portal/components/Avatar'
import Player from 'portal/components/Player'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import clx from 'classnames'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import {ucwords,number_size} from '@portalnesia/utils'
import {Hidden,Typography,Grid,CircularProgress,TextField,FormGroup,FormControlLabel,Switch,List,ListItemSecondaryAction,ListItem, ListItemAvatar,ListItemText,IconButton} from '@mui/material'
import {Create,Delete} from '@mui/icons-material'
import { Pagination } from '@mui/material';
import useSWR from 'portal/utils/swr'
import firebaseApp from 'portal/utils/firebase'
import {getStorage,ref as getStorageRef,uploadBytesResumable,getMetadata} from 'firebase/storage'
import {connect} from 'react-redux';
import Recaptcha from 'portal/components/ReCaptcha'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Backdrop = dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper('login')

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
        paddingBottom:theme.spacing(3)
    },
    withBorder:{
        borderBottom:`1px solid ${theme.palette.divider}`,
    },
    inputContainer:{
        textAlign:'center',
        border:`1px dashed ${theme.palette.divider}`,
        padding:0,
        position:'relative',
        borderRadius:'.375rem',
        willChange:'border-color,background',
        transition:'border-color 250ms ease-in-out,background 250ms ease-in-out',
        '&:hover':{
            background:theme.palette.action.hover,
        },
        '& label':{
            padding:'4.75rem 15px',
            cursor:'pointer',
            display:'inline-block',
            width:'100%',
            fontSize:'1.2rem',
            fontWeight:600,
        },
    },
    secondaryAction:{
        paddingRight:96
    },
    inputHover:{
        background:theme.palette.action.hover,
    }
})

const FileManager=({classes,err,username})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {post,del,put} = useAPI()
    const {page,q,...otherQuery}=router.query;
    const [hoverClass,setHoverClass]=React.useState(false)
    const [value,setValue]=React.useState("")
    const [errorVal,setErrorVal]=React.useState(null);
    const [loadingVal,setLoadingVal]=React.useState(false);
    const [errorEdit,setErrorEdit]=React.useState(null);
    const [loadingEdit,setLoadingEdit]=React.useState(false);
    const [loading,setLoading]=React.useState(false)
    const [backdrop,setBackdrop]=React.useState(false);
    const [search,setSearch]=React.useState(q ? decodeURIComponent(q):"")
    const [dialog,setDialog]=React.useState(null);
    const {setNotif}=useNotif()
    const [progressVal,setProgressVal]=React.useState(0);
    const [totalPage,setTotalPage]=React.useState(1);
    const [totalSize,setTotalSize]=React.useState(null);
    const [labelText,setLabelText]=React.useState("Drag files or click here to upload")
    const [valueUpload,setValueUpload]=React.useState({title:"",artist:""});
    const [artwork,setArtwork] = React.useState(null);
    const [errorUpload,setErrorUpload]=React.useState(null);
    const [disable,setDisable]=React.useState(false)
    const {data,error:errorLoading,mutate}=useSWR(`/v1/files?page=${page||1}${q ? `&q=${q}` : ''}`)
    const captchaRef = React.useRef(null);

    React.useEffect(()=>{
        if(data) {
            if(data?.data?.length > 0) {
                setTotalSize(number_size(data.total_size))
                setTotalPage(data.total_page)
            } else {
                setTotalPage(1)
            }
        } else {
            setTotalPage(1)
        }
    },[data])

    const handlePagination = React.useCallback((event, value) => {
        router.push({
            pathname:'/file-manager',
            query:{
                ...otherQuery,
                page:value
            }
        },`/file-manager?${q ? `q=${q}&` : ''}page=${value}`,{shallow:true})
    },[q,otherQuery]);
    
    const checkYoutubeValue=React.useCallback((val)=>{
        return new Promise((res,rej)=>{
            if(val.trim().match(/^https?\:\/\//i)) {
                if(val.trim().match(/\byoutube\.com\b|\byoutu\.be\b/)){
                    return res();
                }
                return rej("Not youtube URL");
            }
            return rej("Please start with http or https");
        });
    },[])

    const handleChange=React.useCallback((type,name,e)=>{
        if(type==='youtube') {
            setErrorVal(null)
            setValue(e)
            checkYoutubeValue(e).then(()=>{
                setErrorVal(null)
            }).catch((err)=>{
                setErrorVal(err);
            })
        } else if(type==='upload') {
            setErrorUpload(null)
            setValueUpload(prev=>({
                ...prev,
                [name]:e
            }))
            if(e.length===0) setErrorUpload(`${ucwords(name)} cannot be empty`);
        } else {
            setErrorEdit(null);
            setDialog(prev=>({
                ...prev,
                [name]:e
            }))
            if(name==='title' && e.length===0) setErrorEdit("Title cannot be empty");
            if(name==='artist' && e.length===0) setErrorEdit("Artist cannot be empty");
        }
    },[setValueUpload,setDialog])

    const openDialog=React.useCallback((type,dt,i)=>{
        const dia={
            ...dt,
            index:i,
            dialog:type
        }
        setDialog(dia);
    },[])

    const closeDialog=React.useCallback(()=>{
        setDialog(null);
    },[])

    const handleRemoveSearch=React.useCallback(()=>{
        if(search.length > 0) {
            setSearch("");
            if(typeof router.query.q !== 'undefined') {
                router.push({
                    pathname:'/file-manager',
                    query:{
                        page:1
                    }
                },`/file-manager?page=1`,{shallow:true})
            }
        }
    },[search,router])

    const handleSearch=React.useCallback((e)=>{
        e.preventDefault();
        if(search.length > 0) {
            router.push({
                pathname:'/file-manager',
                query:{
                    page:1,
                    q:encodeURIComponent(search)
                }
            },`/file-manager?q=${encodeURIComponent(search)}&page=1`,{shallow:true})
        } else {
            router.push({
                pathname:'/file-manager',
                query:{
                    page:1
                }
            },`/file-manager?page=1`,{shallow:true})
        }
    },[search,router])

    const firebaseUpload=React.useCallback(()=>{
        if(errorUpload===null) {
            setProgressVal(0)
            setBackdrop(true);
            const storage = getStorage(firebaseApp);
            const file=dialog.file,ti=new Date(),it=ti.getTime(), filename='PN_'+it+'_'+file.name,
            storageRef = getStorageRef(storage,'/lagu/' + filename),
            uploadTask = uploadBytesResumable(storageRef,file)
            setDialog(null);
            uploadTask.on('state_changed', (snapshot)=>{
                const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgressVal(prog)
            },(err)=>{
                setBackdrop(false);
                setNotif("Sorry, there was an error uploading your file. Please try again",true);
                setProgressVal(0);
                setValueUpload({title:"",artist:""});
                setArtwork(null);
                console.log(err);
            },()=>{
                getMetadata(uploadTask.snapshot.ref)
                .then(async(metadata)=>{
                    const form=new FormData();
                    const opt={
                        headers:{
                            'Content-Type':'multipart/form-data'
                        }
                    }
                    form.append("title",valueUpload.title);
                    form.append("artist",valueUpload.artist);
                    if(artwork != null) form.append("artwork",artwork);
                    form.append("path",filename);
                    form.append("size",metadata.size);
                    try {
                        const recaptcha = await captchaRef.current?.execute();
                        form.append("recaptcha",recaptcha);
                        await post(`/v1/files`,form,opt);
                        mutate()
                    } catch {

                    } finally {
                        setBackdrop(false);
                        setProgressVal(0);
                        setValueUpload({title:"",artist:""});
                        setArtwork(null);
                    }
                })
            })
        }
    },[errorUpload,post,setNotif,valueUpload,artwork,dialog?.file])

    const handleUpload=React.useCallback(async(e)=>{
        setLabelText("Drag files or click here to upload")
        setHoverClass(false)
        const file=e?.target?.files?.[0] || e?.dataTransfer?.files?.[0] || false;
        if(file) {
            if(file.type.match("image/*")) {
                if(Number(file.size) > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
                setProgressVal(0)
                setBackdrop(true);
                const form=new FormData();
                form.append('file',file);
                const opt={
                    headers:{
                        'Content-Type':'multipart/form-data'
                    },
                    onUploadProgress:(progEvent)=>{
                        const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                        setProgressVal(complete)
                    }
                }
                try {
                    const recaptcha = await captchaRef.current?.execute();
                    form.append("recaptcha",recaptcha);
                    await post(`/v1/files`,form,opt);
                    mutate()
                } catch {
                    
                } finally {
                    setBackdrop(false);
                    setProgressVal(0)
                }
            } else if(file.type == 'audio/mpeg' || file.type == 'audio/mp3') {
                if(Number(file.size) > 10485760) return setNotif("Sorry, your file is too large. Maximum audio size is 10 MB",true);
                const jsmediatags = require("jsmediatags") 
                jsmediatags.read(file,{
                    onSuccess:function(tag){
                        if(tag?.tags?.picture) {
                            const {data,format} = tag?.tags?.picture;
                            let base64String="";
                            for(let i=0;i<data?.length;i++) {
                                base64String += String.fromCharCode(data[i]);
                            }
                            const img = `data:${format};base64,${window.btoa(base64String)}`;
                            setArtwork(img);
                        }
                        setValueUpload({title:tag?.tags?.title,artist:tag?.tags?.artist});
                        setDialog({
                            file:file,
                            dialog:'upload'
                        })
                    },
                    onError:function(err){
                        console.log(err)
                        setDialog({
                            file:file,
                            dialog:'upload'
                        })
                    }
                })
            } else {
                setNotif("Error: File type not allowed",true);
            }
        }
    },[post,setNotif,mutate])

    const handleDrop=React.useCallback((e)=>{
        e.preventDefault();
        e.stopPropagation();
        handleUpload(e)
    },[handleUpload])
    
    /*const handleYoutube=React.useCallback((e)=>{
        e.preventDefault();
        if(errorVal===null) {
            setLoadingVal(true);
            captchaRef.current?.execute()
            .then(recaptcha=>post(`/v1/files`,{youtube:value,recaptcha}))
            .then(()=>{
                setLoadingVal(false);
                setValue("")
                mutate()
            }).catch((err)=>{
                setLoadingVal(false);
            })
        }
    },[post,mutate,errorVal,value])*/

    const handleUpdate=React.useCallback((index)=>{
        if(errorEdit===null) {
            setLoadingEdit(true);
            const upload={
                title:dialog?.title,
                private:dialog?.private,
                ...(typeof dialog?.artist !== 'undefined' ? {artist:dialog?.artist} : {})
            }
            captchaRef.current?.execute()
            .then(recaptcha=>put(`/v1/files/${dialog?.id}`,{...upload,recaptcha}))
            .then(()=>{
                setLoadingEdit(false);
                let newData=[...data?.data];
                newData[index]={
                    ...newData[index],
                    ...upload
                }
                mutate({
                    ...data,
                    data:newData
                })
                setDialog(null)
            }).catch((err)=>{
                setLoadingEdit(false);
            })
        }
    },[dialog,put,errorEdit,data,mutate])

    const handleDelete=React.useCallback((id,i)=>{
        setBackdrop(true);
        setDialog(null)
        del(`/v1/files/${id}`)
        .then(()=>{
            setBackdrop(false);
            mutate()
        }).catch((err)=>{
            setBackdrop(false);
        })
    },[del,mutate]);

    const handleDrag=React.useCallback((e,enter)=>{
        e.preventDefault();
        if(enter){
            setLabelText("Drop your files now")
            setHoverClass(true)
        } else {
            setLabelText("Drag files or click here to upload")
            setHoverClass(false)
        }
    },[])

    const changeProfile=React.useCallback((id)=>()=>{
        setDisable(true)
        post(`/v1/user/${username}`,{file_id:id})
        .then(([res])=>{
            closeDialog()
            window.location.reload();
        }).catch(()=>{})
        .finally(()=>setDisable(false))
    },[closeDialog,post,username])

    return (
        <Header navTitle="File Manager" title="File Manager" canonical='/file-manager' noIndex>
            <PaperBlock title="File Manager" noPadding whiteBg
            action={
                <>
                    <Hidden smDown>
                        <Search onchange={e=>setSearch(e.target.value)} onsubmit={handleSearch} onremove={handleRemoveSearch} remove autosize value={search} />
                    </Hidden>
                    <Hidden smUp>
                        <Search onchange={e=>setSearch(e.target.value)} onsubmit={handleSearch} onremove={handleRemoveSearch} remove value={search} />
                    </Hidden>
                </>
            }
            footer={
                <Pagination color='primary' count={totalPage} page={page ? Number(page) : 1} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
            }
            >
                <div key='file-upload' className={clx(classes.wrapper,classes.withBorder)}>
                    <div>
                        <div className={clx(classes.inputContainer,hoverClass && classes.inputHover)}
                        onDragEnter={(e)=>handleDrag(e,true)}
                        onDragOver={(e)=>e.preventDefault()}
                        onDragLeave={(e)=>handleDrag(e,false)}
                        onDrop={handleDrop} >
                            <input type="file" accept="audio/*|video/*|image/*" id="fileInput" style={{display:'none'}} onChange={handleUpload} />
                            <label htmlFor="fileInput">{labelText}</label>
                        </div>
                    </div>
                </div>
                {/*<div key='youtube-upload' className={clx(classes.wrapper,classes.withBorder)}>
                    <form onSubmit={handleYoutube}>
                        <Typography variant="h6" gutterBottom>Youtube Video</Typography>
                        <div className='flex-header'>
                            <TextField
                                value={value}
                                onChange={e=>handleChange('youtube','',e.target.value)}
                                fullWidth
                                required
                                error={errorVal!==null}
                                helperText={errorVal!==null ? errorVal : ''}
                                label="Youtube URL"
                                disabled={loadingVal}
                            />
                            <div style={{marginLeft:10}}>
                                <Button disabled={loadingVal} isloading={loadingVal} size='small' type='submit' icon='submit'>Submit</Button>
                            </div>
                        </div>
                    </form>
                </div>*/}
                <div key='data-wrapper' {...(data && data?.data?.length > 0 ? {} : {className:clx(classes.wrapper),style:{textAlign:'center'}})}>
                    {!data && !errorLoading ? (
                        <Skeleton image type='list' number={8} />
                    ) : errorLoading ? (
                        <Typography variant="h5">Failed to load data</Typography>
                    ) : data?.data?.length > 0 ? (
                        <List key='list-wrapper'>
                            {data?.data?.map((dt,i)=>(
                                <ListItem button key={`files-${i.toString()}`} divider classes={{secondaryAction:classes.secondaryAction}} onClick={()=>openDialog('file',dt,i)}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Image width={40} height={40} webp src={`${dt.thumbs}&size=40&watermark=no`} style={{width:40}} alt={dt.title} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={dt.title}
                                        secondary={`${ucwords(dt.type)}, ${number_size(dt.size)}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={()=>openDialog('edit',dt,i)}
                                            size="large">
                                            <Create />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={()=>openDialog('delete',dt,i)}
                                            size="large">
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="h5">No data.</Typography>
                    )}
                    {totalSize !==null && (
                        <div key='size-wrapper' className={clx(classes.wrapper,'flex-header')} style={{paddingBottom:0}}>
                            <div key='size-1'>
                                <Typography variant="body1">Total Size</Typography>
                            </div>
                            <div key='size-2'>
                                <Typography variant="body1">{totalSize}</Typography>
                            </div>
                        </div>
                    )}
                </div>
                <Backdrop
                    open={backdrop}
                    {...(progressVal!==0 ? {progress:progressVal} : {})}
                />
                <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth={dialog?.dialog!=='file' ? 'md' : 'sm'} fullWidth={dialog?.dialog!=='delete'} scroll='body'>
                    <DialogTitle id='dialog title'>{dialog?.dialog === 'edit' ? 'Edit '+dialog?.title : (dialog?.dialog === 'file' ? dialog?.title : (dialog?.dialog === 'upload' ? "Upload Audio" : 'Are you sure?'))}</DialogTitle>
                    { dialog !==null ?
                        dialog?.dialog==='edit' ? (
                            <DialogContent key='dialog-content' dividers>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Title'
                                            autoFocus
                                            fullWidth
                                            required
                                            value={dialog?.title}
                                            onChange={(e)=>handleChange('edit','title',e.target.value)}
                                            variant='outlined'
                                            disabled={loadingEdit}
                                            error={errorEdit!==null}
                                            helperText={errorEdit!==null ? errorEdit : ''}
                                        />
                                    </Grid>
                                    {typeof dialog?.artist !== 'undefined' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                label='Artist'
                                                fullWidth
                                                required
                                                value={dialog?.artist}
                                                onChange={(e)=>handleChange('edit','artist',e.target.value)}
                                                variant='outlined'
                                                disabled={loadingEdit}
                                                error={errorEdit!==null}
                                                helperText={errorEdit!==null ? errorEdit : ''}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel control={
                                                <Switch disabled={loadingEdit} checked={dialog?.private} onChange={event=>handleChange('edit','private',event.target.checked)} color="primary" />
                                            }
                                            label="Private" 
                                            
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                        ) : dialog?.dialog === 'upload' ? (
                            <DialogContent key='dialog-content' dividers>
                                <Grid container spacing={2}>
                                    {artwork !== null && (
                                        <Grid item xs={12}>
                                            <div style={{width:'100%',margin:'auto',textAlign:'center'}}><Image src={`${artwork}`} fancybox style={{maxWidth:300,width:'100%',margin:'auto'}} /></div>
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Title'
                                            autoFocus
                                            fullWidth
                                            required
                                            value={valueUpload.title}
                                            onChange={(e)=>handleChange('upload','title',e.target.value)}
                                            variant='outlined'
                                            error={errorUpload!==null}
                                            helperText={errorUpload!==null ? errorUpload : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Artist'
                                            fullWidth
                                            required
                                            value={valueUpload.artist}
                                            onChange={(e)=>handleChange('upload','artist',e.target.value)}
                                            variant='outlined'
                                            error={errorUpload!==null}
                                            helperText={errorUpload!==null ? errorUpload : ''}
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                        ) : dialog?.dialog === 'file' ? (
                            <DialogContent key='dialog-content' dividers>
                                {dialog?.type==='images' ? (
                                    <div style={{width:'100%',margin:'auto',textAlign:'center'}}><Image blured src={`${dialog?.url}&watermark=no`} webp alt={dialog?.title} fancybox style={{maxWidth:300,width:'100%',margin:'auto'}} /></div>
                                ) : dialog?.type==='youtube' || dialog?.type==='video' ? (
                                    <div style={{width:'100%',margin:'auto',textAlign:'center'}}>
                                        <Player
                                            url={dialog?.url}
                                            title={dialog?.title}
                                            type='video'
                                            thumbnails={dialog?.thumbs}
                                            {...(dialog?.type==='youtube' ? {provider:'youtube'} : {})}
                                        />
                                    </div>
                                ) : dialog?.type==='audio' ? (
                                    <div style={{width:'100%',margin:'auto',textAlign:'center'}}>
                                        <Player
                                            url={dialog?.url}
                                            title={dialog?.title}
                                            type='audio'
                                        />
                                    </div>
                                ) : null}
                            </DialogContent>
                        ) : null
                    : null}
                    <DialogActions className='grid-items'>
                        {dialog?.dialog==='upload' ? (
                            <>
                                <Button color='secondary' key='positifBtn' onClick={closeDialog}>Cancel</Button>
                                <Button key='negativeBtn' icon='upload' onClick={()=>firebaseUpload()}>Upload</Button>
                            </>
                        ) : dialog?.dialog==='edit' ? (
                            <>
                            <Button color='secondary' key='positifBtn' onClick={closeDialog} disabled={loadingEdit}>Cancel</Button>
                            <Button key='negativeBtn' onClick={()=>handleUpdate(dialog?.index)} disabled={loadingEdit} isloading={loadingEdit} icon='save' >Save</Button>
                            </>
                        ) : (
                            <>
                                {dialog?.dialog === 'file' && (dialog?.can_set_profile && !dialog?.is_profile_picture) && <Button key='profileBtn' disabled={disable} isloading={disable} onClick={()=>changeProfile(dialog?.id)}>Set as Profile Picture</Button>}
                                {dialog?.dialog === 'delete' && <Button key='positifBtn' onClick={()=>handleDelete(dialog?.id,dialog?.index)} icon='delete'>Yes</Button>}
                                <Button color='secondary' key='negativeBtn' onClick={closeDialog} disabled={dialog?.dialog==='file'&&disable}>{dialog?.dialog === 'delete' ? 'No' : 'Close'}</Button>
                            </>
                        )}
                    </DialogActions>
                </Dialog>
            </PaperBlock>
            <Recaptcha ref={captchaRef} />
        </Header>
    );
}

export default connect(state=>({username:state?.user !== null ? state?.user?.user_login:null}))(withStyles(FileManager,styles))