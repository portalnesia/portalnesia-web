import React from 'react';
import classNames from 'classnames';
import {makeStyles} from 'portal/components/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {Divider,IconButton} from '@mui/material';
import {SlideDown} from 'react-slidedown'
import dynamic from 'next/dynamic'

const ExpandLess = dynamic(()=>import('@mui/icons-material/ExpandLess'),{ssr:false})
const ExpandMore = dynamic(()=>import('@mui/icons-material/ExpandMore'),{ssr:false})

const styles = makeStyles()((theme,_,classes) => {
  return {
    root: {
      paddingTop: `${theme.spacing(3)} !important`,
      paddingBottom: `${theme.spacing(3)} !important`,
      marginBottom: `${theme.spacing(3)} !important`,
      backgroundImage:'unset !important',
      [`&.${classes.marginPlus}`]: {
        paddingTop: `${theme.spacing(7)} !important`,
      },
      paddingLeft:'0!important',
      paddingRight:'0!important',
      '& code:not(.hljs), & blockquote, & code.code:not(.hljs)':{
        background: theme.palette.action.hover,
        borderRadius:'.5rem'
      },
      '& pre code':{
        borderRadius:'.5rem',
        '@media (hover: hover) and (pointer: fine)':{
          '&::-webkit-scrollbar':{
              height:8,
              borderRadius:4
          },
          '&::-webkit-scrollbar-thumb':{
              background:'rgba(255,255,255,.2)',
              borderRadius:4,
              '&:hover':{
                  background:'rgba(255,255,255,.4)'
              }
          },
        }
      },
      '& table':{
        '& td':{
            color:theme.palette.text.primary,
            borderTop:`1px solid ${theme.palette.divider}`,
        },
        '& th':{
          borderTop:`1px solid ${theme.palette.divider}`,
          borderBottom:`2px solid ${theme.palette.divider}`
        }
      },
      boxShadow:'unset!important',
    },
    bg:{
      
    },
    title:{
      '& h1':{
        fontSize: '28px !important',
        textTransform: 'capitalize',
      },
      [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
      },
      [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
      },
    },
    titleContainer:{
      position: 'relative',
    },
    titleBorder:{
      paddingBottom: theme.spacing(2),
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        borderBottom: `4px solid ${theme.palette.divider}`
      },
    },
    description:{
      marginTop:`${theme.spacing(2)} !important`,
      [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
      },
      [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
      },
    },
    header:{
      /*'& a[href]:hover':{
        textDecoration:'underline'
      }*/
    },
    content: {
      marginTop: theme.spacing(4),
      //padding: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
      },
      [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
      },
      /*'& a[href]:hover':{
        textDecoration:'underline'
      },*/
    },
    linkColor:{
      '& a:not(.no-format)':{
        color:`${theme?.custom?.link} !important`,
      },
    },
    footerContainer:{
      marginTop: theme.spacing(4),
      padding:0,
    },
    footer:{
      paddingTop: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
      },
      [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
      },
    },
    whiteBg: {
      backgroundColor: `${theme.palette.background.default} !important`,
      //boxShadow:'0px 3px 0px -1px rgba(0,0,0,0.2)'
    },
    marginPlus:{},
    colorMode: {
      backgroundColor: `${theme.palette.secondary.main} !important`,
      color:'#ffffff',
      [`& .${classes.title}`]: {
        color: '#ffffff',
        '&:after': {
          borderBottom: `5px solid ${theme.palette.primary.light}`
        }
      },
      [`& .${classes.description}`]: {
        color: '#ffffff',
      }
    },
    overflowX: {
      width: '100%',
      overflowX: 'auto',
    },
    noPadding:{
      paddingLeft:'0!important',
      paddingRight:'0!important'
    },
    withPadding:{
      [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
      },
      [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
      },
    },
    withHoverToggle:{
      '&:hover':{
        backgroundColor:`${theme.palette.action.hover} !important`
      },
      cursor:'pointer'
    },
    noMargin:{
      marginTop:`0 !important`
    }
  }
});

