import React from 'react'
import {Header,Image,PaperBlock,Skeleton,Button} from 'portal/components'
import {useAPI,ApiError,useHotKeys} from 'portal/utils'
import {ucwords} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import Link from 'next/link'
import {makeStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import {Grid,Typography,CircularProgress,IconButton} from '@mui/material'
import {Autorenew} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,res,params})=>{
    const slug=params?.slug;
    if(slug?.length > 1) {
        return {
            notFound:true
        }
    }
    if(data.user === null) return {
        redirect:{
            destination:`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`,
            permanent:false
        }
    }
    return {props:{}}
})

const useStyles=makeStyles()((theme)=>({
    title:{
        //marginBottom:'1rem !important',
        fontWeight:'500 !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2
    },
    overfloww:{
        color:`${theme.palette.text.secondary} !important`,
        fontSize:'.9rem !important',
        display:'-webkit-box!important',
        WebkitBoxOrient:'vertical',
        overflow:'hidden',
        WebkitLineClamp:2,
    },
    extendedIcon: {
        marginRight: `${theme.spacing(1)} !important`,
    },
    fab:{
        position: 'fixed !important',
        bottom: `${theme.spacing(2)} !important`,
        right: `${theme.spacing(2)} !important`,
        [theme.breakpoints.down('lg')]: {
            bottom: `${theme.spacing(2) + 56} !important`,
        },
    }
}))

