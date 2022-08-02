import React from 'react'
import {dataUserType} from 'portal/types/user'
import {useDispatch,useSelector as useReduxSelector,TypedUseSelectorHook} from 'react-redux'
import useAPI from 'portal/utils/api'
import {IconButton,CircularProgress as CirProgress,Menu,MenuItem,Tooltip as Toltip,TooltipProps} from '@mui/material'
import {ReportProblem,Favorite,FavoriteBorder,AttachMoney,Share as ShareIcon,Notifications as NotIcon,NotificationsNone} from '@mui/icons-material'
import {useNotif} from 'portal/components/Notification'
import Button,{ButtonProps} from 'portal/components/Button'
import {styled} from '@mui/material/styles'
import {copyTextBrowser as Kcopy} from '@portalnesia/utils'
import {useMousetrap} from 'portal/utils/useKeys'
import * as gtag from 'portal/utils/gtag'

type RootState={
    user?: dataUserType,
}

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

const Tooltip = styled(Toltip)(()=>({
    '&.MuiTooltip-tooltip':{
        fontsize:16
    }
}))

const CircularProgress = styled(CirProgress)(({theme})=>({
    color: `${theme.palette.primary.main} !important`,
    '& svg':{
        color: `${theme.palette.primary.main} !important`,
    },
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
    zIndex:5
}))

const IconComp = styled(IconButton)(({disabled,theme})=>({
    zIndex:1,
    '& svg': {
        color:theme.palette.secondary.main
    },
    ...(disabled ? {
        background:theme.palette.action.disabled
    } : {})
}))

const prefix="action-";
const classes = {
    root:`${prefix}root`,
    child:`${prefix}child`
}

const Div = styled('div')(({theme})=>({
    [`&.${classes.root}`]: {
        display:'flex',
        alignItems:'center',
        [`&.${classes.child}`]:{
            marginLeft:theme.spacing(0.5),
            '&:first-child':{
                marginLeft:'0 !important'
            }
        },
    }
}))

type DefaultPropsType={tooltipProps:{interactive: boolean,enterTouchDelay: number}}
const DefaultProps: DefaultPropsType={
    tooltipProps:{
        interactive:true,
        enterTouchDelay:100
    }
}

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
    /**
     * Props for tooltip component
     */
    tooltipProps?: TooltipProps
}

/**
 * 
 * Like Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const LikeAction=(props: LikeActionProps): JSX.Element=>{
    const [loading,setLoading]=React.useState(false)
    const user=useSelector((state=>state.user))
    const {post,del}=useAPI()
    const {setNotif}=useNotif()
    const handleClick=async()=>{
        if(user===null) setNotif("Login to continue",true)
        else {
            setLoading(true)
            const url = new URL(window.location.href)
            try {
                let res: {liked:boolean};
                if(!props.liked) {
                    const [dt] = await post<{liked: boolean}>(`/v1/likes/${props.type}/${props.posId}${url.search}`,null)
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
        <Tooltip title={props?.liked ? "Unlike" : "Like"} {...props.tooltipProps}>
            <IconComp
                disabled={loading}
                onClick={handleClick}
                size="large"
            >
                {props?.liked ? <Favorite /> : <FavoriteBorder />}
                {loading && <CircularProgress size={24} thickness={7} />}
            </IconComp>
        </Tooltip>
    );
}
LikeAction.defaultProps=DefaultProps

export type NotifyActionProps={
    /**
     * Is notified?
     */
    notify: boolean,
    /**
     * Pos ID of content
     */
    posId: number,
    /**
     * Type of content
     */
    type: 'jadwal',
    /**
     * Fire when component clicked. Change the 'notify' value
     */
    onChange?: (params: boolean)=>void
    /**
     * Props for tooltip component
     */
    tooltipProps?: TooltipProps
}

/**
 * 
 * Notify Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const NotifyAction=(props: NotifyActionProps): JSX.Element=>{
    const [loading,setLoading]=React.useState(false)
    const user=useSelector((state=>state.user))
    const {post}=useAPI()
    const {setNotif}=useNotif()
    const handleClick=()=>{
        if(user===null) setNotif("Login to continue",true)
        else {
            setLoading(true)
            const url = new URL(window.location.href)
            post<{notified: boolean}>(`/v1/backend/notify${url.search}`,{type:props.type,id:props.posId})
            .then(([res])=>{
                if(props.onChange) props.onChange(res.notified)
            }).finally(()=>{
                setLoading(false)
            })
        }
    }
    return (
        <Tooltip title={props?.notify ? "Unsubscribe Notification" : "Subscribe Notification"} {...props.tooltipProps}>
            <IconComp
                disabled={loading}
                onClick={handleClick}
                size="large"
            >
                {props?.notify ? <NotIcon /> : <NotificationsNone />}
                {loading && <CircularProgress size={24} thickness={7} />}
            </IconComp>
        </Tooltip>
    );
}
NotifyAction.defaultProps=DefaultProps

export type ReportActionType={
    /**
     * Props for tooltip component
     */
    tooltipProps?: TooltipProps
}

