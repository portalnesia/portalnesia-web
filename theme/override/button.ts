import { alpha, Theme } from "@mui/material/styles";


export default function buttonOverrides(theme: Theme){
  return {
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: "grey" },
          style: {
            color: theme.palette.getContrastText(theme.palette.grey[300])
          }
        },
        {
          props: { variant: "outlined", color: "grey" },
          style: {
            color: theme.palette.text.primary,
            borderColor:
              theme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.23)"
                : "rgba(255, 255, 255, 0.23)",
            "&.Mui-disabled": {
              border: `1px solid ${theme.palette.action.disabledBackground}`
            },
            "&:hover": {
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.23)"
                  : "rgba(255, 255, 255, 0.23)",
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        },
        {
          props: { color: "grey", variant: "text" },
          style: {
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        }
      ]
    },
    styleOverrides:{
      root: {
        '&:hover': {
          boxShadow: 'none'
        }
      },
      outlinedInherit: {
        border: `1px solid ${theme.palette.grey[500_32]}`,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      },
      textInherit: {
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      }
    }
  }
}