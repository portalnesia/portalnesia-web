import React from 'react'
import { Skeleton } from '@mui/material';
import Slider from "react-multi-carousel";
import {withStyles} from 'portal/components/styles';
import {Avatar,Table,TableRow,TableCell,TableBody,List,ListItemSecondaryAction,ListItem,ListItemText,ListItemAvatar,Grid,Typography,Card,CardContent} from '@mui/material'
import 'react-multi-carousel/lib/styles.css'

const styles=theme=>({
    slider:{
        position:'unset',
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
    sliderContent:{
        padding:'.5rem',
        position:'relative',
        borderRadius:'.625rem',
        height:'calc(100% - 1rem)',
        cursor:'pointer',
        background:theme.palette.background.paper,
        '&:hover':{
          backgroundColor:theme.palette.action.hover
        },
        '& section':{
          position:'absolute',
          bottom:'.45rem',
          right:'.75rem'
        }
    },
    secondaryAction:{
        paddingRight:96
    }
})

const Carousel=withStyles(({classes,number,image,carouselProps})=>{
    const arr=[];
    for(let i=0;i<number;i++) {
        arr.push(
            <div key={`carouselskeleton-${i}`} style={{margin:'0 1em'}}>
                <div className={classes.sliderContent}>
                    {image ? (
                        <>
                            <center><Skeleton><Avatar variant="square" style={{width:'90%',height:'auto',margin:'0'}} /></Skeleton></center>
                            <Typography><Skeleton /></Typography>
                        </>
                    ) : (
                        <>
                            <Typography style={{marginRight:'10%'}}><Skeleton /></Typography>
                            <Typography><Skeleton /></Typography>
                        </>
                    )}
                </div>
            </div>
        )
    }
    return (
        <Slider 
            autoPlay={false}
            arrows={false}
            infinite={false}
            swipeable={false}
            draggable={false}
            showDots={false}
            keyBoardControl={false}
            centerMode={false}
            containerClass={`${classes.slider} react-multi-carousel-list`}
            {...carouselProps}
            >
                {arr}
        </Slider>
    )
},styles)

const Tablee=({number,tableProps})=>{
    const arr=[];
    const column=Array.from(Array(tableProps.column).keys())
    for(let i=0;i<number;i++) {
        arr.push(
            <TableRow>
                {column.map(()=>(
                    <TableCell><Typography><Skeleton /></Typography></TableCell>
                ))}
            </TableRow>
        )
    }
    if(tableProps?.bodyOnly) {
        return (
            <React.Fragment>
                {arr}
            </React.Fragment>
        )
    } else {
        return (
            <Table>
                <TableBody>
                    {arr}
                </TableBody>
            </Table>
        )
    }
    
}

const Listt=withStyles(({image,number,classes})=>{
    const arr=[];
    for(let i=0;i<number;i++) {
        arr.push(
            <ListItem divider classes={{secondaryAction:classes.secondaryAction}}>
                {image && (
                    <ListItemAvatar>
                        <Skeleton variant="circular"><Avatar /></Skeleton>
                    </ListItemAvatar>
                )}
                <ListItemText
                    primary={<Skeleton />}
                    secondary={<Skeleton width='60%' />}
                />
                <ListItemSecondaryAction>
                    <Skeleton variant="circular"><Avatar /></Skeleton>
                </ListItemSecondaryAction>
            </ListItem>
        )
    }
    return (
        <List>
            {arr}
        </List> 
    )
},styles)

const Gridd=({image,number,gridProps})=>{
    const arr=[];
    for(let i=0;i<number;i++) {
        arr.push(
            <Grid key={`blogskeleton-${i}`} item xs={gridProps.xs} sm={gridProps.sm} md={gridProps.md} lg={gridProps.lg}>
                <Card style={{position:'relative',...(image ? {height:300} : {})}} elevation={0}>
                    {image ? (
                        <div style={{position:'relative',height:300}}>
                            <center><Skeleton variant="rectangular" width={200} height={200} style={{marginLeft:'auto',marginRight:'auto',marginTop:'.5rem'}}></Skeleton></center>
                            <CardContent>
                                <Typography component='h6'><Skeleton /></Typography>
                                <Typography component='h6'><Skeleton width='60%' /></Typography>
                            </CardContent>
                        </div>
                    ) : (
                        <CardContent>
                            <Typography style={{marginRight:'25%'}}><Skeleton /></Typography>
                            <Typography><Skeleton /></Typography>
                        </CardContent>
                    )}
                </Card>
            </Grid>
        )
    }
    return (
        <Grid container spacing={2} justifyContent="center">
            {arr}
        </Grid>
    )
}

const Skletonn=({type,number,animation,image,gridProps,carouselProps,tableProps,...other})=>{
    if(type==='paragraph') {
        const arr=[];
        for(let i=0;i<number;i++) {
            arr.push(
                <div key={`skeleton-${i}`}>
                    <Typography style={{marginLeft:'7rem'}}><Skeleton /></Typography>
                    <Typography><Skeleton /></Typography>
                    <Typography><Skeleton /></Typography>
                    <Typography><Skeleton /></Typography>
                    <Typography style={{marginBottom:'30px'}}><Skeleton /></Typography>
                </div>
            )
        }
        return (
            <div>
                {arr}
            </div>
        )
    }
    else if(type==='carousel') {
        return <Carousel number={number} image={image} carouselProps={carouselProps} />
    }
    else if(type==='table') {
        return <Tablee number={number} tableProps={tableProps} />
    }
    else if(type==='list') {
        return <Listt number={number} image={image} />
    }
    else if(type==='grid') {
        return <Gridd number={number} image={image} gridProps={gridProps} />
    }
    else if(type==='ads') {
        return <center><Skeleton variant="rectangular" height={250} width={250} /></center>;
    }
    else return <Skeleton animation={animation} {...other} />
}

Skletonn.defaultProps={
    type:'paragraph',
    number:2,
    animation:'wave',
    gridProps:{
        xs:12,sm:6,md:4,lg:3
    },
    tableProps:{
        column:3,
    },
    carouselProps:{
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
    }
}

export default Skletonn