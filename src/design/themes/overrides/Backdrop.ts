import { alpha } from '@mui/system/colorManipulator';
import {Theme} from '@mui/material/styles/createTheme'

export default function Backdrop(theme: Theme) {
  //const varLow = alpha(theme.palette.grey[900], 0.48);
  const varHigh = alpha(theme.palette.grey[900], 0.8);

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