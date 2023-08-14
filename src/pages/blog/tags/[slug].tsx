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
import { truncate, ucwords } from "@portalnesia/utils";
import Breadcrumbs from "@comp/Breadcrumbs";
import { useRouter } from "next/router";
import wrapper from "@redux/store";
import { IPages } from "@type/general";

export const getServerSideProps = wrapper(async ({ params }) => {
    const slug = params?.slug;
    let title = "";
    if (typeof slug === "string") {
        title = ucwords(slug?.replace(/\-/g, " ")) + " ";
    }
    return {
        props: {
            data: {},
            meta: {
                title
            }
        }
    }
})

export default function BlogCategoryPage({ meta }: IPages) {
    const router = useRouter();
    const slug = router?.query?.slug;

    const [page, setPage] = usePagination();
    const { data, error } = useSWR<PaginationResponse<BlogPagination>>(`/v2/blog/tags/${slug}?page=${page}&per_page=24`);

    return (
        <Pages title={`${meta?.title}Tags - Blog`} canonical={`/blog/tags/${slug}`}>
            <DefaultLayout>
                <Breadcrumbs title={`${meta?.title}Tags`} routes={[{
                    label: "Blog",
                    link: "/blog"
                }]} />

                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>{`${meta?.title}Tags`}</Typography>
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