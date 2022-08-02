import React from 'react'
import Header from 'portal/components/developer/Header'
import {PaperBlock,Skeleton} from 'portal/components'
import PaperBlock from 'portal/components/PaperBlock'
import Skeleton from 'portal/components/Skeleton'
import {useNotif} from 'portal/components/Notification'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import useAPI from 'portal/utils/api'
import {wrapper} from 'portal/redux/store';
import useSWR from 'portal/utils/swr'
import {
    Grid,
    List,ListItem,ListItemText,
    Typography,
} from '@mui/material'

export const getServerSideProps = wrapper('login')

const styles=theme=>({
    secondaryAction:{
        paddingRight:96
    },
    scrollBar:{
        '& textarea':{
            cursor:'auto',
            '@media (hover: hover) and (pointer: fine)':{
                '&::-webkit-scrollbar':{
                    width:'.7em',
                    borderRadius:4
                },
                '&::-webkit-scrollbar-thumb':{
                    background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
                    borderRadius:4
                },
            }
        }
    },
})

const MyPermission=({classes,err,meta})=>{
    if(err) return <ErrorPage statusCode={err} />
    
    const {data,error}=useSWR(`/v1/developer/permissions/my-permissions`)

    return (
        <Header title='My Approved Permissions' active='permissions' subactive='my' canonical='/developer/permissions/my-permissions' noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12}>
                    <PaperBlock title="My Permissions" noPadding whiteBg>
                        {!data && !error ? (
                            <Skeleton type='list' number={3} />
                        ) : error || data?.error ? (
                            <center><Typography variant="h5">Failed load data</Typography></center>
                        ) : data?.scopes?.length ===0 ? (
                            <center><Typography variant="h5">No data</Typography></center>
                        ) : (
                            <List>
                                {data?.scopes?.map((dt,i)=>(
                                    <ListItem divider key={`list-${i}`}>
                                    <ListItemText
                                        primary={dt?.scope}
                                        secondary={dt?.description}
                                    />
                                </ListItem>
                                ))}
                            </List>
                        )}
                    </PaperBlock>
                </Grid>
            </Grid>
        </Header>
    )
}

export default withStyles(MyPermission,styles)