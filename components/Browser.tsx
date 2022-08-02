import React from 'react'
import {useNotif} from 'portal/components/Notification'
import useAPI,{Pagination as PaginationRes} from 'portal/utils/api'
import {IFiles,UnsplashTypes,PixabayTypes} from 'portal/types/files'
import Search from 'portal/components/Search'
import {ucwords, uuid} from '@portalnesia/utils'
import {Portal,DialogProps,Typography,Hidden} from '@mui/material'
import {styled,alpha,useTheme} from '@mui/material/styles'
import {number_size,number_format_short} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import {ProgressLinear} from 'portal/components/Backdrop'
import dynamic from 'next/dynamic'
import {AxiosRequestConfig} from 'axios'
import useSWR from 'portal/utils/swr'
import {isMobile} from 'react-device-detect'
import useMediaQuery from '@mui/material/useMediaQuery'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const IconButton=dynamic(()=>import('@mui/material/IconButton'))
const CloseIcon = dynamic(()=>import('@mui/icons-material/Close'))
const GridView = dynamic(()=>import('@mui/icons-material/GridView'))
const ViewList = dynamic(()=>import('@mui/icons-material/ViewList'))
const DeleteIcon = dynamic(()=>import('@mui/icons-material/Delete'))
const AddPhotoIcon = dynamic(()=>import('@mui/icons-material/AddAPhoto'))
const Image=dynamic(()=>import('portal/components/Image'))
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const List=dynamic(()=>import('@mui/material/List'));
const ListItemIcon=dynamic(()=>import('@mui/material/ListItemIcon'));
const ListItemButton=dynamic(()=>import('@mui/material/ListItemButton'));
const ListItemAvatar=dynamic(()=>import('@mui/material/ListItemAvatar'));
const ListItemText=dynamic(()=>import('@mui/material/ListItemText'));
const Divider=dynamic(()=>import('@mui/material/Divider'));
const Menu=dynamic(()=>import('@mui/material/Menu'));
const MenuItem=dynamic(()=>import('@mui/material/MenuItem'));
const Pagination=dynamic(()=>import('@mui/material/Pagination'));
const TextField=dynamic(()=>import('@mui/material/TextField'))
const Skeleton=dynamic(()=>import('portal/components/Skeleton'));
const Button = dynamic(()=>import('portal/components/Button'));
const Backdrop = dynamic(()=>import('portal/components/Backdrop'));
const PaperBlock = dynamic(()=>import('portal/components/PaperBlock'));
const Select = dynamic(()=>import('portal/components/Select'))
const ImageList = dynamic(()=>import('@mui/material/ImageList'))
const ImageListItem = dynamic(()=>import('@mui/material/ImageListItem'))
const ImageListItemBar = dynamic(()=>import('@mui/material/ImageListItemBar'))

type FilesWithIdx = IFiles & ({
    index: number
})

const PIXABAY_TYPES = ['vector','illustration'];

export interface BrowserProps extends DialogProps {
    onSelected(fileUrl: string): void
    withUnsplash?: boolean;
    onUnsplashSelected?(file: UnsplashTypes): void;
    withPixabay?: boolean;
    onPixabaySelected?(file: PixabayTypes): void
}

const Dialogs = styled(Dialog)(()=>({
    '& .MuiDialog-container,.MuiDialog-root,.MuiDialog-paper':{
        overflowY:'visible'
    }
}))

const CardAction = styled(CardActionArea)<{selected?: boolean}>(({theme,selected})=>({
    position:'relative'
}))
const SelectedArea = styled('div')<{selected?: boolean}>(({theme,selected})=>({
    ...(selected ? {
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%',
        zIndex:5,
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity+0.4)
    } : {})
}))

const TF = styled(TextField)(()=>({
    '.MuiSelect-select, .MuiNativeSelect-select':{
        padding:'3.7px 9px',
    }
}))

const DivUpload = styled('div')(({theme})=>({
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
}))

const Input = styled('div')<{isHover: boolean}>(({theme,isHover})=>({
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
    ...(isHover ? {
        background:theme.palette.action.hover
    } : {})
}))

const Sticky=styled('div')<{notSticky?:boolean}>(({theme,notSticky})=>({
    paddingLeft:24,
    paddingRight:24,
    ...(!notSticky ? {
        position:'sticky',
        top:0,
        zIndex:2,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:theme.palette.background.paper
    } : {
        paddingTop:5,
        paddingBottom:5
    })
}))

