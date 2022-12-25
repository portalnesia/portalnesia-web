import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper from "@redux/store";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useSWR from "@design/hooks/swr";
import Stack from "@mui/material/Stack";
import { BoxPagination } from "@design/components/Pagination";
import { PaginationResponse } from "@design/hooks/api";
import SWRPages, { TableSWRPages } from "@comp/SWRPages";
import dynamic from "next/dynamic";
import { UserPagination } from "@model/user";
import { ReportDetail } from "@model/report";
import useTablePagination from "@design/hooks/TablePagination";
import Scrollbar from "@design/components/Scrollbar";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import ButtonBase from "@mui/material/ButtonBase";
import { getDayJs, href } from "@utils/main";
import { clean, parseURL, truncate } from "@portalnesia/utils";
import Link from "@design/components/Link";
import { Span } from "@design/components/Dom";
import Image from "@comp/Image";

const Dialog = dynamic(()=>import("@design/components/Dialog"));


export const getServerSideProps = wrapper(async({redirect,session,resolvedUrl})=>{
    if(!session || !session.user.isAdmin(undefined,true)) return redirect(); 
    return {
        props:{
            data:{}
        }
    }
})

type SelectedReport = ReportDetail & {
    system: {key: string,value: string}[]|null
}

export default function LogAdminPage() {
    const {page,rowsPerPage,...tablePagination} = useTablePagination(true);
    const {data:dataSWR,error} = useSWR<PaginationResponse<ReportDetail>>(`/v2/admin/report`);
    const [selected,setSelected] = React.useState<SelectedReport>();
    const [dialog,setDialog] = React.useState(false);

    const data = React.useMemo(()=>{
        return dataSWR?.data?.map(dt=>{
            const system = dt.system ? Object.entries(dt?.system).filter(d=>['boolean','number','string'].includes(typeof d[1]) || (typeof d[1] === 'object' && Array.isArray(d[1]))).map(([key,d])=>({
                key:key,
                value: typeof d === 'object' && Array.isArray(d) ? d.join(",") : clean(String(d)).replace(/\&\S+\;/gim," ")
            })) : null;
            const result: SelectedReport = {
                ...dt,
                system
            }
            return result;
        })
    },[dataSWR])

    const getNumber = React.useCallback((i:number)=>{
        return ((page-1)*rowsPerPage)+i+1
    },[page,rowsPerPage])

    const handleClick = React.useCallback((dt: SelectedReport)=>()=>{
        setSelected(dt);
        setDialog(true);
    },[])

    const closeDialog = React.useCallback(()=>setDialog(false),[]);

    return (
        <Pages title="Feedback & Report" canonical="/admin/logs">
            <DashboardLayout adminPage>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='h3' component='h1'>{`Feedback & Report`}</Typography>
                    </Stack>
                </Box>

                <Scrollbar>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>URL</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableSWRPages colSpan={4} loading={!data && !error} error={error}>
                                {data && data?.length > 0 ? data?.map((d,i)=>(
                                    <ButtonBase onClick={handleClick(d)} sx={{display:'table-row',verticalAlign:'middle',":hover":{bgcolor:'action.hover'}}} className="MuiTableRow-root MuiTableRow-head" key={`feedback-${d.id}`} component='tr'>
                                        <TableCell>{getNumber(i)}</TableCell>
                                        <TableCell sx={{textTransform:'capitalize'}}>{d.type}</TableCell>
                                        <TableCell>{getDayJs(d.timestamp).pn_format('full')}</TableCell>
                                        <TableCell><Link onClick={e=>{e.stopPropagation()}} href={href(d.url)}><Span>{truncate(parseURL(d.url),50)}</Span></Link></TableCell>
                                    </ButtonBase>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <BoxPagination>
                                                <Typography>No data</Typography>
                                            </BoxPagination>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableSWRPages>
                        </TableBody>
                    </Table>
                </Scrollbar>

                <Dialog open={dialog && selected!==undefined} handleClose={closeDialog} title={selected ? `ID #${selected.id}` : "Dialog"} content={{sx:{px:0}}}>
                    <Scrollbar>
                        {selected && (
                            <Stack alignItems="flex-start" spacing={2} width='100%'>
                                <Box px={{xs:2,sm:3}}>
                                    <Typography sx={{fontSize:14}}>Type</Typography>
                                    <Typography sx={{textTransform:'capitalize'}}>{selected.type}</Typography>
                                </Box>

                                <Box px={{xs:2,sm:3}}>
                                    <Typography sx={{fontSize:14}}>Message</Typography>
                                    <Typography>{selected.text||"-"}</Typography>
                                </Box>

                                <Box px={{xs:2,sm:3}} pt={2} borderBottom={theme=>`1px solid ${theme.palette.divider}`} pb={0.5} width='100%'>
                                    <Typography sx={{color:'text.disabled'}}>REPORT INFO</Typography>
                                </Box>

                                {selected.type === "konten" ? (
                                    <>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>Content Type</Typography>
                                            <Typography>{selected?.information?.konten?.type||"-"}</Typography>
                                        </Box>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>Content ID</Typography>
                                            <Typography>{selected?.information?.konten?.id||"-"}</Typography>
                                        </Box>
                                    </>
                                ) : selected.type === "api" ? (
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>API Endpoint</Typography>
                                            <Typography>{selected?.information?.api||"-"}</Typography>
                                        </Box>
                                ) : selected.type === "user" ? (
                                    <Box px={{xs:2,sm:3}}>
                                        <Typography sx={{fontSize:14}}>Reported User ID</Typography>
                                        <Typography>{selected?.information?.user||"-"}</Typography>
                                    </Box>
                                ) : selected.type === "komentar" ? (
                                    <>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>Comment ID</Typography>
                                            <Typography>{selected?.information?.komentar?.id}</Typography>
                                        </Box>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>Comment Text</Typography>
                                            <Typography>{selected?.information?.komentar?.comment}</Typography>
                                        </Box>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>{`Commenting User`}</Typography>
                                            {selected?.information?.komentar?.user?.username ? (
                                                <Link href={`/user/${selected?.information?.komentar?.user?.username}`}><Typography>{selected?.information?.komentar?.user?.name}</Typography></Link>
                                            ) : <Typography>{selected?.information?.komentar?.user?.name}</Typography>}
                                        </Box>
                                        <Box px={{xs:2,sm:3}}>
                                            <Typography sx={{fontSize:14}}>Comment Content Type</Typography>
                                            <Typography>{selected?.information?.komentar?.content?.type}</Typography>
                                        </Box>
                                    </>
                                ) : null}

                                <Box px={{xs:2,sm:3}}>
                                    <Typography sx={{fontSize:14}}>URL</Typography>
                                    <Link href={selected.url}><Typography>{truncate(parseURL(selected?.url),50)}</Typography></Link>
                                </Box>

                                {selected?.image && (
                                    <Box px={{xs:2,sm:3}} width='100%'>
                                        <Box mb={1} width='100%'>
                                            <Typography sx={{fontSize:14}}>Image</Typography>
                                        </Box>
                                        <Image className="image-container" src={`${selected?.image}&size=300`} dataSrc={`${selected?.image}&watermark=no`} fancybox dataFancybox={`image-${selected.id}`} sx={{width:'100%', maxHeight:400,objectFit:'contain'}} />
                                    </Box>
                                )}

                                <Box pt={2} px={{xs:2,sm:3}} borderBottom={theme=>`1px solid ${theme.palette.divider}`} pb={0.5} width='100%'>
                                    <Typography sx={{color:'text.disabled'}}>USER INFO</Typography>
                                </Box>

                                {!selected.user ? <Typography sx={{px:{xs:2,sm:3}}}>null</Typography> : (
                                    <>
                                        <Box px={{xs:2,sm:3}} key={'user-id'}>
                                            <Typography sx={{fontSize:14}}>{'ID'}</Typography>
                                            <Typography>{selected.user.id}</Typography>
                                        </Box>
                                        <Box px={{xs:2,sm:3}} key={'user-name'}>
                                            <Typography sx={{fontSize:14}}>{'Name'}</Typography>
                                            <Typography>{selected.user.name}</Typography>
                                        </Box>
                                        <Box px={{xs:2,sm:3}} key={'user-username'}>
                                            <Typography sx={{fontSize:14}}>{'Username'}</Typography>
                                            <Typography>{selected.user.username}</Typography>
                                        </Box>
                                    </>
                                )}

                                {selected.system && (
                                    <>
                                        <Box px={{xs:2,sm:3}} pt={2} borderBottom={theme=>`1px solid ${theme.palette.divider}`} pb={0.5} width='100%'>
                                            <Typography sx={{color:'text.disabled'}}>SYSTEM INFO</Typography>
                                        </Box>
                                        {selected.system.map(d=>(
                                            <Box px={{xs:2,sm:3}} key={d.key}>
                                                <Typography sx={{fontSize:14}}>{d.key}</Typography>
                                                <Typography>{d.value}</Typography>
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </Stack>
                        )}
                    </Scrollbar>
                </Dialog>
            </DashboardLayout>
        </Pages>
    )
}