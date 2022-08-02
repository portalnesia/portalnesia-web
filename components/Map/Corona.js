import React from 'react'
import icon from './Icon'
import {Map as LMap} from 'leaflet'
import GestureHandler from './GestureHandler'
import {useMap} from 'react-leaflet'
import NProgress from 'nprogress'
import PaperBlock from '../PaperBlock';
import {useNotif} from 'portal/components/Notification'
import Button from 'portal/components/Button'
import {ReportAction} from 'portal/components/Action'
import Images from 'portal/components/Image'
import {connect} from 'react-redux'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import {numberFormat} from '@portalnesia/utils'
import useAPI from 'portal/utils/api'
import {styled} from '@mui/material/styles'
import {Typography as TypeFont,CircularProgress} from '@mui/material'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-markercluster/dist/styles.min.css'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Table=dynamic(()=>import('@mui/material/Table'))
const TableBody=dynamic(()=>import('@mui/material/TableBody'))
const TableRow=dynamic(()=>import('@mui/material/TableRow'))
const TableHead=dynamic(()=>import('@mui/material/TableHead'))
const TableCell=dynamic(()=>import('@mui/material/TableCell'))
const Map = dynamic(()=>import('react-leaflet').then(m=>m.MapContainer));
const Marker = dynamic(()=>import('react-leaflet').then(m=>m.Marker));
const TileLayer = dynamic(()=>import('react-leaflet').then(m=>m.TileLayer));
const Popup = dynamic(()=>import('react-leaflet').then(m=>m.Popup));
const FeatureGroup = dynamic(()=>import('react-leaflet').then(m=>m.FeatureGroup));
const Fullscreen = dynamic(()=>import('./Fullscreen'));
const MarkerClusterGroup = dynamic(()=>import('react-leaflet-markercluster'));

const Div = styled('div')(({theme})=>({
    [theme.breakpoints.down('sm')]: {
        paddingLeft:theme.spacing(2),
        paddingRight:theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
        paddingLeft:theme.spacing(3),
        paddingRight:theme.spacing(3)
    }
}))

const Typography = styled(TypeFont)(()=>({
    marginTop:'0 !important'
}))

if(typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts)
}

function GetMapRef({getMap}) {
    const map = useMap();
    React.useEffect(()=>{
        getMap && getMap(map)
    },[getMap,map])
    return null;
}

