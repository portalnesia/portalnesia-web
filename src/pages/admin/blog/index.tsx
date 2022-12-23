import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import { PaginationResponse } from "@design/hooks/api";
import useTablePagination from "@design/hooks/TablePagination";
import { TableSWRPages } from "@comp/SWRPages";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Label from "@design/components/Label";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Edit } from "@mui/icons-material";
import TablePagination from "@mui/material/TablePagination";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import { BlogPagination } from "@model/pages";
import Breadcrumbs from "@comp/Breadcrumbs";
import Grid from "@mui/material/Grid";

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session || !session.user.isAdmin('blog')) return redirect(); 
    return {
        props:{
            data:{}
        }
    }
})

export default function BlogAdminIndex() {
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true,10);
    const {data,error} = useSWR<PaginationResponse<BlogPagination>>(`/v2/blog/admin?page=${page}&per_page=${rowsPerPage}`);

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage]);

    return (
        <Pages title="Blog - Admin" canonical={`/admin/blog`} noIndex>
            <DashboardLayout adminPage>
                <Breadcrumbs title="Blog" routes={[{
                    label:"Admin",
                    link:"/admin"
                }]} />
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>Blog</Typography>
                    </Stack>
                </Box>

                <Box>
                    <Scrollbar>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align='right'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableSWRPages loading={!data&&!error} error={error} colSpan={5}>
                                {data && data?.data?.length > 0 ? data?.data?.map((d,i)=>(
                                        <TableRow key={d.slug}>
                                            <TableCell>{getNumber(i)}</TableCell>
                                            <TableCell><Link href={`/blog/${d.slug}`}><Span sx={{color:'customColor.link'}}>{d.title}</Span></Link></TableCell>
                                            <TableCell>{d.category}</TableCell>
                                            <TableCell>
                                                <Grid container spacing={1}>
                                                    <Grid key={`label-publish`} item xs="auto" zeroMinWidth>
                                                        <Label color={d.publish ? 'secondary':'default'} variant='filled'>{d.publish ? "Published" : "Draft"}</Label>
                                                    </Grid>
                                                    {d.block && (
                                                        <Grid key={`label-block`} item xs="auto" zeroMinWidth>
                                                            <Label color={'error'} variant='filled'>{"Blocked"}</Label>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                                    <Link href={`/admin/blog/${d.slug}`} passHref legacyBehavior>
                                                        <Tooltip title="Edit"><IconButton aria-label="Edit" component='a'>
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Link>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5}>
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
                </Box>
            </DashboardLayout>
        </Pages>
    )
}