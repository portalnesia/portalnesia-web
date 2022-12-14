import React from 'react'
import useNotification from '@design/components/Notification'
import type { IFiles,UnsplashTypes,PixabayTypes } from '@model/files'
import Search from '@design/components/Search'
import { alpha } from '@mui/system/colorManipulator';
import {styled} from '@mui/material/styles'
import dynamic from 'next/dynamic'
import type { DialogProps } from '@design/components/Dialog';
import useAPI, { ApiError, PaginationResponse } from '@design/hooks/api';
import { BoxPagination, usePagination } from '@design/components/Pagination';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { CustomTab, CustomTabs } from '@design/components/Tab';
import useResponsive from '@design/hooks/useResponsive';
import { number_format_short, ucwords } from '@portalnesia/utils';
import useSWR from '@design/hooks/swr';
import SWRPages from './SWRPages';
import Typography from '@mui/material/Typography';
import { getDayJs } from '@utils/main';
import CardActionArea from '@mui/material/CardActionArea'
import Portal from '@mui/material/Portal';
import ConfirmationDialog from '@design/components/ConfirmationDialog';
import { Span } from '@design/components/Dom';
import type { HandleChangeEvent } from '@design/components/DragableFiles';
import { AxiosRequestConfig } from 'axios';

const MenuPopover = dynamic(()=>import('@design/components/MenuPopover'));
const DragableFiles = dynamic(()=>import('@design/components/DragableFiles'));
const Select = dynamic(()=>import("@design/components/Select").then(m=>m.default),{ssr:false});
const SelectItem = dynamic(()=>import("@design/components/Select").then(m=>m.SelectItem),{ssr:false});
const Dialog = dynamic(()=>import('@design/components/Dialog'));
const DeleteIcon = dynamic(()=>import('@mui/icons-material/Delete'))
const AddPhotoIcon = dynamic(()=>import('@mui/icons-material/AddAPhoto'))
const Image=dynamic(()=>import('@comp/Image'))
const ListItemIcon=dynamic(()=>import('@mui/material/ListItemIcon'));
const ListItemText=dynamic(()=>import('@mui/material/ListItemText'));
const Divider=dynamic(()=>import('@mui/material/Divider'));
const MenuItem=dynamic(()=>import('@mui/material/MenuItem'));
const Pagination=dynamic(()=>import('@design/components/Pagination'));
const Backdrop = dynamic(()=>import('@design/components/Backdrop'));
const ImageList = dynamic(()=>import('@mui/material/ImageList'))
const ImageListItem = dynamic(()=>import('@mui/material/ImageListItem'))
const ImageListItemBar = dynamic(()=>import('@mui/material/ImageListItemBar'))

const SelectedArea = styled('div',{shouldForwardProp:prop=>prop!=="selected"})<{selected?: boolean}>(({theme,selected})=>({
    ...(selected ? {
        position:'absolute',
        left:0,
        top:0,
        width:'100%',
        height:'100%',
        zIndex:5,
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity+0.05),
        border:`2px solid ${theme.palette.primary.darker}`
    } : {})
}))

const Sticky=styled('div',{shouldForwardProp:prop=>prop!=="nosticky"})<{notsticky?:boolean}>(({theme})=>({
    position:'sticky',
    top:0,
    zIndex:100,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:theme.palette.background.paper
}))

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

const tabArrDefault = [{
    key:"portalnesia",
    label:"Portalnesia"
},{
    key:"unsplash",
    label:"Unsplash"
},{
    key:"pixabay",
    label:"Pixabay"
}]

