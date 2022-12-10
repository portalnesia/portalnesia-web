import Logo from '@comp/Logo'
import {footerMenu, IFooter} from '@layout/footer.config'
import config from '@src/config'
import useResponsive from '@design/hooks/useResponsive'
import {version} from '@src/version'
import { useMemo } from 'react'
import Box from '@mui/material/Box'
import { styled, SxProps, Theme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Link from '@design/components/Link'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { Span } from '@design/components/Dom'
import Hidden from '@mui/material/Hidden'
import Container from '@mui/material/Container'

const BoxStyle = styled(Box)(({theme})=>({
  backgroundColor:theme.palette.background.paper,
  WebkitBoxAlign:'stretch',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'vertical',
  WebkitFlexBasis:'auto',
  WebkitFlexDirection:'column',
  WebkitFlexShrink:0,
  alignItems:'stretch',
  boxSizing:'border-box',
  display:'flex',
  flexBasis:'auto',
  flexDirection:'column',
  flexShrink:0,
  margin:0,
  padding:0,
  position:'relative',
  zIndex:0,
  justifyContent:'center',
  '& a:not(.no-underline):hover':{
    textDecoration:'underline'
  },
}))

export const FooterRoot = styled('div')(({theme})=>({
  WebkitBoxAlign:'stretch',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'vertical',
  WebkitFlexBasis:'auto',
  WebkitFlexDirection:'column',
  WebkitFlexShrink:0,
  alignItems:'stretch',
  boxSizing:'border-box',
  display:'flex',
  flexBasis:'auto',
  flexDirection:'column',
  flexShrink:0,
  margin:0,
  marginBottom:15,
  padding:0,
  position:'relative',
  zIndex:0,
  '& a:hover':{
    textDecoration:'underline'
  },
  '& span':{
    overflowWrap:'break-word',
    lineHeight:1.3125,
    color:theme.palette.text.secondary,
    whiteSpace:'pre-wrap',
  }
}))

export const FooterMenu = styled('div')(({theme})=>({
  WebkitFlexDirection:'row',
  WebkitFlexWrap:'wrap',
  WebkitBoxDirection:'normal',
  WebkitBoxOrient:'horizontal',
  flexWrap:'wrap',
  flexDirection:'row',
  marginBottom:0,
  paddingLeft:theme.spacing(2),
  paddingRight:theme.spacing(2)
}))

export const FooterChild = styled('div')(({theme})=>({
  color:theme.palette.text.secondary,
  lineHeight:'20px',
  fontSize:13,
  overflowWrap:'break-word',
  margin:'2px 0',
  padding:0,
  paddingRight:10,
  whiteSpace:'pre-wrap',
}))

export const FooterAChild = styled('a')<{home?:boolean}>(({theme,home})=>({
  overflowWrap:'break-word',
  padding:0,
  whiteSpace:'pre-wrap',
  ...(home ? {

  } : {
    color:theme.palette.text.secondary,
    paddingRight:10,
    fontSize:13,
    margin:'2px 0',
    lineHeight:'20px',
  }),
}))

export function MenuItem({data,sx,home=true,spanSx}: {data: IFooter,home?:boolean,sx?: SxProps<Theme>,spanSx?: SxProps<Theme>}) {

  return (
    <>
      {data.link ? (
        <Link href={data.link} passHref legacyBehavior>
          <FooterAChild sx={sx} home={home} className='no-blank'>
            <Span sx={spanSx}>{data.name}</Span>
          </FooterAChild>
        </Link>
      ) : data.exlink ? (
        <FooterAChild className='no-blank' href={data.exlink} target='blank' rel='nofollow noopener noreferrer' sx={sx} home={home}>
          <Span sx={spanSx}>{data.name}</Span>
        </FooterAChild>
      ) : null}
    </>
  )
}

function FooterLogo({xs}: {xs?:boolean}) {
  return (
    <Stack direction='row' spacing={2} {...(xs ? {} : {justifyContent:'center',alignItems:'center'})}>
      <Logo href="/?utm_source=portalnesia+web&utm_medium=footer" svg={{size:40}} />
      <Box>
        <Link href={`/?utm_source=portalnesia+web&utm_medium=footer`} className='no-underline'>
          <Typography variant='h4' sx={{color: 'text.primary'}}>{config.title}</Typography>
          <Typography component='span' sx={{color: 'text.secondary',fontSize:14}}>{config.meta.tagline}</Typography>
        </Link>
      </Box>
    </Stack>
  )
}

function FooterCopyright() {
  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' textAlign='center'>
      <FooterRoot sx={{mb:0}}>
        <FooterMenu sx={{p:0,px:0}}>
          <FooterChild sx={{textAlign:'center'}}>
            <span {...({"xmlns:cc":"http://creativecommons.org/ns#","xmlns:dct":"http://purl.org/dc/terms/"})}>
              <Link href='/?utm_source=portalnesia+web&utm_medium=footer+copyright'  property="dct:title" rel="cc:attributionURL">{config.title}</Link> © {(new Date().getFullYear())}
            </span>
          </FooterChild>
          <FooterChild sx={{textAlign:'center'}}><span>{`v${version}`}</span></FooterChild>
        </FooterMenu>
      </FooterRoot>
    </Box>
  )
}

const isSmXsFooter = footerMenu.length === 3 ? 4 : 6;
function XsFooter() {
  
  return (
    <Box display='flex' flexDirection='column' py={3}>
      <FooterLogo xs />
      <Box mt={4} width='100%'>
        <Box mb={2}>
          <Grid container spacing={4}>
            {footerMenu.map((f)=>(
              <Grid item key={f.header} xs={12} sm={isSmXsFooter}>
                <Stack direction='column' justifyContent='center' spacing={0.5}>
                  <Typography sx={{color:'text.secondary',fontSize:14,mb:1,borderBottom:t=>`1px solid ${t.palette.divider}`}}>{f.header}</Typography>
                  {f.child?.map((c)=>(
                    <MenuItem home sx={{color:'text.primary'}} spanSx={{fontSize:15}} key={c.name} data={c} />
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <FooterCopyright />
    </Box>
  )
}

function SmFooter() {
  const isMd = useResponsive('up','md');
  const sm = useMemo(()=>{
    if(footerMenu.length === 3) {
      return isMd ? 3 : 4
    } else {
      return isMd ? 4 : 6
    }
  },[isMd])
  return (
    <Box display='flex' flexDirection='column' py={3}>
      <Hidden mdUp>
        <FooterLogo />
      </Hidden>
      <Box my={4} width='100%'>
        <Grid container spacing={2}>
          <Hidden mdDown>
            <Grid item key={'footer-logo'} xs={12} sm={footerMenu.length === 3 ? 3 : 4}>
              <FooterLogo />
            </Grid>
          </Hidden>
          {footerMenu.map((f)=>(
            <Grid item key={f.header} xs={12} sm={sm}>
              <Stack direction='column' justifyContent='center' spacing={0.5}>
                <Typography sx={{color:'text.secondary',fontSize:14,mb:1,borderBottom:t=>`1px solid ${t.palette.divider}`}}>{f.header}</Typography>
                {f.child?.map((c)=>(
                  <MenuItem home sx={{color:'text.primary'}} spanSx={{fontSize:15}} key={c.name} data={c} />
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
      <FooterCopyright />
    </Box>
  )
}

export default function Footer() {
  
  return (
    <BoxStyle>
      <Container>
        <Hidden smUp><XsFooter /></Hidden>
        <Hidden smDown><SmFooter /></Hidden>
      </Container>
    </BoxStyle>
  )
}