import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import { accountUrl, href, portalUrl } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import { BoxPagination } from "@design/components/Pagination";
import useSWR, { useSWRPagination } from "@design/hooks/swr";
import Grid from "@mui/material/Grid";
import SWRPages from "@comp/SWRPages";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Link from "@design/components/Link";
import Stack from "@mui/material/Stack";
import Iconify from "@design/components/Iconify";
import { ISections } from "@type/section";
import Scrollbar from "@design/components/Scrollbar";
import CustomCard from "@design/components/Card";
import Carousel from "@comp/Carousel";
import Button from "@comp/Button";
import { Circular } from "@design/components/Loading";
import { PaginationResponse } from "@design/hooks/api";

export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));
    return {
        props:{
            data:{}
        }
    }
})

type CountData = {
    count: number,
    label: string,
    icon: string
    link: string
}

export default function DashIndex() {
    const {data:count,error:errCount} = useSWR<CountData[]>(`/v2/internal/dashboard/home`);
    const {data:sections,error:errSections,isLoadingMore,size,setSize,isLoading} = useSWRPagination<PaginationResponse<ISections>>(`/v2/internal/dashboard/sections`);

    const handleLoadmore = React.useCallback(()=>{
        setSize(size+1);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    },[size])

    return (
        <Pages title="Dashboard" canonical={`/dashboard`} noIndex>
            <DashboardLayout>
                <Box>
                    <Grid container spacing={1}>
                        <SWRPages loading={!count&&!errCount} error={errCount}>
                            {count ? count.map(c=>(
                                <Grid key={c?.label} item xs={6} md={4}>
                                    <Card>
                                        <Link href={href(c.link)} passHref legacyBehavior>
                                            <CardActionArea component='a'>
                                                <Stack spacing={1} p={2} direction='row' justifyContent='space-between'>
                                                    <Box>
                                                        <Typography variant='h3'>{c?.count}</Typography>
                                                        <Typography variant='h5' sx={{fontSize:{xs:15,sm:20}}}>{c?.label}</Typography>
                                                    </Box>
                                                    <Iconify color="customColor.linkIcon" icon={c.icon} width={{xs:35,sm:50}} height={{xs:35,sm:50}} />
                                                </Stack>
                                            </CardActionArea>
                                        </Link>
                                    </Card>
                                </Grid>
                            )) : null}
                        </SWRPages>
                    </Grid>
                </Box>
                
                <Box mt={10}>
                    <SWRPages loading={isLoading} error={errSections}>
                        <Stack alignItems='flex-start' spacing={10} width="100%">
                            {(sections && (sections.data?.length||0) > 0) && sections?.data?.map(d=>(
                                <Box key={d.title} width="100%">
                                    <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                                        <Typography variant='h4' component='h1'>{d.title}</Typography>
                                    </Box>

                                    {'cards' in d ? (
                                        <Scrollbar>
                                            {d.cards.length ? (
                                                <Carousel>
                                                    {d.cards?.map(c=>(
                                                        <Box key={c.title} px={1}>
                                                            <CustomCard title={c.title} link={href(c.link)} image={c.image ? `${c.image}&export=banner&size=300` : undefined}>
                                                                {c.footer ? c.footer?.map(f=>(
                                                                    <Typography key={f} variant='caption'>{f}</Typography>
                                                                )) : undefined}
                                                            </CustomCard>
                                                        </Box>
                                                    ))}
                                                </Carousel>
                                            ) : (
                                                <BoxPagination>
                                                    <Typography>No data</Typography>
                                                </BoxPagination>
                                            )}
                                        </Scrollbar>
                                    ) : null}
                                </Box>
                            ))}
                            {(sections && sections?.can_load) && (
                                <Stack alignItems='center' justifyContent='center' width="100%">
                                    {isLoadingMore ? (
                                        <Circular />
                                    ) : (
                                        <Button outlined color='inherit' onClick={handleLoadmore}>Load more</Button>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </SWRPages>
                </Box>
            </DashboardLayout>
        </Pages>
    )
}