const MapCoronaa=({user,error: errors,data})=>{
    const [globalRef,setGlobalRef]=React.useState(null)
    const [indoRef,setIndoRef]=React.useState(null)
    const [loading,setLoading]=React.useState(true)
    const [globalMap,setGlobalMap]=React.useState([])
    const [indoMap,setIndoMap]=React.useState([])
    const [indoGrafik,setIndoGrafik]=React.useState({})
    const [latLngBounds,setLatLngBounds]=React.useState({global:null,indo:null});
    const {setNotif}=useNotif()
    const [total,setTotal]=React.useState({})
    const [optGrafik,setOptGrafik]=React.useState(null)
    const [image,setImage]=React.useState(null)
    const [imageURL,setImageURL]=React.useState(null)
    const [dialog,setDialog]=React.useState(false)
    const [loadingDown,setLoadingDown]=React.useState(false)
    const [error,setError]=React.useState(false)
    const [errorGrafik,setErrorGrafik] = React.useState(false);
    const [errorIndo,setErrorIndo] = React.useState(false);
    const [errorGlobal,setErrorGlobal] = React.useState(false);
    const [others,setOthers]=React.useState({})
    const {post} = useAPI()
    const grafikRef=React.useRef(null)

    const pointMarker=icon({
        icon:'circle',
        markerColor:'darkred'
    })

    const handlerAddGlobal=(e)=>{
        const bound=e.target.getBounds();
        const latLng=latLngBounds?.global===null ? bound : latLngBounds?.global;
        if(latLngBounds!==null) {
            latLng.extend(bound);
        }
        setLatLngBounds({
            ...latLngBounds,
            global:latLng
        });
        globalRef?.fitBounds(latLng);
    }

    const handlerAddIndo=(e)=>{
        const bound=e.target.getBounds();
        const latLng=latLngBounds?.indo===null ? bound : latLngBounds?.indo;
        if(latLngBounds!==null) {
            latLng.extend(bound);
        }
        setLatLngBounds({
            ...latLngBounds,
            indo:latLng
        });
        indoRef?.fitBounds(latLng);
    }

    React.useEffect(()=>{
        if(globalMap.length===0 && data) {
            if(data?.corona?.data_indo && data?.corona?.data_indo?.length > 0) setIndoMap(data?.corona?.data_indo) 
            else setErrorIndo(true);
            
            if(data?.corona?.others) setOthers(data?.corona?.others)
            else setErrorIndo(true);
            
            setIndoGrafik(data?.corona?.grafik)
            setTotal(data?.corona?.total)
            setGlobalMap(data?.corona?.data)

            setLoading(false);
        }
        if(errors) {
            setError(true)
        }
    },[errors,data,globalMap])

    React.useEffect(()=>{
        LMap.addInitHook("addHandler", "gestureHandling", GestureHandler);

        /*if(globalMap.length===0) {
            const event= new EventSource(`${process.env.APP_URL}/siam/stream/coronav2.php?token=${token.token}&expire=${token.expire}`);
            event.onerror=(e)=>{
                console.log(e);
                NProgress.done()
                setError(true)
                setNotif("Something went wrong",true);
                event.close();
            }
            event.onopen=()=>{
                NProgress.start();
                NProgress.set(0.0);
            }
            event.onmessage = (e)=>{
                const data=JSON.parse(e.data);
                if (e.lastEventId=="CLOSE") {
                    event.close();
                    if(data?.data_indo && data?.data_indo?.length > 0) setIndoMap(data?.data_indo) 
                    else setErrorIndo(true);
                    setGlobalMap(data?.data)
                    setIndoGrafik(data?.grafik)
                    setTotal(data?.total)
                    if(data?.others) setOthers(data?.others)
                    else setErrorIndo(true);

                    setLoading(false)
                    NProgress.done()
                } else {
                    const progress=(data.progress/100);
                    NProgress.set(progress);
                }
            }
            return()=>{
                if(event.readyState!==2) event.close()
            }
        }*/
    },[])

    React.useEffect(()=>{
        if(indoGrafik?.active && indoGrafik?.active?.length > 0 && optGrafik === null) {
            const gr=document.getElementById('grafikIndo');
            const width=gr?.clientWidth||gr?.offsetWidth;
            const option={
                chart: {
                    type: "line",
                    style: {
                        fontFamily: "serif"
                    }
                },
                exporting: {
                    enabled: !1
                },
                credits: {
                    enabled: !1
                },
                title: {
                    text: "Grafik COVID-19 Indonesia, " + indoGrafik.periode,
                    style: {
                        color: "#000000",
                        fontSize: "18px",
                        fontWeight: "bold"
                    }
                },
                    subtitle: {
                    text: `${process.env.URL}/corona`
                },
                xAxis: {
                    type: "datetime",
                    dateTimeLabelFormats: {
                        day: "%e %b"
                    },
                    labels: {
                        style: {
                            color: "#000000"
                        }
                    },
                    crosshair: {
                        width: Math.round(width / indoGrafik.total.length),
                        color: "rgba(204,214,235,0.25)"
                    }
                },
                yAxis: {
                    title: {
                        text: "Kasus (orang)"
                    },
                    labels: {
                        style: {
                            color: "#000000"
                        }
                    }
                },
                plotOptions: {
                    line: {
                        cursor: "pointer",
                            dataLabels: {
                                enabled: !0,
                                crop: 0,
                                overflow: 'allow',
                                format: "{point.y}"
                            },
                        marker: {
                            enabled: !0,
                            symbol: "circle",
                            radius: 4,
                            states: {
                                hover: {
                                    enabled: !0
                                }
                            }
                        }
                    }
                },
                tooltip: {
                    split: !0,
                    formatter: function() {
                        return ['<p style="font-weight: 600;font-size:16px;color:#000">' + Highcharts.dateFormat("%e %B %Y", new Date(this.x)) + "</p>"].concat(this.points ? this.points.map(function(t) {
                            return '<span style="margin-right:2px;font-size:15px;color:#000">' + t.series.name + ':</span>  <span style="font-weight: 600;margin-right:2px;font-size:15px;color:#000">' + numberFormat(t.y,".") + "</span>"
                        }) : [])
                    }
                },
                series: [{
                    data: indoGrafik.total,
                    name: "Total positif",
                    pointStart: indoGrafik.time[0],
                    pointInterval: 864e5
                }, {
                    data: indoGrafik.active,
                    name: "Dalam perawatan",
                    color: "#000000",
                    pointStart: indoGrafik.time[0],
                    pointInterval: 864e5
                }, {
                    data: indoGrafik.recovered,
                    name: "Sembuh",
                    color: "#228B22",
                    pointStart: indoGrafik.time[0],
                    pointInterval: 864e5
                }, {
                    data: indoGrafik.deaths,
                    name: "Meninggal",
                    color: "#dc3545",
                    pointStart: indoGrafik.time[0],
                    pointInterval: 864e5
                }]
            }
            setOptGrafik(option)
        } else {
            if(!loading) setErrorGrafik(true)
        }
    },[indoGrafik,loading,optGrafik])

    const handleDownload=()=>{
        setLoadingDown(true)
        //return console.log(grafikRef?.current?.chart?.getSVG());
        if(image===null) {
            let ctx,
            canvas = document.getElementById("canvasDownloadGrafik");
            const renderImage=()=>{
                const t=canvas.toDataURL();
                for (var e, a = atob(t.split(",")[1]), n = new ArrayBuffer(a.length), o = new Uint8Array(n), i = 0; i < a.length; i++) o[i] = 255 & a.charCodeAt(i);
                try {
                    e = new Blob([n], {
                        type: "image/png"
                    })
                } catch (t) {
                    var r = new(window.WebKitBlobBuilder || window.MozBlobBuilder);
                    r.append(n), e = r.getBlob("image/png")
                }
                const urll = (window.webkitURL || window.URL).createObjectURL(e);
                setImage(t);
                setImageURL(urll)
                setDialog(true)
            }
            const drawFrame=()=>{
                let t = new Image;
                t.src = "/content/Video.png", t.onload = function() {
                    ctx.drawImage(t, 0, 0, canvas.width, canvas.height), ctx.fillStyle = 'black', ctx.font = "22px sans-serif";
                    ctx.fillText("Dalam perawatan: " + total?.indonesia?.active||"-", 630, 47);
                    ctx.fillText("Meninggal: " + total?.indonesia?.deaths||"-", 630, 47+(27*1));
                    ctx.fillText("Sembuh: " + total?.indonesia?.recovered||"-", 630, 47+(27*2));
                    ctx.fillText("Tingkat kematian: "+total?.indonesia?.fatality_rate||"-", 630, 47+(27*3));
                    ctx.fillText("Total: " + total?.indonesia?.total||"-", 630, 47+(27*4));
                    renderImage()
                }
            }
            const drawPic=()=>{
                let t, e,a = grafikRef?.current?.chart?.getSVG(),
                n = new Blob([a], {
                    type: "image/svg+xml;charset=utf-8"
                }),
                o = self.URL || self.webkitURL || self,
                i = o.createObjectURL(n),
                r = 1,
                l = Math.round("750" * r);
                ctx = canvas.getContext("2d"), l > 750 ? (r = 750 / l, e = Math.round(l * r)) : e = l, t = 500 - e / 2 + 45;
                let s = new Image;
                s.src = i, s.onload = function() {
                    ctx.fillStyle = "white", ctx.fillRect(0, 0, canvas.width, canvas.height), ctx.drawImage(s, 0, t, 1e3, e), o.revokeObjectURL(i), drawFrame()
                }
            }
            drawPic();
        } else {
            setDialog(true)
        }
    }

    const handleSaveServer=()=>{
        setLoadingDown(true)
        const form = new FormData();
        form.append('data',image);
        post(`/v1/internal/corona`,form,{headers:{'Content-Type':'multipart/form-data'}}).then(()=>{
            setLoadingDown(false)
        }).catch((err)=>{
            setLoadingDown(false)
            setNotif(err?.msg||"Something went wrong",true)
        })
    }

    const onTileLoad=React.useCallback(()=>{
        const divs = document.querySelectorAll("a[href='https://leafletjs.com']");
        if(divs.length > 0) {
            divs.forEach(d=>{
                d.target = '_blank';
                d.rel = "noopener noreferrer nofollow"
            })
        }
    },[])

    return <>
        <PaperBlock title="Grafik Indonesia" noPadding whiteBg>
            <div id='grafikIndo'>
                {optGrafik?.chart ? (
                    <div>
                        <HighchartsReact ref={grafikRef} highcharts={Highcharts} options={optGrafik} />
                        <Div style={{marginTop:10}}>
                            <Typography>Sumber: covid19.go.id</Typography>
                        </Div>
                        <Div style={{marginTop:15,display:'flex'}}>
                            <Button disabled={loadingDown} onClick={handleDownload} loading={loadingDown} icon='download'>Download</Button>
                            {user?.admin===true && image!==null && (
                                <Button disabled={loadingDown} style={{marginLeft:15}} color='secondary' onClick={handleSaveServer}>Save to server</Button>
                            )}
                        </Div>
                    </div>
                ) : error || errorGrafik ? (
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <Typography variant="h5">Failed to load data</Typography>
                    </div>
                ) : (
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <CircularProgress thickness={5} size={50}/>
                    </div>
                )}
                <canvas id="canvasDownloadGrafik" style={{display:'none'}} width={1000} height={1000}></canvas>
            </div>
        </PaperBlock>
        <PaperBlock title="Indonesia Map" noPadding whiteBg>
            {loading ? (
                <div style={{margin:'20px auto',textAlign:'center'}}>
                    <CircularProgress thickness={5} size={50}/>
                </div>
            ) : error || errorIndo ? (
                <div style={{margin:'20px auto',textAlign:'center'}}>
                    <Typography variant="h5">Failed to load data</Typography>
                </div>
            ) : (
                <div>
                    {others?.data && (
                        <div key={'indo-0'} style={{overflowX:'auto'}}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Total ODP</TableCell>
                                        <TableCell>{others?.data?.odp}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total PDP</TableCell>
                                        <TableCell>{others?.data?.pdp}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total Spesimen</TableCell>
                                        <TableCell>{others?.data?.spesimen}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total Spesimen Negatif</TableCell>
                                        <TableCell>{others?.data?.spesimen_negatif}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {others?.new_case && (
                        <div key={'indo-1'} style={{overflowX:'auto'}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} align="center"><strong>PENAMBAHAN KASUS</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Dalam Perawatan</TableCell>
                                        <TableCell>{others?.new_case?.active}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Sembuh</TableCell>
                                        <TableCell>{others?.new_case?.recovered}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Meninggal</TableCell>
                                        <TableCell>{others?.new_case?.deaths}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Positif</TableCell>
                                        <TableCell>{others?.new_case?.total}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div key={'indo-2'} style={{overflowX:'auto'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} align="center"><strong>TOTAL</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Dalam Perawatan</TableCell>
                                    <TableCell>{total?.indonesia?.active||"-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Sembuh</TableCell>
                                    <TableCell>{total?.indonesia?.recovered||"-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Meninggal</TableCell>
                                    <TableCell>{total?.indonesia?.deaths||"-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Positif</TableCell>
                                    <TableCell>{total?.indonesia?.total||"-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tingkat kematian</TableCell>
                                    <TableCell>{total?.indonesia?.fatality_rate||"-"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <Map center={[-7.978884, 112.625351]} zoom={5} zoomControl={true} style={{height:'80vh',width:'100%'}} gestureHandling={true}>
                        <GetMapRef getMap={setIndoRef} />
                        <Fullscreen />
                        <TileLayer 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a target=&quot;_blank&quot; rel=&quot;noopener noreferrer nofollow&quot; href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors | &copy; <a rel=&quot;noopener noreferrer&quot; target=&quot;_blank&quot; href=&quot;https://portalnesia.com&quot;>Portalnesia</a>"
                            eventHandlers={{
                                load:onTileLoad
                            }}
                        />
                        <FeatureGroup onAdd={handlerAddIndo}>
                            <MarkerClusterGroup>
                                {indoMap.map((dt,i)=>{
                                    if(dt?.lat!==null && dt?.long!==null) {
                                        return (
                                        <Marker key={`indomap-${i}`} position={[dt?.lat,dt?.long]} icon={pointMarker}>
                                            <Popup>
                                                <Typography variant='h5' component='h4'>{dt?.provinsi}</Typography>
                                                <Typography style={{margin:0}}>{`Dalam perawatan: ${dt?.active}`}</Typography>
                                                <Typography style={{margin:0}}>{`Sembuh: ${dt?.recovered}`}</Typography>
                                                <Typography style={{margin:0}}>{`Meninggal: ${dt?.deaths}`}</Typography>
                                                {dt?.gender?.male && (
                                                    <Typography style={{margin:0}}>{`Laki-laki: ${dt?.gender?.male}`}</Typography>
                                                )}
                                                {dt?.gender?.female && (
                                                    <Typography style={{margin:0}}>{`Perempuan: ${dt?.gender?.female}`}</Typography>
                                                )}
                                                {dt?.new_case?.total && (
                                                    <>
                                                        <Typography style={{margin:0}}>Penambahan Kasus</Typography>
                                                        <Typography style={{margin:0}}>&nbsp;&nbsp;&nbsp;{`Positif: ${dt?.new_case?.total}`}</Typography>
                                                        <Typography style={{margin:0}}>&nbsp;&nbsp;&nbsp;{`Sembuh: ${dt?.new_case?.recovered}`}</Typography>
                                                        <Typography style={{margin:0}}>&nbsp;&nbsp;&nbsp;{`Meninggal: ${dt?.new_case?.deaths}`}</Typography>
                                                    </>
                                                )}
                                                <Typography style={{marginTop:'0 !important'}} gutterBottom>{`Tingkat kematian: ${dt?.fatality_rate}`}</Typography>
                                                <Typography variant='h6' component='h6' style={{margin:0}}>{`Total: ${dt?.total}`}</Typography>
                                            </Popup>
                                        </Marker>
                                    )
                                }
                                return null;
                            })}
                            </MarkerClusterGroup>
                        </FeatureGroup>
                    </Map>
                    <Div style={{marginTop:10}}>
                        <Typography>Sumber: covid19.go.id</Typography>
                    </Div>
                </div>
            )}
        </PaperBlock>
        {globalMap !== null && (
            <PaperBlock title="Global Map" noPadding whiteBg
            action={<ReportAction />}
            >
                {loading ? (
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <CircularProgress thickness={5} size={50}/>
                    </div>
                ) : error || errorGlobal ? (
                    <div style={{margin:'20px auto',textAlign:'center'}}>
                        <Typography variant="h5">Failed to load data</Typography>
                    </div>
                ) : (
                    <div>
                        <div>
                            <center><Typography variant='h6' component='h5' gutterBottom>{`TOTAL: ${total?.global?.total}`}</Typography></center>
                            <div style={{overflowX:'auto'}}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Dalam perawatan</TableCell>
                                            <TableCell>{total?.global?.active}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sembuh</TableCell>
                                            <TableCell>{total?.global?.recovered}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Meninggal</TableCell>
                                            <TableCell>{total?.global?.deaths}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Tingkat kematian</TableCell>
                                            <TableCell>{total?.global?.fatality_rate}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <Map center={[-7.978884, 112.625351]} zoom={1} zoomControl={true} style={{height:'80vh',width:'100%'}} gestureHandling={true}>
                            <GetMapRef getMap={setGlobalRef} />
                            <Fullscreen />
                            <TileLayer 
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot; href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors | &copy; <a rel=&quot;noopener noreferrer&quot; target=&quot;_blank&quot; href=&quot;https://portalnesia.com&quot;>Portalnesia</a>"
                                eventHandlers={{
                                    load:onTileLoad
                                }}
                            />
                            <FeatureGroup onAdd={handlerAddGlobal}>
                                <MarkerClusterGroup>
                                    {globalMap.map((dt,i)=>(
                                        <Marker key={`globalmap-${i}`} position={[dt?.Lat,dt?.Lon]} icon={pointMarker}>
                                            {dt?.Lat!==null && dt?.Lon!==null && (
                                                <Popup>
                                                    <Typography variant='h5' component='h4'>{dt?.Country}</Typography>
                                                    <Typography style={{margin:0}}>{`Dalam perawatan: ${dt?.TotalActive}`}</Typography>
                                                    <Typography style={{margin:0}}>{`Sembuh: ${dt?.TotalRecovered}`}</Typography>
                                                    <Typography style={{margin:0}}>{`Meninggal: ${dt?.TotalDeaths}`}</Typography>
                                                    <Typography style={{marginTop:'0 !important'}} gutterBottom>{`Tingkat kematian: ${dt?.fatality_rate}`}</Typography>
                                                    <Typography variant='h6' component='h6' style={{margin:0}}>{`Total: ${dt?.TotalConfirmed}`}</Typography>
                                                    <Typography style={{margin:0,fontSize:14}} component='span'>{`Update ${dt?.Date}`}</Typography>
                                                </Popup>
                                            )}
                                        </Marker>
                                    ))}
                                </MarkerClusterGroup>
                            </FeatureGroup>
                        </Map>
                        <Div style={{marginTop:10}}>
                            <Typography>Sumber: systems.jhu.edu</Typography>
                        </Div>
                    </div>
                )}
            </PaperBlock>
        )}
        <Dialog
            open={dialog}
            maxWidth='sm'
            fullWidth
            scroll='body'
            TransitionProps={{
                onEnter: ()=>setLoadingDown(false)
            }}>
            {dialog && (
                <>
                    <DialogTitle>Download Grafik</DialogTitle>
                    <DialogContent dividers>
                        <div style={{display:'flex',justifyContent:'center'}}>
                            <Images blured src={image} style={{width:'100%',maxWidth:300}} />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button color='secondary' sx={{mr:1}} onClick={()=>setDialog(false)}>Cancel</Button>
                        <a href={imageURL} download={`Grafik Indonesia (COVID-19) ${indoGrafik?.periode} - Portalnesia`}><Button icon='download'>Download</Button></a>
                    </DialogActions>
                </>
            )}
        </Dialog>
    </>;
}
const MapCorona=connect(state=>({user:state.user}))(MapCoronaa)
export default MapCorona