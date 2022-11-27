import { generalFooter } from '@layout/footer.config'
import {styled} from '@mui/material/styles'
import Link from 'next/link';
import { A, Span } from '@design/components/Dom';
import { getDayJs, portalUrl } from '@utils/main';

export const FooterRoot = styled('div')(({ theme }) => ({
  WebkitBoxAlign: 'stretch',
  WebkitBoxDirection: 'normal',
  WebkitBoxOrient: 'vertical',
  WebkitFlexBasis: 'auto',
  WebkitFlexDirection: 'column',
  WebkitFlexShrink: 0,
  alignItems: 'stretch',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  padding: 0,
  position: 'relative',
  zIndex: 0,
  '& a:hover': {
      textDecoration: 'underline'
  },
  '& span': {
      overflowWrap: 'break-word',
      lineHeight: 1.3125,
      color: theme.palette.text.secondary,
      whiteSpace: 'pre-wrap',
  }
}))
export const FooterMenu = styled('div')(({ theme }) => ({
  WebkitFlexDirection: 'row',
  WebkitFlexWrap: 'wrap',
  WebkitBoxDirection: 'normal',
  WebkitBoxOrient: 'horizontal',
  flexWrap: 'wrap',
  flexDirection: 'row',
  marginBottom: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  color: theme.palette.text.secondary,
  lineHeight: '20px',
  fontSize: 10,
  margin: '2px 0',
  '& a': {
      paddingRight: 10
  }
}))

export default function DefaultFooter(){

  return (
    <FooterRoot sx={{position:'absolute',bottom:16,display:'flex',justifyContent:'center',width:'100%'}}>
      <FooterMenu key='up' sx={{textAlign:'center',fontSize:13}}>
          <Span><A sx={{pr:'0 !important',fontSize:13}} href={portalUrl()}><span>Portalnesia</span></A> © {getDayJs().format("YYYY")}</Span>
      </FooterMenu>
      <FooterMenu key='down' sx={{textAlign:'center'}}>
          {generalFooter.map(f => {
              if (f.link) {
                  return (
                      <Link key={f.name} href={f.link} passHref legacyBehavior>
                          <A sx={{fontSize:12}}><span>{f.name}</span></A>
                      </Link>
                  )
              } else if (f.exlink) {
                  return <A sx={{fontSize:12}} key={f.name} target={"_blank"} href={f.exlink}><span>{f.name}</span></A>
              }
              return null
          })}
      </FooterMenu>
    </FooterRoot>
  )
}