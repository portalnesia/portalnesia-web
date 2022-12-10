import {logEvent} from 'firebase/analytics'
import { getAnalytics } from '@utils/firebase'
import { useDispatch, useSelector } from '@redux/store'
import useAPI from '@design/hooks/api'
import useNotification from '@design/components/Notification'
import { useState,MouseEvent, useMemo, useCallback, useRef } from 'react'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { Circular } from '@design/components/Loading'
import { AttachMoney, Favorite, FavoriteBorder, ReportProblem, Share } from '@mui/icons-material'
import { useMousetrap } from '@hooks/hotkeys'
import Button, { ButtonProps } from './Button'
import { copyTextBrowser } from '@portalnesia/utils'
import MenuPopover from '@design/components/MenuPopover'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'

export type LikeActionProps={
    /**
     * Is content liked?
     */
    liked: boolean,
    /**
     * Pos ID of content
     */
    posId: number,
    /**
     * Type of content
     */
    type: 'twitter_thread'|'chord'|'news'|'blog',
    /**
     * Fire when component clicked. Change the 'liked' value
     */
    onChange?: (params: boolean)=>void
}

/**
 * 
 * Like Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
 export const LikeAction=(props: LikeActionProps): JSX.Element=>{
    const [loading,setLoading]=useState(false)
    const user=useSelector((state=>state.user))
    const {post,del}=useAPI()
    const setNotif=useNotification()
    const handleClick=async()=>{
        if(user===null) setNotif("Login to continue",true)
        else {
            setLoading(true)
            const url = new URL(window.location.href)
            try {
                let res: {liked:boolean};
                if(!props.liked) {
                    const dt= await post<{liked: boolean}>(`/v1/likes/${props.type}/${props.posId}${url.search}`,null)
                    res = dt;
                } else {
                    const [dt] = await del(`/v1/likes/${props.type}/${props.posId}${url.search}`);
                    res = dt;
                }
                if(props.onChange) props.onChange(res.liked)
            } catch {

            } finally {
                setLoading(false)
            }
        }
    }
    return (
        <Tooltip title={props?.liked ? "Unlike" : "Like"}>
            <IconButton
                disabled={loading}
                onClick={handleClick}
            >
                {props?.liked ? <Favorite sx={{color:'error.main'}} /> : <FavoriteBorder />}
                {loading && <Circular size={24} thickness={7} />}
            </IconButton>
        </Tooltip>
    );
}

export type ReportActionType={

}

/**
 * 
 * Report Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const ReportAction=(): JSX.Element=>{
    //const dispatch=useDispatch();
    useMousetrap('shift+r',(e)=>{
        if(e && typeof e?.preventDefault === 'function') e.preventDefault()
        if(e && typeof e?.returnValue!=='undefined') e.returnValue=false
        handleClick()
    })
    const handleClick=(e?: MouseEvent<HTMLButtonElement>)=>{
        if(e && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
        //dispatch({type:'REPORT',payload:{type:'konten',url:window.location.href,endpoint:null}})
    }
    return (
        <Tooltip title="Report (Shift + R)">
            <IconButton onClick={handleClick}>
                <ReportProblem />
            </IconButton>
        </Tooltip>
    );
}

export type ShareActionProps={
    /**
     * UTM Campaign
     */
    campaign: 'chord'|'news'|'twitter thread'|'blog'|'pages'|'events'|'quiz'|'media'|'twibbon'|string,
    /**
     * Props for tooltip component
     */
    variant?:'button'|'icon',
    /**
     * Pos ID of content
     */
    posId?: number,
    buttonProps?: ButtonProps,
}

