import React from 'react'
import Header from 'portal/components/Header'
import ErrorPage from 'portal/pages/_error'
import {useRouter} from 'next/router'
import Link from 'next/link'
import PaperBlock from 'portal/components/PaperBlock'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import Skeleton from 'portal/components/Skeleton'
import {styled} from '@mui/material/styles';
import {wrapper} from 'portal/redux/store'
import useAPI,{ApiError} from 'portal/utils/api'
import {useHotKeys} from 'portal/utils/useKeys'
import useSWR from 'portal/utils/swr'
import {Grid,Typography as Typo,CircularProgress,IconButton} from '@mui/material'
import {Autorenew} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));
const CardMedia=dynamic(()=>import('@mui/material/CardMedia'));
const Tooltip=dynamic(()=>import('@mui/material/Tooltip'));
const Image=dynamic(()=>import('portal/components/Image'),{ssr:false})

export const getServerSideProps = wrapper(()=>({props:{}}))

const Typography = styled(Typo,{shouldForwardProp:prop=>prop!=="isTitle"})(({theme,isTitle})=>({
    ...(isTitle ? {
        marginBottom:'1rem !important',
        fontWeight:'500 !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2
    } : {
        color:`${theme.palette.text.secondary} !important`,
        fontSize:'.7rem !important',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:1,
        position:'absolute !important',
        bottom:16,
        right:16
    })
}))

const NewsHome=({meta,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {page,reloadedPage}=router.query
    const [firstPage,setFirstPage]=React.useState(page ? page-1 : 0);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [data,setData]=React.useState(meta?.data||[]);
    const [isLoading,setIsLoading]=React.useState(false);
    const [isReachEnd,setReachEnd]=React.useState(meta?.reachEnd||false);
    const [error,setError]=React.useState(false);
    const {get} = useAPI()
    const {data:dataRecommend,error:errorRecommend,mutate:mutateRecommend}=useSWR(`/v1/news/recommendation`)
    const {feedback,keyboard}=useHotKeys()
    const getData=(pg,aaa)=>{
        setError(false)
        if(!isReachEnd && !keyboard && !feedback) {
            setIsLoading(true);
            get(`/v1/news?page=${pg||1}`)
            .then(([res])=>{
                setReachEnd(!res.can_load);
                if(aaa) {
                    setData(res.data)
                } else {
                    const a=data;
                    const b=a.concat(res.data)
                    setData(b);
                }
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
        }
    }
    React.useEffect(()=>{
        if(reloadedPage) {
            mutateRecommend();
            getData(0,true)
        }
    },[page,reloadedPage])

    React.useEffect(()=>{
        mutateRecommend()
        if(data.length == 0) getData(page)
    },[])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-200)) {
                if(!isLoading && !isReachEnd && !keyboard && !feedback) {
                    setIsLoading(true)
                    const {page:pg}=router.query;
                    const pgg=Number(pg||1)+1;
                    router.replace({
                        pathname:'/news/',
                        query:{
                            page:pgg
                        }
                    },`/news/${pgg ? '?page='+pgg : ''}`,{shallow:true})
                    getData(pgg)
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage!==0) {
            setIsLoadingFP(true);
            get(`/v1/news?page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const a=res.data;
                const b=a.concat(data)
                setData(b);
                setTimeout(()=>setIsLoadingFP(false),1000);
            }).catch((err)=>{
                setTimeout(()=>setIsLoadingFP(false),1000);
            })
        }
    }

    return (
        <Header notBack iklan canonical='/news' title='News' desc="Recent News" keyword="berita hari ini, berita harian, berita terkini, berita terbaru, berita indonesia, berita terpopuler, berita, info terkini, berita dunia, peristiwa hari ini, hot news, news" active='news'>
            <Breadcrumbs title={"News"} />
            {dataRecommend && (!errorRecommend) && dataRecommend?.length > 0 ? (
                <PaperBlock key='recommend' title="Recommended" whiteBg>
                    <Grid container spacing={2}>
                        {dataRecommend?.map((dt,i)=>(
                            <Grid key={`recommend-news-${dt?.title}-1`} item xs={12} sm={6} md={4} lg={3}>
                                <Card style={{position:'relative'}} elevation={0}>
                                    <Link href={dt?.link?.replace(process.env.DOMAIN,"")} passHref><a title={dt.title}>
                                        <CardActionArea style={{position:'relative'}}>
                                            <CardMedia>
                                                <Image webp src={`${dt.image}&export=banner&size=300`} alt={dt.title} style={{width:'100%',height:'auto'}}/>
                                            </CardMedia>
                                            <CardContent>
                                                <div style={{height:80.24}}>
                                                    <Tooltip title={dt.title}>
                                                        <Typography component='p' isTitle>{dt.title}</Typography>
                                                    </Tooltip>
                                                    <Typography variant="body2">{dt.source}</Typography>
                                                </div>
                                            </CardContent>
                                        </CardActionArea>
                                    </a></Link>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </PaperBlock>
            ) : !dataRecommend && !errorRecommend ? (
                <PaperBlock key='recommend' title="Recommended" whiteBg>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Skeleton type='grid' image number={8} />
                        </Grid>
                    </Grid>
                </PaperBlock>
            ): null}

            <PaperBlock title="News" whiteBg>
                <Grid container spacing={2}>
                    {firstPage!==0 ?
                        isLoadingFP ? (
                            <Grid item xs={12}>
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <CircularProgress thickness={5} size={50}/>
                                </div>
                            </Grid>
                        ) : (
                            <Grid item xs={12}>
                                <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                    <IconButton onClick={handleFirstPage} size="large">
                                        <Autorenew />
                                    </IconButton>
                                    <Typo variant="body2" style={{marginLeft:10}}>Load page {firstPage}</Typo>
                                </div>
                            </Grid>
                        )
                    : null}

                    {error !== false ? (
                        <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typo variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typo>
                            </div>
                        </Grid>
                    ) : data.length ? data.map((dt,i)=>(
                        <React.Fragment key={`news-${dt?.title}`}>
                            <Grid key={`news-${dt?.title}-1`} item xs={12} sm={6} md={4} lg={3}>
                                <Card style={{position:'relative'}} elevation={0}>
                                    <Link href='/news/[...slug]' as={dt?.link?.replace(process.env.DOMAIN,"")} passHref><a title={dt.title}>
                                        <CardActionArea style={{position:'relative'}}>
                                            <CardMedia>
                                                <Image webp src={`${dt.image}&export=banner&size=300`} alt={dt.title} style={{width:'100%',height:'auto'}}/>
                                            </CardMedia>
                                            <CardContent>
                                                <div style={{height:80.24}}>
                                                    <Tooltip title={dt.title}>
                                                        <Typography component='p' isTitle>{dt.title}</Typography>
                                                    </Tooltip>
                                                    <Typography variant="body2">{dt.source}</Typography>
                                                </div>
                                            </CardContent>
                                        </CardActionArea>
                                    </a></Link>
                                </Card>
                            </Grid>
                        </React.Fragment>
                    )) : null}

                    {isReachEnd && (
                        <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typo variant="body2">You've reach the bottom of pages</Typo>
                            </div>
                        </Grid>
                    )}
                    {isLoading && (
                        <Grid item xs={12}>
                            {data?.length > 0 ? (
                                <div style={{margin:'20px auto',textAlign:'center'}}>
                                    <CircularProgress thickness={5} size={50}/>
                                </div>
                            ) : <Skeleton type='grid' image number={8} />}
                        </Grid>
                    )}
                </Grid>
            </PaperBlock>
        </Header>
    );
}
export default NewsHome