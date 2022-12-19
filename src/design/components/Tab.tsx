import { styled } from "@mui/material/styles"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"


export const CustomTab = styled(Tab)<{component?: string}>(({theme})=>({
    borderRadius:5,
    minHeight: 35,
    '&:hover':{
        backgroundColor: theme.palette.action.hover
    }
}))
export const CustomTabs = styled(Tabs)(()=>({
    minHeight:40,
    height:40,
    '& .MuiTabScrollButton-root':{
        height:35
    },
    '& .MuiTabs-indicator':{
        height:3
    }
}))