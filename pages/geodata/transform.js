import React from 'react'
import Header from 'portal/components/Header'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import PaperBlock from 'portal/components/PaperBlock'
import {AdsRect} from 'portal/components/Ads'
import ErrorPage from 'portal/pages/_error'
import {wrapper} from 'portal/redux/store'
import useAPI from 'portal/utils/api'
import {Close as CloseIcon} from '@mui/icons-material'
import {Grid,IconButton,CircularProgress,Typography,TextField,Divider,FormControlLabel,FormGroup,Switch, InputAdornment} from '@mui/material'
import { Pagination } from '@mui/material';
import useSWR from 'portal/utils/swr'
import dynamic from 'next/dynamic'
import ReCaptcha from 'portal/components/ReCaptcha'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableHead=dynamic(()=>import('@mui/material/TableHead'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))

export const getServerSideProps = wrapper(()=>({props:{}}))

const useData=(pg,search)=>{
    return useSWR(`/v1/geodata/epsg?page=${pg}&q=${encodeURIComponent(search)}`);
}

const GeoTransform=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const {post} = useAPI()
    const [srcEpsg,setSrcEpsg]=React.useState({from:'4326',to:'4326'})
    const [textEpsg,setTextEpsg]=React.useState({from:'WGS 84 (EPSG:4326)',to:'WGS 84 (EPSG:4326)'})
    const [switchVal,setSwitch]=React.useState({switch:false,add_input:false})
    const [input,setInput]=React.useState("")
    const [output,setOutput]=React.useState("")
    const [loading,setLoading]=React.useState(false)
    const {setNotif}=useNotif()
    const [dialog,setDialog]=React.useState(null)
    const [page,setPage]=React.useState(1)
    const [search,setSearch]=React.useState("")
    const [cari,setCari]=React.useState("");
    const {data,error}=useData(page,cari);
    const captchaRef=React.useRef(null)

    const openDialog=(type)=>{
        //setLoadingData(true)
        setDialog(type)
        setPage(1)
        //getData(1)
    }

    const closeDialog=()=>{
        setDialog(null)
        setPage(1)
        setSearch("")
    }

    const handleSearch=(e)=>{
        e.preventDefault();
        setPage(1)
        setCari(search)
        //getData(1);
    }

    const removeSearch=()=>{
        setCari("")
        setSearch("")
        setPage(1)
    }

    const handlePagination=(event,value)=>{
        setPage(value);
    }

    const handleDataClick=(type,dt)=>{
        if(type==='input') {
            setSrcEpsg({
                ...srcEpsg,
                from:dt.code
            })
            setTextEpsg({
                ...textEpsg,
                from:`${dt.name} (EPSG:${dt.code})`
            })
            closeDialog()
        } else {
            setSrcEpsg({
                ...srcEpsg,
                to:dt.code
            })
            setTextEpsg({
                ...textEpsg,
                to:`${dt.name} (EPSG:${dt.code})`
            })
            closeDialog()
        }
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true)
        const payload={
            ...switchVal,
            ...srcEpsg,
            input:input
        }
        try {
            const recaptcha = await captchaRef.current?.execute();
            const [res] = await post(`/v1/geodata/transform-coordinates`,{...payload,recaptcha});
            if(res?.length) setOutput(res?.join("\n"));
            setLoading(false)
        } catch {
            setLoading(false)
        }
    }

    return (
        <Header iklan title="Transform Coordinate - Geodata" desc={`On-line tool to insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection. You can insert value pairs to the text area labeled as "Input coordinate pairs" - also by using copy/paste even from MS Excell or similar programs. This tool accepts various input formats of value pairs - only what you need is to have one pair by a row.\nIt is necessary to set appropriate input coordinate system and to set desired output coordinate system to which you want to transform the input coordinate pairs.`} active='geodata' subactive='transform' canonical="/geodata/transform">
            <PaperBlock title="Transform Coordinate" whiteBg
            desc={
                <div>
                    <p>This on-line tool allows you to insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection. You can insert value pairs to the text area labeled as "Input coordinate pairs" - also by using copy/paste even from MS Excell or similar programs. This tool accepts various input formats of value pairs - only what you need is to have one pair by a row. Please see examples in the input text area window.</p>
                    <p>It is necessary to set appropriate input coordinate system and to set desired output coordinate system to which you want to transform the input coordinate pairs.</p>
                </div>
            }
            >   
                <form onSubmit={handleSubmit}>
                    <div key='divider-0' style={{margin:'20px 0'}}><Divider /></div>
                    <Grid key='grid-container-0' container spacing={2}>
                        <Grid key='grid-0' item xs={12} md={6}>
                            <div>
                                <Typography key='in-title' variant='h5' component='h3'>Input Coordinate System / Projection</Typography>
                                <Typography key='in-text' gutterBottom>{textEpsg.from}</Typography>
                                <Button key='in-btn' outlined onClick={()=>openDialog('input')}>Choose input coordinate system</Button>
                            </div>
                        </Grid>
                        <Grid key='grid-1' item xs={12} md={6}>
                            <div>
                                <Typography variant='h5' component='h3' key='out-title'>Output Coordinate System / Projection</Typography>
                                <Typography key='out-text' gutterBottom>{textEpsg.to}</Typography>
                                <Button key='out-btn' outlined onClick={()=>openDialog('output')}>Choose output coordinate system</Button>
                            </div>
                        </Grid>
                    </Grid>
                    <div key='divider-1' style={{margin:'20px 0'}}><Divider /></div>
                    <Grid key='grid-container-1' container spacing={2}>
                        <Grid key='grid-2' item xs={12} md={6}>
                            <Typography variant='h6' component='span' gutterBottom>Input Coordinate Pairs*</Typography>
                            <TextField
                                key='input-text'
                                //InputLabelProps={{ shrink: true, classes: inputLabelStyles }}
                                //InputProps={{ classes: inputBaseStyles, disableUnderline: true }}
                                fullWidth
                                required
                                value={input}
                                onChange={e=>setInput(e.target.value)}
                                multiline
                                rows={15}
                                maxRows={40}
                                margin={'normal'}
                                disabled={loading}
                                variant="outlined"
                                placeholder="Decimal values formats, example:&#13;&#10;18.5;54.2&#13;&#10;113.4 46.78&#13;&#10;16.9,67.8&#13;&#10;&#13;&#10;Geodetic or GPS formats, example:&#13;&#10;41°26'47&quot;N 71°58'36&quot;W&#13;&#10;42d26'47&quot;N;72d58'36&quot;W&#13;&#10;43d26'46&quot;N,73d56'55&quot;W"
                            />
                            <FormGroup key='input-switch'>
                                <FormControlLabel control={
                                    <Switch disabled={loading} checked={switchVal.switch} onChange={event=>setSwitch({...switchVal,switch:event.target.checked})} color="primary" />
                                }
                                label="Switch X <--> Y" />
                            </FormGroup>
                        </Grid>
                        <Grid key='grid-3' item xs={12} md={6}>
                            <Typography variant='h6' component='span' gutterBottom>Output Coordinate Pairs</Typography>
                            <TextField
                                key='output-text'
                                //InputLabelProps={{ shrink: true, classes: inputLabelStyles }}
                                //InputProps={{ classes: inputBaseStyles, disableUnderline: true }}
                                fullWidth
                                inputProps={{readonly:true}}
                                value={output}
                                multiline
                                rows={15}
                                maxRows={40}
                                variant="outlined"
                                margin={'normal'}
                            />
                            <FormGroup key='output-switch'>
                                <FormControlLabel control={
                                    <Switch disabled={loading} checked={switchVal.add_input} onChange={event=>setSwitch({...switchVal,add_input:event.target.checked})} color="primary" />
                                }
                                label="Include input coordinates" />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <div key='divider-2' style={{margin:'20px 0'}}><Divider /></div>
                    <Grid key='grid-container-2' container spacing={2}>
                        <Grid key='grid-4' item xs={12}>
                            <Typography variant='body1'><strong>Beware!</strong> Inserted values pairs needs to be in order X-coordinate and then Y-coordinate. If you are inserting latitude/longitude values in decimal format, then the longitude should be first value of the pair (X-coordinate) and latitude the second value (Y-coordinate). Otherwise you can use choice "Switch XY" bellow the input text area window.</Typography>
                        </Grid>
                        <Grid key='grid-5' item xs={12}>
                            <AdsRect />
                            <div style={{textAlign:'center'}}>
                                <Button type='submit' size='large' disabled={loading} loading={loading} icon='submit'>Transform</Button>
                            </div>
                        </Grid>
                    </Grid>
                </form>
            </PaperBlock>
            <Dialog open={dialog!==null} aria-labelledby='add-dialog' maxWidth='md' fullWidth scroll='body'>
                <DialogTitle>
                    <div class='flex-header'>
                        <Typography component='h2' variant='h6'>Coordinate Reference System</Typography>
                        <IconButton onClick={closeDialog} size="large">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    <div key='form-search' style={{marginBottom:10}}>
                        <form onSubmit={handleSearch}>
                            <TextField
                                fullWidth
                                variant='outlined'
                                value={search}
                                onChange={e=>setSearch(e.target.value)}
                                placeholder="Type EPSG or name or area to search..."
                                {...(search.length>0 ? {
                                    InputProps:{
                                        endAdornment:(
                                            <InputAdornment position='end'>
                                                <IconButton
                                                    onMouseDown={e=>e.preventDefault()}
                                                    edge="end"
                                                    onClick={removeSearch}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                } : {})}
                            />
                        </form>
                    </div>
                    <div style={{overflowX:'auto'}} key="table">
                        <Table aria-label="URL table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>EPSG</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Area of Use</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!data && !error ? (
                                    <TableRow>
                                        <TableCell align="center" colSpan={3}><CircularProgress thickness={5} size={50}/></TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell align="center" colSpan={3}>{error}</TableCell>
                                    </TableRow>
                                ) : data?.data?.map((ep,i)=>(
                                    <TableRow key={`row-${i}`} hover role="button" style={{cursor:'pointer'}} onClick={()=>handleDataClick(dialog,ep)}>
                                        <TableCell>{ep?.code}</TableCell>
                                        <TableCell>{ep?.name}</TableCell>
                                        <TableCell>{ep?.area}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div key='div-footer' style={{marginTop:17}}>
                        <Pagination color='primary' count={data?.total_page || 1} page={page||1} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                    </div>
                </DialogContent>
            </Dialog>
            <ReCaptcha ref={captchaRef} />
        </Header>
    );
}

export default GeoTransform