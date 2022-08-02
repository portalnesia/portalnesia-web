import React from 'react'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import {useNotif} from 'portal/components/Notification'
import Button from 'portal/components/Button'
import ErrorPage from 'portal/pages/_error'
import {register} from 'portal/utils/webauthn'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import useSWR from 'portal/utils/swr';
import {getDayJs} from 'portal/utils/Main'
import {
    Grid,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment
} from '@mui/material'
import {Delete as DeleteIcon,Visibility,VisibilityOff} from '@mui/icons-material'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Backdrop = dynamic(()=>import('portal/components/Backdrop'))

export const getServerSideProps = wrapper('login')

const SecurityKey=({err})=>{
    if(err) return <ErrorPage statusCode={err} />

    const {post} = useAPI()
    const [loading,setLoading]=React.useState(false)
    const [disable,setDisable]=React.useState(true);
    const [dialog,setDialog]=React.useState(null)
    const [input,setInput]=React.useState("")
    const {setNotif}=useNotif()
    const [backdrop,setBackdrop]=React.useState(false)
    const [pass,setPass]=React.useState(false)
    const {data:initialData,error}=useSWR(`/v1/setting/security-key`);
    const [data,setData]=React.useState([]);
    
    React.useEffect(()=>{
        if(initialData) {
            const dt = initialData?.map(dt=>{
                const dates = getDayJs(dt?.timestamp);
                const day = dates.format("MMM DD, YYYY");
                const time = dates.format("HH:mm");
                const date = `${day}, ${time}`
                return {
                    ...dt,
                    date
                }
            })
            setData(dt)
        }
        if(initialData?.length >= 4) setDisable(true);
        else setDisable(false)
    },[initialData])

    const handleRegister=React.useCallback((challenge,token)=>{
        try {
            register(challenge,(sukses,err)=>{
                if(sukses) {
                    post(`/v1/setting/security-key`,{register:err,token},{},{success_notif:false}).then(([res])=>{
                        if(res) {
                            const dates = getDayJs(dt?.timestamp);
                            const day = dates.format("MMM DD, YYYY");
                            const time = dates.format("HH:mm");
                            const date = `${day}, ${time}`
                            const dt = {
                                ...res,
                                date
                            }
                            const b=[dt];
                            const c=b.concat(data)
                            if(c?.length >= 4) setDisable(true);
                            else setDisable(false)
                            setData(c)
                        }
                        setNotif("Registration completed successfully",false)
                        setBackdrop(false)
                    }).catch((err)=>{
                        setBackdrop(false)
                    })
                } else {
                    setBackdrop(false)
                    setNotif(err,true)
                }
            })
        } catch (err) {
            console.log(err);
            setBackdrop(false)
            setNotif(typeof err?.message === 'string' ? err?.message : "Something went wrong",true)
        }
    },[post,data])

    const handleAdd=React.useCallback((password)=>{
        setLoading(true)
        post(`/v1/setting/security-key/prepare-register`,{password},{},{success_notif:false}).then(([res])=>{
            setLoading(false)
            setDialog(null)
            setBackdrop(true)
            handleRegister(res.challenge,res?.token);
        }).catch((err)=>{
            setLoading(false)
        })
    },[post,handleRegister])

    const handleDelete=React.useCallback((password)=>{
        setLoading(true)
        post(`/v1/setting/security-key/delete`,{password,id:dialog?.id}).then(([res])=>{
            setLoading(false)
            const id=data.findIndex(d=>d?.id == dialog?.id);
            if(id > -1) {
                const a = data;
                a.splice(id,1);
                if(a?.length >= 4) setDisable(true);
                else setDisable(false)
                setData(a)
            }
            setDialog(null)
        }).catch((err)=>{
            setLoading(false)
        })
    },[post,dialog?.id,data])

    const handleConfirm=React.useCallback(()=>{
        if(dialog?.type==='add') handleAdd(input)
        else if(dialog?.type==='delete') handleDelete(input)
    },[dialog?.type,input,handleAdd,handleDelete])

    return (
        <Header active='setting' subactive='security_key' title="Security Key" canonical='/setting/security-key' noIndex>
            <Grid container justifyContent='center'>
                <Grid item xs={12} md={10} lg={8}>
                    <PaperBlock title="Security Key" noPadding divider={false} whiteBg
                    footer={
                        <Button disabled={disable} onClick={()=>setDialog({type:'add'})} icon='add'>Add</Button>
                    }
                    >
                        <div style={{overflowX:'auto'}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Devices</TableCell>
                                        <TableCell>Added</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {!data && !error ? (
                                        <TableRow key='information'>
                                            <TableCell align='center' colSpan={3}>
                                                <CircularProgress thickness={5} size={50}/>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow key='information'>
                                            <TableCell align="center" colSpan={3}>{error}</TableCell>
                                        </TableRow>
                                    ) : initialData && initialData?.length > 0 ? (
                                        <>
                                            {data?.length >= 4 && (
                                                <TableRow key='information'>
                                                    <TableCell align="center" colSpan={3}>You have added the maximum number of security keys</TableCell>
                                                </TableRow>
                                            )}
                                            {data?.map((dt,i)=>(
                                                <TableRow key={`data-${i}`}>
                                                    <TableCell>{dt?.device}</TableCell>
                                                    <TableCell>{dt?.date}</TableCell>
                                                    <TableCell align='right'>
                                                        <IconButton onClick={()=>setDialog({type:'delete',id:dt?.id})} size="large">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    )
                                    : 
                                    (
                                        <TableRow key='information'>
                                            <TableCell align="center" colSpan={3}>You have not added a security key</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </PaperBlock>
                </Grid>
            </Grid>
            <Backdrop open={backdrop} />
            <Dialog
                open={dialog!==null}
                aria-labelledby='dialog'
                TransitionProps={{
                    onExited: ()=>setInput("")
                }}>
                <DialogTitle>Type Your Password</DialogTitle>
                <DialogContent dividers>
                    <FormControl variant="outlined" disabled={loading} fullWidth>
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={pass ? 'text' : 'password'}
                            value={input}
                            onChange={(e)=>setInput(e.target.value)}
                            autoFocus
                            labelWidth={80}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={()=>setPass(!pass)}
                                    onMouseDown={e=>e.preventDefault()}
                                    edge="end"
                                    size="large">
                                    {pass ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                            }
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading} loading={loading} onClick={handleConfirm} icon='submit'>Submit</Button>
                    <Button outlined disabled={loading} onClick={()=>setDialog(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Header>
    );
}

export default SecurityKey