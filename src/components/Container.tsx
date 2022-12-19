import Box,{BoxProps} from '@mui/material/Box'

export default function Container({children,...props}: BoxProps) {
    return (
        <Box px={2} {...props}>
            {children}
        </Box>
    )
}