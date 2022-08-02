import { createTheme, responsiveFontSizes,Theme,alpha } from '@mui/material/styles';
import {grey} from '@mui/material/colors'
import buttonOverride from './override/button'

export function getTheme(currentTheme: 'dark'|'light'='light') {
    const isDark=currentTheme==='dark';
    const tema = ['dark','light'].indexOf(currentTheme) !== -1 ? currentTheme : 'light';
    return responsiveFontSizes(createTheme({
        components: {
          MuiTooltip:{
            defaultProps:{
              disableInteractive:true
            },
            styleOverrides: {
              tooltip:{
                fontSize:15
              }
            }
          },
          MuiBackdrop: {
            styleOverrides:{
              root: {
                backgroundColor:'rgba(0,0,0,0.7)'
              }
            }
          }
        },
        palette: {
          mode:tema,
          primary: {
            light: '#588b71',
            main: '#2f6f4e',
            dark:'#204d36',
            action:'#2f6f4e26',
            link:isDark ? '#bbe0ff' : '#1591f9',
            dasar:isDark ? '#000' : '#fff',
            contrastText: '#fff'
          },
          secondary: {
            //light: '#e57373',
            //main: '#f44336',
            //dark:'#d32f2f',
            light: '#ce6b67',
            main: '#c24741',
            dark:'#87312d',
            action:'#f443361c',
            contrastText: '#fff'
          },
          //divider:(isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
          background:{
            paper:(isDark ? '#141414' : '#ffffff'),
            default:(isDark ? '#1c1c1c' : '#f7f7f7')
          },
          grey:{
            main:grey[300],
            dark:grey[400]
          }
        },
        zIndex:{
          snackbar: 2500
        },
        typography:{
          fontFamily:[
            '"Inter"',
            '"Inter var"',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Helvetica Neue"',
            '"Segoe UI"',
            'Roboto',
            'Oxygen',
            'Ubuntu',
            'Cantarell',
            'Droid Sans',
            'Fira Sans',
            'sans-serif'
          ].join(',')
        },
        custom:{
          action:'#2f6f4e26',
          link:isDark ? '#bbe0ff' : '#1591f9',
          dasar:isDark ? '#000' : '#fff',
          dasarText: isDark ? '#fff' : '#000',
          dasarIcon:isDark ? '#fff' : 'rgba(0, 0, 0, 0.54)',
          bgChat:(isDark ? '#1c1c1c' : '#ece5dd'),
          //bgChat:isDark ? '#081821':'#ece5dd',
          bubbleLeftChat:isDark ? '#222E35':'#ffffff',
          bubbleRightChat:isDark ? '#054740':'#E8FFD4'
          //bubbleLeftChat:isDark ? '#054740':'#ffffff',
          //bubbleRightChat:'#588b71'
        }
    }))
};

export function getSecondTheme(theme: Theme) {
    return responsiveFontSizes(createTheme(theme,{
      components:{
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: theme.palette.grey[800]
            },
            arrow: {
              color: theme.palette.grey[800]
            }
          }
        },
        ...buttonOverride(theme),
      }
    }))
}