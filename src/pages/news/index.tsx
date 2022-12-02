import Pages from "@comp/Pages";
import SWRPages from "@comp/SWRPages";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import type { NewsPagination } from "@model/news";
import type { PaginationResponse } from "@design/hooks/api";
import CustomCard from "@design/components/Card";
import { href } from "@utils/main";
import Container from "@comp/Container";
import View from "@comp/View";

export default function News() {
    const [page,setPage] = usePagination();
    const {data,error} = useSWR<PaginationResponse<NewsPagination>>(`/v2/news?page=${page}&per_page=24`);

    return (
        <Pages title="News">
            <DefaultLayout>
                <SWRPages loading={!data&&!error} error={error}>
                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                        <Typography variant='h4' component='h1'>Recent News</Typography>
                    </Box>
                    <Container>
                        <Grid container spacing={2}>
                            {data && data?.data?.length > 0 ? ( data.data.map(d=>(
                                <Grid key={d.title} item xs={12} sm={6} md={4} lg={3}>
                                    <CustomCard link={href(d.link)} title={d.title} image={`${d.image}&export=banner&size=300`}>
                                        <Typography variant='caption'>{d.source}</Typography>
                                    </CustomCard>
                                </Grid>
                            ))) : (
                                <Grid key={'no-data'} item xs={12}>
                                    <BoxPagination>
                                        <Typography>No data</Typography>
                                    </BoxPagination>
                                </Grid>
                            )}
                            {data && (
                                <Grid sx={{mt:2}} key={'pagination'} item xs={12}>
                                    <Pagination page={page} onChange={setPage} count={data?.total_page} />
                                </Grid>
                            )}
                        </Grid>
                    </Container>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}