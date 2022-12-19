import { alpha } from '@mui/system/colorManipulator';
import {Theme} from '@mui/material/styles/createTheme'

export default function Backdrop(theme: Theme) {
  const varHigh = alpha(theme.palette.grey[900], 0.8);
  //'rgba(0,0,0,0.7)'
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          background: varHigh,
          '&.MuiBackdrop-invisible': {
            background: 'transparent'
          }
        }
      }
    }
  };
}