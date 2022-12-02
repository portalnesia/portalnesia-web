import { Circular } from '@design/components/Loading'
import { Box, Typography } from '@mui/material'
import React from 'react'

export interface SWRPagesProps {
    loading?:boolean
    error?:any
    children?: React.ReactNode
    minHeight?: number
}

export default function SWRPages({children,error,loading=true,minHeight=200}: SWRPagesProps) {

    return(
        <>
            {loading ? (
                <Box display='flex' justifyContent="center" alignItems='center' textAlign='center' minHeight={minHeight} width="100%"><Circular /></Box>
            ) : error ? (
                <Box minHeight={minHeight} display='flex' flexDirection="column" justifyContent="center" alignItems='center' textAlign='center'>
                    <Typography>{error?.message||"Something went wrong"}</Typography>
                </Box>
            ) : children}
        </>
    )
}