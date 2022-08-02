import React from 'react'
import Header from 'portal/components/Header'
import {useRouter} from 'next/router'
import Link from 'next/link'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {withStyles} from 'portal/components/styles';
import {ucwords} from '@portalnesia/utils'
import {wrapper} from 'portal/redux/store'
import useAPI,{ApiError} from 'portal/utils/api'
import {useHotKeys} from 'portal/utils/useKeys'
import {Fab,Grid,Typography,CircularProgress,IconButton} from '@mui/material'
import {Home as HomeIcon,Autorenew} from '@mui/icons-material';
import dynamic from 'next/dynamic'

const Card=dynamic(()=>import('@mui/material/Card'));
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'));
const CardContent=dynamic(()=>import('@mui/material/CardContent'));
const CardMedia=dynamic(()=>import('@mui/material/CardMedia'));

const Image=dynamic(()=>import('portal/components/Image'),{ssr:false})

export const getServerSideProps = wrapper(()=>({props:{}}))

const styles=theme=>({
    overfloww:{
        color:`${theme.palette.text.secondary} !important`,
        fontSize:'.7rem !important',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:1,
    },
    divOverflow:{
        position:'absolute !important',
        bottom:0,
        left:0
    },
    title:{
        marginBottom:'1rem !important',
        fontWeight:'500 !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2
    },
    extendedIcon: {
        marginRight: `${theme.spacing(1)} !important`,
    },
    fab:{
        position: 'fixed !important',
        bottom: `${theme.spacing(2)} !important`,
        right: `${theme.spacing(2)} !important`,
    }
})

const BlogCategory=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {slug,page}=router.query;
    const title=ucwords(slug?.replace(/\-/g," "));
    const [firstPage,setFirstPage]=React.useState(page||1);
    const [isLoadingFP,setIsLoadingFP]=React.useState(false);
    const [data,setData]=React.useState([]);
    const [isLoading,setIsLoading]=React.useState(false);
    const [isReachEnd,setReachEnd]=React.useState(false);
    const [error,setError]=React.useState(false);
    const {get} = useAPI()
    const {keyboard,feedback}=useHotKeys()

    const getData=(pg,aaa)=>{
        setError(false)
        if(!isReachEnd && !keyboard && !feedback) {
            setIsLoading(true);
            get(`/v1/blog/category/${slug}?page=${pg}`,{error_notif:false})
            .then(([res])=>{
                setReachEnd(!res?.can_load);
                if(aaa) {
                    setData(res?.data)
                } else {
                    const a=data;
                    const b=a.concat(res?.data)
                    setData(b);
                }
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            }).finally(()=>setTimeout(()=>setIsLoading(false),1000))
        }
    }
    React.useEffect(()=>{
        if(typeof page !== 'undefined' && !keyboard && !feedback) getData(page)
        else if(typeof page === 'undefined' && !keyboard && !feedback) getData(1,true)
    },[router.query])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-150)) {
                if(!isLoading && !isReachEnd && !keyboard && !feedback) {
                    setIsLoading(true)
                    const {page:pg}=router.query;
                    const pgg=Number(pg||1)+1;
                    router.replace({
                        pathname:'/blog/category/[slug]',
                        query:{
                            slug:slug,
                            page:pgg
                        }
                    },`/blog/category/${slug}/${pgg ? '?page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage>1) {
            setIsLoadingFP(true);
            get(`${process.env.API}/blog/category/${slug}?page=${firstPage - 1}`,{error_notif:false})
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
        <Header iklan title={`${title} Category - Blog`} desc={`Post with ${title} category`} keyword="blog,platform,writer" active='blog' subactive='blog_category' canonical={`/blog/category/${slug}`}>
            <Breadcrumbs routes={[{label:"Blog",href:"/blog"}]} title={`${title} Category`} />
            <PaperBlock title={`${title} Category`} whiteBg>
                <Grid container spacing={2}>
                    {firstPage > 1 ?
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
                                    <Typography variant="body2" style={{marginLeft:10}}>Load page {firstPage - 1}</Typography>
                                </div>
                            </Grid>
                        )
                    : null}

                    {error !== false ? (
                        <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typography>
                            </div>
                        </Grid>
                    ) : data.length > 0 ? data.map((dt,i)=>(
                        <React.Fragment key={`blog-${dt.slug}`}>
                            <Grid key={`blog-${dt.slug}-1`} item xs={12} sm={6} md={4} lg={3}>
                                <Card style={{position:'relative'}} elevation={0}>
                                    <Link href='/blog/[slug]' as={`/blog/${dt.slug}`} passHref><a title={dt.title}>
                                        <CardActionArea style={{position:'relative'}}>
                                            <CardMedia>
                                                <Image webp src={`${dt.image}&export=banner&size=300`} alt={dt.title} style={{width:'100%',height:'auto'}}/>
                                            </CardMedia>
                                            <CardContent>
                                                <div style={{height:96.48,position:'relative'}}>
                                                    <Typography component='p' className={classes.title}>{dt.title}</Typography>
                                                    <div className={classes.divOverflow}>
                                                        <Typography variant="body2" className={classes.overfloww}>By {dt?.user?.name}</Typography>
                                                        <Typography variant="body2" className={classes.overfloww}>{dt.created?.format}</Typography>
                                                    </div>
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
                                <Typography variant="body2">You've reach the bottom of pages</Typography>
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
                <Link href='/blog/dashboard' passHref>
                    <Fab variant="extended" color='primary' href='/blog/dashboard' className={classes.fab}>
                        <HomeIcon className={classes.extendedIcon} />
                        Dashboard
                    </Fab>
                </Link>
            </PaperBlock>
        </Header>
    );
}
export default withStyles(BlogCategory,styles)