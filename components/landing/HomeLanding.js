import React from 'react'
import {makeStyles} from 'portal/components/styles';
import {specialHTML} from '@portalnesia/utils'
import useAPI,{getAxiosCache} from 'portal/utils/api'
import useSWR from 'portal/utils/swr';
import { Skeleton } from '@mui/material';
import {Grid,Typography,Paper as Paperr,Avatar} from '@mui/material'
import {styled} from '@mui/material/styles'
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SecurityIcon from '@mui/icons-material/Security';
import FilterIcon from '@mui/icons-material/Filter';
import LinkIcon from '@mui/icons-material/Link';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import EventIcon from '@mui/icons-material/Event';
import Link from 'next/link'
import Coookies from 'js-cookie'
import Header from 'portal/components/Header'
import Image from 'portal/components/Image'
import Button from 'portal/components/Button'
import CustomSkeleton from 'portal/components/Skeleton'
import PapperBlock from 'portal/components/PaperBlock'
import CountUp from 'react-countup'
import Carousel from 'portal/components/Carousel';

//const CountUp = dynamic(()=>import('react-countup'),{ssr:false})
//const Carousel=dynamic(()=>import('portal/components/Carousel'),{ssr:false})

const RootDiv = styled('div')(()=>({
  flexGrow: 1
}))

const Paper = styled(Paperr,{shouldForwardProp:prop=>prop!=="loading"})(({theme,loading})=>({
  flexGrow: 1,
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: 10,
  height: 190,
  marginBottom: 6,
  display: 'flex',
  cursor:'pointer',
  boxShadow:'unset!important',
  backgroundColor:`${theme.palette.background.paper} !important`,
  backgroundImage:'unset !important',
  [theme.breakpoints.up('sm')]: {
    height: 120,
    marginBottom: -1,
    alignItems: 'flex-end',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
  '& > *': {
    padding: '0 5px'
  },
  '&:hover':{
    backgroundColor:`${theme.palette.action.hover} !important`
  },
  ...(loading ? {
    display:'block !important'
  } : {})
}))

/*const CustomGrid = styled(Grid)(({theme})=>({
  flexGrow: 1,
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: 10,
  height: 190,
  marginBottom: 6,
  display: 'flex',
  cursor:'pointer',
  boxShadow:'unset!important',
  //backgroundColor:theme.palette.background.default,
  [theme.breakpoints.up('sm')]: {
    height: 120,
    marginBottom: -1,
    alignItems: 'flex-end',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
  '& > *': {
    padding: '0 5px'
  },
  /*'&:hover':{
    backgroundColor:theme.palette.action.hover
  }*/
/*}))*/

const stylesCounter = makeStyles()((theme)=>({
  counterIcon: {
    color: theme.palette.error.dark,
    opacity: 1,
    fontSize: `64px !important`
  },
  title: {
    color: theme.palette.text.primary,
    fontSize: '16px !important',
    fontWeight: '400 !important'
  },
  subtitle: {
    fontSize: '13px !important',
  },
  counter: {
    color: theme.palette.text.primary,
    fontSize: '28px !important',
    fontWeight: '500 !important',
  },
  customContent: {
    textAlign: 'right'
  },
}));

const Counter=({api,cuaca,loading,error})=>{
  const {classes} = stylesCounter();  
    return(
      <RootDiv>
          <Grid container spacing={2}>
            <Grid item md={3} xs={6}>
              <Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter}>{cuaca?.temp}</Typography> }
                  {loading ? <Skeleton width='100%' /> : <Typography className={classes.subtitle}>{cuaca?.text}</Typography>}
                  {loading ? <Skeleton width='100%' /> : <Typography className={classes.title} variant="h6">{cuaca?.title}</Typography>}
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    {loading ? <Skeleton><Avatar style={{width:64,height:64}} className={classes.counterIcon} /></Skeleton> : cuaca?.icon!==null ? (
                      <Image blured src={cuaca?.icon} className={classes.counterIcon} alt={cuaca?.text} />
                    ) : (
                      <WbSunnyIcon />
                    )}
                  </div>
                )}
                
              </Paper>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/chord/dashboard'><a><Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter} >{!error ? <CountUp delay={1} end={Number(api?.count?.chord)} duration={3} useEasing /> : "Error"}</Typography>}
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">{'Chord'}</Typography>}
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <LibraryMusicIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/setting/[[...slug]]' as='/setting/security'><a><Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter} >{!error ? <CountUp delay={1} end={Number(api?.count?.session)} duration={3} useEasing /> : "Error"}</Typography>}
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">{'Session'}</Typography>}
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <SecurityIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/twibbon/dashboard'><a><Paper loading={loading}>
                <div>
                  { loading ? <Skeleton width='80%' /> : <Typography className={classes.counter}>{!error ? <CountUp delay={1} end={Number(api?.count?.twibbon)} duration={3} useEasing /> : "Error"}</Typography> }
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">Twibbon</Typography>}
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <FilterIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/url'><a><Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter} >{!error ? <CountUp delay={1} end={Number(api?.count?.url)} duration={3} useEasing /> : "Error"}</Typography>}
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">{'URL'}</Typography>}
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <LinkIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/quiz'><a><Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter} >{!error ? <CountUp delay={1} end={Number(api?.count?.quiz)} duration={3} useEasing /> : "Error"}</Typography>}
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">{'Quiz'}</Typography> }
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <ListAltIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
            <Grid item md={3} xs={6}>
              <Link href='/blog/dashboard'><a><Paper loading={loading}>
                <div>
                  {loading ? <Skeleton width='80%' /> : <Typography className={classes.counter} >{!error ? <CountUp delay={1} end={Number(api?.count?.blog)} duration={3} useEasing /> : "Error"}</Typography>}
                  {loading ? <Skeleton /> : <Typography className={classes.title} variant="h6">{'Blog'}</Typography> }
                </div>
                {!loading && (
                  <div className={classes.customContent}>
                    <LibraryBooksIcon className={classes.counterIcon} />
                  </div>
                )}
              </Paper></a></Link>
            </Grid>
          </Grid>
      </RootDiv>
    )
}
const CounterStyle = Counter;

