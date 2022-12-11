import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper, { BackendError } from "@redux/store";
import { accountUrl, href, portalUrl, staticUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useAPI, { ApiError } from "@design/hooks/api";
import { BlogDetail } from "@model/pages";
import { Div, Span } from "@design/components/Dom";
import { Close } from "@mui/icons-material";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import { CopyPartial, IPages } from "@type/general";
import Router, { useRouter } from "next/router";
import Recaptcha from "@design/components/Recaptcha";
import { useBeforeUnload, useMousetrap } from "@hooks/hotkeys";
import submitForm from "@utils/submit-form";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { parseURL, slugFormat, ucwords } from "@portalnesia/utils";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import type ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import dynamic from "next/dynamic";
import Sidebar from "@design/components/Sidebar";
import PaperBlock from "@design/components/PaperBlock";
import {arrayMove, SortableContainer,SortableElement,SortableHandle} from 'react-sortable-hoc'
import IconButton from "@mui/material/IconButton";
import { DragHandle, SortContainer } from "@comp/Sort";

const SimpleMDE=dynamic(()=>import('@comp/SimpleMDE'),{ssr:false})
const CKEditor=dynamic(()=>import('@comp/CKEditor'),{ssr:false})
const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));
const Select = dynamic(()=>import("@design/components/Select").then(m=>m.default),{ssr:false});
const SelectItem = dynamic(()=>import("@design/components/Select").then(m=>m.SelectItem),{ssr:false});
const FileManager = dynamic(()=>import("@comp/FileManager"));
const Image = dynamic(()=>import("@comp/Image"));

type IBlogEdit = Pick<CopyPartial<BlogDetail,'link'|'slug'>,'title'|'format'|'text'|'tags'|'category'|'slug'|'publish'|'image'|'link'>

