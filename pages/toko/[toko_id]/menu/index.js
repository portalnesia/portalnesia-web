import React from 'react'
import db from 'portal/utils/db'
import {separateNumber,ucwords,jsStyles} from '@portalnesia/utils'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {Grid} from '@mui/material'
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr'
import dynamic from 'next/dynamic'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'

const Typography=dynamic(()=>import('@mui/material/Typography'),{ssr:false})
const Card=dynamic(()=>import('@mui/material/Card'),{ssr:false})
const CardContent=dynamic(()=>import('@mui/material/CardContent'),{ssr:false})
const Image=dynamic(()=>import('portal/components/Image'),{ssr:false})
const ShareAction=dynamic(()=>import('portal/components/Action').then(mod=>mod.ShareAction),{ssr:false})

export const getServerSideProps = wrapper(async({params})=>{
    const {toko_id}=params;
    const toko = await db.kata(`SELECT * FROM klekle_toko WHERE slug=? AND BINARY(slug) = BINARY(?) LIMIT 1`,[toko_id,toko_id])
    if(!toko) {
        db.redirect();
    }
    const meta={
        id:toko[0]?.id,
        title:toko[0]?.name,
        description:(toko[0]?.description == null ? "" : toko[0]?.description),
        slug:toko[0]?.slug
    }
    return {props:{meta:meta}}
})

const styles=theme=>({
    cat:{
        paddingBottom:'.3em',
        borderBottom:`1px solid ${theme.palette.divider}`
    },
    contspan:{
        '& span':{
            '&:hover':{
                textDecoration:'underline'
            },
        },
        '&.active':{
            color:theme.palette.primary.link,
        }
    },
    contentTools:{
        position:'fixed',
        top:200,
        zIndex:101,
        transition: 'right .5s ease-out',
        maxWidth:'calc(100% - 40px)'
    },
    contentBtn:{
        cursor:'pointer',
        fontSize:15,
        padding:'7px 20px',
        backgroundColor:theme.palette.primary.main,
        color:'#ffffff',
        display:'inline-block',
        position:'absolute',
        top:36,
        left:-70,
        transform:'rotate(-90deg)',
        borderRadius:'10px 10px 0 0',
    },
    contentCont:{
        backgroundColor:theme.palette.background.default,
        borderBottomLeftRadius:10,
        position:'relative'
    },
    contentContt:{
        maxHeight:'calc(100% - 250px)',
        overflowY:'auto',
        '-webkit-box-shadow':'50px 4px 40px -7px rgba(0,0,0,0.2)',
        boxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
        padding:20,
        wordBreak:'break-word'
    }
})

