import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import type { PaginationResponse } from "@design/hooks/api";
import CustomCard from "@design/components/Card";
import { getDayJs, href } from "@utils/main";
import { BlogPagination } from "@model/pages";
import Stack from "@mui/material/Stack";
import { truncate } from "@portalnesia/utils";
import Breadcrumbs from "@comp/Breadcrumbs";

export default function News() {
    const [page, setPage] = usePagination();
    const { data, error } = useSWR<PaginationResponse<BlogPagination>>(`/v2/blog?page=${page}&per_page=24`);

    return (
        <Pages title="Blog" canonical="/blog">
            <DefaultLayout>
                <Breadcrumbs title="Blog" />

                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>Recent Blog</Typography>
                </Box>

                <SWRPages loading={!data && !error} error={error}>
                    <Grid container spacing={2}>
                        {data && data?.data?.length > 0 ? (data.data.map(d => (
                            <Grid key={d.title} item xs={12} sm={6} md={4} lg={3}>
                                <CustomCard lazy={false} link={href(d.link)} title={d.title} image={d.image} image_query="&export=banner&size=300">
                                    <Stack direction='row' justifyContent='space-between'>
                                        <Typography variant='caption'>{`By ${truncate(d.user.name, 20)}`}</Typography>
                                        <Typography variant='caption'>{getDayJs(d.last_modified || d.created).time_ago().format}</Typography>
                                    </Stack>
                                </CustomCard>
                            </Grid>
                        ))) : (
                            <Grid key={'no-data'} item xs={12}>
                                <BoxPagination>
                                    <Typography>No data</Typography>
                                </BoxPagination>
                            </Grid>
                        )}
                        {(data) && (
                            <Grid sx={{ mt: 2 }} key={'pagination'} item xs={12}>
                                <Pagination page={page} onChange={setPage} count={data?.total_page} />
                            </Grid>
                        )}
                    </Grid>

                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}