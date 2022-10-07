import React from 'react'
import {Header,PaperBlock,Sidebar,Skeleton} from 'portal/components'
import Breadcrumbs from 'portal/components/Breadcrumbs'
import {useRouter} from 'next/router'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import db from 'portal/utils/db'
import {time_ago} from 'portal/utils/Main'
import useSWR from 'portal/utils/swr'
import {styled,alpha} from '@mui/material/styles'
import {Table,TableHead,TableBody,TableCell,TableRow,Grid,Typography,List,ListItem as RootListItem,ListItemText} from '@mui/material'

export const getServerSideProps = wrapper(async({pn:data,params,resolvedUrl})=>{
    const slug=params.slug
    if(data.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    const res = await db.kata(`SELECT k.unik FROM klekle_kuis_respon r LEFT JOIN klekle_kuis k ON k.unik = r.kuisid WHERE r.unik = ? AND BINARY(r.unik) = BINARY(?) AND k.userid = ? LIMIT 1`,[slug,slug,data.user.id])
    if(!res) {
        return db.redirect();
    }
    else return {props:{meta:{id:res?.[0]?.unik}}}
})

const ListItem = styled(RootListItem,{shouldForwardProp:prop=>prop!=="isError"})(({theme,isError})=>({
    ...(isError ? {
        '&.MuiListItem-root':{
            background: `${theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.dark,0.2) : alpha(theme.palette.secondary.light,0.2)} !important`
        }
    } : {})
}))

const QuizResponse=({err,meta})=>{
    if(err) return <ErrorPage statusCode={err} />

    const router=useRouter()
    const {slug}=router.query
    const {data,error}=useSWR(`/v1/quiz/${meta?.id}/response/${slug}`)

    return(
        <Header title='Response - Quiz' active='quiz' subactive='quiz_response' canonical={`/quiz/response/${slug}`} noIndex>
            <Grid container spacing={2} justifyContent='center'>
            {data && (
                <Grid item xs={12}>
                    <Breadcrumbs routes={[{label:"Quiz",href:"/quiz"},{label:data?.quiz?.title,href:'/quiz/[slug]',as:`/quiz/${data?.quiz?.id}`}]} title={"Response"} />
                </Grid>
            )}
                <Grid item xs={12} lg={4}>
                    <Sidebar id='cardContent'>
                        <PaperBlock title='Information' noPadding>
                            {!data && !error ? (
                                <Skeleton type='table' number={4} tableProps={{column:2}} />
                            ) : error ? (
                                <div style={{margin:'20px 0',textAlign:'center'}}>
                                    <Typography variant='h6' component='h5'>{error}</Typography>E    
                                </div>
                            ) : (
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Quiz Title</TableCell>
                                            <TableCell>{data?.quiz?.title}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>{data?.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Score</TableCell>
                                            <TableCell>{data?.score}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>{time_ago(data?.timestamp)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )} 
                        </PaperBlock>
                    </Sidebar>
                </Grid>
                <Grid item xs={12} lg={8}>
                    <PaperBlock title='Response' noPadding id='cardContent' whiteBg>
                        {!data && !error ? (
                            <Skeleton type='table' number={6} tableProps={{column:2}} />
                        ) : error ? (
                            <div style={{margin:'20px 0',textAlign:'center'}}>
                                <Typography variant='h6' component='h5'>{error}</Typography>E    
                            </div>
                        ) : (
                            <List>
                                {data?.result?.length > 0 ? data?.result?.map((dt,i)=>(
                                    <ListItem isError={dt?.answer !== dt?.correct_answer}>
                                        <ListItemText
                                            primary={<Typography variant='body1'>{`${dt?.answer}${dt?.answer !== dt?.correct_answer ? ` (${dt?.correct_answer})` : ''}`}</Typography>}
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
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    )
}

export default QuizResponse