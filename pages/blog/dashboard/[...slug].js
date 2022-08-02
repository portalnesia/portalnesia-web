import React from 'react'
import Header from 'portal/components/Header'
import CustomButton from 'portal/components/Button'
import Image from 'portal/components/Image'
import Sidebar from 'portal/components/Sidebar'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import {slugFormat as setSlug,ucwords} from '@portalnesia/utils'
import {staticUrl} from 'portal/utils/Main'
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {Grid,Typography,IconButton,TextField,FormControlLabel,FormGroup,Switch,Divider,MenuItem} from '@mui/material'
import {Cancel as CancelIcon,Close as CloseIcon} from '@mui/icons-material'
import {sortableContainer,sortableElement,sortableHandle} from 'react-sortable-hoc'
import {arrayMoveImmutable as arrayMove} from 'array-move'
//import CKEditor from 'ckeditor4-react'
import {isMobile} from 'react-device-detect'
import {useMousetrap,useBeforeUnload} from 'portal/utils/useKeys'
import ReCaptcha from 'portal/components/ReCaptcha'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Editor=dynamic(()=>import('portal/components/CKEditor'),{ssr:false})
const Browser=dynamic(()=>import('portal/components/Browser'))
const SimpleMDE=dynamic(()=>import('portal/components/SimpleMDE'),{ssr:false})

//CKEditor.editorUrl=`${process.env.CONTENT_URL}/ckeditor/ckeditor.js`;

const arrayCategory=["uncategory","tutorial","blog"];
const arrayFormat=[['html','HTML'],['markdown','Markdown']];
export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,res,params})=>{
    const slug=params.slug;
    if(data.user === null) {
        return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    }
    if(slug?.[0] !== "edit" && slug?.[0] !== "new") {
        return {
            notFound:true
        }
    }
    if(slug?.[0] === "edit" && typeof slug?.[1] === "undefined" || slug?.[0] === "new" && typeof slug?.[1] !== "undefined" || ['new','edit'].indexOf(slug?.[0]) === -1) {
        return {
            notFound:true
        }
    }
    const meta={
        title:"New Blog",
    }
    if(slug?.[0]==='edit') {
        const blog = await db.get("pages",{type:'blog',slug:slug[1]},{limit:1});
        if(!blog) {
            return {
                notFound:true
            }
        }
        if(blog.userid==1 && !data?.user?.admin) {
            return {
                notFound:true
            }
        } else if(blog.userid!=1 && blog.userid != data?.user?.id) {
            return {
                notFound:true
            }
        }
        blog.block=Boolean(blog.block);
        if(blog.block) return {props:{meta:{err:'blocked'}}}
        const b = {
            title:blog.title,
            format:blog.format,
            text:blog.text !== null ? blog.text.replace(/\\\"/gim,'"').replace(/\\\'/gim,"'") : "",
            tags:blog.tag.length > 0 ? blog.tag.split(",") : [],
            category:arrayCategory[Number(blog.kategori)],
            slug:blog.slug,
            image:blog.photo,
            publish:Boolean(blog.publish),
            userid:blog.userid
        }
        meta.title="Edit blog";
        meta.blog=b;
    }
    return {props:{meta:meta}}
})

const styles=theme=>({
    wrapper:{
        [theme.breakpoints.down('md')]: {
            paddingLeft:theme.spacing(2),
            paddingRight:theme.spacing(2)
        },
            [theme.breakpoints.up('sm')]: {
            paddingLeft:theme.spacing(3),
            paddingRight:theme.spacing(3)
        },
        paddingBottom:theme.spacing(1.5),
        paddingTop:theme.spacing(1.5),
    },
    sortContainer:{
        position:'relative',
        zIndex:0,
        marginTop:10,
        marginBottom:10,
        background:theme.palette.background.default
    },
    sortItem:{
        zIndex:9999,
        padding:'10px 5px',
        WebkitBoxAlign:'center',
        boxSizing:'border-box',
        display:'-webkit-box',
        display:'-webkit-flex',
        display:'flex',
        width:'100%',
        minHeight:40,
        alignItems:'center',
        borderBottom:`1px solid ${theme.palette.divider}`,
        cursor:'pointer',
        background:theme.palette.background.paper,
        '&:hover':{
            background:theme.palette.action.hover
        },
        //'&:active':{
        //   boxShadow: `0 0 8px ${theme.palette.action.active}`,
        //},
    },
    drag:{
        position:'relative',
        cursor:'row-resize',
        top:1,
        display:'block',
        width:18,
        height:11,
        opacity:'.55',
        marginRight:20,
        background:'-webkit-linear-gradient(top,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)',
        background:'linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)'
    },
    helper:{
        boxShadow: `0 0 8px ${theme.palette.action.active}`,
    },
    action:{
        boxShadow: `0 0 8px ${theme.palette.action.active}`,
    }
})