export default function FileManager(props: BrowserProps) {
    const {post,del} = useAPI();
    const {onSelected,open,maxWidth='md',handleClose,onUnsplashSelected,withUnsplash=false,onPixabaySelected,withPixabay=false} = props;
    const setNotif = useNotification();
    const [page,setPage] = usePagination(1);
    const [selected,setSelected] = React.useState<FilesWithIdx|undefined|'upload'>();
    const [isHover,setIsHover]=React.useState(false)
    const [labelText,setLabelText] = React.useState("Drag files or click here to upload");
    const [progressUpload,setProgressUpload] = React.useState(0)
    const [search,setSearch] = React.useState("");
    const [disabled,setDisabled] = React.useState<string|null>(null)
    const [searchSubmit,setSearchSubmit] = React.useState("");
    const [serverType,setServerType] = React.useState<'unsplash'|'pixabay'|'portalnesia'>();
    const [pixabayTypes,setPixabayTypes]=React.useState("vector");
    const [tab,setTab] = React.useState(-1)
    const [openOption,setOpenOption] = React.useState(false);
    const smDown = useResponsive('down','sm')
    const mdDown = useResponsive('down','md')
    const smMd = useResponsive('between','sm','md')
    const lgUp = useResponsive('up','md')
    const confirmRef = React.useRef<ConfirmationDialog>(null)

    const tabArr = React.useMemo(()=>{
        const tab = tabArrDefault.filter(t=>{
            if(t.key === 'unsplash' && withUnsplash) return true;
            if(t.key === 'pixabay' && withPixabay) return true;
            if(t.key === 'portalnesia') return true;
            return false;
        })
        if(serverType === 'portalnesia') {
            tab.push({
                key:"upload",
                label:"Upload"
            },{
                key:"options",
                label:"Options"
            })
        }
        return tab;
    },[withPixabay,withUnsplash,serverType])

    const isUploadTab = React.useMemo(()=>{
        const index = tabArr.findIndex(i=>i.key === 'upload')
        return index === tab;
    },[tabArr,tab])

    const anchorEl = React.useRef(null);

    const cols = React.useMemo(()=>{
        if(smDown) return 2;
        else if(smMd) return 3;
        else if(lgUp) return 4;
    },[smDown,smMd,lgUp])

    const {data,error,mutate} = useSWR<PaginationResponse<IFiles>>(open && serverType==='portalnesia' ? `/v2/files/browser?per_page=30&page=${page||1}${searchSubmit.length > 0 ? `&q=${searchSubmit}` : ''}` : null,{revalidateOnFocus:false});
    const {data:dtUn,error:errUn} = useSWR<PaginationResponse<UnsplashTypes>>(open && serverType==='unsplash' && withUnsplash ? `/v2/unsplash?page=${page}&per_page=30${searchSubmit.length > 0 ? `&query=${searchSubmit}` : ''}` : null,{revalidateOnFocus:false});
    const {data:dtPix,error:errPix} = useSWR<PaginationResponse<PixabayTypes>>(open && serverType==='pixabay' && withPixabay ? `/v2/pixabay?page=${page}&per_page=30&image_type=${pixabayTypes}${searchSubmit.length > 0 ? `&query=${searchSubmit}` : ''}` : null,{revalidateOnFocus:false});

    const onClose=React.useCallback(()=>{
        if(handleClose) handleClose();
    },[handleClose])

    const handleSelect=React.useCallback((dt: FilesWithIdx)=>{
        onClose();
        if(onSelected) onSelected(dt.url);
    },[onClose,onSelected])

    const handleUnsplashSelect=React.useCallback(async(dt: UnsplashTypes)=>{
        onClose();
        dt.url = `${dt.url}&w=800`
        if(onUnsplashSelected) onUnsplashSelected(dt)
        try {
            await post(`/v2/unsplash/${dt.id}`,{},{},{success_notif:false});
        } catch {}
    },[withUnsplash,onClose,onUnsplashSelected])

    const handlePixabaySelect=React.useCallback(async(dt: PixabayTypes)=>{
        if(disabled !== null) return;
        setDisabled('pixabay')
        if(onPixabaySelected) {
            try {
                const [r] = await post<string>(`/v2/pixabay/${dt.id}`,{url:dt.url},{},{success_notif:false});
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
                onClose();
                onPixabaySelected(dt)
            } catch {}
            finally {
                setDisabled(null)
            }
        } else {
            onClose();
            setDisabled(null)
        }
    },[withPixabay,onPixabaySelected,onClose,post,disabled])

    const handleClick=React.useCallback((dt: IFiles,index: number)=>{
        if(selected === undefined || selected === 'upload') {
            setSelected({...dt,index})
        } else {
            if(selected.id_number === dt.id_number) setSelected(undefined)
            else setSelected({...dt,index})
        }
    },[selected])


    const onRightClick = React.useCallback((dt: IFiles,index: number)=>{
        setSelected({...dt,index})
    },[])

    const handleServerType=React.useCallback((type: 'unsplash'|'pixabay'|'portalnesia')=>()=>{
        setPage({},1);
        setServerType(type)
    },[])

    const handleTabChange = React.useCallback((key: string)=>()=>{
        if(key === "options") {
            setOpenOption(true);
        } else {
            setSelected(undefined);
        }
        if(['portalnesia','pixabay','unsplash','upload','options'].includes(key)) {
            const index = tabArr.findIndex(i=>i.key === key);
            setTab(index);
            
            if(!['upload','options'].includes(key)) {
                handleServerType(key as 'portalnesia'|'pixabay'|'unsplash')()
            }
        }
    },[handleServerType,tabArr])

    const handleUpload = React.useCallback(async(e: HandleChangeEvent)=>{
        if(disabled !== null || serverType !== 'portalnesia') return;
        let picture: File|undefined
        if('dataTransfer' in e) {
            if(e.dataTransfer.files.length === 1) {
                picture = e.dataTransfer.files[0];
            }
        } else {
            if(e.target.files && e.target.files.length === 1) {
                picture = e.target.files[0]
            }
        }

        if(!picture) return setNotif("Something went wrong, we couldn't find your image",true);
        if(picture.size > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
        const type = picture.type.toLowerCase();
        if(!['image/jpeg','image/png','image/jpg'].includes(type)) return setNotif("File not supported, only jpg, jpeg, png",true);

        try {
            setDisabled('upload')
            setProgressUpload(0)
            const form = new FormData();
            form.append('file',picture);
            const opt: AxiosRequestConfig={
                headers:{
                    'Content-Type':'multipart/form-data'
                },
                onUploadProgress:(progEvent)=>{
                    const complete=Math.round((progEvent.loaded * 100) / (progEvent.total||1));
                    setProgressUpload(complete);
                }
            }
            await post('/v2/files/browser',form,opt);
            setSelected(undefined);
            handleTabChange('portalnesia')()
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setProgressUpload(0)
            setDisabled(null)
        }
    },[post,setNotif,mutate,disabled,serverType,handleTabChange])

    const handleDelete=React.useCallback(async()=>{
        console.log(disabled,Boolean(!data),serverType,typeof selected)
        if(disabled !== null || !data || serverType !== 'portalnesia' || typeof selected !== 'object') return;
        try {
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            setDisabled('delete');
            await del(`/v2/files/${selected?.id}`);
            setSelected(undefined);
            handleTabChange('portalnesia')()
            mutate();
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setDisabled(null)
        }
    },[del,disabled,mutate,serverType,selected,setNotif])

    React.useEffect(()=>{
        if(!open) {
            setSelected(undefined)
        } else {
            setPage({},1)
            setSearch("");
            setSearchSubmit("")
            setServerType('portalnesia')
            setTab(0);
        }
    },[open])

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

    /*
    Check parentElement overflow:
    React.useEffect(()=>{
        if(open) {
            const div = document.getElementById('test-sticky');
            if(div) {
                let parent = div.parentElement;
                while (parent) {
                    const hasOverflow = getComputedStyle(parent).overflow;
                    if (hasOverflow !== 'visible') {
                        console.log(hasOverflow, parent);
                    }
                    parent = parent.parentElement;
                }
            }
        }
    },[open])*/

    return (
        <Portal>
            <Dialog loading={disabled!==null} fullScreen={mdDown} open={open} handleClose={onClose} title="File Manager" sticky={false} content={{sx:{px:0,pt:0,overflow:'unset'}}} {...(!mdDown ? {PaperProps:{sx:{overflow:'unset'}}} : {})} maxWidth={maxWidth}>
                <Sticky id='test-sticky'>
                    <Stack direction='row'>
                        <CustomTabs variant='scrollable' value={tab > -1 ? tab : undefined} sx={{px:1,flexGrow:1}}>
                            {tabArr.map(t=>(
                                <CustomTab onClick={handleTabChange(t.key)} key={t.key} sx={{py:1,...(t.key === 'options' ? {display:typeof selected === 'object' ?'block' : 'none'} : {})}} label={t.label} {...(t.key === 'options' ? {ref:anchorEl} : {})} />
                            ))}
                            {(serverType && serverType !== 'portalnesia') ? (
                                <a className='no-blank no-underline' href={serverType === 'unsplash' ? 'https://unsplash.com/license?utm_source=Portalnesia&utm_medium=referral' : 'https://pixabay.com/service/license?utm_source=Portalnesia&utm_medium=referral'} target='_blank' rel='nofollow noopener noreferrer'><CustomTab key={'license'} sx={{py:1}} label={"License"} component='a' /></a>
                            ) : null}
                        </CustomTabs>
                        {(serverType) && (
                            <Stack pr={1} direction='row' spacing={1}>
                                {serverType === 'pixabay' && (
                                    <Select disabled={disabled!==null} value={pixabayTypes} onChange={(e)=>setPixabayTypes(e.target.value)}
                                        sx={{
                                            '.MuiSelect-select, .MuiNativeSelect-select':{
                                                padding:'4px 9px'
                                            }
                                        }}
                                    >
                                        {PIXABAY_TYPES.map(c=>(
                                            <SelectItem key={c} value={c}>{ucwords(c)}</SelectItem>
                                        ))}
                                    </Select>
                                )}
                                <Search autosize={!mdDown} onchange={handleSearch('set')} onsubmit={handleSearch('submit')} onremove={handleSearch('remove')} remove value={search} />
                            </Stack>
                        )}
                    </Stack>
                </Sticky>

                <Box>
                    {isUploadTab ? (
                        <Box px={3}>
                            <DragableFiles id='dragable-upload' label="Drag images or click here to select images" type="file" accept="image/*" handleChange={handleUpload} />
                        </Box>
                    ) : serverType === 'unsplash' && withUnsplash ? (
                        <SWRPages loading={!dtUn && !errUn} error={errUn}>
                            {dtUn && dtUn.data.length > 0 ? (
                                <ImageList variant='masonry' cols={3} gap={4}>
                                    {dtUn?.data?.map((dt,i)=>(
                                        <CardActionArea title={`Photo by ${dt?.user?.name}`} disabled={disabled !== null} onClick={()=>handleUnsplashSelect(dt)} sx={{p:0.5}}>
                                            <ImageListItem key={`unsplash-${i}`}>
                                                <Image webp src={`${dt.url}&w=200&q=50&auto=compress&fit=crop`} alt={`Photo by ${dt.user.name}`} style={{width:'100%',height:'auto'}}/>
                                                <ImageListItemBar
                                                    title={dt?.user?.name}
                                                    subtitle={`${number_format_short(dt?.likes).format} likes`}
                                                />
                                            </ImageListItem>
                                        </CardActionArea>
                                    ))}
                                </ImageList>
                            ) : (
                                <BoxPagination>
                                    <Typography variant="body2">No data</Typography>
                                </BoxPagination>
                            )}
                        </SWRPages>
                    ) : serverType === 'pixabay' && withPixabay ? (
                        <SWRPages loading={!dtPix && !errPix} error={errPix}>
                            {dtPix && dtPix.data.length > 0 ? (
                                <ImageList variant='masonry' cols={3} gap={4}>
                                    {dtPix?.data?.map((dt,i)=>(
                                        <CardActionArea title={`${dt.type} by ${dt.user}`} disabled={disabled !== null} onClick={()=>handlePixabaySelect(dt)} sx={{p:0.5}}>
                                            <ImageListItem key={`pixabay-${i}`}>
                                            
                                                <Image src={`${dt.thumbs}`} alt={`Photo by ${dt.user}`} style={{width:'100%',height:'auto'}}/>
                                                <ImageListItemBar
                                                    title={dt?.user}
                                                    subtitle={`${number_format_short(dt?.views).format} views`}
                                                />
                                            </ImageListItem>
                                        </CardActionArea>
                                    ))}
                                </ImageList>
                            ) : (
                                <BoxPagination>
                                    <Typography variant="body2">No data</Typography>
                                </BoxPagination>
                            )}
                        </SWRPages>
                    ) : serverType === 'portalnesia' ? (
                        <SWRPages loading={!data && !error} error={error}>
                            {(data && data?.data?.length > 0) ? (
                                <ImageList variant='masonry' cols={cols} gap={4}>
                                    {data?.data?.map((dt,i)=>(
                                        <PortalnesiaFiles key={`portalnesia-${i}`} selected={selected} data={dt} index={i} onClick={handleClick} onRightClick={onRightClick} onSelect={handleSelect} onDelete={handleDelete} disabled={disabled!==null} />
                                    ))}
                                </ImageList>
                            ) : (
                                <BoxPagination>
                                    <Typography variant="body2">No data</Typography>
                                </BoxPagination>
                            )}
                        </SWRPages>
                    ) : null}
                </Box>
                
                {(serverType && !isUploadTab) && (
                    <>
                        <Divider sx={{my:2}} />
                        <Pagination page={page} onChange={setPage} count={serverType === 'pixabay' ? (dtPix?.total_page||1) : serverType === 'unsplash' ? (dtUn?.total_page||1) : serverType === 'portalnesia' ? (data?.total_page||1) : 0} />
                    </>
                )}
            </Dialog>
            <MenuPopover
                open={openOption}
                anchorEl={anchorEl.current}
                onClose={()=>{setOpenOption(false),setTab(0)}}
                sx={{ width: 220 }}
            >
                {typeof selected === 'object' && (
                    <Box py={1}>
                        <MenuItem onClick={()=>handleSelect(selected)}>
                            <ListItemIcon><AddPhotoIcon /></ListItemIcon>
                            <ListItemText>Use image</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDelete}>
                            <ListItemIcon><DeleteIcon /></ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    </Box>
                )}
            </MenuPopover>
            <ConfirmationDialog ref={confirmRef} body={typeof selected === 'object' ? (
                <Typography>Delete <Span sx={{color:'customColor.link'}}>{selected.title}</Span>?</Typography>
            ) : undefined} />
            <Backdrop open={disabled!==null} {...(progressUpload > 0 ? {progress:progressUpload} : {})} />
        </Portal>
    )
}

