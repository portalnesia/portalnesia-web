import Box,{BoxProps} from '@mui/material/Box'

export default function View({children,...props}: BoxProps) {
    return (
        <Box pt={{xs:3,md:4,lg:5}} {...props}>
            {children}
        </Box>
    )
}