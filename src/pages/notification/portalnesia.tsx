import Button from "@comp/Button";
import Image from "@comp/Image";
import Pages from "@comp/Pages";
import { PaginationResponse } from "@design/hooks/api";
import { useSWRPagination } from "@design/hooks/swr";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import wrapper, {  } from "@redux/store";
import { getDayJs } from "@utils/main";
import React from "react";
import SWRPages from "@comp/SWRPages";
import { BoxPagination } from "@design/components/Pagination";
import DefaultLayout from "@layout/default";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Parser } from "@design/components/Parser";
import CardActionArea from "@mui/material/CardActionArea";

export const getServerSideProps = wrapper(async({redirect,session})=>{
    if(!session) return redirect();

    return {
        props:{
            data:{}
        }
    }
})


type NotificationResponse = {
    id: number;
    message: string | null;
    timestamp: string;
    image: string | null;
}

export default function PortalnesiaNotification() {
    const {data,error,size,setSize,isLoadingMore} = useSWRPagination<PaginationResponse<NotificationResponse>>(`/v2/notification/portalnesia`)

    const handleLoadMore = React.useCallback(()=>{
        setSize(size+1);
    },[size])

    return (
        <Pages title="Notification" noIndex canonical="/notification/portalnesia">
            <DefaultLayout maxWidth='md'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Notification</Typography>
                </Box>

                <SWRPages loading={!data&&!error}>
                    <Stack alignItems='flex-start' width='100%' spacing={2}>
                        {data && data.data.length > 0 ? data?.data?.map(d=>(
                            <NotificationComp key={`notification-${d.id}`} data={d} />
                        )) : (
                            <BoxPagination>
                                <Typography>No data</Typography>
                            </BoxPagination>
                        )}
                        {data?.can_load && (
                            <Box mt={2} width='100%'>
                                {isLoadingMore ? <BoxPagination loading maxHeight={55} /> : (
                                    <Stack width='100%'>
                                        <Button size='large' sx={{width:'100%'}} outlined color='inherit' onClick={handleLoadMore}>Load more</Button>
                                    </Stack>
                                )}
                            </Box>
                        )}
                    </Stack>
                </SWRPages>
            </DefaultLayout>
        </Pages>
    )
}

function NotificationComp({data}:{data:NotificationResponse}) {
    
    return (
        <Card variant='outlined' sx={{width:'100%',bgcolor:'background.default'}}>
            <CardContent>
                {data.image && (
                    <Stack justifyContent={'center'}>
                        <Image src={`${data.image}&width=300`} dataSrc={`${data.image}&watermark=no`} alt={data.message||undefined} sx={{maxWidth:300,maxHeight:300,objectFit:'contain'}} fancybox webp dataFancybox="notification" />
                    </Stack>
                )}
                <Parser html={data.message||""} />
                <Box>
                    <Typography variant='caption'>{getDayJs(data.timestamp).time_ago().format}</Typography>
                </Box>
            </CardContent>
        </Card>
    )
}