type PortalnesiaFilesProps = {
    data: IFiles
    index: number
    selected?: FilesWithIdx | "upload"
    onClick:(data: IFiles,index:number)=>void
    onRightClick:(data: IFiles,index:number)=>void
    disabled?: boolean
    onSelect(selected: FilesWithIdx): void
    onDelete(): void
}
function PortalnesiaFiles({data:dt,selected,index:i,onClick,onRightClick,disabled,onSelect,onDelete}: PortalnesiaFilesProps) {
    //const anchorEl = React.useRef<HTMLButtonElement>(null);
    const [anchorEl,setAnchorEl]=React.useState<[number,number]|null>(null)
    const [open,setOpen] = React.useState(false);

    const handleClick = React.useCallback(()=>{
        if(onClick) onClick(dt,i)
    },[onClick,dt,i])

    const handleRightClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation()
        e.preventDefault()
        setOpen(true)
        setAnchorEl([e.clientX - 2,e.clientY - 4]);
        if(onRightClick) onRightClick(dt,i)
    },[onRightClick,dt,i])

    const handleContextClose = React.useCallback((withDelete?:boolean)=>()=>{
        setOpen(false);
        setAnchorEl(null);
        if(withDelete && onDelete) onDelete();
    },[onDelete])

    const handleSelect = React.useCallback(()=>{
        if(typeof selected === 'object') onSelect(selected)
        handleContextClose()();
    },[onSelect,handleContextClose,selected])

    return (
        <>
            <CardActionArea title={dt?.title} disabled={disabled} onClick={handleClick} onContextMenu={handleRightClick} sx={{p:0.5,position:'relative'}}>
                <SelectedArea selected={typeof selected === 'object' && selected.index === i} />
                <ImageListItem>
                    <Image webp src={`${dt.thumbs}&size=200&watermark=no`} alt={dt.title} style={{width:'100%',maxHeight:300,objectFit:'contain'}}/>
                    <ImageListItemBar
                        title={dt?.title}
                        subtitle={getDayJs(dt?.created).time_ago().format}
                    />
                
                </ImageListItem>
            </CardActionArea>
            <MenuPopover
                open={open && typeof selected === 'object'}
                onClose={handleContextClose()}
                anchorReference="anchorPosition"
                anchorPosition={
                    anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                }
                paperSx={{ width: 220 }}
                slotProps={{
                    backdrop:{
                        // @ts-ignore
                        invisible:false
                    }
                }}
            >
                <Box py={1}>
                    <MenuItem onClick={handleSelect}>
                        <ListItemIcon><AddPhotoIcon /></ListItemIcon>
                        <ListItemText>Use image</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleContextClose(true)}>
                        <ListItemIcon><DeleteIcon /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Box>
            </MenuPopover>
        </>
    )
}