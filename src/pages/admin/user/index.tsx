import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import { PaginationResponse } from "@design/hooks/api";
import { TableSWRPages } from "@comp/SWRPages";
//import dynamic from "next/dynamic";
import { UserPagination } from "@model/user";
import useTablePagination from "@design/hooks/TablePagination";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Edit } from "@mui/icons-material";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import useNotification from "@design/components/Notification";
import TablePagination from "@mui/material/TablePagination";
import Grid from "@mui/material/Grid";
import Label from "@design/components/Label";

//const Dialog = dynamic(()=>import("@design/components/Dialog"));
//const Backdrop = dynamic(()=>import("@design/components/Backdrop"));


export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session || !session.user.isAdmin(undefined,true)) return redirect(); 
    return {
        props:{
            data:{}
        }
    }
})

type IUserData = UserPagination & {
    active: boolean;
    suspend: boolean;
    gender: "Male" | "Female" | null;
    created: Date;
    remove: boolean;
    remove_date: Date | null;
}

export default function LogAdminPage() {
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true);
    const {data,error} = useSWR<PaginationResponse<IUserData>>(`/v2/admin/user?page=${page}&per_page=${rowsPerPage}`);
    //const [selected,setSelected] = React.useState<IUserData>();
    //const [dialog,setDialog] = React.useState(false);
    //const setNotif = useNotification();
    //const [loading,setLoading] = React.useState(false)
    //const {put} = useAPI();

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage])

    /*const handleClick = React.useCallback((dt: IUserData)=>()=>{
        setSelected(dt);
        setDialog(true);
    },[])*/

    //const closeDialog = React.useCallback(()=>setDialog(false),[]);

    return (
        <Pages title="User" canonical="/admin/user" noIndex>
            <DashboardLayout adminPage>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>{`User`}</Typography>
                    </Stack>
                </Box>

                <Scrollbar>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>{`Name (username)`}</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableSWRPages colSpan={4} loading={!data && !error} error={error}>
                                {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                                    <TableRow key={d.username}>
                                        <TableCell>{getNumber(i)}</TableCell>
                                        <TableCell><Link href={`/user/${d.username}`}><Span>{`${d.name} (${d.username})`}</Span></Link></TableCell>
                                        <TableCell>
                                            <Grid container spacing={1}>
                                                {d.active && (
                                                    <Grid key={`label-publish`} item xs="auto" zeroMinWidth>
                                                        <Label color='secondary' variant='filled'>Active</Label>
                                                    </Grid>
                                                )}
                                                {d.remove && (
                                                    <Grid key={`label-remove`} item xs="auto" zeroMinWidth>
                                                        <Label color='default' variant='filled'>Removed</Label>
                                                    </Grid>
                                                )}
                                                {d.suspend && (
                                                    <Grid key={`label-remove`} item xs="auto" zeroMinWidth>
                                                        <Label color='error' variant='filled'>Suspended</Label>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                <Tooltip title="Edit">
                                                    <IconButton aria-label="Edit">
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <BoxPagination>
                                                <Typography>No data</Typography>
                                            </BoxPagination>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableSWRPages>
                        </TableBody>
                    </Table>
                </Scrollbar>
                <TablePagination page={page-1} rowsPerPage={rowsPerPage} count={data?.total||0} {...tablePagination} />
            </DashboardLayout>
        </Pages>
    )
}