const EditBlog=({classes,meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {slug}=router.query;
    const captchaRef=React.useRef(null)
    const isEditPost = slug?.[0]!=='new';
    const DragHandle=sortableHandle(()=><div className={classes.drag}></div>);
    const SortTag=sortableElement(({value,sortIndex})=>(
        <div className={`${classes.sortItem} pn-sort`} onClick={()=>handleEditDialog('tags',sortIndex)}>
            <DragHandle />
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                <Typography variant='body2'>{value}</Typography>
                <IconButton
                    style={{padding:5}}
                    onClick={(e)=>handleRemoveSort('tags',sortIndex,e)}
                    size="large"><CloseIcon /></IconButton>
            </div>
        </div>
    ))
    const SortContainer=sortableContainer(({children})=>(
        <div className={classes.sortContainer}>{children}</div>
    ))
    const {post,put}=useAPI();
    const [dialogValue,setDialogValue]=React.useState({name:'',id:''});
    const [value,setValue]=React.useState(meta?.blog||{title:'',format:'html',text:'',tags:[],category:'uncategory',slug:'',image:'',publish:false});
    const [loading,setLoading]=React.useState(false)
    const [sortI,setSortI]=React.useState(null)
    const [dialog,setDialog]=React.useState(null)
    const [canChange,setCanChange]=React.useState(true)
    const [browser,setBrowser] = React.useState(false);
    const editorRef = React.useRef();

    useBeforeUnload(canChange,`/blog/dashboard/${slug[0]}${slug?.[1] ? `/${slug[1]}` : ''}`)
    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit(e)
    },true)
    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        if(isEditPost) router.push('/blog/dashboard/[...slug]','/blog/dashboard/new');
    },false)

    const handleSelectedImage=React.useCallback((url)=>{
        setValue(prev=>({
            ...prev,
            image:staticUrl(`img/url?image=${encodeURIComponent(url)}`)
        }))
    },[setValue])

    const handleChange=React.useCallback((name,val)=>{
        setCanChange(false)
        if(name==='title') {
            const slug = setSlug(val);
            setValue(prev=>({
                ...prev,
                title:val,
                slug
            }))
        } else if(name==='slug') {
            const slug = setSlug(val);
            setValue(prev=>({
                ...prev,
                slug
            }))
        } else {
            setValue(prev=>({
                ...prev,
                [name]:val
            }))
        }
    },[setValue])

    const onCloseDialog=React.useCallback(()=>{
        setDialog(null);
        setSortI(null);
        setDialogValue({name:"",id:""})
    },[])

    const handleEditDialog=React.useCallback((type,i)=>{
        setSortI(i)
        if(type==='tags') {
            setDialogValue({
                name:value.tags[i]
            })
        }
        setDialog([type,"Edit"]);
    },[value])

    const handleRemoveSort=React.useCallback((type,i,e)=>{
        e.stopPropagation();
        if(type==='tags') {
            const aaa=value.tags;
            aaa.splice(i,1);
            setValue({
                ...value,
                tags:aaa
            })
        }
    },[value])

    const handleDialog=React.useCallback((type)=>{
        let err=false;
        if(typeof dialogValue.name === 'undefined' || typeof dialogValue.name === 'string' && dialogValue.name.length===0) err=true;
            
        if(type==='tags'){
            if(!err){
                const dt=value.tags;
                if(sortI!==null) dt[sortI]=dialogValue.name;
                else dt.push(dialogValue.name);
                setValue({
                    ...value,
                    tags:dt
                })
            }
        } 

        if(!err) {
            onCloseDialog();
        }
    },[dialogValue,value])

    const onSortEnd=React.useCallback((type)=>({oldIndex,newIndex})=>{
        setValue({
            ...value,
            [type]:arrayMove(value?.[type],oldIndex,newIndex)
        })
    },[value])

    const handleChangeEditor=React.useCallback(()=>{
        setCanChange(false);
    },[])

    const handleSubmit=async(e)=>{
        if(typeof e?.preventDefault==='function') e.preventDefault()
        if(loading) return;
        setLoading(true);
        try {
            const text = value?.format === 'html' ? editorRef.current?.getData() : value?.text;
            const dt={
                ...value,
                text,
                tags:value.tags.join(",")
            }
            if(isEditPost) {
                const recaptcha = await captchaRef?.current?.execute()
                const [r] = await put(`/v1/blog/${slug[1]}`,{...dt,recaptcha},{},{success_notif:true});
                setCanChange(true)
                setTimeout(()=>router.replace('/blog/dashboard/[...slug]',`/blog/dashboard/edit/${r.slug}`,{shallow:true}),500);
            } else {
                const recaptcha = await captchaRef?.current?.execute()
                const [r] = await post(`/v1/blog`,{...dt,recaptcha},{},{success_notif:true});
                setTimeout(()=>{
                    router.push('/blog/dashboard/[...slug]',`/blog/dashboard/edit/${r.slug}`);
                },1000)
            }
        } catch {
            
        } finally {
            setLoading(false);
        }
    }

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    /*React.useEffect(()=>{
        const onMessage=(e)=>{
            if(e.origin!==process.env.URL) return;
            if(typeof e.data.type === 'undefined' || e?.data?.type !== 'use' || typeof e.data.src !== 'string') return;
            handleChange('image',e.data.src)
        }
        window.addEventListener('message',onMessage)
        return ()=>window.removeEventListener('message',onMessage)
    },[])*/

    return (
        <Header title={meta.title} canonical={slug?.[1] ? `/blog/dashboard/edit/${slug?.[1]}` : '/blog/dashboard/new'} noIndex active='blog' subactive='dashboard'>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {meta.err==='blocked' ? (
                        <Grid item xs={12}>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h6">Your Blog is Blocked</Typography>
                            </div>
                        </Grid>
                    ) : (
                        <>
                        <Grid item xs={12} lg={8}>
                            <PaperBlock id='cardContent' title={isEditPost ? "Edit Post" : "New Post"} whiteBg>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Title'
                                            value={value.title}
                                            onChange={(e)=>handleChange('title',e.target.value)}
                                            variant='outlined'
                                            fullWidth
                                            required
                                            disabled={loading}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label='Slug'
                                            value={value.slug}
                                            onChange={(e)=>handleChange('slug',e.target.value)}
                                            variant='outlined'
                                            fullWidth
                                            required
                                            disabled={loading}
                                            helperText={`${process.env.URL}/blog/${value?.slug}`}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            select
                                            value={value?.format}
                                            onChange={(e)=>handleChange("format",e.target.value)}
                                            SelectProps={{native:isMobile}}
                                            variant="outlined"
                                            fullWidth
                                            required
                                            disabled={loading}
                                            helperText="Format Editor"
                                        >
                                            {isMobile ? arrayFormat.map((cat)=><option key={`mobile-${cat[0]}`} value={cat[0]}>{cat[1]}</option>) : arrayFormat.map((cat)=><MenuItem key={`desktop-${cat[0]}`} value={cat[0]}>{cat[1]}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {value?.format === 'html' ? (
                                            <Editor
                                                data={value?.text}
                                                onReady={e=>editorRef.current = e}
                                                onChange={handleChangeEditor}
                                                disabled={loading}
                                                onSave={handleSubmit}
                                            />
                                        ) : (
                                            <SimpleMDE
                                                id="markdown-editor"
                                                onChange={(text)=>handleChange('text',text)}
                                                value={value?.text}
                                                name='text'
                                                image
                                            />
                                        )}
                                    </Grid>
                                </Grid>
                            </PaperBlock>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <Sidebar id='cardContent'>
                                <PaperBlock key='option' title="Option" noPadding linkColor>
                                    <div key={0} className={classes.wrapper}>
                                        <Typography variant='h6' component='h6'>Post Thumbnails</Typography>
                                        {value?.image!==null && value?.image?.length > 0 ? (
                                            <div style={{position:'relative',margin:'15px auto',textAlign:'center'}}>
                                                <IconButton
                                                    style={{position:'absolute',top:5,right:5}}
                                                    onClick={()=>handleChange('image','')}
                                                    size="large">
                                                    <CancelIcon fontSize='large' style={{color:'red'}} />
                                                </IconButton>
                                                <Image blured src={`${value?.image}&size=200`} dataSrc={value?.image} fancybox webp style={{width:'100%',maxWidth:400,margin:'auto'}} />
                                            </div>
                                        ) : <div style={{margin:'15px 0'}}>No thumbnails</div>}
                                        <CustomButton disabled={loading} outlined onClick={openFileManager}>Add</CustomButton>
                                    </div>

                                    <Divider key={1} />
                                    <div key={2} className={classes.wrapper}>
                                        <Typography variant='h6' component='h6' gutterBottom>Category</Typography>
                                        <TextField
                                            select
                                            value={value?.category}
                                            onChange={(e)=>handleChange("category",e.target.value)}
                                            SelectProps={{native:isMobile}}
                                            variant="outlined"
                                            fullWidth
                                            required
                                            disabled={loading}
                                        >
                                            {isMobile ? arrayCategory.map((cat)=><option key={`mobile-${cat}`} value={cat}>{ucwords(cat)}</option>) : arrayCategory.map((cat)=><MenuItem key={`desktop-${cat}`} value={cat}>{ucwords(cat)}</MenuItem>)}
                                        </TextField>
                                    </div>

                                    <Divider key={3} />
                                    <div key={4} className={classes.wrapper}>
                                        <Typography variant='h6' component='h6'>Tags</Typography>
                                        {value?.tags?.length > 0 ? (
                                            <SortContainer onSortEnd={onSortEnd('tags')} useDragHandle  helperClass={classes.helper}>
                                                {value?.tags?.map((val,i)=>(
                                                    <SortTag key={`tags-${i.toString()}`} index={i} sortIndex={i} value={val} />
                                                ))}
                                            </SortContainer>
                                        ) : <div style={{marginBottom:10}}></div>}
                                        <CustomButton disabled={loading} outlined onClick={()=>setDialog(['tags','Add'])}>Add</CustomButton>
                                    </div>

                                    <Divider key={7} />
                                    <div key={8} className={classes.wrapper}>
                                        <Typography variant='body1'>Link: <a className="underline" href={`/blog/${value?.slug}`} target="_blank">{`${process.env.URL.substring(8)}/blog/${value?.slug}`}</a></Typography>
                                    </div>
                                    
                                    {slug?.[0]==='edit' && (
                                        <>
                                            <Divider key={9} />
                                            <div key={10} className={classes.wrapper}>
                                                <Grid item xs={12}>
                                                    <FormGroup>
                                                        <FormControlLabel control={
                                                            <Switch disabled={loading} checked={value.publish} onChange={event=>handleChange('publish',event.target.checked)} color="primary" />
                                                        }
                                                        label="Publish" />
                                                    </FormGroup>
                                                </Grid>
                                            </div>
                                        </>
                                    )}

                                    <Divider key={11} />
                                    <div key={12} className={classes.wrapper} style={{paddingBottom:0}}>
                                        <CustomButton tooltip='Ctrl + S' type="submit" disabled={loading} loading={loading} icon='save' >Save</CustomButton>
                                    </div>
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                        </>
                    )}
                </Grid>
            </form>
            <Dialog open={dialog!==null && !loading} aria-labelledby='dialog' maxWidth='md' fullWidth scroll='body'>
                <form onSubmit={(e)=>{e.preventDefault(),handleDialog(dialog?.[0])}}>
                    <DialogTitle>{`${dialog?.[1]} ${dialog?.[0]==='tags' ? 'Tags': ''}`}</DialogTitle>
                    <DialogContent dividers>
                        {dialog?.[0]==='tags' ? (
                            <TextField
                                autoFocus
                                label='Tag Name'
                                value={dialogValue.name}
                                onChange={(e)=>setDialogValue({...dialogValue,name:e.target.value})}
                                variant='outlined'
                                fullWidth
                                required
                                error={dialogValue.name.length===0}
                                helperText={dialogValue.name.length===0 ? 'Cannot be empty':''}
                            />
                        ) : null}
                    </DialogContent>
                    <DialogActions>
                        <CustomButton color="secondary" onClick={onCloseDialog}>Cancel</CustomButton>
                        <CustomButton type='submit'>{dialog?.[1]==='Edit' ? 'Save' : 'Add'}</CustomButton>
                    </DialogActions>
                </form>
            </Dialog>
            <ReCaptcha ref={captchaRef} />
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
        </Header>
    );
}
//<Browser open={browser!==null} onSelected={handleSelected(browser)} onClose={()=>setBrowser(null)} />
export default withStyles(EditBlog,styles)