/**
 * 
 * Share Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
 export const ShareAction=({campaign,variant:variantProps,posId,buttonProps}: ShareActionProps): JSX.Element=>{
    const setNotif=useNotification()
    const {post}=useAPI()
    const anchorEl = useRef(null)
    const [openMenu,setOpenMenu]=useState(false);
    const variant=useMemo(()=>variantProps||'icon',[variantProps]);

    const shareType=useMemo(()=>{
        let typ: string;
        if(campaign==='twitter thread') typ='twitter_thread';
        else if(campaign==='events') typ='jadwal';
        else if(campaign==='blog') typ='pages';
        else typ=campaign;
        return typ;
    },[campaign])

    const handleOpenMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setOpenMenu(true);
    },[]);
    const handleCloseMenu = useCallback(() => {
        setOpenMenu(false);
    },[]);
    const handleClick=useCallback((e: MouseEvent<HTMLButtonElement>)=>{
        if(typeof navigator.share === 'function'){
            const url = new URL(window.location.href)
            if(posId && process.env.NODE_ENV==='production') {
                const firebase = getAnalytics();
                post(`/v1/internal/shared${url.search}`,{type:shareType,posid:posId},{},{success_notif:false})
                logEvent(firebase,"share",{
                    method:campaign,
                    content_id:posId
                })
            }
            url.searchParams.set('utm_medium','share button')
            url.searchParams.set('utm_campaign',campaign);
            
            copyTextBrowser(url.toString()).then(()=>{
                setNotif('URL Copied',false)
                navigator.share({
                    title: 'Portalnesia Share',
                    text: document.title+" #PN #Portalnesia",
                    url: url.toString()
                });
            })
        } else {
            handleOpenMenu(e)
        }
    },[posId,campaign,setNotif,handleOpenMenu,post,shareType]);

    const handleMenuClick=useCallback((type: 'facebook'|'twitter'|'line'|'whatsapp'|'telegram'|'copy')=>()=>{
        const firebase = getAnalytics();
        const url = new URL(window.location.href)
        if(posId && process.env.NODE_ENV === 'production') {
            post(`/v1/internal/shared${url.search}`,{type:shareType,posid:posId},{},{success_notif:false})
            logEvent(firebase,"share",{
                method:campaign,
                content_id:posId
            })
        }
        url.searchParams.set('utm_medium','share button')
        url.searchParams.set('utm_campaign',campaign);
        switch(type){
    		case "facebook":
                url.searchParams.set('utm_source','facebook')
    			window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url.toString()), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "twitter":
                url.searchParams.set('utm_source','twitter')
    			window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(url.toString())+'&text='+encodeURIComponent(document.title)+'&via=portalnesia1&hashtags=PN,Portalnesia&related=portalnesia1', 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "line":
                url.searchParams.set('utm_source','line messenger')
    			window.open('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(url.toString()), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "whatsapp":
                url.searchParams.set('utm_source','whatsapp')
    			window.open('https://wa.me/?text='+encodeURIComponent(document.title+" #PN #Portalnesia"+" "+ url.toString()));
                handleCloseMenu()
                break;
    		case "telegram":
                url.searchParams.set('utm_source','telegram')
    			window.open('https://telegram.me/share/url?url='+encodeURIComponent(url.toString())+'&text='+encodeURIComponent(document.title+" #PN #Portalnesia"), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
            case "copy":
            default:
                copyTextBrowser(url.toString()).then(()=>{
                    setNotif("URL Copied",false)
                    handleCloseMenu()
                });
                break;
    	}
    },[posId,campaign,setNotif,handleOpenMenu,post,shareType])
    return (
        <>
            {variant==='icon' ? (
                <Tooltip title="Share">
                    <IconButton ref={anchorEl} onClick={handleClick}>
                        <Share />
                    </IconButton>
                </Tooltip>
            ) : (
                <Button ref={anchorEl} tooltip='Share' onClick={handleClick} icon='share' {...buttonProps}>Share</Button>
            )}
            
            <MenuPopover
                anchorEl={anchorEl.current}
                open={openMenu}
                onClose={handleCloseMenu}
            >
                <MenuItem key={'facebook'} onClick={handleMenuClick('facebook')}>Facebook</MenuItem>
                <MenuItem key={'twitter'} onClick={handleMenuClick('twitter')}>Twitter</MenuItem>
                <MenuItem key={'line'} onClick={handleMenuClick('line')}>Line</MenuItem>
                <MenuItem key={'whatsapp'} onClick={handleMenuClick('whatsapp')}>Whatsapp</MenuItem>
                <MenuItem key={'telegram'} onClick={handleMenuClick('telegram')}>Telegram</MenuItem>
                <MenuItem key={'copy'} onClick={handleMenuClick('copy')}>Copy URL</MenuItem>
            </MenuPopover>
        </>
    );
}

/**
 * 
 * Donation Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
 export const DonationAction=(): JSX.Element=>{
    const handleClick=useCallback(()=>window.open('https://paypal.me/adityatranasuta'),[])
    return (
        <Tooltip title="Donate">
            <IconButton onClick={handleClick}>
                <AttachMoney />
            </IconButton>
        </Tooltip>
    );
}

type CombineActionProps={
    /**
     * List of component 
     */
    list:{
        donation?: boolean,
        share?: ShareActionProps,
        report?: boolean,
        like?: LikeActionProps,
    },
}

/**
 * 
 * Combine Action Components
 * 
 * Combined Action for:
 * 
 * - Like
 * - Notify
 * - Report
 * - Share
 * - Donation
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
 export const CombineAction=(props: CombineActionProps)=>{
    return (
        <Stack direction='row' spacing={2} alignItems='center'>
            {Object.keys(props.list).map((key: string,i: number)=>(
                <>
                {key==='donation' && props.list.donation && <DonationAction />}
                {key==='share' && typeof props.list.share !== 'undefined' && <ShareAction {...props.list.share}/>}
                {key==='report' && typeof props.list.report !== 'undefined' && <ReportAction />}
                {key==='like' && typeof props.list.like !== 'undefined' && <LikeAction {...props.list.like}/> }
                </>
            ))}
        </Stack>
    )
}