const Like=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const {classes} = useStyles();
    const router=useRouter();
    const {page,slug}=router.query;
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [unformatdata,setData]=React.useState([{type:"loading",data:[]}]);
    const [data,setFormatData] = React.useState([{type:"loading",data:[]}]);
    const [isLoading,setIsLoading]=React.useState(false);
    const [isReachEnd,setReachEnd]=React.useState(false);
    const [error,setError]=React.useState(false);
    const {get} = useAPI()
    const {keyboard,feedback}=useHotKeys()

    const getData=()=>{
        if(typeof slug==='undefined' && !keyboard && !feedback) {
            setData([{type:"loading",data:[]}])
            setIsLoading(true);
            setReachEnd(false);
            get(`/v1/likes`)
            .then(([res])=>{
                setData(res.data);
                setReachEnd(false);
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
                setTimeout(()=>setIsLoading(false),500)
            })
        }
        else if(typeof slug[0] !== 'undefined' && ['chord','blog','news','thread'].indexOf(slug[0]) !== -1 &&  typeof page==='undefined' && !keyboard && !feedback){
            setReachEnd(false);
            setData([{type:"loading",data:[]}])
            setIsLoading(true);
            get(`/v1/likes/${slug[0].toLowerCase()}?page=1`)
            .then(([res])=>{
                setData([res.data]);
                setReachEnd(!res.can_load);
            }).catch((err)=>{
                setTimeout(()=>setIsLoading(false),500)
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            })
        }
        else if(typeof slug[0] !== 'undefined' && ['chord','blog','news','thread'].indexOf(slug[0]) !== -1 && !isReachEnd && !keyboard && !feedback){
            setIsLoading(true);
            get(`/v1/likes/${slug[0].toLowerCase()}?page=${page||1}`)
            .then((res)=>{
                const a= data.length > 0 ? data?.[0]?.data : [];
                const b=a.concat(res.data?.data)
                setData([{type:slug[0],data:b}])
                setReachEnd(!res.can_load);
            }).catch((err)=>{
                setTimeout(()=>setIsLoading(false),500)
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            })
        } else {
            console.log("Error")
            setTimeout(()=>setIsLoading(false),500)
            setError(true);
        }
    }

    React.useEffect(()=>{
        setError(false)
        getData()
    },[router.query])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if((scrollTop + docHeight) > (scrollHeight-250)) {
                if(!isLoading && !isReachEnd && router.query.filter && !keyboard && !feedback) {
                    setIsLoading(true)
                    const {page:pg,...other}=router.query;
                    const pgg=Number(pg||1)+1;
                    router.replace({
                        pathname:'/likes/[[...slug]]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/likes/${router.query.slug?.[0]||''}${pgg ? '?page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage>1 && typeof slug[0] !== 'undefined') {
            setIsLoadingFP(true);
            get(`/v1/likes/${slug[0].toLowerCase()}?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const c = res?.data?.data
                const a = data.length ? data?.[0]?.data : [];
                const b = c.concat(a)
                setData([{type:slug[0],data:b}])
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    React.useEffect(()=>{
        if(unformatdata?.length > 0 && unformatdata?.[0]?.data?.length > 0) {
            const udata = unformatdata?.[0]?.type !== 'loading' ? unformatdata.map((u)=>{
                const type = u.type;
                const data = u.data?.map(d=>{
                    const edit = {
                        title:''
                    }
                    if(type == 'chord') {
                        edit.title = `${d?.artist} - ${d?.title}`
                    } else {
                        edit.title = d?.title;
                    }
                    d.link = (d?.link||"#")?.replace("https://portalnesia.com","");
                    return {
                        ...d,
                        ...edit
                    }
                })
                return {
                    type,
                    data
                }
            }) : unformatdata;
            setFormatData(udata);
            setTimeout(()=>setIsLoading(false),1000)
        } else {
            setFormatData(unformatdata);
            setTimeout(()=>setIsLoading(false),1000)
        }
    },[unformatdata])

    return (
        <Header navTitle="Likes" title="My Likes" canonical={slug?.[0] ? `/likes/${slug[0]}` : '/likes'} noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12}>
                    {error===true || typeof error === 'string' ? (
                        <PaperBlock title="Error" whiteBg>
                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                <Typography variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typography>
                            </div>
                        </PaperBlock>
                    ) : data.length > 0 ? data.map((type,i)=>(
                        <PaperBlock key={`type-${i}`} title={ucwords(type.type)} whiteBg
                        action={slug?.[0] || isLoading || type.data.length===0 ? null : <Link href="/likes/[[...slug]]" as={`/likes/${type.type}`} shallow><a><Button outlined>View More</Button></a></Link>}
                        >
                            <Grid container spacing={2}>
                                {firstPage>1 && typeof slug[0] !== 'undefined' ?
                                    isLoadingFP ? (
                                        <Grid key={`loading-${type.type}-1`} item xs={12}>
                                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                                <CircularProgress thickness={5} size={50}/>
                                            </div>
                                            </Grid>
                                    ) : (
                                        <Grid key={`loading-${type.type}-2`} item xs={12}>
                                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                                <IconButton onClick={handleFirstPage} size="large">
                                                    <Autorenew />
                                                </IconButton>
                                                <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                                            </div>
                                        </Grid>
                                    )
                                : null}
                                {type.data.length > 0 ? type.data.map((dt,ii)=>(
                                    <Grid key={`child-${type.type}-${ii.toString()}`} item xs={12} sm={6} md={4} lg={3}>
                                        {['chord','thread'].indexOf(type.type) !== -1 ? (
                                            <Card style={{position:'relative'}} elevation={0}>
                                                <Link href={dt.link} passHref><a title={dt?.title}>
                                                    <CardActionArea style={{position:'relative'}}>
                                                        <CardContent>
                                                            <div style={{height:48}}>
                                                                <Typography component='p' className={classes.title}>{dt.title}</Typography>
                                                            </div>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </a></Link>
                                            </Card>
                                        ) : (
                                            <Card style={{position:'relative'}} elevation={0}>
                                                <Link href={dt.link} passHref><a title={dt?.title}>
                                                    <CardActionArea style={{position:'relative'}}>
                                                        <div style={{width:200,marginLeft:'auto',marginRight:'auto',paddingTop:'.5rem'}}><Image width={200} height={200} webp src={`${dt.image}`} alt={dt.title} style={{width:200,height:200,marginLeft:'auto',marginRight:'auto'}}/></div>
                                                        <CardContent>
                                                            <div style={{height:48}}>
                                                                <Typography component='p' className={classes.title}>{dt.title}</Typography>
                                                            </div>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </a></Link>
                                            </Card>
                                        )}
                                    </Grid>
                                )) : !isLoading && type.data.length===0 && type?.type !== 'loading' ? (
                                    <Grid item xs={12}>
                                        <div style={{margin:'20px auto',textAlign:'center'}}>
                                            <Typography variant="body2">No data</Typography>
                                        </div>
                                    </Grid>
                                ) : null}

                                {isReachEnd && (
                                    <Grid item xs={12}>
                                        <div style={{margin:'20px auto',textAlign:'center'}}>
                                            <Typography variant="body2">You've reach the bottom of pages</Typography>
                                        </div>
                                    </Grid>
                                )}
                                {(isLoading || unformatdata?.[0]?.type === 'loading') && (
                                    <Grid item xs={12}>
                                        { unformatdata?.[0]?.type === 'loading' ? (
                                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                                <CircularProgress thickness={5} size={50}/>
                                            </div>
                                        ) : <Skeleton type='grid' number={8} image/>}
                                    </Grid>
                                )}
                            </Grid>
                        </PaperBlock>
                    )) : (
                        <PaperBlock key={`not-found`} title="Likes" whiteBg>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <div style={{margin:'20px auto',textAlign:'center'}}>
                                        <Typography variant="body2">No data</Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </PaperBlock>
                    )}
                </Grid>
            </Grid>
        </Header>
    );
}
export default Like