const getLicense = (props: any)=><a {...props} target='_blank' rel='nofollow noopener noreferrer' />

function BrowserComp(props: BrowserProps) {
    const theme = useTheme();
    const {post,del} = useAPI();
    const {onSelected,open,scroll='body',maxWidth='md',fullWidth=true,onClose,onUnsplashSelected,withUnsplash=false,onPixabaySelected,withPixabay=false} = props;
    const {setNotif} = useNotif();
    const router = useRouter();
    const [page,setPage] = React.useState(1);
    const [anchorEl,setAnchorEl]=React.useState<[number,number]|null>(null)
    const [menu,setMenu] = React.useState(false);
    const [selected,setSelected] = React.useState<FilesWithIdx|undefined|'upload'>();
    const [isHover,setIsHover]=React.useState(false)
    const [labelText,setLabelText] = React.useState("Drag files or click here to upload");
    const [progressUpload,setProgressUpload] = React.useState(0)
    const [disabled,setDisabled] = React.useState<null|string>(null);
    const [dialog,setDialog] = React.useState(false);
    const [isGrid,setGrid] = React.useState(true);
    const [search,setSearch] = React.useState("");
    const [searchSubmit,setSearchSubmit] = React.useState("");
    const [serverType,setServerType] = React.useState<'unsplash'|'pixabay'|null>(null);
    const [pixabayTypes,setPixabayTypes]=React.useState("vector");
    const {data,error,mutate} = useSWR<PaginationRes<IFiles>>(open ? `/v1/files/browser?per_page=30&page=${page||1}` : null);
    const {data:dtUn,error:errUn} = useSWR<PaginationRes<UnsplashTypes>>(open && serverType==='unsplash' && withUnsplash ? `/v1/unsplash?page=${page}&per_page=30${searchSubmit.length > 0 ? `&query=${searchSubmit}` : ''}` : null);
    const {data:dtPix,error:errPix} = useSWR<PaginationRes<PixabayTypes>>(open && serverType==='pixabay' && withPixabay ? `/v1/pixabay?page=${page}&per_page=30&image_type=${pixabayTypes}${searchSubmit.length > 0 ? `&query=${searchSubmit}` : ''}` : null);
    const idScroll = React.useRef(uuid('file-manager'));
    const smDown = useMediaQuery(theme.breakpoints.down('sm'));
    const mdDown = useMediaQuery(theme.breakpoints.between('sm','md'));
    const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

    const cols = React.useMemo(()=>{
        if(smDown) return 2;
        else if(mdDown) return 3;
        else if(lgUp) return 4;
    },[smDown,mdDown,lgUp])

    const handleClose=React.useCallback(()=>{
        //if(disabled !== null) {
            //cancelRequest();
            //setDisabled(null);
        //}
        setDisabled(null);
        setPage(1);
        setServerType(null)
        setSearch("");
        setSearchSubmit("")
        if(onClose) onClose({},'backdropClick');
    },[onClose,disabled])

    const handleSelect=React.useCallback((dt: FilesWithIdx)=>()=>{
        if(disabled !== null) return;
        handleClose();
        if(onSelected) onSelected(dt.url);
    },[handleClose,onSelected,disabled])

    const handleUnsplashSelect=React.useCallback((dt: UnsplashTypes)=>{
        if(disabled !== null) return;
        handleClose();
        dt.url = `${dt.url}&w=800`
        if(onUnsplashSelected) onUnsplashSelected(dt)
        try {
            post(`/v1/unsplash/${dt.id}`,{},{},{success_notif:false,error_notif:false});
        } catch {}
    },[withUnsplash,handleClose,onUnsplashSelected,disabled])

    const handlePixabaySelect=React.useCallback(async(dt: PixabayTypes)=>{
        if(disabled !== null) return;
        setDisabled('pixabay');
        if(onPixabaySelected) {
            try {
                const [r] = await post<string>(`/v1/pixabay/${dt.id}`,{url:dt.url},{},{success_notif:false});
                const url = new URL(r);
                let fixUrl = r;
                if(url.searchParams.has('image')) {
                    const imageUrl = decodeURIComponent(url.searchParams.get('image') as string);
                    const imgLen = imageUrl.length;
                    if(imageUrl.substring(imgLen - 3,imgLen) === 'png') {
                        fixUrl+="&output=png";
                    }
                }
                dt.url = fixUrl;
                handleClose();
                onPixabaySelected(dt)
            } catch {}
        } else {
            handleClose();
        }
    },[withPixabay,onPixabaySelected,handleClose,disabled,post])

    const onRightClick = React.useCallback((dt: IFiles,index: number)=>(event: React.MouseEvent<HTMLButtonElement|HTMLDivElement>)=>{
        event.stopPropagation()
        event.preventDefault()
        setSelected({...dt,index})
        setMenu(true)
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    },[])

    const handleContextClose = React.useCallback(()=>{
        setSelected(undefined)
        setMenu(false)
        setAnchorEl(null)
    },[])

    const handleClick=React.useCallback((dt: IFiles,index: number)=>()=>{
        if(disabled !== null) return;
        if(selected === undefined || selected === 'upload') {
            setSelected({...dt,index})
        } else {
            if(selected.id_number === dt.id_number) setSelected(undefined)
            else setSelected({...dt,index})
        }
    },[disabled,selected])

    const handleUpload = React.useCallback((e: React.DragEvent<HTMLDivElement>|React.ChangeEvent<HTMLInputElement>)=>{
        setLabelText("Drag files or click here to upload")
        setIsHover(false)
        if(disabled !== null || serverType !== null) return;
        const file = (typeof e?.target !== 'undefined' && typeof (e?.target as HTMLInputElement)?.files !== 'undefined') ? (e?.target as HTMLInputElement)?.files?.[0] : (typeof (e as React.DragEvent<HTMLDivElement>)?.dataTransfer !== 'undefined' ? (e as React.DragEvent<HTMLDivElement>)?.dataTransfer?.files?.[0] : undefined);
        if(file) {
            if(/image\/(jpg|jpeg|png)/.test(file.type)) {
                setDisabled('upload')
                if(Number(file.size) > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
                const form=new FormData();
                form.append('file',file);
                const opt: AxiosRequestConfig={
                    headers:{
                        'Content-Type':'multipart/form-data'
                    },
                    onUploadProgress:(progEvent: any)=>{
                        const complete=Math.round((progEvent.loaded * 100) / progEvent.total);
                        setProgressUpload(complete)
                    }
                }
                post<IFiles>('/v1/files/browser',form,opt)
                .then(()=>{
                    //const a = data;
                    //a.unshift(res);
                    //setData(a);
                    setSelected(undefined);
                    setPage(1);
                    mutate();
                }).catch(err=>{

                }).finally(()=>{
                    setProgressUpload(0)
                    setDisabled(null)
                })
            } else {
                setNotif("Error: File type not allowed",true);
            }
        }
    },[data,setNotif,post,disabled,mutate,serverType])

    const handleDrag=React.useCallback((enter: boolean)=>(e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        if(disabled !== null) return;
        if(enter){
            setLabelText("Drop your files now")
            setIsHover(true)
        } else {
            setLabelText("Drag files or click here to upload")
            setIsHover(false)
        }
    },[disabled])

    const handleDrop=React.useCallback((e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        e.stopPropagation();
        if(disabled !== null) return;
        handleUpload(e)
    },[handleUpload,disabled])

    const handleDelete=React.useCallback((dt: FilesWithIdx)=>()=>{
        if(disabled !== null || !data || serverType !== null) return;
        setDisabled('delete');
        del(`/v1/files/${dt?.id}`)
        .then(()=>{
            if(!data) return;
            setSelected(undefined)
            //const a = [...data];
            const a = [...data.data]
            a.splice(dt.index,1);
            mutate({
                ...data,
                data:a
            })
            //setData(a);
        }).catch(()=>{

        }).finally(()=>{
            setDisabled(null);
        })
    },[del,disabled,data,mutate,serverType])

    React.useEffect(()=>{
        if(open) {
            if(typeof router.query.i === 'undefined') {
                const query = {...router.query}
                if(typeof query.reloadedPage !== 'undefined') delete query.reloadedPage;
                const asss=router.asPath.match(/\&i\=.+?(?=\&)/) ? router.asPath.replace(/\&i\=.+?(?=\&)/gi,"") : router.asPath.match(/\&/) ? router.asPath.replace(/\?i\=.+?(?=\&)/gi,"").replace(/\&i\=.+/gi,"") : router.asPath.replace(/\?i\=.+/gi,"").replace(/\&i\=.+/gi,"")
                const asPath=(asss.match(/\?/) ? `${asss}&i=file-manager` : `${asss}?i=file-manager`)
                const newQ={
                    pathname:router.pathname,
                    query:{...query,i:'file-manager'}
                }
                router.push(newQ,asPath,{shallow:true})
            }
        } else {
            setSelected(undefined)
            if(typeof router.query.i !== 'undefined') router.back();
        }
    },[open])

    const handlePagination=React.useCallback((_:any,pageNumber: number)=>{
        setPage(pageNumber)
    },[]);

    const handleServerType=React.useCallback((type: 'unsplash'|'pixabay'|null)=>()=>{
        setPage(1);
        setServerType(type)
    },[])

    const handleSearch = React.useCallback((type: 'submit'|'remove'|'set')=>(e: any)=>{
        if(type==='remove') {
            setSearch("");
            setSearchSubmit("");
        } else if(type==='set') {
            setSearch(e?.target?.value||"");
        } else if(type==='submit') {
            if(e?.preventDefault) e.preventDefault();
            if(e?.stopPropagation) e.stopPropagation();
            setSearchSubmit(search)
        }
    },[search])

    return (
        <Portal>
            {open && (
                <React.Fragment>
                    <Dialogs classes={{scrollBody:`file-manager-${idScroll.current}`}} open={true} scroll={scroll} maxWidth={maxWidth} fullWidth={fullWidth}>
                        <DialogTitle>
                            <div className='flex-header'>
                                <Typography component='h2' variant='h6'>File Manager</Typography>
                                <IconButton onClick={handleClose} size="large">
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </DialogTitle>
                        <Divider />
                        <Sticky notSticky>
                            {withUnsplash && serverType==='unsplash' ? (
                                <div style={{display:'flex'}}>
                                    <Button sx={{mr:1}} outlined disabled={disabled !== null} onClick={handleServerType(null)}>Portalnesia</Button>
                                    {withPixabay && <Button outlined sx={{mr:1}} disabled={disabled !== null} onClick={handleServerType('pixabay')}>Pixabay</Button>}
                                    <Button text LinkComponent={getLicense} href='https://unsplash.com/license?utm_source=Portalnesia&utm_medium=referral'>License</Button>
                                </div>
                            ) : withPixabay && serverType === 'pixabay' ? (
                                <div style={{display:'flex'}}>
                                    <Button sx={{mr:1}} outlined disabled={disabled !== null} onClick={handleServerType(null)}>Portalnesia</Button>
                                    {withUnsplash && <Button outlined sx={{mr:1}} disabled={disabled !== null} onClick={handleServerType('unsplash')}>Unsplash</Button>}
                                    <Button text LinkComponent={getLicense} href='https://pixabay.com/service/license?utm_source=Portalnesia&utm_medium=referral'>License</Button>
                                </div>
                            ) : (
                                <div style={{display:'flex'}}>
                                    {withUnsplash && <Button outlined sx={{mr:1}} disabled={disabled !== null} onClick={handleServerType('unsplash')}>Unsplash</Button>}
                                    {withPixabay && <Button outlined sx={{mr:1}} disabled={disabled !== null} onClick={handleServerType('pixabay')}>Pixabay</Button>}
                                </div>
                            )}
                        </Sticky>
                        <Sticky>
                            <div className='flex-header'>
                                {withUnsplash && serverType==='unsplash' ? (
                                    <>
                                        <div></div>
                                        <Hidden smUp>
                                            <Search onchange={handleSearch('set')} onsubmit={handleSearch('submit')} onremove={handleSearch('remove')} remove value={search} />
                                        </Hidden>
                                        <Hidden smDown>
                                            <Search onchange={handleSearch('set')} autosize onsubmit={handleSearch('submit')} onremove={handleSearch('remove')} remove value={search} />
                                        </Hidden>
                                    </>
                                ) : withPixabay && serverType === 'pixabay' ? (
                                    <>
                                        <TF
                                            select
                                            value={pixabayTypes}
                                            onChange={(e)=>setPixabayTypes(e.target.value)}
                                            SelectProps={{native:isMobile}}
                                            variant="outlined"
                                            disabled={disabled !== null}
                                        >
                                            {PIXABAY_TYPES.map((cat)=><Select key={`${cat}`} value={cat}>{ucwords(cat)}</Select>)}
                                        </TF>
                                        <Hidden smUp>
                                            <Search onchange={handleSearch('set')} onsubmit={handleSearch('submit')} onremove={handleSearch('remove')} remove value={search} />
                                        </Hidden>
                                        <Hidden smDown>
                                            <Search onchange={handleSearch('set')} autosize onsubmit={handleSearch('submit')} onremove={handleSearch('remove')} remove value={search} />
                                        </Hidden>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <Button outlined sx={{mr:1}} disabled={disabled !== null} icon='upload' onClick={()=>setSelected('upload')}>Upload</Button>
                                            {selected && selected !== 'upload' && (
                                                <div style={{display:'flex',marginTop:8}}>
                                                    <Button disabled={disabled !== null} sx={{mr:1}} onClick={handleSelect(selected)} icon='addphoto'>Use image</Button>
                                                    <Button disabled={disabled !== null} loading={disabled==='delete'} color='secondary' icon='delete'  onClick={()=>setDialog(true)}>Delete</Button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <IconButton
                                            edge="end"
                                            aria-label='view'
                                            onClick={()=>setGrid(!isGrid)}
                                        >
                                            {isGrid ? <ViewList /> : <GridView />}
                                        </IconButton>
                                    </>
                                )}
                            </div>
                        </Sticky>
                        <DialogContent dividers sx={{zIndex:1}}>
                            {serverType === 'unsplash' && withUnsplash ? (
                                <>
                                    {!dtUn && !errUn ? (
                                        <Skeleton type={'grid'} image number={8} />
                                    ) : errUn ? (
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant="body2">{errUn}</Typography>
                                        </div>
                                    ) : dtUn && dtUn.data.length > 0 ? (
                                        <ImageList variant='masonry' cols={3} gap={4}>
                                            {dtUn?.data?.map((dt,i)=>(
                                                <ImageListItem key={`unsplash-${i}`}>
                                                    <CardAction title={`Photo by ${dt?.user?.name}`} disabled={disabled !== null} onClick={()=>handleUnsplashSelect(dt)}>
                                                    <Image webp src={`${dt.url}&w=200&q=50&auto=compress&fit=crop`} alt={`Photo by ${dt.user.name}`} style={{width:'100%',height:'auto'}}/>
                                                        <ImageListItemBar
                                                            title={dt?.user?.name}
                                                            subtitle={`${number_format_short(dt?.likes).format} likes`}
                                                        />
                                                    </CardAction>
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    ) : (
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant="body2">No data</Typography>
                                        </div>
                                    )}
                                </>
                            ) : serverType === 'pixabay' && withPixabay ? (
                                <>
                                    {!dtPix && !errPix ? (
                                        <Skeleton type={'grid'} image number={8} />
                                    ) : errPix ? (
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant="body2">{errPix}</Typography>
                                        </div>
                                    ) : dtPix && dtPix.data.length > 0 ? (
                                        <ImageList variant='masonry' cols={3} gap={4}>
                                            {dtPix?.data?.map((dt,i)=>(
                                                <ImageListItem key={`pixabay-${i}`}>
                                                    <CardAction title={`${dt.type} by ${dt.user}`} disabled={disabled !== null} onClick={()=>handlePixabaySelect(dt)}>
                                                        <Image src={`${dt.thumbs}`} alt={`Photo by ${dt.user}`} style={{width:'100%',height:'auto'}}/>
                                                        <ImageListItemBar
                                                            title={dt?.user}
                                                            subtitle={`${number_format_short(dt?.views).format} views`}
                                                        />
                                                    </CardAction>
                                                </ImageListItem>
                                            ))}
                                        </ImageList>
                                    ) : (
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant="body2">No data</Typography>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {!data && !error ? (
                                        <Skeleton type={!isGrid ? 'list' : 'grid'} image number={8} />
                                    ) : error ? (
                                        <div style={{textAlign:'center'}}>
                                            <Typography variant="body2">{error}</Typography>
                                        </div>
                                    ) : (data && data?.data?.length > 0) ? (
                                        <>
                                            {isGrid ? (
                                                <ImageList variant='masonry' cols={cols} gap={4}>
                                                    {data?.data?.map((dt,i)=>(
                                                        <ImageListItem key={`portalnesia-${i}`}>
                                                            <CardAction title={dt?.title} disabled={disabled !== null} onClick={handleClick(dt,i)} onContextMenu={onRightClick(dt,i)}>
                                                                <SelectedArea selected={typeof selected === 'object' && selected.index === i} />
                                                                <Image webp src={`${dt.thumbs}&size=200&watermark=no`} alt={dt.title} style={{width:'100%',height:'auto'}}/>
                                                                <ImageListItemBar
                                                                    title={dt?.title}
                                                                    subtitle={dt?.created?.format}
                                                                />
                                                            </CardAction>
                                                        </ImageListItem>
                                                    ))}
                                                </ImageList>
                                            ) : (
                                                <List>
                                                    {data.data.map((dt,i)=>(
                                                        <ListItemButton key={`data-list-${dt.id}-${i}`} selected={typeof selected === 'object' && selected.index === i} disabled={disabled !== null} onClick={handleClick(dt,i)} onContextMenu={onRightClick(dt,i)}>
                                                            <ListItemAvatar>
                                                                <Image webp src={`${dt.thumbs}&size=200&watermark=no`} alt={dt.title} width={40} height={40} />
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={<Typography variant='body1'>{dt?.title}</Typography>}
                                                                secondary={
                                                                    <React.Fragment>
                                                                        <Typography sx={{fontSize:'.7rem'}} variant='body2'>{number_size(dt?.size)}</Typography>
                                                                        <Typography sx={{fontSize:'.7rem'}} variant='body2'>{dt?.created?.format}</Typography>
                                                                    </React.Fragment>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    ))}
                                                </List>
                                            )}
                                        </>
                                    ) : null}
                                    <Menu
                                        anchorReference="anchorPosition"
                                        anchorPosition={
                                            anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                                        }
                                        open={menu && typeof selected === 'object'}
                                        onClose={handleContextClose}
                                    >
                                        <MenuItem onClick={handleSelect(selected as FilesWithIdx)}>
                                            <ListItemIcon><AddPhotoIcon /></ListItemIcon>
                                            <ListItemText>Use image</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={()=>{handleContextClose(),setDialog(true)}}>
                                            <ListItemIcon><DeleteIcon /></ListItemIcon>
                                            <ListItemText>Delete</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </DialogContent>

                        <DialogActions>
                            <Pagination color='primary' count={serverType === 'unsplash' ? Number(dtUn?.total_page||1) : Number(data?.total_page||1)} page={Number(page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                        </DialogActions>
                    </Dialogs>

                    <Dialog open={dialog && typeof selected === 'object'} scroll={'body'} maxWidth={'sm'} fullWidth>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogContent dividers>
                            <Typography>{`Delete ${(selected as FilesWithIdx)?.title}`}</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button outlined disabled={disabled!==null} sx={{mr:1}} onClick={()=>setDialog(false)}>Cancel</Button>
                            <Button color="secondary" icon='delete' disabled={disabled!==null} loading={disabled==='delete'} onClick={handleDelete(selected as FilesWithIdx)}>Yes</Button>
                        </DialogActions>
                    </Dialog>

                    <Backdrop open={selected==='upload'} loading={false} textColor='theme'>
                        <PaperBlock title="Upload Image"
                            action={
                                <IconButton onClick={()=>setSelected(undefined)} size="large">
                                    <CloseIcon />
                                </IconButton>
                            }
                        >
                            <DivUpload>
                                <Input 
                                    isHover={isHover}
                                    onDragEnter={handleDrag(true)}
                                    onDragLeave={handleDrag(false)}
                                    onDragOver={e=>e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <input disabled={disabled !== null} type="file" accept="audio/*|video/*|image/*" id="fileInput" style={{display:'none'}} onChange={handleUpload} />
                                    <label htmlFor="fileInput">{labelText}</label>
                                </Input>
                            </DivUpload>
                            {progressUpload > 0 && (
                                <React.Fragment>
                                    <Divider sx={{mt:1,mb:1}} />
                                    <ProgressLinear progress={progressUpload} textColor="theme" />
                                </React.Fragment>
                            )}
                        </PaperBlock>
                    </Backdrop>
                </React.Fragment>
            )}
        </Portal>
    )
}

const Browser = React.memo(BrowserComp);
export default Browser;