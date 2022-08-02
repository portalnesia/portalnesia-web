import React from 'react'
import Skeleton from 'portal/components/Skeleton'
import Button from 'portal/components/Button'
import EmailEditor,{EmailEditorProps,Design as DesignTypes,DoneFunc} from 'react-email-editor';
import { useSelector } from 'react-redux';
import {State} from 'portal/type/store'
import useAPI,{Pagination as PaginationResponse} from 'portal/utils/api'
import useSWR from 'portal/utils/swr'
import {UnsplashTypes,PixabayTypes} from 'portal/type/files'
import useCombinedRefs from 'portal/utils/combinedRefs'
import {styled,Typography,Pagination,IconButton,Grid} from '@mui/material'
import {Close as CloseIcon,Fullscreen,FullscreenExit,DesignServices} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Image=dynamic(()=>import('portal/components/Image'))
const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));
const CardMedia=dynamic(()=>import('@mui/material/CardMedia'));
const Backdrop = dynamic(()=>import('portal/components/Backdrop'))
const Browser=dynamic(()=>import('portal/components/Browser'));
const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))

export interface UnlayerProps extends EmailEditorProps {
    signature?: string;
    type?: 'email';
    disabled?:boolean;
    loading?: boolean;
    onSave?(event: React.MouseEvent<HTMLButtonElement>): void;
}

const Title = styled(Typography)(()=>({
    marginBottom:'0 !important',
    fontWeight:'bold',
    textOverflow:'ellipsis',
    display:'-webkit-box!important',
    overflow:'hidden',
    WebkitBoxOrient:'vertical',
    WebkitLineClamp:1
}))
const Div = styled('div')<{fullscreen: boolean}>(({theme,fullscreen})=>({
    ...(fullscreen ? {
        position:'fixed',
        height:'100%',width:'100%',
        zIndex:1202,
        background:theme.palette.background.default,
        top:0,
        left:0
    } : {})
}))

interface TemplateTypes {
    id: number;
    name: string;
    slug: string;
    thumbs: string;
    json: Record<string,any>
}

type Response = PaginationResponse<TemplateTypes>