const styles = makeStyles()((theme) => ({
  root: {
    flexGrow: 1,
  },
  divider: {
    margin: `${theme.spacing(2)} 0`,
    background: 'none'
  },
  sliderWrap: {
    position: 'relative',
    display: 'block',
    boxShadow: theme.shadows[1],
    width: '100%',
    borderRadius: 4
  },
  dividerMini: {
    margin: `${theme.spacing(1.5)} 0`,
    background: 'none'
  },
  noPadding: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    [theme.breakpoints.up('sm')]: {
      padding: '0 !important'
    }
  }
}));

const Element=({api,cuaca,loading,error})=>{
  return(
    <>
      <CounterStyle cuaca={cuaca} loading={loading} error={error} api={api} />
      <Grid container style={{marginTop:'1rem'}}>
        <Grid item xs={12}>
          {api ? <Carousel data={api?.news} linkParams="/news/[...slug]" asParams="link" title='Recent News' paperBlock={{action:<Link href='/news' passHref><Button component='a'>Show More</Button></Link>}} /> : <CustomSkeleton type='carousel' number={5} image /> }
        </Grid>
      </Grid>
      <Grid container style={{marginTop:'1rem'}}>
        <Grid item xs={12}>
          {api ? <Carousel data={api?.chord} linkParams="/chord/[[...slug]]" asParams="link" title='Recent Chord' paperBlock={{action:<Link href='/chord/[[...slug]]' as='/chord' passHref><Button component='a'>Show More</Button></Link>}}/> : <CustomSkeleton type='carousel' number={5} /> }
        </Grid>
      </Grid>
      <Grid container style={{marginTop:'1rem'}}>
        <Grid item xs={12}>
          {api ? <Carousel data={api?.thread} linkParams="/twitter/thread/[[...slug]]" asParams="link" title='Recent Thread' paperBlock={{action:<Link href='/twitter/thread/[[...slug]]' as='/twitter/thread' passHref><Button component='a'>Show More</Button></Link>}}/> : <CustomSkeleton type='carousel' number={5} /> }
        </Grid>
      </Grid>
    </>
  )
}

const ElementStyle = Element;

const Home=()=>{
    const {post}=useAPI(true)
    const {data: baseData,error} = useSWR(`/v1/internal/home`);
    const [cuaca,setCuaca]=React.useState(null);

    const data = React.useMemo(()=>{
      if(!baseData) return undefined;
      const chord = baseData?.chord?.map(c=>{
        c.title = `${c?.artist} - ${c?.title}`
        return c;
      })
      const thread = baseData?.thread?.map(t=>{
        t.text = specialHTML(t?.title?.replace(`Threads by @${t?.screen_name}: `,""));
        t.title = `Threads by @${t?.screen_name}`;
        return t
      })
      return {
        ...baseData,
        chord,
        thread
      }
    },[baseData])

    React.useEffect(()=>{
        const getWeather=(dt)=>{
          return new Promise((result)=>{
            setTimeout(()=>{
              post(`/v1/internal/weather`,dt,{},{error_notif:false,success_notif:false,feedback:false}).then(([res])=>{
                result(res)
              }).catch(()=>{
                setCuaca({temp:'0°C',title:'Error',text:"Error while getting weather",icon:null})
              })
            },1000)
            
          })
        }
  
        const cookie=Coookies.get('__kllo__')
        if(typeof cookie === 'undefined') {
          if(navigator.geolocation){
              navigator.permissions.query({name:'geolocation'}).then((result)=>{
                if(result.state!='denied') {
                    navigator.geolocation.getCurrentPosition((pos)=>{
                      getWeather({latitude:pos.coords.latitude,longitude:pos.coords.longitude}).then((loc)=>{
                        setCuaca({temp:loc.temperature,title:loc.title,text:loc.text,icon:loc.icon})
                        if(typeof loc.loc !== 'undefined') {
                          const datetanggal = new Date();
                          datetanggal.setTime(datetanggal.getTime() + (60 * 60 * 1000));
                          Coookies.set('__kllo__',loc?.loc,{expires:datetanggal,domain:'.portalnesia.com'})
                        }
                      })
                    },(err)=>{
                      console.log(err)
                      setCuaca({temp:'0°C',title:'Error',text:"Error while getting location",icon:null})
                    },{
                      enableHighAccuracy: true,
                      timeout: 5000,
                      maximumAge: 0
                    });
                } else {
                    setCuaca({temp:'0°C',title:'Error',text:"Permission denied",icon:null})
                }
              });
          }
      } else {
          getWeather({latlng:cookie}).then((loc)=>{
              setCuaca({temp:loc.temperature,title:loc.title,text:loc.text,icon:loc.icon})
          })
      }
    },[])

    return(
      <Header notBack iklan active='home' canonical=''>
        {typeof error !== 'undefined' ? (
          <PapperBlock title="Home">
            <h3>Failed load data</h3>
          </PapperBlock>
        ) : (
          <ElementStyle api={data} cuaca={cuaca} loading={((!data&&!error)||cuaca===null)} error={error} />
        )}
      </Header>
    )
}

export default Home