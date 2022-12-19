import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import DefaultLayout from "@layout/default";
import { QuizResponseDetail } from "@model/quiz";
import wrapper, { BackendError } from "@redux/store";
import { IPages } from "@type/general";
import { accountUrl, getDayJs, portalUrl } from "@utils/main";
import { useRouter } from "next/router";
import React from "react";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography'
import SWRPages from "@comp/SWRPages";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import List from "@mui/material/List";
import NativeListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import { alpha } from '@mui/system/colorManipulator';
import Scrollbar from "@design/components/Scrollbar";
import Box from "@mui/material/Box";
import Sidebar from "@design/components/Sidebar";

export const getServerSideProps = wrapper<QuizResponseDetail>(async({params,redirect,fetchAPI,session,resolvedUrl})=>{
    if(!session) return redirect(accountUrl(`login?redirect=${encodeURIComponent(portalUrl(resolvedUrl))}`));

    const slug = params?.slug
    const response_id = params?.response_id;
    if(typeof slug !== 'string') return redirect();
    if(typeof response_id !== 'string') return redirect();

    try {
        const data: QuizResponseDetail = await fetchAPI<QuizResponseDetail>(`/v2/quiz/${slug}/response/${response_id}`);
        if(data?.quiz?.user?.id !== session.user.id) return redirect();
        
        return {
            props:{
                data
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})

const ListItem = styled(NativeListItem,{shouldForwardProp:prop=>prop!=="isError"})<{isError?:boolean}>(({theme,isError})=>({
    ...(isError ? {
        '&.MuiListItem-root':{
            background: `${theme.palette.mode === 'dark' ? alpha(theme.palette.error.dark,0.2) : alpha(theme.palette.error.light,0.2)} !important`
        }
    } : {})
}))

export default function QuizResponsePage({data:response}: IPages<QuizResponseDetail>) {
    const router = useRouter();
    const slug = router.query?.slug;
    const response_id = router.query?.response_id;
    const {data,error} = useSWR<QuizResponseDetail>(`/v2/quiz/${slug}/response/${response_id}`,{fallbackData:response});

    return (
        <Pages title="Response - Quiz" canonical={`/quiz/response/${slug}`}>
            <DefaultLayout>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Quiz Response</Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <SWRPages loading={!data&&!error} error={error}>
                            <Sidebar id='response-sidebar'>
                                <Scrollbar>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{color:'text.secondary'}}>Quiz Title</TableCell>
                                                <TableCell sx={{fontSize:15}}>{data?.quiz?.title}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{color:'text.secondary'}}>Name</TableCell>
                                                <TableCell sx={{fontSize:15}}>{data?.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{color:'text.secondary'}}>Score</TableCell>
                                                <TableCell sx={{fontSize:15}}>{data?.score}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{color:'text.secondary'}}>Date</TableCell>
                                                <TableCell sx={{fontSize:15}}>{getDayJs(data?.timestamp).time_ago().format}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Scrollbar>
                            </Sidebar>
                        </SWRPages>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box id='response-content'>
                            <SWRPages loading={!data&&!error} error={error}>
                                <List>
                                    {data && data?.result?.length > 0 ? data?.result?.map((dt,i)=>(
                                        <ListItem key={dt.question} isError={Boolean(dt?.answer && dt?.answer !== dt?.correct_answer)}>
                                            <ListItemText
                                                primary={<Typography variant='body1'>{dt.answer ? `${dt?.answer}${dt?.answer !== dt?.correct_answer ? ` (${dt?.correct_answer})` : ''}` : 'Not yet answered'}</Typography>}
                                                secondary={<Typography variant='body2'>{dt?.question}</Typography>}
                                            />
                                        </ListItem>
                                    )) : (
                                        <ListItem>
                                            <ListItemText
                                                primary={<Typography variant='body1'>No data</Typography>}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </SWRPages>
                        </Box>
                    </Grid>
                </Grid>
            </DefaultLayout>
        </Pages>
    )
}