let isOverflow = false;
const UnlayerComp = React.forwardRef<EmailEditor,UnlayerProps>((props,ref)=>{
    const {signature,onReady,options,type='email',disabled,loading,onSave,...rest} = props;
    const {redux_theme:theme,user}=useSelector<State,Pick<State,'user'|'redux_theme'>>(state=>({redux_theme:state.redux_theme,user:state.user}));
    const editorRef = React.useRef(ref) as React.RefObject<EmailEditor>
    const combinedRefs = useCombinedRefs<EmailEditor>(ref,editorRef);

    const {get} = useAPI();
    const [backdrop,setBackdrop] = React.useState(false);
    const [browser,setBrowser]=React.useState(false);
    const [template,setTemplate]=React.useState(false);
    const [page,setPage]=React.useState(1);
    const [fullscreen,setFullscreen]=React.useState(false);
    const {data,error} = useSWR<Response>(`/v1/template?type=${type}&page=${page}`);
    const doneRef = React.useRef<DoneFunc>();

    const onEditorLoad=React.useCallback(()=>{
        if(editorRef?.current) {
            editorRef.current.registerCallback("selectImage",(_,done)=>{
                doneRef.current = done;
                setBrowser(true)
            })
        }
        if(onReady) onReady();
    },[onReady]);

    const handleSelectedImage=React.useCallback((url: string)=>{
        if(doneRef.current) {
            const func = doneRef.current;
            doneRef.current=undefined;
            func({url});
        }
    },[])

    const handleUnsplashSelectedImage=React.useCallback((dt: UnsplashTypes|PixabayTypes)=>{
        if(doneRef.current) {
            const func = doneRef.current;
            doneRef.current=undefined;
            func({url:dt.url});
        }
    },[])

    const handleCloseTemplate=React.useCallback((e?:{},reason?: "backdropClick" | "escapeKeyDown")=>{
        if(!e || e && reason === 'escapeKeyDown') {
            setTemplate(false);
            setPage(1);
        }
    },[])

    const handleCloseBrowser=React.useCallback((e?:{},reason?: "backdropClick" | "escapeKeyDown")=>{
        if(!e || e && reason === 'escapeKeyDown') {
            setBrowser(false)
        }
    },[])

    const handlePagination = React.useCallback((_:any,value: number)=>{
        setPage(value);
    },[])

    const handleSelectTemplate=React.useCallback((dt: TemplateTypes)=>async()=>{
        try {
            setTemplate(false);
            setBackdrop(true);
            const [res] = await get<TemplateTypes>(`/v1/template/${dt.slug}`);
            const design = res?.json as DesignTypes;
            if(design) {
                editorRef.current?.loadDesign(design);
                handleCloseTemplate();
            }
        } catch {

        } finally {
            setBackdrop(false);
        }
    },[handleCloseTemplate,get])

    const handleSave = React.useCallback((event: React.MouseEvent<HTMLButtonElement>)=>{
        if(onSave) onSave(event)
    },[onSave])

    React.useEffect(()=>{
        const body = document.body;
        if(fullscreen) {
            isOverflow = body.style.overflow === 'hidden';
            if(!isOverflow) body.style.overflow='hidden';
        } else {
            if(!isOverflow) body.style.removeProperty('overflow');
        }
    },[fullscreen])

    return (
        <>
            <Div fullscreen={fullscreen}>
                <div style={{marginBottom:15,display:'flex',alignItems:'center',justifyContent:'space-between',...(fullscreen ? {paddingTop:15,paddingLeft:15,paddingRight:15} : {})}}>
                    <div style={{display:'flex',alignItems:'center'}}>
                        {fullscreen && <Button disabled={disabled} loading={loading} sx={{mr:1}} onClick={handleSave} tooltip="Save" icon='save'>Save</Button>}
                        <Button disabled={disabled} color="secondary" onClick={()=>setTemplate(true)} tooltip="Select template" endIcon={<DesignServices/>}>Template</Button>
                    </div>
                    <Button disabled={disabled} outlined onClick={()=>setFullscreen(!fullscreen)} tooltip={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} endIcon={fullscreen ? <FullscreenExit /> : <Fullscreen />}>Fullscreen</Button>
                </div>
                <EmailEditor
                    ref={combinedRefs}
                    onReady={onEditorLoad}
                    options={{
                        displayMode:'email',
                        appearance:{
                            theme:theme||'light'
                        },
                        mergeTags:[
                            {
                                name:"Name",
                                value:"{{name}}",
                                sample:"Portalnesia"
                            },
                            {
                                name:"Username",
                                value:"{{username}}",
                                sample:"portalnesia"
                            },
                            {
                                name:"Email",
                                value:"{{email}}",
                                sample:"support@portalnesia.com"
                            },
                            {
                                name:'Change Preferences Link',
                                value:'{{unsubcribe_link}}',
                                sample:'https://portalnesia.com/email/preferences/123456789'
                            },
                            {
                                name:'View Email on Browser Link',
                                value:'{{preview_link}}',
                                sample:'https://portalnesia.com/email/preview/123456789'
                            }
                        ],
                        specialLinks:[
                            {
                                name:"Change Preferences",
                                href:'{{unsubcribe_link}}',
                                target:'_blank'
                            },
                            {
                                name:"Preview on Browser",
                                href:'{{preview_link}}',
                                target:'_blank'
                            }
                        ],
                        safeHtml:true,
                        ...(user && signature ? {
                            user:{
                                id:user.id,
                                name: user.user_nama,
                                signature
                            }
                        } : {}),
                        ...options
                    }}
                    {...rest}
                />
            </Div>
            <Dialog open={template} scroll='body' maxWidth='md' fullWidth onClose={handleCloseTemplate}>
                <DialogTitle>
                    <div className='flex-header'>
                        <Typography component='h2' variant='h6'>Template</Typography>
                        <IconButton onClick={()=>handleCloseTemplate()} size="large">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {!data && !error ? (
                            <Grid item xs={12}>
                                <Skeleton type={'grid'} image number={4} />
                            </Grid>
                        ) : error ? (
                            <Grid item xs={12}>
                                <div style={{textAlign:'center'}}>
                                    <Typography variant="body2">{error}</Typography>
                                </div>
                            </Grid>
                        ) : data && data?.data?.length > 0 ? data?.data?.map((dt,i)=>(
                            <Grid key={`data-grid-${dt.id}-${i}`} item xs={12} sm={6} md={4} lg={3}>
                                <Card style={{position:'relative'}} elevation={0} title={dt?.name}>
                                    <CardActionArea onClick={handleSelectTemplate(dt)} >
                                        <CardMedia>
                                            <Image webp src={`${dt.thumbs}`} alt={dt.name} style={{width:'100%',height:'auto'}}/>
                                        </CardMedia>
                                        <CardContent>
                                            <div style={{position:'relative',height:24}}>
                                                <Title>{dt?.name}</Title>
                                            </div>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        )) : null}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Pagination color='primary' count={data?.total_page || 1} page={page||1} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                </DialogActions>
            </Dialog>
            <Backdrop open={backdrop} />
            <Browser open={browser} onSelected={handleSelectedImage} onUnsplashSelected={handleUnsplashSelectedImage} onPixabaySelected={handleUnsplashSelectedImage} onClose={handleCloseBrowser}  withUnsplash withPixabay />
        </>
    )
})

const Unlayer = React.memo(UnlayerComp);
export default Unlayer;