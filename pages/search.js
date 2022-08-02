import React from 'react'
import ErrorPage from 'portal/pages/_error'
import {Header,Image,PaperBlock,Skeleton,Avatar} from 'portal/components'
import {useRouter} from 'next/router'
import Link from 'next/link'
import Button from 'portal/components/Button'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store'
import {useAPI,useHotKeys,ApiError} from 'portal/utils'
import {ucwords} from '@portalnesia/utils'
import {Grid,Typography,Tooltip,CircularProgress,Card,CardContent,CardActionArea,IconButton} from '@mui/material'
import {Autorenew} from '@mui/icons-material';

export const getServerSideProps = wrapper()

const styles=theme=>({
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
})

const Search=({classes,err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter();
    const {page,q,filter}=router.query;
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
        if(typeof q === 'undefined' && typeof page==='undefined' && !keyboard && !feedback) {
            setData([])
            setIsLoading(false);
        }
        else if(q && q.length && typeof filter==='undefined' && typeof page==='undefined' && !keyboard && !feedback) {
            setData([{type:"loading",data:[]}])
            setIsLoading(true);
            setReachEnd(false);
            get(`/v1/search?q=${q}`)
            .then(([res])=>{
                setData(res.data);
                setReachEnd(false);
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
                setTimeout(()=>setIsLoading(false),500)
            })
        }
        else if(q && filter && typeof page==='undefined' && !keyboard && !feedback) {
            setData([{type:"loading",data:[]}])
            setIsLoading(true);
            setReachEnd(false);
            get(`/v1/search/${filter}?q=${q}&page=1`)
            .then(([res])=>{
                setData([res.data]);
                setReachEnd(!res.can_load);
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
                setTimeout(()=>setIsLoading(false),500)
            })
        } else {
            if(q && filter && page && !isReachEnd && !keyboard && !feedback) {
                setIsLoading(true);
                get(`/v1/search/${filter}?q=${q}&page=${page||1}`)
                .then(([res])=>{
                    const a= data.length > 0 ? data?.[0]?.data : [];
                    const b=a.concat(res.data?.data)
                    setData([{type:filter,data:b}])
                    setReachEnd(!res.can_load);
                }).catch((err)=>{
                    if(err instanceof ApiError) setError(err?.message)
                    else setError(true);
                    setTimeout(()=>setIsLoading(false),500)
                })
            } else {
                console.log("Error")
                setTimeout(()=>setIsLoading(false),500)
                setError(true);
            }
        }
    }

    React.useEffect(()=>{
        setError(false)
        setIsLoading(true);
        getData()
    },[router.query])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            //console.log(scrl);
            if((scrollTop + docHeight) > (scrollHeight-250)) {
                if(!isLoading && !isReachEnd && typeof filter !== 'undefined' && !keyboard && !feedback) {
                    setIsLoading(true);
                    const {...other}=router.query;
                    const pgg=Number(page||1)+1;
                    router.replace({
                        pathname:'/search',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/search?q=${q}&filter=${filter}${pgg ? '&page='+pgg : ''}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    },[q,isLoading,isReachEnd,filter,keyboard,feedback,router.query])

    const handleFirstPage=()=>{
        if(!isLoadingFP && firstPage>1 && typeof filter !== 'undefined') {
            setIsLoadingFP(true);
            get(`/v1/search/${filter}?q=${q}&page=${firstPage - 1}`)
            .then(([res])=>{
                setFirstPage(firstPage - 1)
                const c = res?.data?.data
                const a = data.length ? data?.[0]?.data : [];
                const b = c.concat(a)
                setData([{type:filter,data:b}])
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
                    if(type == 'users') {
                        edit.title = `${d?.username}`
                        d.link = `/user/${d?.username}`;
                        if(d?.image === null) {
                            d.imageTitle = d?.name;
                        } else {
                            d.image = `${d?.picture}&watermark=no`
                        }
                    }
                    else if(type == 'chord') {
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
            console.log(udata)
            setFormatData(udata);
            setTimeout(()=>setIsLoading(false),1000)
        } else {
            setFormatData(unformatdata);
        }
    },[unformatdata])

    return (
        <Header navTitle="Search" iklan canonical='/search' title={q ? decodeURIComponent(q.replace("/\+/g"," ")) : "Search"} desc="Portalnesia Search">
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
                        action={router.query.filter || isLoading || type.data.length===0 ? null : <Link href={{pathname:'/search',query:{...router.query,filter:type.type}}} as={`/search?q=${q}&filter=${type.type}`} shallow><a><Button outlined>View More</Button></a></Link>}
                        >
                            <Grid container spacing={2}>
                                {firstPage>1 && typeof filter !== 'undefined' ?
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
                                    <React.Fragment key={`child-${type.type}-${ii.toString()}`}>
                                        {['chord','thread','quiz'].indexOf(type.type) !== -1 ? (
                                            <Grid key={`child-${type.type}-${ii.toString()}-2`} item xs={12} sm={6} md={4}>
                                                <Card style={{position:'relative'}} elevation={0}>
                                                    <Link href={dt.link} passHref><a title={dt.title}>
                                                        <CardActionArea style={{position:'relative'}}>
                                                            <CardContent>
                                                                <div style={{height:48}}>
                                                                    <Typography component='p' className={classes.title}>{dt.title}</Typography>
                                                                </div>
                                                            </CardContent>
                                                        </CardActionArea>
                                                    </a></Link>
                                                </Card>
                                            </Grid>
                                        ) : (
                                            <Grid key={`child-${type.type}-${ii.toString()}-2`} item xs={12} sm={6} md={4} lg={3}>
                                                <Card style={{position:'relative'}} elevation={0}>
                                                    <Link href={dt.link} passHref><a title={dt.title}>
                                                        <CardActionArea style={{position:'relative'}}>
                                                            <Avatar variant='square' alt={dt?.title} sx={{width:200,height:200,ml:'auto',mr:'auto',mt:'15px'}}>
                                                                {dt?.image !== null ? <Image width={200} height={200} webp src={dt.image !== null ? `${dt.image}&size=200` : `${process.env.CONTENT_URL}/img/content?image=images/avatar.png&size=200&watermark=no`} alt={dt.title} style={{width:200,height:200,marginLeft:'auto',marginRight:'auto'}}/>
                                                                : dt?.imageTitle}
                                                            </Avatar>
                                                            <CardContent>
                                                                <div style={{height:48}}>
                                                                    <Typography component='p' className={classes.title}>{dt.title}</Typography>
                                                                </div>
                                                            </CardContent>
                                                        </CardActionArea>
                                                    </a></Link>
                                                </Card>
                                            </Grid>
                                        )}
                                    </React.Fragment>
                                )) : !isLoading && unformatdata?.[0]?.type !== 'loading' && type.data.length===0 ? (
                                    <Grid item xs={12}>
                                        <div style={{margin:'20px auto',textAlign:'center'}}>
                                            <Typography variant="h5">No data</Typography>
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
                                        { data[0]?.data?.length > 0 ? (
                                            <div style={{margin:'20px auto',textAlign:'center'}}>
                                                <CircularProgress thickness={5} size={50}/>
                                            </div>
                                        ) : <Skeleton type='grid' number={8} image/>}
                                    </Grid>
                                )}
                            </Grid>
                        </PaperBlock>
                    )) : !isLoading ? (
                        <PaperBlock key={`not-found`} title="Search" whiteBg>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <div style={{margin:'20px auto',textAlign:'center'}}>
                                        <Typography variant="h5">No data</Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </PaperBlock>
                    ) : null}
                </Grid>
            </Grid>
        </Header>
    );
}
export default withStyles(Search,styles)