const PaperBlock=({id,style,enableSlideDown,title,desc,children,whiteBg,marginPlus,divider,colorMode,overflowX,action,footer,header,linkColor,noPadding,noPaddingHeader,noPaddingFooter,toggle,initialShow,noMarginFooter,noMargin,...other})=>{
  const {classes} = styles();  
  const [toggleVal,setToggleVal]=React.useState(initialShow);

    const handleToggle=()=>{
      if(!toggleVal){
        setToggleVal(true)
      }
    }

    return (
      <div className={classNames('pn-card',whiteBg ? classes.whiteBg : classes.bg)} style={style}>
          <Paper onClick={handleToggle} className={classNames(whiteBg ? classes.whiteBg:classes.bg,classes.root, marginPlus && classes.marginPlus,linkColor && classes.linkColor, colorMode && classes.colorMode,!toggleVal&&classes.withHoverToggle)} elevation={0} {...(id ? {id:id} : {})}>
              {title && (
                <div className={classNames(classes.titleContainer,toggleVal && classes.titleBorder)}>
                  <div className={classes.title}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <Typography component="h1">
                            {title}
                          </Typography>
                        </div>
                        {toggle ? (
                          <IconButton onClick={()=>setToggleVal(!toggleVal)} size="large">
                            {toggleVal ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        ) : (
                          <>
                          {action}
                          </>
                        )}
                      </div>
                  </div>
                  <div className={classNames(!noPaddingHeader && classes.withPadding,classes.header)} {...(toggleVal ? {style:{marginTop:10}} : {})}>{header}</div>
                </div>
              )}
              {enableSlideDown || toggle ? (
                <SlideDown>
                  {toggleVal && (
                    <>
                      { desc ? (
                        <>
                        {typeof desc === 'string' ? (
                          <Typography component="p" className={classNames(classes.description,noPaddingHeader && classes.noPadding)}>{desc}</Typography>
                        ) : (
                          <div className={classNames(classes.description,noPaddingHeader && classes.noPadding)}>
                            {desc}
                          </div>
                        )}
                        </>
                      ) : null}

                      <section className={classNames('pn-content',classes.content, overflowX && classes.overflowX,noPadding && classes.noPadding,noMargin && classes.noMargin)} {...other}>
                          {children}
                      </section>
                      {footer  && (
                        <div className={classNames(classes.footerContainer,noMarginFooter && classes.noMargin)}>
                          {divider && <Divider />}
                          <div className={classNames(classes.footer,noPaddingFooter && classes.noPadding)}>
                            {footer}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </SlideDown>
              ) : (
                <>
                  { desc ? (
                    <>
                    {typeof desc === 'string' ? (
                      <Typography component="p" className={classNames(classes.description,noPaddingHeader && classes.noPadding)}>{desc}</Typography>
                    ) : (
                      <div className={classNames(classes.description,noPaddingHeader && classes.noPadding)}>
                        {desc}
                      </div>
                    )}
                    </>
                  ) : null}

                  <section className={classNames('pn-content',classes.content, overflowX && classes.overflowX,noPadding && classes.noPadding,noMargin && classes.noMargin)} {...other}>
                      {children}
                  </section>
                  {footer  && (
                    <div className={classNames(classes.footerContainer,noMarginFooter && classes.noMargin)}>
                      {divider && <Divider />}
                      <div className={classNames(classes.footer,noPaddingFooter && classes.noPadding)}>
                        {footer}
                      </div>
                    </div>
                  )}
                </>
              )}
          </Paper>
      </div>
    );
}
  
PaperBlock.defaultProps = {
    whiteBg: false,
    marginPlus: false,
    colorMode: false,
    overflowX: false,
    action:'',
    linkColor:false,
    noPadding:false,
    noPaddingHeader:false,
    noPaddingFooter:false,
    noMargin:false,
    noMarginFooter:false,
    toggle:false,
    initialShow:true,
    divider:true,
    enableSlideDown:false,
};
  
export default PaperBlock;