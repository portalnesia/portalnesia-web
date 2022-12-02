import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'

const Textarea = styled(TextField)(({theme})=>({
    '& textarea':{
        '@media (hover: hover) and (pointer: fine)':{
            '&::-webkit-scrollbar':{
                width:0,
                borderRadius:0
            },
            '&::-webkit-scrollbar-thumb':{
                borderRadius:0
            },
        }
    },
    '& textarea:focus, & textarea:hover':{
        '@media (hover: hover) and (pointer: fine)':{
            '&::-webkit-scrollbar':{
                width:'.6em',
                borderRadius:4,
            },
            '&::-webkit-scrollbar-thumb':{
                background:theme.palette.action.hover,
                borderRadius:4
            },
            '&::-webkit-scrollbar-thumb:hover':{
                background:theme.palette.action.focus,
            },
            '&::-webkit-scrollbar-thumb:active':{
                background:theme.palette.divider,
            },
        }
    }
}))

export default Textarea;