/**
 * 
 * Report Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const ReportAction=(props: ReportActionType): JSX.Element=>{
    const dispatch=useDispatch();
    useMousetrap('shift+r',(e)=>{
        if(e && typeof e?.preventDefault === 'function') e.preventDefault()
        if(e && typeof e?.returnValue!=='undefined') e.returnValue=false
        handleClick(e)
    })
    const handleClick=(e)=>{
        if(typeof e.target.blur === 'function') e.target.blur();
        if(typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
        dispatch({type:'REPORT',payload:{type:'konten',url:window.location.href,endpoint:null}})
    }
    return (
        <Tooltip title="Report (Shift + R)" {...props.tooltipProps}>
            <IconButton onClick={handleClick} size="large">
                <ReportProblem />
            </IconButton>
        </Tooltip>
    );
}
ReportAction.defaultProps=DefaultProps

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
    tooltipProps?: TooltipProps
}

/**
 * 
 * Share Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 * @params campaign
 * @params variant
 * @params posId
 * @params buttonProps
 * @params tooltipProps
 * 
 */
export const ShareAction=(props: ShareActionProps): JSX.Element=>{
    const {setNotif}=useNotif()
    const {post}=useAPI()
    const [anchorEl,setAnchorEl]=React.useState<Array<number>|null>(null);
    const [openMenu,setOpenMenu]=React.useState(false);
    const variant=props.variant||'icon';
    const btnProps=props.buttonProps||{};

    const shareType=React.useMemo(()=>{
        let typ: string;
        if(props.campaign==='twitter thread') typ='twitter_thread';
        else if(props.campaign==='events') typ='jadwal';
        else if(props.campaign==='blog') typ='pages';
        else typ=props.campaign;
        return typ;
    },[props.campaign])

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement,MouseEvent>) => {
        event.preventDefault();
        setOpenMenu(true);
        setAnchorEl([event.clientX - 2,event.clientY - 4]);
    };
    const handleCloseMenu = () => {
        setOpenMenu(false);
        setAnchorEl(null);
    };
    const handleClick=(e: React.MouseEvent<HTMLButtonElement,MouseEvent>)=>{
        if(typeof navigator.share === 'function'){
            const url = new URL(window.location.href)
            if(props.posId && process.env.NODE_ENV==='production') {
                post(`/v1/internal/shared${url.search}`,{type:shareType,posid:props.posId},{},{success_notif:false,error_notif:false})
                gtag.event({
                    action:"share",
                    method:props.campaign,
                    content_id:props.posId
                })
            }
            const campg=props.campaign.replace(/\s/g,"+"), a=window.location.href.match(/\?/)?window.location.href+"&utm_source=native+share&utm_medium=share+button&utm_campaign="+campg:window.location.href+"?utm_source=native+share&utm_medium=share+button&utm_campaign="+campg;
            
            Kcopy(a).then(()=>{
                setNotif('URL Copied',false)
                navigator.share({
                    title: 'Portalnesia Share',
                    text: document.title+" #PN #Portalnesia",
                    url: a
                });
            })
        } else {
            handleOpenMenu(e)
        }
    }
    const handleMenuClick=(type: 'facebook'|'twitter'|'line'|'whatsapp'|'telegram'|'copy')=>()=>{
        const url = new URL(window.location.href)
        const campg=props.campaign.replace(/\s/g,"+"), a=window.location.href.match(/\?/)?window.location.href+"utm_medium=share+button&utm_campaign="+campg:window.location.href+"?utm_medium=share+button&utm_campaign="+campg;
        if(props.posId && process.env.NODE_ENV === 'production') {
            post(`/v1/internal/shared${url.search}`,{type:shareType,posid:props.posId},{},{success_notif:false,error_notif:false})
            gtag.event({
                action:"share",
                method:props.campaign,
                content_id:props.posId
            })
        }
        switch(type){
    		case "facebook":
    			window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(a+"&utm_source=facebook"), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "twitter":
    			window.open('https://twitter.com/intent/tweet?url='+encodeURIComponent(a+"&utm_source=twitter")+'&text='+encodeURIComponent(document.title)+'&via=portalnesia1&hashtags=PN,Portalnesia&related=portalnesia1', 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "line":
    			window.open('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(a+"&utm_source=line+messenger"), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
    		case "whatsapp":
    			window.open('https://wa.me/?text='+encodeURIComponent(document.title+" #PN #Portalnesia"+" "+a+"&utm_source=whatsapp"));
                handleCloseMenu()
                break;
    		case "telegram":
    			window.open('https://telegram.me/share/url?url='+encodeURIComponent(a+"&utm_source=telegram")+'&text='+encodeURIComponent(document.title+" #PN #Portalnesia"), 'Portalnesia Share', "width=650, height=550");
                handleCloseMenu()
                break;
            case "copy":
            default:
                Kcopy(a+"&utm_source=copy+url").then(()=>{
                    setNotif("URL Copied",false)
                    handleCloseMenu()
                });
                break;
    	}
    }
    return (
        <div>
            {variant==='icon' ? (
                <Tooltip title="Share" {...props.tooltipProps}>
                    <IconButton onClick={handleClick} size="large">
                        <ShareIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Button tooltip='Share' onClick={handleClick} {...btnProps}>Share</Button>
            )}
            
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={
                    anchorEl !== null ? { top: anchorEl[1], left: anchorEl[0] } : undefined
                }
                open={openMenu}
                onClose={handleCloseMenu}
            >
                <MenuItem key={0} onClick={handleMenuClick('facebook')}>Facebook</MenuItem>
                <MenuItem key={1} onClick={handleMenuClick('twitter')}>Twitter</MenuItem>
                <MenuItem key={2} onClick={handleMenuClick('line')}>Line</MenuItem>
                <MenuItem key={3} onClick={handleMenuClick('whatsapp')}>Whatsapp</MenuItem>
                <MenuItem key={4} onClick={handleMenuClick('telegram')}>Telegram</MenuItem>
                <MenuItem key={5} onClick={handleMenuClick('copy')}>Copy URL</MenuItem>
            </Menu>
        </div>
    );
}
ShareAction.defaultProps=DefaultProps

export type DonationActionProps={
    tooltipProps?: TooltipProps
}

/**
 * 
 * Donation Action Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
export const DonationAction=(props: DonationActionProps): JSX.Element=>{
    const handleClick=()=>window.open('https://paypal.me/adityatranasuta')
    return (
        <Tooltip title="Donate" {...props.tooltipProps}>
            <IconButton onClick={handleClick} size="large">
                <AttachMoney />
            </IconButton>
        </Tooltip>
    );
}
DonationAction.defaultProps=DefaultProps

type CombineActionProps={
    /**
     * List of component 
     */
    list:{
        donation?: DonationActionProps|boolean,
        share?: ShareActionProps,
        report?: ReportActionType|boolean,
        like?: LikeActionProps,
        notify?: NotifyActionProps
    },
    /**
     * Props for tooltip component
     */
    tooltipProps?: TooltipProps
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
        <Div className={classes.root}>
            {Object.keys(props.list).map((key: string,i: number)=>(
                <>
                {key==='donation' && props.list.donation && <Div key={`donation-${i}`} className={classes.child}><DonationAction {...(props.tooltipProps ? {tooltipProps:props.tooltipProps} : {})} /></Div>}
                {key==='share' && typeof props.list.share !== 'undefined' && <Div key={`share-${i}`} className={classes.child}><ShareAction {...(props.tooltipProps ? {tooltipProps:props.tooltipProps} : {})} {...props.list.share}/></Div>}
                {key==='report' && typeof props.list.report !== 'undefined' && <Div key={`report-${i}`} className={classes.child}><ReportAction {...(props.tooltipProps ? {tooltipProps:props.tooltipProps} : {})}/></Div>}
                {key==='like' && typeof props.list.like !== 'undefined' && <Div key={`like-${i}`} className={classes.child}><LikeAction {...(props.tooltipProps ? {tooltipProps:props.tooltipProps} : {})} {...props.list.like}/></Div>}
                {key==='notify' && typeof props.list.notify !== 'undefined' && <Div key={`notify-${i}`} className={classes.child}><NotifyAction {...(props.tooltipProps ? {tooltipProps:props.tooltipProps} : {})} {...props.list.notify}/></Div>}
                </>
            ))}
        </Div>
    )
}
CombineAction.defaultProps=DefaultProps