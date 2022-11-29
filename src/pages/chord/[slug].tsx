import Container from "@comp/Container";
import Pages from "@comp/Pages";
import { Parser, usePageContent } from "@design/components/Parser";
import SWRPages from "@comp/SWRPages";
import View from "@comp/View";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { clean, truncate } from "@portalnesia/utils";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { useRouter } from "next/router";
import React from "react";
import Sidebar from "@design/components/Sidebar";
import Hidden from "@mui/material/Hidden";
import { HtmlMdUp } from "@design/components/TableContent";
import PaperBlock from "@design/components/PaperBlock";
import { ChordDetail } from "@model/chord";
import dynamic from "next/dynamic";
import Fab from "@mui/material/Fab";
import Iconify from "@design/components/Iconify";
import Portal from "@mui/material/Portal";
import Tooltip from "@mui/material/Tooltip";
import MenuPopover from "@design/components/MenuPopover";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@comp/Button";
import { Span } from "@design/components/Dom";

const Chord = dynamic(()=>import('@comp/Chord'))

export const getServerSideProps = wrapper<ChordDetail>(async({params,redirect,fetchAPI})=>{
    const slug = params?.slug;
    if(typeof slug === 'undefined') return redirect();

    try {
        const url = `/v2/chord/${slug}`;
        const data = await fetchAPI<ChordDetail>(url);
        
        const desc = truncate(clean(data?.original||""),200);
        return {
            props:{
                data:data,
                meta:{
                    title: `Chord ${data?.artist} ${data?.title}`,
                    desc:`${data?.title} by ${data?.artist}.\n${desc}`
                }
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})



export default function ChordPage({data:chord,meta}: IPages<ChordDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const {data,error} = useSWR<ChordDetail>(`/v2/chord/${slug}`,{fallbackData:chord});
    const [transpose,setTranspose]=React.useState(0);
    const [fontsize,setFontsize]=React.useState(5);
    const [scrollSpeed,setScrollSpeed]=React.useState(0);
    const [open,setOpen] = React.useState(false);
    const anchorEl = React.useRef(null)
    const scrollInterval = React.useRef<NodeJS.Timer>()
    const iframeRef = React.useRef<HTMLIFrameElement>();
    const [disable,setDisable]=React.useState({t:{u:false,d:false},a:{u:false,d:true},f:{u:false,d:false}});

    const handleTranspose=React.useCallback((type:'up'|'down'|'reset')=>()=>{
        let res: number;
        if(type==='reset') {
            res=0;
            setDisable({
                ...disable,
                t:{
                    u:false,
                    d:false
                }
            })
        } else if(type==='up') {
            res=transpose+1;
            const dis=res>=12?true:false;
            setDisable({
                ...disable,
                t:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=transpose-1;
            const dis=res<=-12?true:false;
            setDisable({
                ...disable,
                t:{
                    u:false,
                    d:dis
                }
            })
        }
        setTranspose(res);
    },[disable,transpose])

    const handleAutoScroll=React.useCallback((type:'up'|'down'|'reset')=>()=>{
        let res: number;
        if(type==='reset') {
            res=0;
            setDisable({
                ...disable,
                a:{
                    u:false,
                    d:true
                }
            })
        } else if(type==='up') {
            res=scrollSpeed >= 5 ? 5 : scrollSpeed+1;
            const dis=res >=5 ? true : false;
            setDisable({
                ...disable,
                a:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=scrollSpeed <= 0 ? 0 : scrollSpeed-1;
            const dis=res <= 0 ? true : false;
            setDisable({
                ...disable,
                a:{
                    u:false,
                    d:dis
                }
            })
        }
        setScrollSpeed(res);
    },[disable,scrollSpeed])

    const handleFontSize=React.useCallback((type:'up'|'down'|'reset')=>()=>{
        let res: number;
        if(type==='reset') {
            res=5;
            setDisable({
                ...disable,
                f:{
                    u:false,
                    d:false
                }
            })
        } else if(type==='up') {
            res=fontsize+1;
            const dis=res>=10?true:false;
            setDisable({
                ...disable,
                f:{
                    u:dis,
                    d:false
                }
            })
        } else {
            res=fontsize-1;
            const dis=res<=1?true:false;
            setDisable({
                ...disable,
                f:{
                    u:false,
                    d:dis
                }
            })
        }
        setFontsize(res);
    },[disable,fontsize])

    React.useEffect(()=>{
        if(scrollInterval.current) clearInterval(scrollInterval.current)
        if(scrollSpeed > 0) {
            const skala=[0,150,110,70,45,20];
            scrollInterval.current = setInterval(()=>{
                window.scrollBy(0,1);
            },skala[scrollSpeed]);
        } else {
            scrollInterval.current=undefined;
        }
    },[scrollSpeed]);

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            const con=document.getElementById('chord-content');
            if(con) {
                const conHeight = con?.clientHeight||con?.offsetHeight ;
                const conTop=con?.offsetTop;
                //console.log((scrollTop + docHeight),(conHeight + conTop));
                if((scrollTop + docHeight) > (conHeight + conTop + 200)) {
                    handleAutoScroll('reset')();
                }
            }
        }
        const onMessage=(e: MessageEvent<any>)=>{
            if(e.origin!==process.env.URL) return;
            //if(e.origin!=='https://debug.portalnesia.com') return;
            if(typeof e.data.print === 'undefined') return;
            //console.log(iframe)
            if(iframeRef.current){
                document.body.removeChild(iframeRef.current);
                iframeRef.current=undefined;
            }
        }

        window.addEventListener('message',onMessage)
        window.addEventListener('scroll',onScroll)

        return()=>{
            window.removeEventListener('scroll',onScroll)
            window.removeEventListener('message',onMessage)
            if(iframeRef.current){
                document.body.removeChild(iframeRef.current);
                iframeRef.current=undefined;
            }
            if(scrollInterval.current) clearInterval(scrollInterval.current)
        }
    },[slug])

    return (
        <Pages title={meta?.title} desc={meta?.desc}>
            <DefaultLayout>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                        <Typography variant='h3' component='h1'>{`Chord ${data?.title} - ${data?.artist}`}</Typography>
                    </Box>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Box id='chord-content'>
                                {data && <Chord template={data?.text} transpose={transpose} sx={{fontSize:fontsize+9}} />}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>

                        </Grid>
                    </Grid>
                </SWRPages>
            </DefaultLayout>
            <Portal>
                <Tooltip title="Tools">
                    <Fab ref={anchorEl} size='medium' aria-label="Chord Tools" sx={{position:'fixed',right:16,bottom:16+48+8}} onClick={()=>setOpen(true)}>
                        <Iconify icon='arcticons:chordanalyser' width={40} height={40} />
                    </Fab>
                </Tooltip>
                <MenuPopover anchorOrigin={undefined} transformOrigin={undefined} arrow={false} open={open} anchorEl={anchorEl.current} onClose={()=>setOpen(false)} paperSx={{width:320}}>
                    <Box p={2} display="flex" flexDirection={"column"} justifyContent="center" alignItems="center">
                        <Typography variant='h5'>Chord Tools</Typography>
                        <ButtonGroup key="auto-scroll" sx={{mt:2}}>
                            <Button color="error" onClick={handleAutoScroll('reset')}>X</Button>
                            <Button disabled={disable.a.d} onClick={handleAutoScroll('down')}>-</Button>
                            <Span sx={{p:1,px:2,minWidth:120}}>{`Auto Scroll: ${scrollSpeed}`}</Span>
                            <Button disabled={disable.a.u} onClick={handleAutoScroll('up')}>+</Button>
                        </ButtonGroup>

                        <ButtonGroup key="transpose" sx={{my:2}}>
                            <Button color="error" onClick={handleTranspose('reset')}>X</Button>
                            <Button disabled={disable.t.d} onClick={handleTranspose('down')}>-</Button>
                            <Span sx={{p:1,px:2,minWidth:120}}>{`Transpose: ${transpose}`}</Span>
                            <Button disabled={disable.t.u} onClick={handleTranspose('up')}>+</Button>
                        </ButtonGroup>

                        <ButtonGroup key="font-size">
                            <Button color="error" onClick={handleFontSize('reset')}>X</Button>
                            <Button disabled={disable.f.d} onClick={handleFontSize('down')}>-</Button>
                            <Span sx={{p:1,px:2,minWidth:120}}>{`Font Size: ${fontsize}`}</Span>
                            <Button disabled={disable.f.u} onClick={handleFontSize('up')}>+</Button>
                        </ButtonGroup>
                    </Box>
                </MenuPopover>
            </Portal>
        </Pages>
    )
}