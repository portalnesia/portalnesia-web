import React from 'react'
import Header from 'portal/components/Header'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import PaperBlock from 'portal/components/PaperBlock'
import {withStyles} from 'portal/components/styles';
import Skeleton from 'portal/components/Skeleton'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {wrapper} from 'portal/redux/store';
import useAPI,{ApiError} from 'portal/utils/api'
import {ucwords} from '@portalnesia/utils'
import db from 'portal/utils/db'
import {useHotKeys} from 'portal/utils/useKeys'
import Link from 'next/link'
import {Fab,Grid,Typography,CircularProgress} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home';
import dynamic from 'next/dynamic'

const Card=dynamic(()=>import('@mui/material/Card'),{ssr:false})
const CardActionArea=dynamic(()=>import('@mui/material/CardActionArea'),{ssr:false})
const CardContent=dynamic(()=>import('@mui/material/CardContent'),{ssr:false})

export const getServerSideProps = wrapper(async({req,res,params})=>{
    const slug=params.slug;
    const chord = await db.kata(`SELECT artist FROM klekle_chord WHERE slug_artist=? LIMIT 1`,[slug]);
    const artist = chord ? chord[0].artist : ucwords(slug.replace(/\-/," "));
    return {props:{artist:artist}}
})

const styles=theme=>({
    title:{
        marginBottom:'1rem !important',
        fontWeight:'500 !important',
        textOverflow:'ellipsis',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2
    },
    overfloww:{
        color:`${theme.palette.text.secondary} !important`,
        fontSize:'.7rem !important',
        display:'-webkit-box!important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:1,
        position:'absolute !important',
        bottom:0,
        right:0
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

const SlugArtist=({classes,artist,err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter();
    const {slug,page}=router.query;
    const [data,setData]=React.useState([])
    const [isLoading,setIsLoading]=React.useState(false);
    const [isReachEnd,setReacEnd]=React.useState(false);
    const [error,setError]=React.useState(false);
    const {get} = useAPI()
    const {keyboard,feedback}=useHotKeys()
    React.useEffect(()=>{
        if(!isReachEnd && !keyboard && !feedback) {
            setIsLoading(true);
            get(`/v1/chord/artist/${slug}?page=${page||1}`,{error_notif:false})
            .then(([res])=>{
                setReacEnd(!res?.can_load);
                if(typeof page === 'undefined') {
                    setData(res.data)
                } else {
                    const a=data;
                    const b=a.concat(res.data)
                    setData(b);
                }
            }).catch((err)=>{
                if(err instanceof ApiError) setError(err?.message)
                else setError(true);
            }).finally(()=>setIsLoading(false))
        }
    },[router.query.page])

    React.useEffect(()=>{
        const onScroll=()=>{
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight ;
            const docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if((scrollTop + docHeight) > (scrollHeight-100)) {
                if(!isLoading && !isReachEnd && !keyboard && !feedback) {
                    const {page:pg,...other}=router.query;
                    const pgg=Number(pg)+1||2;
                    router.push({
                        pathname:'/chord/artist/[slug]',
                        query:{
                            ...other,
                            page:pgg
                        }
                    },`/chord/artist/${slug}?page=${pgg}`,{shallow:true})
                }
            }
        }
        window.addEventListener('scroll',onScroll)
        return()=>{
            window.removeEventListener('scroll',onScroll)
        }
    })

    return(
        <Header iklan title={`Chord by ${artist}`} desc={`Find a variety of guitar chords from  ${artist}`} active='chord' subactive='chord_artist' canonical={`/chord/artist/${slug}`}>
            <Breadcrumbs routes={[{label:"Chord",href:"/chord",as:'/chord/[[...slug]]'},{label:"Artist",href:"/chord/artist"}]} title={artist} />
            <PaperBlock title={`Chord by ${artist}`} whiteBg>
                <Grid container spacing={2}>
                    {error !== false ? (
                        <Grid item xs={12}>
                                <div style={{textAlign:'center'}}>
                                    <Typography variant="h5">{typeof error === 'string' ? error : `Failed load data`}</Typography>
                                </div>
                        </Grid>
                    ) : !error && data.length > 0 ? data.map((chord,i)=>(
                        <React.Fragment key={`recent-${i.toString()}`}>
                            <Grid key={`recent-${i.toString()}-2`} item xs={12} sm={6}>
                                <Card style={{position:'relative'}} elevation={0} >
                                    <Link href='/chord/[[...slug]]' as={`/chord/${chord.slug}`} passHref><a><CardActionArea>
                                        <CardContent>
                                            <div style={{position:'relative',height:80.24}}>
                                                <Typography component='h6' className={classes.title}>{`${chord?.artist} - ${chord?.title}`}</Typography>
                                                <Typography variant="body2" className={classes.overfloww}>{chord.created?.format}</Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea></a></Link>
                                </Card>
                            </Grid>
                        </React.Fragment>
                    )) : !isLoading && data.length === 0 ? (
                        <Grid item xs={12}>
                            <div style={{textAlign:'center'}}>
                                <Typography variant="h5">Sorry, we didn't find the artist you are looking for.</Typography>
                            </div>
                        </Grid>
                    ) : null}

                    {isReachEnd && data.length && (
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
                            ) : <Skeleton type='grid' number={8} gridProps={{xs:12,sm:6}} />}
                        </Grid>
                    )}
                </Grid>
                <Link href='/chord/dashboard' passHref>
                    <Fab variant="extended" color='primary' href='/chord/dashboard' className={classes.fab}>
                        <HomeIcon className={classes.extendedIcon} />
                        Dashboard
                    </Fab>
                </Link>
            </PaperBlock>
        </Header>
    )
}

export default withStyles(SlugArtist,styles)