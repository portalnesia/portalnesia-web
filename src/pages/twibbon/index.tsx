import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import { PaginationResponse } from "@design/hooks/api";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import SWRPages from "@comp/SWRPages";
import { TwibbonPagination } from "@model/twibbon";
import CustomCard from "@design/components/Card";
import { getDayJs, href } from "@utils/main";
import Stack from "@mui/material/Stack";
import Breadcrumbs from "@comp/Breadcrumbs";

export default function TwibbonIndex() {
    const [page, setPage] = usePagination(true);
    const { data, error } = useSWR<PaginationResponse<TwibbonPagination>>(`/v2/twibbon?page=${page}`)

    return (
        <Pages title="Twibbon" canonical="/twibbon">
            <DefaultLayout>
                <Breadcrumbs title='Twibbon' />
                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>Twibbon</Typography>
                </Box>

                <SWRPages loading={!data && !error} error={error}>
                    <Grid container spacing={2}>
                        {data && data?.data?.length > 0 ? data.data.map(d => (
                            <Grid key={d.slug} item xs={12} sm={6} md={4} lg={3}>
                                <CustomCard link={href(d.link)} title={d.title} image={d.image} image_query="&export=banner&size=300" ellipsis={2}>
                                    <Stack direction='row' justifyContent='space-between'>
                                        <Typography variant='caption' component='p'>{`By ${d.user.name}`}</Typography>
                                        <Typography variant='caption' component='p'>{getDayJs(d.created).pn_format('minimal')}</Typography>
                                    </Stack>
                                </CustomCard>
                            </Grid>
                        )) : (
                            <Grid key={'no-data'} item xs={12}>
                                <BoxPagination>
                                    <Typography>No data</Typography>
                                </BoxPagination>
                            </Grid>
                        )}
                        {data && (
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