export const getServerSideProps = wrapper<IBlogEdit>(async({redirect,session,params,resolvedUrl,fetchAPI})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    const slug = params?.slug;
    if(!Array.isArray(slug)) return redirect();
    if(typeof slug?.[0] !== 'string') return redirect();
    
    if(slug[0] === 'new') {
        const data: IBlogEdit = {
            title:"",
            tags:[],
            category:"uncategory",
            publish:false,
            text:"",
            format:"markdown",
            image:""
        }
        return {
            props:{
                data,
                meta:{
                    title:"New Blog"
                }
            }
        }
    } else {
        try {
            const data: IBlogEdit = await fetchAPI<IBlogEdit>(`/v2/blog/dashboard/${slug[0]}`);
            return {
                props:{
                    data,
                    meta:{
                        title:"Edit Blog"
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
const arrayCategory=["uncategory","tutorial","blog"];


const SortTag=SortableElement<{value:string,sortIndex:number,handleEditDialog: (type: string, i: number) => void,handleRemoveSort: (type: string, i: number) => (e: React.MouseEvent<HTMLButtonElement>) => void}>(({value,sortIndex,handleEditDialog,handleRemoveSort}: {value:string,sortIndex:number,handleEditDialog: (type: string, i: number) => void,handleRemoveSort: (type: string, i: number) => (e: React.MouseEvent<HTMLButtonElement>) => void})=>(
    <Div className={`pn-sort`} onClick={()=>handleEditDialog('tags',sortIndex)}
        sx={{
            zIndex:9999,
            padding:'10px 5px',
            WebkitBoxAlign:'center',
            boxSizing:'border-box',
            display:'flex',
            width:'100%',
            minHeight:40,
            alignItems:'center',
            borderBottom:t=>`1px solid ${t.palette.divider}`,
            cursor:'pointer',
            bgcolor:'background.paper',
            ':hover':{
                bgcolor:'action.hover'
            },
        }}
    >
        <DragHandle />
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
            <Typography variant='body2'>{value}</Typography>
            <IconButton
                style={{padding:5}}
                onClick={handleRemoveSort('tags',sortIndex)}
                size="large"><Close /></IconButton>
        </div>
    </Div>
))

export default function EditBlogPages({data,meta}: IPages<IBlogEdit>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const captchaRef = React.useRef<Recaptcha>(null);
    const [input,setInput] = React.useState(data);
    const [dialogValue,setDialogValue]=React.useState({name:''});
    const [loading,setLoading]=React.useState(false)
    const {post,put} = useAPI()
    const setNotif = useNotification();
    const [browser,setBrowser] = React.useState(false);
    const [canChange,setCanChange]=React.useState(true)
    const [sortI,setSortI]=React.useState<number>()
    const [dialog,setDialog]=React.useState<[string,string]>()
    const editorRef = React.useRef<ClassicEditor>();
    const dialogTextRef = React.useRef<HTMLInputElement>(null);

    const urlLink = React.useMemo(()=>portalUrl(`/blog/${slugFormat(input.slug||"")}`),[input.slug])
    const slugHelper = React.useMemo(()=>parseURL(urlLink),[urlLink]);

    const handleChange=React.useCallback(<K extends keyof IBlogEdit,V = IBlogEdit[K]>(name: K,val: V)=>{
        setCanChange(false)
        const additional: Partial<IBlogEdit> = {};
        if(name === 'title') {
            additional.slug = slugFormat(val as string);
        }
        setInput({
            ...input,
            ...additional,
            [name]:val
        })
    },[input])
    const handleChangeEditor=React.useCallback(()=>{
        setCanChange(false);
    },[])

    const handleSelectedImage=React.useCallback((url: string)=>{
        setInput(prev=>({
            ...prev,
            image:staticUrl(`img/url?image=${encodeURIComponent(url)}`)
        }))
    },[setInput])

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            const recaptcha = await captchaRef.current?.execute();
            if(slug?.[0] !== "new") {
                await put(`/v2/blog/${data.slug}`,{...input,recaptcha},{},{success_notif:true});
                setCanChange(true)
            } else {
                const res = await post<{slug?:string}>("/v2/blog",{...input,recaptcha},{},{success_notif:true});
                setCanChange(true)
                if(res?.slug) {
                    setTimeout(()=>{
                        Router.push(`/dashboard/blog/${res.slug}`);
                    },500)
                }
            }
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    }),[input,slug,post,put,setNotif])

    const handleEditDialog=React.useCallback((type: string,i: number)=>{
        setSortI(i)
        if(type==='tags') {
            setDialogValue({
                name:input.tags[i]
            })
        }
        setDialog([type,"Edit"]);
    },[input])

    const handleRemoveSort=React.useCallback((type: string,i: number)=>(e: React.MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation();
        if(type==='tags') {
            const aaa=[...input.tags];
            aaa.splice(i,1);
            setInput({
                ...input,
                tags:aaa
            })
        }
    },[input])

    const onSortEnd=React.useCallback((type:'tags')=>({oldIndex,newIndex}:{oldIndex:number,newIndex:number})=>{
        setInput({
            ...input,
            [type]:arrayMove<string>(input?.[type],oldIndex,newIndex)
        })
    },[input])

    const onCloseDialog=React.useCallback(()=>{
        setDialog(undefined);
        setSortI(undefined);
        setDialogValue({name:""})
    },[])

    const handleDialog=React.useCallback((type: string)=>submitForm(()=>{
        let err=false;
        if(typeof dialogValue.name === 'undefined' || typeof dialogValue.name === 'string' && dialogValue.name.length===0) err=true;
        if(type==='tags'){
            if(!err){
                const dt=input.tags;
                if(sortI!==undefined) dt[sortI]=dialogValue.name;
                else dt.push(dialogValue.name);
                setInput({
                    ...input,
                    tags:dt
                })
            }
        } 

        if(!err) {
            onCloseDialog();
        }
    }),[dialogValue,input,onCloseDialog,sortI])

    React.useEffect(()=>{
        if(dialog) {
            setTimeout(()=>dialogTextRef.current?.focus(),100);
        }
    },[dialog])

    useBeforeUnload(canChange,`/dashboard/blog/${slug?.[0]}`)

    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        handleSubmit()
    },true)

    useMousetrap(['+','shift+='],(e)=>{
        setDialog(['tags','Add'])
    },false)

    return (
        <Pages title={meta?.title} noIndex canonical={'slug' in data ? `/dashboard/blog/${data?.slug}` : '/dashboard/blog/new'}>
            <DashboardLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>{'slug' in data ? "Edit Blog" : "New Blog"}</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} lg={8}>

                            <Box id='editor-content'>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            value={input?.title || ''}
                                            label="Title"
                                            fullWidth
                                            onChange={event=>handleChange('title',event.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={8}>
                                        <TextField
                                            value={input?.slug || ''}
                                            label="Slug"
                                            fullWidth
                                            onChange={event=>handleChange('slug',event.target.value)}
                                            required
                                            helperText={slugHelper}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={4}>
                                        <Select label="Format" fullWidth value={input.format} onChange={(e)=>handleChange('format',e.target.value)}>
                                            <SelectItem value="html">HTML</SelectItem>
                                            <SelectItem value="markdown">Markdown</SelectItem>
                                        </Select>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {input.format === 'markdown' ? (
                                            <SimpleMDE
                                                onChange={(text)=>handleChange('text',text)}
                                                value={input?.text}
                                                image
                                            />
                                        ) : (
                                            <CKEditor
                                                data={input?.text}
                                                onReady={e=>editorRef.current = e}
                                                onChange={handleChangeEditor}
                                                onSave={handleSubmit}
                                            />
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>

                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <Sidebar id='editor-content' minimalScreen="lg">
                                <PaperBlock title="Options" content={{sx:{px:0}}}>
                                    <Stack alignItems='flex-start' spacing={3}>
                                        <Box px={2} width='100%'>
                                            <Typography variant='h6' component='h6' gutterBottom>Post Thumbnail</Typography>
                                            {input?.image!==null && input?.image?.length > 0 && (
                                                <Stack mb={2}><Image src={`${input?.image}&size=350&watermark=no`} dataSrc={`${input?.image}&watermark=no`} fancybox webp sx={{width:'100%',maxHeight:350,objectFit:'contain'}} /></Stack>
                                            )}
                                            <Stack direction='row' spacing={1}>
                                                <Button outlined color='inherit' sx={{width:'100%'}} onClick={openFileManager}>{input?.image!==null && input?.image?.length > 0 ? "Change" : "Select"}</Button>
                                                {input?.image!==null && input?.image?.length > 0 && <Button outlined color='inherit' sx={{width:'100%'}} onClick={()=>handleChange('image','')}>Remove</Button>}
                                            </Stack>
                                        </Box>

                                        <Divider sx={{width:'100%'}} />
                                        
                                        <Box px={2} width='100%'>
                                            <Typography variant='h6' component='h6' gutterBottom>Category</Typography>
                                            <Select fullWidth value={input.category} onChange={(e)=>handleChange('category',e.target.value)}>
                                                {arrayCategory.map(c=>(
                                                    <SelectItem key={c} value={c}>{ucwords(c)}</SelectItem>
                                                ))}
                                            </Select>
                                        </Box>

                                        <Divider sx={{width:'100%'}} />

                                        <Box px={2} width='100%'>
                                            <Typography variant='h6' component='h6' gutterBottom>Tags</Typography>
                                            <Div sx={{
                                                '.helper':{
                                                    boxShadow:t=>`0 0 8px ${t.palette.action.active}`,
                                                }
                                            }}>
                                                {input?.tags?.length > 0 ? (
                                                    <SortContainer onSortEnd={onSortEnd('tags')} useDragHandle  helperClass={'helper'}>
                                                        {input?.tags?.map((val,i)=>(
                                                            <SortTag key={`tags-${i.toString()}`} index={i} sortIndex={i} value={val} handleEditDialog={handleEditDialog} handleRemoveSort={handleRemoveSort} />
                                                        ))}
                                                    </SortContainer>
                                                ) : <div style={{marginBottom:10}}></div>}
                                            </Div>
                                            <Button tooltip="+" sx={{mt:1}} disabled={loading} outlined color='inherit' onClick={(e)=>{setDialog(['tags','Add']),e.currentTarget.blur()}}>Add</Button>
                                        </Box>

                                        <Divider sx={{width:'100%'}} />

                                        <Box px={2} width='100%'>
                                            <Typography variant='body1'>Link: <a className="underline" href={href(urlLink)} target="_blank"><Span sx={{color:'customColor.link'}}>{slugHelper}</Span></a></Typography>
                                        </Box>

                                        {slug?.[0]!=='new' && (
                                            <>
                                                <Divider sx={{width:'100%'}} />
                                                <Box px={2} width='100%'>
                                                    <Grid item xs={12}>
                                                        <FormGroup>
                                                            <FormControlLabel control={
                                                                <Switch disabled={loading} checked={input.publish} onChange={event=>handleChange('publish',event.target.checked)} color="primary" />
                                                            }
                                                            label="Publish" />
                                                        </FormGroup>
                                                    </Grid>
                                                </Box>
                                            </>
                                        )}

                                        <Divider sx={{width:'100%'}} />

                                        <Box px={2} width='100%'><Button sx={{width:'100%'}} tooltip="Ctrl + S" type='submit' icon='save'>Save</Button></Box>
                                    </Stack>
                                </PaperBlock>
                            </Sidebar>
                        </Grid>
                    </Grid>
                </form>
            </DashboardLayout>
            <Backdrop open={loading} />
            <Dialog open={dialog!==undefined && !loading} handleClose={onCloseDialog}
                title={`${dialog?.[1]} ${dialog?.[0]==='tags' ? 'Tags': ''}`}
            >
                <form onSubmit={dialog ? handleDialog(dialog?.[0]) : (e)=>e.preventDefault()}>
                    {dialog?.[0]==='tags' ? (
                        <TextField
                            inputRef={dialogTextRef}
                            label='Tag Name'
                            value={dialogValue.name}
                            onChange={(e)=>setDialogValue({name:e.target.value})}
                            fullWidth
                            required
                            error={dialogValue.name.length===0}
                            helperText={dialogValue.name.length===0 ? 'Cannot be empty':''}
                        />
                    ) : null}
                    <DialogActions sx={{mt:2}}>
                        <Button type='submit'>{dialog?.[1]==='Edit' ? 'Save' : 'Add'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
            <FileManager open={browser} onSelected={handleSelectedImage} handleClose={()=>setBrowser(false)} />
        </Pages>
    )
}