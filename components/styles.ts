import {useTheme,Theme} from '@mui/material/styles'
import {createMakeAndWithStyles} from 'tss-react'


export const {makeStyles,withStyles,useStyles} = createMakeAndWithStyles({useTheme});

export const blogStyles = (theme: Theme)=>({
    title:{
        margin:'0 !important',
        marginBottom:'0! important',
        textOverflow:'ellipsis',
        display:'-webkit-box !important',
        overflow:'hidden',
        WebkitBoxOrient:'vertical',
        WebkitLineClamp:2,
    },
    divider:{
        paddingTop:'.5rem !important',
        borderTop:`1px solid ${theme.palette.divider} !important`,
        '& > div':{
            [theme.breakpoints.down('md')]: {
                paddingLeft:`${theme.spacing(2)} !important`,
                paddingRight:`${theme.spacing(2)} !important`
            },
                [theme.breakpoints.up('sm')]: {
                paddingLeft:`${theme.spacing(3)} !important`,
                paddingRight:`${theme.spacing(3)} !important`
            },
        },
        '&.pbottom':{
            paddingBottom:'.5rem !important',
        }
    },
    contentTools:{
        position:'fixed',
        top:200,
        zIndex:101,
        transition: theme.transitions.create(['right','opacity'],{
            easing:theme.transitions.easing.easeIn,
            duration:500
        }),
        maxWidth:'80%'
    },
    contspan:{
        '& span':{
            '&:hover':{
                textDecoration:'underline'
            },
        },
        '&.active':{
            color:`${theme.custom.link} !important`,
        }
    },
    contentBtn:{
        cursor:'pointer',
        fontSize:15,
        padding:'7px 20px',
        backgroundColor:theme.palette.primary.main,
        color:'#ffffff',
        display:'inline-block',
        position:'absolute',
        top:65,
        left:-100,
        transform:'rotate(-90deg)',
        borderRadius:'10px 10px 0 0',
    },
    contentCont:{
        backgroundColor:theme.palette.background.default,
        borderBottomLeftRadius:10,
        position:'relative'
    },
    contentContt:{
        maxHeight:'calc(100vh - 220px)',
        overflowY:'auto',
        WebkitBoxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
        boxShadow:'50px 4px 40px -7px rgba(0,0,0,0.2)',
        padding:20,
        wordBreak:'break-word',
        minHeight:167
    }
})

export const blogResponsive = {
    tabletLarge:{
        breakpoint: { max: 3000, min: 1344 },
        items: 3
    },
    tablet: {
        breakpoint: { max: 1344, min: 534 },
        items: 2
    },
    mobile: {
        breakpoint: { max: 534, min: 0 },
        items: 1
    }
}