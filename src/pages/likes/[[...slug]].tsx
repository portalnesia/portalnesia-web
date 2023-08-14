import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import Pagination, { BoxPagination, usePagination } from "@design/components/Pagination";
import SWRPages from "@comp/SWRPages";
import { TwibbonPagination } from "@model/twibbon";
import CustomCard from "@design/components/Card";
import { accountUrl, href, portalUrl, staticUrl } from "@utils/main";
import Router, { useRouter } from "next/router";
import { NewsPagination } from "@model/news";
import { UserPagination } from "@model/user";
import { ChordPagination } from "@model/chord";
import { BlogPagination } from "@model/pages";
import { ucwords } from "@portalnesia/utils";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Link from "@design/components/Link";
import wrapper from "@redux/store";

type ResultData = {
    type: 'news',
    data: NewsPagination[]
} | {
    type: "chord",
    data: ChordPagination[]
} | {
    type: "blog",
    data: BlogPagination[]
}

type IResponse = {
    page: number | null
    total: number | null,
    total_page: number | null
    can_load: boolean | null
    data: ResultData[]
}

export const getServerSideProps = wrapper(async ({ session, redirect, resolvedUrl, params }) => {
    if (!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));

    const slug = params?.slug as string[];
    if (slug?.length > 1) return redirect();

    return {
        props: {
            data: {}
        }
    }
})

export default function LikesPages() {
    const router = useRouter();
    const slug = router.query?.slug;
    const [page, setPage] = usePagination(true);
    const title = React.useMemo(() => typeof slug?.[0] === 'string' ? `${ucwords(slug[0])} - My Likes` : "My Likes", [slug]);
    const { data, error } = useSWR<IResponse>(`/v2/likes${typeof slug?.[0] === 'string' ? `/${slug[0].toLowerCase()}` : ''}?page=${page}&per_page=${24}`)

    return (
        <Pages title={title} noIndex canonical="/likes">
            <DefaultLayout>
                <Box pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>My Likes</Typography>
                </Box>

                <SWRPages loading={!data && !error} error={error}>
                    {!data ? null : data.data.filter(t => !['thread', 'quiz'].includes(t.type)).map((type) => (
                        <Box mb={5} key={type.type}>
                            <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                                    <Typography variant='h4' component='h2'>{ucwords(type.type)}</Typography>
                                    {type.data.length === 6 && (
                                        <Link href={`/likes/${type.type}`} legacyBehavior passHref shallow scroll><Button component='a' outlined color='inherit'>View More</Button></Link>
                                    )}
                                </Stack>
                            </Box>
                            <Grid container spacing={4}>
                                {type.data.length === 0 ? (
                                    <Grid key={'no-data'} item xs={12}>
                                        <BoxPagination>
                                            <Typography>No data</Typography>
                                        </BoxPagination>
                                    </Grid>
                                ) : type.data.map(d => {
                                    const title = 'artist' in d ? `${d.artist} - ${d.title}` : 'title' in d ? d.title : '';
                                    const image = 'image' in d ? d.image : undefined;
                                    return (
                                        <Grid key={`${type}-${d.id}`} item xs={12} sm={6} md={4} lg={3}>
                                            <CustomCard lazy={false} link={href(d.link)} title={title} image={image} image_query="&export=banner&size=300" />
                                        </Grid>
                                    )
                                })}
                            </Grid>
                            {(typeof slug?.[0] === 'string' && data) && (
                                <Box mt={5}>
                                    <Pagination page={page} onChange={setPage} count={data?.total_page || 1} />
                                </Box>
                            )}
                        </Box>
                    ))}
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}