import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import Image from 'portal/components/Image'
import Sidebar from 'portal/components/Sidebar'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import {slugFormat as setSlug} from '@portalnesia/utils'
import {staticUrl} from 'portal/utils/Main'
import useAPI from 'portal/utils/api'
import db from 'portal/utils/db'
import {Grid,Typography,IconButton,TextField,FormControlLabel,FormGroup,Switch,Divider,MenuItem} from '@mui/material'
import {Cancel as CancelIcon} from '@mui/icons-material'
//import CKEditor from 'ckeditor4-react'
import {isMobile} from 'react-device-detect'
import {useMousetrap,useBeforeUnload} from 'portal/utils/useKeys'
import ReCaptcha from 'portal/components/ReCaptcha'
import dynamic from 'next/dynamic'

const Editor=dynamic(()=>import('portal/components/CKEditor'),{ssr:false})
const Browser=dynamic(()=>import('portal/components/Browser'))
const SimpleMDE=dynamic(()=>import('portal/components/SimpleMDE'),{ssr:false})

//CKEditor.editorUrl=`${process.env.CONTENT_URL}/ckeditor/ckeditor.js`;
const arrayFormat=[['html','HTML'],['markdown','Markdown']];
export const getServerSideProps = wrapper(async({pn:data,res,params,query})=>{
    const slug=params.slug;
    const post_type = query?.type||"pages"
    if(data.user === null || !data?.user?.admin) {
        return db.redirect();
    }
    const blog = await db.get("pages",{type:post_type,slug},{limit:1});
    if(!blog) {
        return db.redirect();
    }
    blog.publish=Boolean(blog.publish);
    const b = {
        title:blog.title,
        format:blog.format,
        text:blog.text !== null ? blog.text.replace(/\\\"/gim,'"').replace(/\\\'/gim,"'") : "",
        slug:blog.slug,
        image:blog.photo,
        publish:Boolean(blog.publish),
        userid:blog.userid
    }
    const meta={
        title:"Edit Pages",
        pages:b
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

const EditPages=({classes,meta,errorCode})=>{
    if(errorCode) return <ErrorPage statusCode={errorCode} />

    const captchaRef=React.useRef(null)
    const router=useRouter();
    const {put}=useAPI()
    const {slug,type:post_type}=router.query;
    const [value,setValue]=React.useState(meta?.pages||{title:'',format:'html',text:'',slug:'',image:'',publish:false});
    const [loading,setLoading]=React.useState(false)
    const [canChange,setCanChange]=React.useState(true)
    const [browser,setBrowser] = React.useState(false);
    const editorRef = React.useRef();

    useBeforeUnload(canChange,`/pages/edit/${slug}`)
    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        e.returnValue=false
        handleSubmit(e)
    },true)

    const slugg=React.useMemo(()=>{
        if(post_type==='developer') {
            const aslug = value.slug.replace(/\-/,"/");
            const aa = aslug.split("/");
            if(aa[0]==='apireference') return `api-reference/${a[1]}`
            else return aslug;
        } else {
            return value.slug
        }
    },[value.slug,post_type])

    const handleSelectedImage=React.useCallback((url)=>{
        setValue(prev=>({
            ...prev,
            image:staticUrl(`img/url?image=${encodeURIComponent(url)}`)
        }))
    },[setValue])

    const handleChange=(name,val)=>{
        setCanChange(false)
        if(name==='title') {
            const slug = setSlug(val);
            setValue({
                ...value,
                title:val,
                slug
            })
        } else if(name==='slug') {
            const slug = setSlug(val);
            setValue({
                ...value,
                slug
            })
        } else {
            setValue({
                ...value,
                [name]:val
            })
        }
    }

    const handleChangeEditor=React.useCallback(()=>{
        setCanChange(false);
    },[])

    const handleSubmit=async(e)=>{
        if(typeof e?.preventDefault === 'function') e.preventDefault()
        if(loading) return;
        setLoading(true);
        const url=`/v1/pages/${slug}${post_type==='developer' ? '?type=developer' : ''}`;
        const text = value?.format === 'html' ? editorRef.current?.getData() : value?.text;
        const dt={
            ...value,
            text
        }
        try {
            const recaptcha = await captchaRef?.current?.execute()
            const [r] = await put(url,{...dt,recaptcha});
            setCanChange(true)
            setTimeout(()=>router.replace('/pages/edit/[slug]',`/pages/edit/${r.slug}`,{shallow:true}),500);
        } catch {

        } finally {
            setLoading(false);
        }
    }

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    return (
        <Header title={meta.title} canonical={`/pages/edit/${slug}`} noIndex>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={8}>
                        <PaperBlock id='cardContent' title="Edit Post" whiteBg>
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
                                        helperText={post_type === 'developer' ? `${process.env.URL}/developer/${slugg}` : `${process.env.URL}/pages/${value?.slug}`}
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
                            <PaperBlock title="Option" noPadding linkColor>
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
                                    <Button disabled={loading} outlined onClick={openFileManager}>Add</Button>
                                </div>

                                <Divider key={7} />
                                <div key={8} className={classes.wrapper}>
                                    <Typography variant='body1'>Link: <a className="underline" href={post_type === 'developer' ? `/developer/${slugg}` : `/pages/${value?.slug}`} target="_blank">{`${process.env.URL.substring(8)}${post_type === 'developer' ? `/developer/${slugg}` : `/pages/${value?.slug}`}`}</a></Typography>
                                </div>
                                
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

                                <Divider key={11} />
                                <div key={12} className={classes.wrapper} style={{paddingBottom:0}}>
                                    <Button tooltip='Ctrl + S' type="submit" disabled={loading} loading={loading} icon='save'>Save</Button>
                                </div>
                            </PaperBlock>
                        </Sidebar>
                    </Grid>
                </Grid>
            </form>
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
            <ReCaptcha ref={captchaRef} />
        </Header>
    );
}

export default withStyles(EditPages,styles)