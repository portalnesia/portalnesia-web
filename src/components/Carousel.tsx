import { forwardRef, useMemo } from 'react'
import Slider,{CarouselProps as NativeProps} from 'react-multi-carousel'
import {isMobile, isMobileOnly,isTablet} from 'react-device-detect'

import 'react-multi-carousel/lib/styles.css'
import Box from '@mui/material/Box';
import { CopyPartial } from '@type/general';

export type CarouselProps = CopyPartial<NativeProps,'responsive'>
const responsiveDefault = {
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
}
const Carousel = forwardRef<Slider,CarouselProps>(({autoPlay,transitionDuration,arrows,infinite,children,responsive=responsiveDefault,...props},ref)=>{
    const autoplay = useMemo(()=>{
        return autoPlay||isMobile;
    },[autoPlay])

    return (
        <Box sx={{
            '.slider':{
                ...(!autoplay ? {overflow:'unset'} : {})
            },
            pb:0.5
        }}>
            <Slider
                autoPlay={autoplay}
                autoPlaySpeed={autoplay ? (transitionDuration||1500) : undefined}
                arrows={arrows||autoplay}
                infinite={autoplay||infinite}
                swipeable
                draggable
                showDots={false}
                keyBoardControl
                centerMode={false}
                containerClass={`slider${!autoplay ? ' slideroverflow' : ''}`}
                deviceType={isTablet ? 'tablet' : isMobileOnly ? 'mobile' : 'desktop'}
                responsive={responsive}
                {...props}
                ref={ref}
            >
                {children}
            </Slider>
        </Box>
    )
});
Carousel.displayName="Carousel";
Carousel.defaultProps = {
    infinite:false,
    autoPlaySpeed:undefined,
    transitionDuration:undefined,
    partialVisible:false,
}

export default Carousel;