const MenuToko=({err,meta,classes})=>{
    if(err) return <ErrorPage statusCode={err} />
    const [content,setContent]=React.useState([]);
    const [right,setRight]=React.useState(-500);
    const [opacity,setOpacity]=React.useState(0)
    const {data,error} = useSWR(`/v1/toko/${meta?.slug}/menu`)
    let containerRef=React.useRef(null);
    let hashRef=React.useRef(null)

    const handlePageContent=(id,tutup)=>e=>{
        if(e && e.preventDefault) e.preventDefault()
        const conta=document.getElementById(id);
        if(conta){
            const a=conta.offsetTop,b=a+15;
            window.scrollTo({top:b,left:0,behavior:'smooth'});
            if(tutup===true) setRight(containerRef.current)
        }
    }

    const btnPageContent=()=>{
        if(right === 0) setRight(containerRef.current)
        else setRight(0)
    }

    React.useEffect(()=>{
        const tim1 = setTimeout(()=>{
            if(data) {
                const konten = data?.filter((menu)=>(menu.category!='Uncategory'))||[];
                const kon = konten?.map((ko)=>{
                    const validId = ko?.category?.split(' ').slice(0,3).join(' ');
                    const id = jsStyles(validId)
                    return {
                        id:id,
                        name:ko.category
                    }
                });
                setContent(kon);
            }
        },200)
        
        return()=>{
            setContent([])
            clearTimeout(tim1)
        }
    },[data])

    React.useEffect(()=>{
        const $=require('jquery')

        function onScroll() {
            const aa=$("#tableOfContents").find("a");
            const o=$(window).scrollTop();
            aa.each(function(){
                $(this.hash).length&&$(this.hash).offset().top-84<=o&&($(this).addClass("active"),$(this).siblings().removeClass("active"))
            })
        }
        const tim2 = setTimeout(()=>{
            if(content.length > 0) {
                if(hashRef.current===null) {
                    hashRef.current=10;
                    const hash = window.location.hash;
                    if(hash.length > 0) {
                        handlePageContent(hash.substring(1))()
                    }
                }
                if(containerRef.current===null) {
                    const cont=document.getElementById('table-contents')
                    if(cont) {
                        const a=cont.clientWidth||cont.offsetWidth;
                        containerRef.current=Number(a*-1);
                        setRight(Number(a*-1));
                        setOpacity(1)
                    }
                }
                $(window).on('scroll',onScroll)
            }
        },1000)
        return ()=>{
            $(window).off('scroll',onScroll)
            clearTimeout(tim2)
            //if(containerRef.current!==null) {
                setRight(-500)
                setOpacity(0)
                containerRef.current=null
            //}
        }
    },[content])

    return (
        <Header title={meta?.title} navTitle={meta?.title} desc={meta?.description} canonical={`/toko/${meta?.slug}/menu`} >
            <Grid container spacing={2} justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock title={`${meta?.title}'s Menu`} linkColor whiteBg action={
                        <ShareAction campaign="toko" posId={meta?.id} />
                    }>
                        {error ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{error}</Typography>
                            </div>
                        ) : !data && !error ? (
                            <Skeleton type="grid" image number={6} gridProps={{xs:12,sm:6,lg:4}} />
                        ) : data?.length == 0 ? (
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">No Data</Typography>
                            </div>
                        ) : data?.map((dt,i)=>{
                            const validId = dt?.category?.split(' ').slice(0,3).join(' ');
                            const id = jsStyles(validId)
                            return (
                                <div style={{marginBottom:100}} key={`cat-${i}`}>
                                    {dt?.category != 'Uncategory' && <a className="no-format" href={`#${id}`} onClick={handlePageContent(id,true)}><h1 id={id} className={classes?.cat}>{ucwords(dt?.category)}</h1></a>}
                                    <Grid container spacing={2}>
                                        {Object.keys(dt?.groups)?.map((gr,ii)=>{
                                            const it = dt?.groups?.[gr]?.items;
                                            const img = dt?.groups?.[gr]?.image;
                                            return (
                                                <Grid item xs={12} sm={6} lg={4} key={`menu-${ii}`}>
                                                    <Card style={{position:'relative'}} elevation={0}>
                                                        <div style={{width:200,marginLeft:'auto',marginRight:'auto',paddingTop:'.5rem'}}><Image fancybox={img!=`${process.env.CONTENT_URL}/img/content?image=notfound.png`} alt={gr} width={200} height={200} webp src={`${img}&size=200&watermark=no`} dataSrc={img} /></div>
                                                        <CardContent>
                                                            {gr !== it?.[0]?.name && it?.length == 1 || it?.length > 1 ? (
                                                                <React.Fragment>
                                                                    <center><h3 style={{marginTop:0}}>{gr}</h3></center>
                                                                    {it?.map((item,iii)=>(
                                                                        <div className='flex-header' key={`it=${iii}`}>
                                                                            <Typography>{item?.name}</Typography>
                                                                            <Typography style={{marginLeft:10}}><strong>{`IDR ${separateNumber(Number(item?.price))}`}</strong></Typography>
                                                                        </div>
                                                                    ))}
                                                                </React.Fragment>
                                                            ) : (
                                                                <center>
                                                                    <h3 style={{marginTop:0}}>{gr}</h3>
                                                                    <Typography><strong>{`IDR ${separateNumber(Number(it?.[0]?.price))}`}</strong></Typography>
                                                                </center>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            )
                                        })}
                                    </Grid>
                                </div>
                            )
                        })}
                    </PaperBlock>
                </Grid>
            </Grid>
            {content.length > 0 && (
                <div className={classes.contentTools} style={{right:right,opacity:opacity}}>
                    <div className={classes.contentCont}>
                        <div onClick={btnPageContent} key={0} className={classes.contentBtn}>Category</div>
                        <div key={1} id='table-contents' className={classes.contentContt}>
                            <div id="tableOfContents">
                                {content.map((dt,i)=>(
                                    <a key={`${dt?.id}-${i}`} href={`#${dt?.id}`} onClick={handlePageContent(dt?.id,true)} className={classes.contspan}><Typography>{i+1}. <span>{dt?.name}</span></Typography></a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Header>
    )
}

export default withStyles(MenuToko,styles)