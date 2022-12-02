import { Theme } from "@mui/material";
import { alpha } from '@mui/system/colorManipulator';

export default function TableCell(theme: Theme) {
    return {
      MuiTableCell: {
        styleOverrides: {
          head:{
            borderColor:alpha(theme.palette.divider,0.5)
          },
          body:{
            borderColor:alpha(theme.palette.divider,0.2)
          }
        }
      }
    };
  }