import { Circular } from '@design/components/Loading'
import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'

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

export interface TableSWRPagesProps extends SWRPagesProps {
    colSpan: number
}

export function TableSWRPages({children,error,loading=true,minHeight=200,colSpan}: TableSWRPagesProps) {

    return(
        <>
            {loading ? (
                <TableRow key='swr-loading'>
                    <TableCell align='center' colSpan={colSpan}>
                        <Box display='flex' justifyContent="center" alignItems='center' textAlign='center' minHeight={minHeight} width="100%"><Circular /></Box>
                    </TableCell>
                </TableRow>
            ) : error ? (
                <TableRow key='swr-error'>
                    <TableCell align='center' colSpan={colSpan}>
                        <Box minHeight={minHeight} display='flex' flexDirection="column" justifyContent="center" alignItems='center' textAlign='center'>
                            <Typography>{error?.message||"Something went wrong"}</Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            ) : children}
        </>
    )
}