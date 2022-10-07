import React from "react";
import PaperBlock from './PaperBlock'
import Slider from "react-multi-carousel";
import AnotherSlider from 'react-animated-slider'
import Link from 'next/link'
import Image from './Image'
import {isMobile, isMobileOnly,isTablet} from 'react-device-detect'
import clx from 'classnames'
import {Tooltip as Toltip} from '@mui/material'
import {styled,alpha} from '@mui/material/styles'
import {withStyles} from 'portal/components/styles';
import 'react-multi-carousel/lib/styles.css'
import 'react-animated-slider/build/horizontal.css'

const Tooltip = styled(Toltip)(()=>({
  '&.MuiTooltip-tooltip':{
      fontsize:15
  }
}))

const P = styled('p')(()=>({
  marginTop:10,
  marginBottom:'1rem',
  lineHeight:'1.4 !important',
  fontSize:'1rem',
  fontWeight:500,
  textOverflow:'ellipsis',
  display:'-webkit-box!important',
  WebkitBoxOrient:'vertical',
  overflow:'hidden',
  WebkitLineClamp:2
}))

const PText = styled('p')(()=>({
  fontSize:'.9rem',
  lineHeight:'1.4 !important',
  textOverflow:'ellipsis',
  display:'-webkit-box!important',
  WebkitBoxOrient:'vertical',
  overflow:'hidden',
  WebkitLineClamp:3,
  marginBottom:'1rem',
}))

const Span = styled('span')(()=>({
  fontSize:'.7rem'
}))

const Images = styled(Image)(()=>({
  width:'100%',
  margin:'auto'
}))

const Div = styled('div',{shouldForwardProp:prop=>!['text','created'].includes(prop)})(({text,created})=>({
  ...(text && created ? {
    height:(70.8 + 76.48 + 11.2)
  } : text ? {
    height:(70.8 + 76.48)
  } : created ? {
    height:(70.8 + 11.2)
  } : {
    height:70.8
  }),
  '& .ptext':{
    position:'absolute !important',
    top:'70.8px !important',
    left:'12.8px !important'
  },
  '& section':{
    position:'absolute !important',
    bottom:'12.8px !important',
    right:'12.8px !important'
  }
}))

const SliderContent = styled('div',{shouldForwardProp:prop=>prop!=="image"})(({theme,image})=>({
  paddingBottom:'.8rem',
  position:'relative',
  borderRadius:'.25rem',
  //height:'calc(100% - 1.3rem)',
  cursor:'pointer',
  background:theme.palette.background.paper,
  '&:hover':{
    backgroundColor:theme.palette.action.hover
  },
  ...(image ? {} : {paddingTop:'.8rem'}),
  '& div.slider-content': {
    paddingLeft:'.8rem',
    paddingRight:'.8rem',
  }
}))

const stylesCarousel=(theme)=>({
  slider:{
    position:'unset !important',
    '@media (hover: hover) and (pointer: fine)':{
      '&::-webkit-scrollbar':{
          height:10,
          borderRadius:4
      },
      '&::-webkit-scrollbar-thumb':{
          background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
          borderRadius:4
      },
    }
  },
  sliderOverFlow:{
    overflowX:'auto !important',
  },
})

const Carousel=({classes,data,title,single,linkParams,asParams,paperBlock,autoPlay,autoPlaySpeed,transitionDuration,arrows,infinite,type,...other})=>{
    //const [isOverflow,setOverflow]=React.useState(false)
    if(single) {
        return(
          <div>
            <AnotherSlider classNames={{previousButton:`previousButton`,nextButton:`nextButton`}} autoplay={4000} duration={1500}>
              {data.map((item,index)=>(
                <SliderContent
                  key={`carousel-${index.toString()}`}
                  {...(item.image ? {style:{color:'white',background:`linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)), url('${item.image}')`,backgroundSize:'cover',backgroundRepeat:'no-repeat',backgroundPosition:'center center'} } : {})}
                >
                  <div>
                    <Typography variant="h4" component="h4" gutterBottom>{item.title}</Typography>
                    <Link href={item.link} {...(item?.as ? {as:item?.as?.replace(process.env.DOMAIN,"")} :{})}><a><Button variant="contained" color="primary">
                      Read More
                    </Button></a></Link>
                  </div>
                </SliderContent>
              ))}
            </AnotherSlider>
          </div>
        )
    } else {
      const autoP=autoPlay||isMobile
        return (
          <div>
            <PaperBlock title={title} whiteBg {...paperBlock}>
              <div>
                <Slider 
                  autoPlay={autoP}
                  autoPlaySpeed={autoP ? (autoPlaySpeed||4000):undefined}
                  transitionDuration={autoP ? (transitionDuration||1500) : undefined}
                  arrows={arrows||autoP}
                  infinite={autoP||infinite}
                  swipeable
                  draggable
                  showDots={false}
                  keyBoardControl
                  centerMode={false}
                  containerClass={clx(classes.slider,!autoP && classes.sliderOverFlow)}
                  deviceType={isTablet ? 'tablet' : isMobileOnly ? 'mobile' : 'desktop'}
                  ssr
                {...other}
                >
                  {data.map((item,index)=>(
                    <div key={`carousel-${index.toString()}`} style={{margin:'0 1em'}}>
                      <Link href={linkParams} as={item?.[asParams]?.replace(process.env.DOMAIN,"")} passHref><a title={item.title.replace(/&amp;/g, "\&")}>
                        <SliderContent image={typeof item?.image !== 'undefined'}>
                          {item.image && (
                            <center><Images alt="Card image" src={`${item.image}&export=banner&size=300`} webp /></center>
                          )}
                          <Div className="slider-content" text={typeof item?.text === 'string'} created={typeof item?.created?.format === 'string'}>
                            <Tooltip title={item.title.replace(/&amp;/g, "\&")} classes={{tooltip:classes.tooltip}}>
                              <P>{item.title.replace(/&amp;/g, "\&")}</P>
                            </Tooltip>
                            {item?.text && <PText className="ptext">{item.text.replace(/&amp;/g, "\&")}</PText>}
                            {item?.created?.format && (
                              <section>
                                <Span>{item?.created?.format}</Span>
                              </section>
                            )}
                          </Div>
                        </SliderContent></a>
                      </Link>
                    </div>
                  ))}
                </Slider>
              </div>
            </PaperBlock>
          </div>
        );
    }
}

Carousel.defaultProps={
    responsive:{
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
            partialVisibilityGutter: 10
        },
        desktop: {
            breakpoint: { max: 3000, min: 1344 },
            items: 4,
            partialVisibilityGutter: 10
        },
        tabletLarge:{
            breakpoint: { max: 1344, min: 784 },
            items: 3,
            partialVisibilityGutter: 10
        },
        tablet: {
            breakpoint: { max: 784, min: 534 },
            items: 2,
            partialVisibilityGutter: 10
        },
        mobile: {
            breakpoint: { max: 534, min: 0 },
            items: 1,
            partialVisibilityGutter: 10
        }
    },
    paperBlock:{},
    single:false,
    linkParams:'/',
    asParams:'link',
    partialVisible:false,
    infinite:false,
    autoPlaySpeed:undefined,
    transitionDuration:undefined,
}

export default withStyles(Carousel,stylesCarousel);