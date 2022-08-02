import React from 'react'
import Header from 'portal/components/Header'
import Skeleton from 'portal/components/Skeleton'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import CountUp from 'portal/components/CountUp'
import Avatar from 'portal/components/Avatar'
import Search from 'portal/components/Search'
import Recaptcha from 'portal/components/ReCaptcha'
import useAPI,{ApiError} from 'portal/utils/api'
import {useMousetrap} from 'portal/utils/useKeys'
import db from 'portal/utils/db'
import {staticUrl,day_format} from 'portal/utils/Main'
import {separateNumber,numberFormat,isTrue} from '@portalnesia/utils'
import {useRouter} from 'next/router'
import ErrorPage from 'portal/pages/_error'
import {withStyles} from 'portal/components/styles';
import {wrapper} from 'portal/redux/store';
import { Pagination } from '@mui/material';
import {connect} from 'react-redux';
import Link from 'next/link'
import useSWR from 'portal/utils/swr'
import {
    Grid,IconButton,Portal,ListItemSecondaryAction,CircularProgress,
    FormControlLabel,FormGroup,Switch,FormControl,FormLabel,RadioGroup,Radio,
    Typography,Divider,List,ListItem,ListItemText,Paper,Collapse,
    ListItemAvatar,Table,TableHead,TableBody,TableRow,TableCell,TableFooter,
    Hidden,
    TextField,
    Slide,AppBar,Toolbar
} from '@mui/material'
import {DatePicker,LocalizationProvider} from '@mui/lab'
import AdapterDayjs from '@mui/lab/AdapterDayjs'
import {Close,Receipt,MenuBook,BarChart,Storage,Settings,Delete,Add,Remove,FilterList,Print} from '@mui/icons-material'
import Autocomplete from '@mui/material/Autocomplete';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const DialogActions=dynamic(()=>import('@mui/material/DialogActions'))
const Image=dynamic(()=>import('portal/components/Image'))
const Backdrop=dynamic(()=>import('portal/components/Backdrop'))
const Browser=dynamic(()=>import('portal/components/Browser'))

export const getServerSideProps = wrapper(async({pn:data,resolvedUrl,params})=>{
    const {toko_id,slug}=params;
    if(slug) {
        if(slug?.length > 2) {
            return db.redirect();
        }
        if(['setting','cashier','report','insight','product'].indexOf(slug?.[0]) === -1) {
            return db.redirect();
        }
    }
    if(data.user === null) return db.redirect(`${process.env.ACCOUNT_URL}/login?redirect=${encodeURIComponent(`${process.env.URL}${resolvedUrl}`)}`);
    const toko = await db.kata(`SELECT * FROM klekle_toko WHERE slug=? AND BINARY(slug) = BINARY(?) LIMIT 1`,[toko_id,toko_id])
    if(!toko) {
        return db.redirect();
    }
    let admin;
    if(toko[0]?.userid != data?.user?.id) {
        const ceku = await db.kata(`SELECT * FROM klekle_toko_users WHERE toko_id=? AND userid=? LIMIT 1`,[toko[0].id,data.user.id]);
        if(!ceku) {
            return db.redirect();
        }
        admin = isTrue(ceku.admin)
    } else admin = true
    const meta={
        title:toko[0]?.name,
        description:(toko[0]?.description == null ? "" : toko[0]?.description),
        toko:{
            admin:admin
        }
    }
    return {props:{meta:meta}}
})

const useScrollLock=()=>{
    React.useLayoutEffect(()=>{
        document.body.style.overflow = 'hidden'

        return ()=>document.body.style.overflow = 'auto'
    })
}

const useToko=()=>{
    const router=useRouter()
    const {toko_id}=router.query;
    return useSWR(`/v1/toko/${toko_id}`)
}

const styles=(theme)=>({
    button:{
        background:`${theme.palette.background.default} !important`,
        display:'block !important',
        width:'100% !important'
    },
    buttonIcon:{
        margin:'0 auto !important',
        display:'block !important',
        fontSize:`${theme.spacing(8)} !important`
    },
    buttonLabel:{
        textAlign:'center !important',
        '& span':{
            color:`${theme.custom.dasarText} !important`,
            fontSize:'20px !important'
        }
    },
    con:{
        background:`${theme.palette.background.default} !important`,
        paddingTop:theme.spacing(4),
        minHeight:'100%'
    },
    toolbar:{
        '& svg':{
            color:'#fff !important'
        },
        '& span, & p':{
            color:'#fff !important'
        }
    },
    divider:{
        paddingTop:'2rem',
        borderTop:`1px solid ${theme.palette.divider}`,
        '& > div':{
            [theme.breakpoints.down('sm')]: {
                paddingLeft:theme.spacing(2),
                paddingRight:theme.spacing(2)
            },
                [theme.breakpoints.up('sm')]: {
                paddingLeft:theme.spacing(3),
                paddingRight:theme.spacing(3)
            },
        }
    },
    content:{
        [theme.breakpoints.down('md')]: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1)
        },
        [theme.breakpoints.up('md')]: {
            //paddingLeft: theme.spacing(1.5),
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1.5),
        },
    },
    alink:{
        color:`${theme.custom.link} !important`,
        '&:hover':{
            textDecoration:'underline !important'
        }
    },
    input:{
        padding:'5px 10px !important'
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
    }
})
let iframe=null;
const handlePrint=(id,token)=>{
    return window.open(`/print/toko/transactions/${id}?token=${token}`, "", "width=500, height=1000")
}
const cardData=['income_today','tr_today','income','tr'];
const cardDataTitle=["Incomes Today","Transactions Today",'Incomes',"Transactions"]
/* ============================ GRAFIK ============================= */
const TokoGrafikComp=({classes,onBack})=>{
    const router=useRouter()
    const {toko_id}=router.query;
    const [dialog,setDialog]=React.useState(false)
    const [query,setQuery]=React.useState({filter:'monthly',from:null,to:null})
    const [queryFix,setQueryFix]=React.useState({filter:'monthly',from:dayjs().subtract(1, 'month').add('1','day').unix(),to:dayjs().unix()})
    const [range,setRange]=React.useState({from:dayjs().subtract(1, 'month').add('1','day'),to:dayjs()})
    const {data,mutate,isValidating}=useSWR(`/v1/toko/${toko_id}/insight?filter=${queryFix?.filter}${queryFix?.filter === 'custom' ? `&from=${queryFix?.from}&to=${queryFix?.to}` : ''}`,{
        revalidateOnFocus:false,
        revalidateOnReconnect:false,
        revalidateOnMount:false
    })
    const [graph,setGraph]=React.useState({items:null,transactions:null})
    const [dataa,setDataa]=React.useState({income:null,tr:null,income_today:null,tr_today:null})
    const [trChart,setTrChart]=React.useState(null)
    const [itChart,setItChart]=React.useState(null)

    useScrollLock()

    const title=React.useMemo(()=>{
        return `${dayjs(queryFix.from * 1000).format("MMMM D, YYYY")} - ${dayjs(queryFix.to * 1000).format("MMMM D, YYYY")}`
    },[queryFix])

    const handleDateChange=React.useCallback((name,value)=>{
        const val = dayjs(value)
        if(name === 'from' && range.to.isAfter(val.add(1,'month'))){
            setQuery(query=>({
                ...query,
                to:val.add(1,'month').unix(),
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                to:val.add(1,'month'),
                [name]:value
            }));
        } else if(name === 'to' && range.from.isBefore(val.subtract(1,'month'))) {
            setQuery(query=>({
                ...query,
                from:val.subtract(1,'month').unix(),
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                from:val.subtract(1,'month'),
                [name]:value
            }));
        } else {
            setQuery(query=>({
                ...query,
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                [name]:value
            }));
        }
    },[setQuery,setRange,range])

    const handleChange=React.useCallback((e)=>{
        if(e.target.value=='weekly') {
            const lalu = dayjs().subtract(1, 'week').add('1','day');
            const no = dayjs();
            setQuery({filter:e.target.value,from:lalu.unix(),to:no.unix()})
            setRange({from:lalu,to:no})
        } else if(e.target.value=='monthly') {
            const lalu = dayjs().subtract(1, 'month').add('1','day');
            const no = dayjs();
            setQuery({filter:e.target.value,from:lalu.unix(),to:no.unix()})
            setRange({from:lalu,to:no})
        } else {
            setQuery(query=>({...query,filter:e.target.value}))
        }
    },[setQuery])

    React.useEffect(()=>{
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
                style: {
                    color: "#000000",
                    fontSize: "18px",
                    fontWeight: "bold"
                }
            },
            subtitle: {
                text: `${process.env.URL}`
            },
            yAxis: {
                title: {
                    text: "Total"
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
                        return '<span style="margin-right:2px;font-size:15px;color:#000">' + t.series.name + ':</span>  <span style="font-weight: 600;margin-right:2px;font-size:15px;color:#000">IDR ' + numberFormat(t.y,",") + "</span>"
                    }) : [])
                }
            },
            legend: {
                enabled: false
            },
        }
        if(graph?.transactions !== null && !isValidating) {
            const gr=document.getElementById('transactions-chart');
            const width=gr?.clientWidth||gr?.offsetWidth;
            const opt={
                ...option,
                series: [{
                    data: graph?.transactions?.total,
                    name: "Income",
                    pointStart: graph?.transactions?.time[0],
                    pointInterval: 864e5
                }],
                title:{
                    ...option.title,
                    text:"Income Chart " + title
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
                        width: Math.round(width / graph.transactions.length),
                        color: "rgba(204,214,235,0.25)"
                    }
                },
                yAxis: {
                    title: {
                        text: "IDR"
                    },
                    labels: {
                        style: {
                            color: "#000000"
                        }
                    }
                },
            }
            setTrChart(opt);
        } else {
            setTrChart(null);
        }

        if(graph?.items !== null && graph?.items!==false && !isValidating) {
            const opt={
                ...option,
                chart: {
                    ...option.chart,
                    type: 'column'
                },
                title:{
                    ...option.title,
                    text:"Product Best Seller " + title
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                series:[{
                    data: graph?.items,
                    name: 'Product'
                }],
                tooltip: {
                    shared: true,
                    headerFormat: '<span style="font-weight: 600;font-size:16px;color:#000">{point.point.name}</span><br/>',
                    pointFormat: '<span style="margin-right:2px;font-size:15px;color:#000">Sold: <b>{point.y}</b></span><br/>'
                },
            }
            setItChart(opt);
        } else {
            if(graph?.items===false) setItChart(false)
            else setItChart(null);
        }
    },[graph,isValidating,title])

    React.useEffect(()=>{
        if(data) {
            setDataa({income_today:Number(data.today.income),tr_today:Number(data.today.total_transactions),income:Number(data.data.income),tr:Number(data.data.total_transactions)})
            setGraph(data.graph)
        }
    },[data])

    React.useEffect(()=>{
        mutate()
    },[queryFix])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppBar enableColorOnDark position="sticky">
                <Toolbar className={classes.toolbar}>
                    <IconButton edge="start" style={{marginRight:15}} onClick={onBack} size="large">
                        <Close />
                    </IconButton>
                    <Typography variant='h5' style={{flex:1}}>Insight</Typography>
                    <Button variant='text' color='grey' size="medium" sx={{color:'white'}} onClick={()=>setDialog(true)}>FILTER</Button>
                </Toolbar>
            </AppBar>
            <Paper className={classes.con}>
                <div className={classes.content}>
                    <Grid container spacing={2} justifyContent="center">
                        {cardData.map((dt,i)=>(
                            <Grid item xs={6} lg={3}>
                                <PaperBlock noMargin>
                                    <div style={{textAlign:'right'}}>
                                        {dataa?.[dt] === null || (['income_today','tr_today'].indexOf(dt) === -1 && isValidating) ? (
                                            <>
                                                <Typography style={{marginBottom:15,marginLeft:'25%'}}><Skeleton type='other' variant='wave' /></Typography>
                                                <Typography><Skeleton type='other' variant='wave' /></Typography>
                                            </>
                                        ) : (
                                            <>
                                                <Typography style={{fontSize: 28,fontWeight: 500}} component='h4'>{dataa?.[dt] != 0 ? <CountUp data={{number:dataa?.[dt],format:['income','income_today'].indexOf(dt) !== -1 ? `IDR ${separateNumber(Number(dataa?.[dt]))}` : dataa?.[dt].toString()}} /> : ['income','income_today'].indexOf(dt) !== -1 ? `IDR 0` : `0`}</Typography>
                                                <Typography>{cardDataTitle[i].toUpperCase()}</Typography>
                                            </>
                                        )}
                                    </div>
                                </PaperBlock>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <PaperBlock whiteBg noMargin noPadding {...(trChart===false || isValidating ? {title:`Income Chart ${title}`} : {})}>
                                <div id='transactions-chart'>
                                    {trChart === null || isValidating ?(
                                        <div style={{display:'flex',justifyContent:'center',margin:'20px 0'}}>
                                            <CircularProgress thickness={5} size={50}/>
                                        </div>
                                    ) : trChart === false ? (
                                        <div style={{display:'flex',justifyContent:'center',margin:'20px 0'}}>
                                            <Typography cariant='h6'>No Data</Typography>
                                        </div>
                                    ) : <HighchartsReact highcharts={Highcharts} options={trChart} /> }
                                </div>
                            </PaperBlock>
                        </Grid>
                        <Grid item xs={12}>
                            <PaperBlock whiteBg noMargin noPadding style={{marginBottom:75}} {...(itChart===false || isValidating ? {title:`Product Best Seller ${title}`} : {})}>
                                <div id='items-chart'>
                                    {itChart === null || isValidating ? (
                                        <div style={{display:'flex',justifyContent:'center',margin:'20px 0'}}>
                                            <CircularProgress thickness={5} size={50}/>
                                        </div>
                                    ) : itChart === false ? (
                                        <div style={{display:'flex',justifyContent:'center',margin:'20px 0'}}>
                                            <Typography cariant='h6'>No Data</Typography>
                                        </div>
                                    ) : <HighchartsReact highcharts={Highcharts} options={itChart} /> }
                                </div>
                            </PaperBlock>
                        </Grid>
                    </Grid>
                </div>
            </Paper>
            <Dialog open={dialog} aria-labelledby='dialog' scroll='body'>
                <DialogTitle>Filter</DialogTitle>
                <DialogContent dividers>
                    <Grid container justifyContent="center" spacing={2}>
                        <Grid item xs={12}>
                            <FormControl component='fieldset'>
                                <FormLabel component="legend">Filter</FormLabel>
                                <RadioGroup aria-label="filter" name="filter" value={query?.filter||"monthly"} onChange={handleChange}>
                                    <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                                    <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                                    <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        {query?.filter==='custom' && (
                            <React.Fragment>
                                <Grid item xs={12} lg={6}>
                                    <DatePicker
                                        disableFuture
                                        fullWidth
                                        id="date-picker-from"
                                        label="From"
                                        inputFormat="DD MMMM YYYY"
                                        value={range.from}
                                        onChange={date=>handleDateChange('from',date)}
                                        required
                                        strictCompareDates
                                        name='from_date'
                                        renderInput={(params)=><TextField {...params} />}
                                    />
                                </Grid>
                                <Grid item xs={12} lg={6}>
                                    <DatePicker
                                        disableFuture
                                        fullWidth
                                        id="date-picker-to"
                                        label="To"
                                        inputFormat="DD MMMM YYYY"
                                        value={range.to}
                                        onChange={date=>handleDateChange('to',date)}
                                        required
                                        strictCompareDates
                                        name='to_date'
                                        renderInput={(params)=><TextField {...params} />}
                                    />
                                </Grid>
                            </React.Fragment>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{setQueryFix(query),setDialog(false)}}>Done</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
const TokoGrafik = React.memo(TokoGrafikComp);

/* ============================ REPORT ============================= */
const TokoDataComp=({classes,onBack,user})=>{
    const router=useRouter()
    const {del}=useAPI()
    const [dialog,setDialog]=React.useState(false)
    const [dialogIsi,setDialogIsi]=React.useState(null)
    const {toko_id,slug}=router.query;
    const [query,setQuery]=React.useState({filter:'monthly',from:null,to:null})
    const [queryFix,setQueryFix]=React.useState({filter:'monthly',from:null,to:null})
    const [range,setRange]=React.useState({from:dayjs().subtract(1, 'month'),to:dayjs()})
    const [collapse,setCollapse]=React.useState(false)
    const [page,setPage]=React.useState(1);
    const {data,error,mutate}=useSWR(`/v1/toko/${toko_id}/transactions?page=${page}&filter=${queryFix?.filter}${queryFix?.filter === 'custom' ? `&from=${queryFix?.from}&to=${queryFix?.to}` : ''}`)
    const {data:dataToko}=useToko();
    const [loading,setLoading]=React.useState(false)
    const [csv,setCSV]=React.useState({filter:'monthly',from:null,to:null})
    const [rangeCSV,setRangeCSV]=React.useState({from:dayjs().subtract(1, 'month'),to:dayjs()})

    useScrollLock()

    const handlePagination = React.useCallback((event, value) => setPage(value),[]);
    const handleDownloadReport=React.useCallback(()=>{window.location.href=`${process.env.CONTENT_URL}/export/toko/report/${toko_id}?filter=${csv?.filter}${csv?.filter === 'custom' ? `&from=${csv?.from}&to=${csv?.to}` : ''}`},[toko_id,csv])

    const isAdmin = React.useMemo(()=>{
        if(dataToko && user) {
            const filter = dataToko.users.find(u=>u.id == user.id);
            if(filter) {
                return filter.admin;
            }
        }
        return false;
    },[dataToko,user])
    
    const handleDateChange=React.useCallback((name,value)=>{
        const val = dayjs(value)
        if(name === 'from' && range.to.isAfter(val.add(1,'month'))){
            setQuery(query=>({
                ...query,
                to:val.add(1,'month').unix(),
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                to:val.add(1,'month'),
                [name]:value
            }));
        } else if(name === 'to' && range.from.isBefore(val.subtract(1,'month'))) {
            setQuery(query=>({
                ...query,
                from:val.subtract(1,'month').unix(),
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                from:val.subtract(1,'month'),
                [name]:value
            }));
        } else {
            setQuery(query=>({
                ...query,
                [name]:val.unix()
            }));
            setRange(range=>({
                ...range,
                [name]:value
            }));
        }
    },[setQuery,setRange,range])

    const handleDateChangeCSV=React.useCallback((name,value)=>{
        const val = dayjs(value);
        if(name === 'from' && rangeCSV.to.isAfter(val.add(1,'month'))){
            setCSV(query=>({
                ...query,
                to:val.add(1,'month').unix(),
                [name]:val.unix()
            }));
            setRangeCSV(range=>({
                ...range,
                to:val.add(1,'month'),
                [name]:value
            }));
        } else if(name === 'to' && rangeCSV.from.isBefore(val.subtract(1,'month'))) {
            setCSV(query=>({
                ...query,
                from:val.subtract(1,'month').unix(),
                [name]:val.unix()
            }));
            setRangeCSV(range=>({
                ...range,
                from:val.subtract(1,'month'),
                [name]:value
            }));
        } else {
            setCSV(query=>({
                ...query,
                [name]:val.unix()
            }));
            setRangeCSV(range=>({
                ...range,
                [name]:value
            }));
        }
    },[setCSV,setRangeCSV,rangeCSV])

    const handleChange=React.useCallback((e)=>{
        if(e.target.value!=='custom') {
            setQuery({filter:e.target.value,from:null,to:null})
        } else {
            setQuery(query=>({...query,filter:e.target.value}))
        }
    },[setQuery])

    const handleChangeCSV=React.useCallback((e)=>{
        if(e.target.value!=='custom') {
            setCSV({filter:e.target.value,from:null,to:null})
        } else {
            setCSV(query=>({...query,filter:e.target.value}))
        }
    },[setCSV])

    const handleFilter=React.useCallback(()=>{
        setQueryFix(query)
        setCollapse((col)=>!col)
    },[setCollapse,query]);

    const handleDelete=React.useCallback((id)=>()=>{
        setLoading(true)
        del(`/v1/toko/${toko_id}/transactions/${id}`)
        .then(()=>{
            setDialog(false)
            mutate()
        })
        .catch((err)=>{
            
        })
        .finally(()=>setLoading(false))
    },[del,toko_id])

    const total_page=React.useMemo(()=>{
        if(data) {
            return data?.total_page;
        }
        else return 1;
    },[data])

    React.useEffect(()=>{
        const onMessage=(e)=>{
            if(e.origin!==process.env.URL) return;
            //if(e.origin!=='https://debug.portalnesia.com') return;
            if(typeof e.data.print === 'undefined') return;
            //console.log(iframe)
            if(iframe!==null){
                document.body.removeChild(iframe);
                iframe=null
            }
        }
        window.addEventListener('message',onMessage)

        return()=>window.removeEventListener('message',onMessage)
    },[])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppBar enableColorOnDark position="sticky">
                <Toolbar className={classes.toolbar}>
                    <IconButton edge="start" style={{marginRight:15}} onClick={onBack} size="large">
                        <Close />
                    </IconButton>
                    <Typography variant='h5' style={{flex:1}}>REPORT</Typography>
                    <Button
                        variant='text'
                        size="medium"
                        color='grey'
                        sx={{color:'white'}}
                        onClick={()=>{
                            setDialogIsi({type:'export'})
                            setDialog(true)
                        }}>DOWNLOAD REPORT</Button>
                </Toolbar>
            </AppBar>
            <Paper className={classes.con}>
                <PaperBlock whiteBg title="Data Transactions" noPadding style={{marginBottom:75}} divider={false} noPaddingHeader action={
                    <IconButton onClick={()=>setCollapse((col)=>!col)} size="large">
                        <FilterList />
                    </IconButton>
                }
                footer={
                    <Pagination color='primary' count={Number(total_page||1)} page={Number(page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                }
                header={
                    <Collapse
                        component="div"
                        in={collapse}
                        timeout="auto"
                        unmountOnExit
                    >
                        <div className={classes.divider}>
                            <Grid container justifyContent="center" spacing={2}>
                                <Grid item xs={12}>
                                <FormControl component='fieldset'>
                                    <FormLabel component="legend">Filter</FormLabel>
                                    <RadioGroup aria-label="filter" name="filter" value={query?.filter||"monthly"} onChange={handleChange}>
                                        <FormControlLabel value="today" control={<Radio />} label="Today" />
                                        <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                                        <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                                        <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                                    </RadioGroup>
                                </FormControl>
                                </Grid>
                                {query?.filter==='custom' && (
                                    <React.Fragment>
                                        <Grid item xs={12} lg={6}>
                                            <DatePicker
                                                disableFuture
                                                fullWidth
                                                id="date-picker-from"
                                                label="From"
                                                inputFormat="DD MMMM YYYY"
                                                value={range.from}
                                                onChange={date=>handleDateChange('from',date)}
                                                required
                                                strictCompareDates
                                                name='from_date'
                                                renderInput={(params)=><TextField {...params} />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} lg={6}>
                                            <DatePicker
                                                disableFuture
                                                fullWidth
                                                id="date-picker-to"
                                                label="To"
                                                inputFormat="DD MMMM YYYY"
                                                value={range.to}
                                                onChange={date=>handleDateChange('to',date)}
                                                required
                                                strictCompareDates
                                                name='to_date'
                                                renderInput={(params)=><TextField {...params} />}
                                            />
                                        </Grid>
                                    </React.Fragment>
                                )}
                                <Grid item xs={12}>
                                    <center><Button onClick={handleFilter}>Filter</Button></center>
                                </Grid>
                            </Grid>
                        </div>
                    </Collapse>
                }>
                    <div style={{overflowX:'auto'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center'>#</TableCell>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Datetime</TableCell>
                                    <TableCell align='center'>Total</TableCell>
                                    <TableCell align='center'>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!data && !error ? (
                                    <Skeleton type='table' number={5} tableProps={{column:5,bodyOnly:true}} />
                                ) : error  ? (
                                    <TableRow><TableCell colSpan={5} align='center'>{error}</TableCell></TableRow>
                                ) : data?.data?.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align='center'>No Data</TableCell></TableRow>
                                ) : data?.data?.map((dt,i)=>(
                                    <TableRow hover style={{cursor:'pointer'}} onClick={()=>{
                                        setDialogIsi({type:'detail',...dt})
                                        setDialog(true)
                                    }}>
                                        <TableCell align='center'>{i+1}</TableCell>
                                        <TableCell>{dt?.id}</TableCell>
                                        <TableCell>{day_format(dt?.timestamp,'full')}</TableCell>
                                        <TableCell align='center'>{`IDR ${separateNumber(Number(dt?.total||0))}`}</TableCell>
                                        <TableCell align='center'>
                                            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                                {dt?.token_print && (
                                                    <IconButton
                                                        style={{marginRight:5}}
                                                        onClick={(e)=>{
                                                            if(e?.stopPropagation) e.stopPropagation();
                                                            handlePrint(dt?.id,dt?.token_print)
                                                        }}
                                                        size="large">
                                                        <Print />
                                                    </IconButton>
                                                )}
                                                {isAdmin && (
                                                    <IconButton
                                                        onClick={(e)=>{
                                                            if(e?.stopPropagation) e.stopPropagation();
                                                            setDialogIsi({type:'delete',...dt})
                                                            setDialog(true)
                                                        }}
                                                        size="large">
                                                        <Delete />
                                                    </IconButton>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            {data && !error ? (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} align="center"><strong>TOTAL</strong></TableCell>
                                        <TableCell colSpan={2} align="center"><strong>{`IDR ${separateNumber(Number(data?.total_money||0))}`}</strong></TableCell>
                                    </TableRow>
                                </TableFooter>
                            ) : null}
                        </Table>
                    </div>
                </PaperBlock>
            </Paper>
            <Dialog
                open={dialog&&dialogIsi!==null}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth={dialogIsi?.type==='detail'}
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setDialogIsi(null)
                }}>
                <DialogTitle>{dialogIsi?.type==='delete' ? "Are You Sure?" : dialogIsi?.type==='export' ? "Download Report" : `Transaction #${dialogIsi?.id}`}</DialogTitle>
                <DialogContent dividers>
                    {dialogIsi?.type==='delete' ? (
                        <Typography>{`Delete transactions #${dialogIsi?.id}?`}</Typography>
                    ) : dialogIsi?.type==='export' ? (
                        <Grid container justifyContent="center" spacing={2}>
                            <Grid item xs={12}>
                                <FormControl component='fieldset'>
                                    <FormLabel component="legend">Filter</FormLabel>
                                    <RadioGroup aria-label="filter" name="filter" value={csv?.filter||"monthly"} onChange={handleChangeCSV}>
                                        <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
                                        <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
                                        <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            {csv?.filter==='custom' && (
                                <React.Fragment>
                                    <Grid item xs={12} lg={6}>
                                        <DatePicker
                                            disableFuture
                                            fullWidth
                                            id="date-picker-csv-from"
                                            label="From"
                                            inputFormat="DD MMMM YYYY"
                                            value={rangeCSV.from}
                                            onChange={date=>handleDateChangeCSV('from',date)}
                                            required
                                            strictCompareDates
                                            name='from_date'
                                            renderInput={(params)=><TextField {...params} />}
                                        />
                                    </Grid>
                                    <Grid item xs={12} lg={6}>
                                        <DatePicker
                                            disableFuture
                                            fullWidth
                                            id="date-picker-csv-to"
                                            label="To"
                                            inputFormat="DD MMMM YYYY"
                                            value={rangeCSV.to}
                                            onChange={date=>handleDateChangeCSV('to',date)}
                                            required
                                            strictCompareDates
                                            name='to_date'
                                            renderInput={(params)=><TextField {...params} />}
                                        />
                                    </Grid>
                                </React.Fragment>
                            )}
                        </Grid>
                    ) : (
                        <React.Fragment>
                            <div style={{overflowX:'auto'}}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Cashier</TableCell>
                                            <TableCell>{dialogIsi?.user?.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>{dialogIsi?.id}</TableCell>
                                        </TableRow>
                                        {dialogIsi?.name !== null && (
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>{dialogIsi?.name}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell>{`Date & Time`}</TableCell>
                                            <TableCell>{day_format(dialogIsi?.timestamp,'full')}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sub Total</TableCell>
                                            <TableCell>{`IDR ${separateNumber(Number(dialogIsi?.subtotal||0))}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Disscount</TableCell>
                                            <TableCell>{`IDR ${separateNumber(Number(dialogIsi?.disscount||0))}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total</TableCell>
                                            <TableCell>{`IDR ${separateNumber(Number(dialogIsi?.total||0))}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cash</TableCell>
                                            <TableCell>{`IDR ${separateNumber(Number(dialogIsi?.cash||0))}`}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            <Divider style={{margin:'10px 0'}} />
                            <div style={{overflowX:'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={5} align='center'><strong>Items</strong></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell align='center'>#</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell align='center'>Price</TableCell>
                                            <TableCell align='center'>Disscount</TableCell>
                                            <TableCell align='center'>Qty</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dialogIsi?.items?.map((dt,i)=>(
                                            <TableRow>
                                                <TableCell align='center'>{i+1}</TableCell>
                                                <TableCell>{dt?.name}</TableCell>
                                                <TableCell align='center'>{`IDR ${separateNumber(Number(dt?.price||0))}`}</TableCell>
                                                <TableCell align='center'>{`IDR ${separateNumber(Number(dt?.disscount||0))}`}</TableCell>
                                                <TableCell align='center'>{dt?.qty}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </React.Fragment>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button disabled={loading} onClick={()=>{setDialog(false)}} {...(dialogIsi?.type==='delete' ? {color:'secondary'} : {outlined:true})}>{dialogIsi?.type!=='detail' ? "Cancel" : "Done"}</Button>
                    {dialogIsi?.type==='delete' ? (
                        <Button disabled={loading} loading={loading} onClick={handleDelete(dialogIsi.id)} icon='delete'>Delete</Button>
                    ) : dialogIsi?.type==='export' ? (
                        <Button onClick={handleDownloadReport} icon='download'>Download</Button>
                    ) : null}
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
const TokoData = React.memo(TokoDataComp)

/* ============================ KASIR ============================= */
const TokoKasirComp=({classes,onBack,user})=>{
    const defaultInput=React.useMemo(()=>({cash:0,items:[]}),[]);
    const [input,setInput]=React.useState(defaultInput)
    const router=useRouter();
    const {toko_id,slug}=router.query;
    const [loading,setLoading]=React.useState(false)
    const {post}=useAPI()
    const {setNotif}=useNotif()
    const [dialog,setDialog]=React.useState(false)
    const [dialogPay,setDialogPay]=React.useState(false)
    const [itemm, setItems]=React.useState([])
    const {data}=useSWR(`/v1/toko/${toko_id}/items/cashier`)
    const [tanggal,setTanggal]=React.useState(null)
    const [waktu,setWaktu]=React.useState(null)
    const [search,setSearch] = React.useState(null)
    const [searchVal,setSearchVal]=React.useState("")

    const handleRemoveSearch=()=>{
        setSearch(null)
        setSearchVal("")
    }

    const handleSearch=React.useCallback((value)=>{
        setSearchVal(value);
        if(itemm.length > 0 && value?.length > 0) {
            const filter = itemm?.filter(item=>item?.name?.toLowerCase().indexOf(value.toLowerCase()) > -1);
            setSearch(filter)
        } else {
            setSearch(null)
        }
    },[itemm])

    // Yang sudah fix dibeli
    const items=React.useMemo(()=>{
        return itemm.filter(it=>it.qty > 0)
    },[itemm])

    useScrollLock()

    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        addItems()
    },false)

    useMousetrap(['p'],(e)=>{
        if(e.preventDefault) e.preventDefault()
        if(!loading&&items.length != 0) setDialogPay(true)
    },false)

    const addItems=React.useCallback(()=>{
        if(data) {
            if(itemm.length === 0) {
                setItems(data.map(d=>({...d,qty:0})));
            }
            setDialog(true)
        }
    },[data,itemm])

    const {total,subtotal,disscount}=React.useMemo(()=>{
        let tot=0,sub=0,diss=0;
        if(items.length > 0) {
            Object.keys(items).map((i)=>{
                if(items[i].qty > 0) {
                    sub+=Number(items[i].price * items[i].qty)
                    diss+=Number(items[i].disscount * items[i].qty)
                }
            })
        }
        tot = sub - diss;
        return {total:tot,subtotal:sub,disscount:diss}
    },[items])

    const handleQty=(id,type)=>(e)=>{
        const index = itemm.findIndex((it)=>it.id==id)
        if(index !== -1) {
            let a = [...itemm];
            let b;
            if(type==='text') {
                b = Number(e.target.value) > 0 ? e.target.value : 0;
            } else if(type==='add') {
                let c = a[index].qty;
                b = c+1;
            } else if(type==='min') {
                let c = a[index].qty;
                b = (c-1 > 0) ? c-1 : 0;
            }
            a[index]={
                ...a[index],
                qty:b
            }
            setItems(a)
        }
        if(search!==null) {
            const ind = search?.findIndex((it)=>it.id==id)
            if(ind !== -1) {
                let a = [...search];
                let b;
                if(type==='text') {
                    b = Number(e.target.value) > 0 ? e.target.value : 0;
                } else if(type==='add') {
                    let c = a[ind].qty;
                    b = c+1;
                } else if(type==='min') {
                    let c = a[ind].qty;
                    b = (c-1 > 0) ? c-1 : 0;
                }
                a[ind]={
                    ...a[ind],
                    qty:b
                }
                setSearch(a)
            }
        }
    }

    const handleDelete=React.useCallback((id)=>()=>{
        const index = itemm.findIndex((it)=>it.id==id)
        if(index !== -1) {
            let a = [...itemm];
            a[index]={
                ...a[index],
                qty:0
            }
            setItems(a)
        }
    },[itemm])

    const handleReset=React.useCallback(()=>{
        setItems([])
        setInput(defaultInput)
    },[])

    const handleSubmit=(e)=>{
        if(e?.preventDefault) e.preventDefault();
        setLoading(true)
        let it = [...items];
        const item = it.map((dt)=>({
            id:dt?.id,
            qty:dt?.qty
        }))
        if(item?.length == 0) return setNotif("Items cannot be empty",true)
        const dt = {...input,items:item,total:total,subtotal:subtotal,disscount:disscount}
        post(`/v1/toko/${toko_id}/transactions`,dt)
        .then(([res])=>{
            handlePrint(res?.id,res?.token)
            handleReset();
            setDialogPay(false)
        })
        .catch((err)=>{
            setNotif(err?.msg||"Something went wrong",true)
        })
        .finally(()=>setLoading(false))
    }

    React.useEffect(()=>{
        let inter;
        const handleTanggal=()=>{
            const today = dayjs();
            const tgl = today.format("ddd, MMMM D, YYYY")
            const wkt = today.format("HH:mm:ss")
            setTanggal(tgl)
            setWaktu(wkt)
        }
        inter = setInterval(handleTanggal,1000)
        const onMessage=(e)=>{
            if(e.origin!==process.env.URL) return;
            //if(e.origin!=='https://debug.portalnesia.com') return;
            if(typeof e.data.print === 'undefined') return;
            //console.log(iframe)
            if(iframe!==null){
                document.body.removeChild(iframe);
                iframe=null
            }
        }
        window.addEventListener('message',onMessage)
        return()=>{
            clearInterval(inter)
            window.removeEventListener('message',onMessage)
        }
    },[])

    const productItems = React.useMemo(()=>search!== null?search:itemm,[search,itemm]);

    return (
        <React.Fragment>
            <AppBar enableColorOnDark position="sticky">
                <Toolbar className={classes.toolbar}>
                    <IconButton edge="start" style={{marginRight:15}} onClick={onBack} size="large">
                        <Close />
                    </IconButton>
                    <Typography variant='h5' style={{flex:1}}>Cashier</Typography>
                    <Typography variant="body2">{tanggal}</Typography>
                </Toolbar>
            </AppBar>
            <Paper className={classes.con}>
                <Grid container justifyContent="center">
                    <Grid item xs={12}>
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item xs={12} lg={3}>
                                <PaperBlock whiteBg noMargin>
                                    <Typography variant="h4">{waktu}</Typography>
                                    <Typography>{`Cashier : ${user?.user_nama}`}</Typography>
                                    <Divider style={{margin:'20px 0'}} />
                                    <div className="flex-header">
                                        <Button color="secondary" disabled={loading} onClick={handleReset}>Reset</Button>
                                        <Button tooltip="P" disabled={loading||items.length == 0} size="medium" onClick={()=>setDialogPay(true)}>Process</Button>
                                    </div>
                                </PaperBlock>
                            </Grid>
                            <Grid item xs={12} lg={5}>
                                <PaperBlock whiteBg noMargin>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={6}>
                                            <div style={{textAlign:'left',marginBottom:5}}>
                                                <Typography variant='body2' style={{fontSize:12,textDecoration:'underline'}}>SUBTOTAL</Typography>
                                                <Typography variant="h5"><span style={{marginRight:5,fontSize:10,verticalAlign:'text-top'}}>IDR</span><strong>{separateNumber(subtotal)}</strong></Typography>
                                            </div>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <div style={{textAlign:'right'}}>
                                                <Typography variant='body2' style={{fontSize:12,textDecoration:'underline'}}>DISSCOUNT</Typography>
                                                <Typography variant="h5"><span style={{marginRight:5,fontSize:10,verticalAlign:'text-top'}}>IDR</span><strong>{separateNumber(disscount)}</strong></Typography>
                                            </div>
                                        </Grid>
                                    </Grid>
                                </PaperBlock>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                                <PaperBlock noMargin whiteBg>
                                    <div style={{textAlign:'right'}}>
                                        <Typography variant='body2' style={{textDecoration:'underline'}}>TOTAL</Typography>
                                        <Typography variant="h3"><span style={{marginRight:5,fontSize:18,verticalAlign:'text-top'}}>IDR</span><strong>{separateNumber(total)}</strong></Typography>
                                    </div>
                                </PaperBlock>
                            </Grid>
                        </Grid>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <PaperBlock title="Products" whiteBg style={{marginBottom:75}} action={
                            <Button tooltip="+" underlined onClick={addItems} disabled={loading}>Add products</Button>
                        }>
                            <div style={{overflowX:'auto'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">#</TableCell>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="center">Qty</TableCell>
                                            <TableCell align="center">Price</TableCell>
                                            <TableCell align="center">Disscount</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items?.length > 0 ? items?.map((dt,i)=>(
                                            <TableRow key={i}>
                                                <TableCell align="center">{i+1}</TableCell>
                                                <TableCell>{dt?.name}</TableCell>
                                                <TableCell align="center" width={100}>
                                                    <div>
                                                        <TextField
                                                            value={dt?.qty}
                                                            onChange={handleQty(i,'text')}
                                                            disabled={loading}
                                                            fullWidth
                                                            type='number'
                                                            inputProps={{min:0}}
                                                            InputProps={{
                                                                classes:{
                                                                    input:classes.input
                                                                }
                                                            }}
                                                        />
                                                        <div style={{marginTop:5,display:'flex',justifyContent:'center',alignItems:'center',maxWidth:100}}>
                                                            <IconButton size="small" disabled={loading} style={{marginRight:10}} onClick={handleQty(dt?.id,'min')}>
                                                                <Remove />
                                                            </IconButton>
                                                            <IconButton size="small" disabled={loading} onClick={handleQty(dt?.id,'add')}>
                                                                <Add />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell align="center">{`IDR ${separateNumber(dt?.price)}`}</TableCell>
                                                <TableCell align="center">{`IDR ${separateNumber(dt?.disscount)}`}</TableCell>
                                                <TableCell>
                                                    <IconButton disabled={loading} onClick={handleDelete(dt?.id)} size="large">
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">No items</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </PaperBlock>
                    </Grid>
                </Grid>
            </Paper>
            <Dialog open={dialogPay} onClose={(_,r)=>{r !== 'backdropClick' && setDialogPay(false)}} aria-labelledby='dialog'>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Process Orders</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} justifyContent='center' alignItems='center'>
                            <Grid item xs={12}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Total</TableCell>
                                            <TableCell>{`IDR ${separateNumber(total)}`}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cash</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={input?.cash}
                                                    onChange={(e)=>setInput({...input,cash:e.target.value > 0 ? Number(e.target.value) : 0})}
                                                    fullWidth
                                                    type='number'
                                                    disabled={loading}
                                                    helperText={`IDR ${separateNumber(input?.cash||0)}`}
                                                    inputProps={{min:0}}
                                                    InputProps={{
                                                        classes:{
                                                            input:classes.input
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Change</TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={`IDR ${(input?.cash > 0 ? separateNumber(Number((total - input?.cash)*-1)) : 0)}`}
                                                    fullWidth
                                                    disabled
                                                    error={input?.cash!=0 && (total - input?.cash)>0}
                                                    InputProps={{
                                                        classes:{
                                                            input:classes.input
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>setDialogPay(false)} outlined disabled={loading}>Cancel</Button>
                        <Button disabled={loading||input?.cash == 0||(total - input?.cash)>0} isloading={loading} type="submit">Process</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog
                open={!loading&&dialog}
                onClose={(_,r)=>{r !== 'backdropClick' && setDialog(false)}}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth
                scroll='body'
                TransitionProps={{
                    onExited: handleRemoveSearch
                }}>
                <DialogTitle>
                        <div className="flex-header">
                            <Hidden mdUp>
                                <div>
                                    <Typography variant='h6' component='h2'>Product Items</Typography>
                                    <Search style={{fontSize:'0.875rem'}} onchange={e=>handleSearch(e.target.value)} onsubmit={(e)=>e?.preventDefault()} onremove={handleRemoveSearch} value={searchVal} />
                                </div>
                                <IconButton onClick={()=>setDialog(false)} size="large">
                                    <Close />
                                </IconButton>
                            </Hidden>
                            <Hidden mdDown>
                                <Typography variant='h6' component='h2'>Product Items</Typography>
                                <Search style={{fontSize:'0.875rem'}} onchange={e=>handleSearch(e.target.value)} onsubmit={(e)=>e?.preventDefault()} onremove={handleRemoveSearch} remove autosize value={searchVal} />
                            </Hidden>
                        </div>
                </DialogTitle>
                <DialogContent dividers>
                    <div style={{overflowX:'auto'}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Qty</TableCell>
                                    <TableCell align="center">Price</TableCell>
                                    <TableCell align="center">Disscount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productItems?.length > 0 ? productItems?.map((dt,i)=>(
                                    <TableRow key={i}>
                                        <TableCell>{dt?.name}</TableCell>
                                        <TableCell align="center" width={100}>
                                            <div>
                                                <TextField
                                                    value={dt?.qty}
                                                    onChange={handleQty(i,'text')}
                                                    disabled={loading}
                                                    fullWidth
                                                    type='number'
                                                    inputProps={{min:0}}
                                                    InputProps={{
                                                        classes:{
                                                            input:classes.input
                                                        }
                                                    }}
                                                />
                                                <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:5,maxWidth:100}}>
                                                    <IconButton size="small" style={{marginRight:10}} onClick={handleQty(dt?.id,'min')}>
                                                        <Remove />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={handleQty(dt?.id,'add')}>
                                                        <Add />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">{`IDR ${separateNumber(dt?.price)}`}</TableCell>
                                        <TableCell align="center">{`IDR ${separateNumber(dt?.disscount)}`}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow key={0}>
                                        <TableCell colSpan={4}>No Data</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setDialog(false)}>Done</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
const TokoKasir = React.memo(TokoKasirComp)

/* ============================ PRODUCT ============================= */
const TokoItemComp=({classes,onBack,user})=>{
    const defaultInput=React.useMemo(()=>({name:'',price:0,disscount:0,description:null,image:null,active:true,category:null}),[]);
    const router=useRouter();
    const {setNotif} = useNotif();
    const {toko_id,slug,page}=router.query;
    const [loading,setLoading]=React.useState(false)
    const {post,put}=useAPI()
    const [dialog,setDialog]=React.useState(null)
    const [isi,setIsi]=React.useState(null)
    const [uang,setUang]=React.useState({price:"",disscount:''})
    const [sudahHome,setSudahHome]=React.useState(false)
    const {data:dataToko}=useToko();
    const [pages,setPages]=React.useState(1);
    const [browser,setBrowser] = React.useState(false);
    const captchaRef = React.useRef(null);

    const {data,error,mutate}=useSWR(`/v1/toko/${toko_id}/items?page=${pages}`,{
        revalidateOnFocus:false
    })
    //const {data:dataItems,isValidating}=useSWR(slug[1] && slug[1]!='add' ? `${process.env.API}/toko/${toko_id}/items/${slug[1]}` : undefined,fetchGet)

    useScrollLock()

    useMousetrap(['+','shift+='],(e)=>{
        if(e.preventDefault) e.preventDefault()
        router.push('/toko/[toko_id]/[[...slug]]',`/toko/${toko_id}/product/add`,{shallow:true})
    },false)

    const isAdmin = React.useMemo(()=>{
        if(dataToko && user) {
            const filter = dataToko.users.find(u=>u.id == user.id);
            if(filter) {
                return filter.admin;
            }
        }
        return false;
    },[dataToko,user])

    const handleEdit=React.useCallback((name,value)=>{
        if(['price','disscount'].indexOf(name) !== -1) {
            setUang({...uang,[name]:separateNumber(value)})
        }
        setIsi({...isi,[name]:value})
    },[isi,uang])

    const handleSelectedImage=React.useCallback((dt)=>{

        setIsi({...isi,image:staticUrl(`img/url?image=${encodeURIComponent(dt.url)}`)})
    },[isi])

    const handlePagination = React.useCallback((event, value) => {
        router.replace({
            pathname:'/toko/[toko_id]/[[...slug]]',
            query:{
                page:value
            }
        },`/toko/${toko_id}/product?page=${value}`,{shallow:true})
        setPages(value);
    },[toko_id]);

    const handleBack=React.useCallback(()=>{
        if(sudahHome) {
            router.back();
            setDialog(null)
        }
        else {
            router.replace('/toko/[toko_id]/[[...slug]]',`/toko/${toko_id}/product`,{shallow:true});
            setDialog(null)
        }
    },[sudahHome,toko_id])

    const handleSubmit=React.useCallback(async(e)=>{
        if(e?.preventDefault) e.preventDefault();
        setLoading(true)
        const isEdit = dialog === 'edit';
        try {
            if(isEdit) {
                await put(`/v1/toko/${toko_id}/items/${slug?.[1]}`,isi);
            } else {
                const recaptcha = await captchaRef.current?.execute();
                await post(`/v1/toko/${toko_id}/items`,{...isi,recaptcha})
            }
            handleBack();
            mutate();
        } catch(e) {
            if(e instanceof ApiError) {

            } else {
                console.log(e)
                setNotif(e?.message,true)
            }
        } finally {
            setLoading(false)
        }
        
    },[slug,isi,toko_id,handleBack,mutate,isi,slug,put,post,dialog,setNotif])

    React.useEffect(()=>{
        if(slug?.[1]) {
            if(slug[1]==='add') {
                setIsi(defaultInput)
                setUang({price:'',disscount:''})
                setDialog('add')
            } else {
                if(data && isi===null) {
                    const index=data?.data?.findIndex(item=>item?.id==slug[1]);
                    if(index > -1) {
                        const b = {...data?.data[index]}
                        if(b?.toko_id) delete b.toko_id;
                        setIsi(b)
                        setUang({price:separateNumber(Number(b?.price)),disscount:separateNumber(Number(b?.disscount))})
                        setDialog('edit')
                    } else {
                        router.replace('/toko/[toko_id]/[[...slug]]',`/toko/${toko_id}/product?page=${pages||1}`,{shallow:true});
                        setDialog(null)
                    }
                }
            }
        } else {
            setIsi(null)
            setDialog(null)
            setPages(pages)
        }
        if(typeof slug[1] === 'undefined') setSudahHome(true)
    },[page,slug,data])

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    const total_page=React.useMemo(()=>{
        if(data) {
            return data?.total_page;
        }
        else return 1;
    },[data])

    return (
        <React.Fragment>
            <AppBar enableColorOnDark position="sticky">
                <Toolbar className={classes.toolbar}>
                    <IconButton edge="start" style={{marginRight:15}} onClick={onBack} size="large">
                        <Close />
                    </IconButton>
                    <Typography variant='h5' style={{flex:1}}>Product</Typography>
                    {isTrue(isAdmin) && <Link href={`/toko/${toko_id}/product/add`} passHref shallow><Button tooltip="+" component='a' variant='text' color='grey' size="medium" sx={{color:'white'}} icon='add'>Add Product</Button></Link>}
                </Toolbar>
            </AppBar>
            <Paper className={classes.con}>
                <Grid container justifyContent='center' spacing={0}>
                    <Grid item xs={12} md={10} lg={8}>
                        <PaperBlock title="product" style={{marginBottom:55}} noPadding whiteBg divider={false} footer={
                            <Pagination color='primary' count={Number(total_page||1)} page={Number(router.query.page||1)} boundaryCount={2} siblingCount={2} hidePrevButton hideNextButton showFirstButton showLastButton onChange={handlePagination} />
                        }>
                            {!data && !error ? (
                                <Skeleton type='list' number={3} />
                            ) : error ? (
                                <center><Typography variant="h5">{error}</Typography></center>
                            ) : data?.data?.length === 0 ? (
                                <center><Typography variant="h5">No data</Typography></center>
                            ) : (
                                <List>
                                    {data?.data?.map((dt,i)=>(
                                        <Link key={i} href={`/toko/${toko_id}/product/${dt.id}`} passHref shallow><ListItem component='a' divider button alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>
                                                    <Image type="png" withPng src={`${dt?.image === null ? 'https://content.portalnesia.com/img/content?image=notfound.png' : dt?.image}&size=40&watermark=no`} style={{width:40}} alt={dt.name} />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography>{dt.name}</Typography>}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography variant='body2'>{`IDR ${separateNumber(dt.price)}`}</Typography>
                                                        {dt.description != null && <Typography variant='body2'>{dt.description}</Typography>}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem></Link>
                                    ))}
                                </List>
                            )}
                        </PaperBlock>
                    </Grid>
                </Grid>
            </Paper>
            <Dialog open={dialog!==null} aria-labelledby='dialog' maxWidth='md' fullWidth scroll='body'>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{dialog === 'edit' ? 'Edit Product' : 'Add Product'}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container justifyContent='center' spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label='Product Name'
                                    value={isi?.name||""}
                                    onChange={(e)=>handleEdit('name',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    disabled={loading||!dataToko||!(isTrue(isAdmin))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Product Description'
                                    value={isi?.description||''}
                                    onChange={(e)=>handleEdit('description',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={2}
                                    disabled={loading||!dataToko||!(isTrue(isAdmin))}
                                    InputProps={{
                                        className:classes.scrollBar
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Product Category'
                                    value={isi?.category||""}
                                    onChange={(e)=>handleEdit('category',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    disabled={loading||!dataToko||!(isTrue(isAdmin))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Price'
                                    value={isi?.price||0}
                                    onChange={(e)=>handleEdit('price',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    type='number'
                                    disabled={loading||!dataToko||!(isTrue(isAdmin))}
                                    helperText={`IDR ${uang.price}`}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Disscount'
                                    value={isi?.disscount||0}
                                    onChange={(e)=>handleEdit('disscount',e.target.value)}
                                    variant='outlined'
                                    fullWidth
                                    required
                                    type='number'
                                    disabled={loading||!dataToko||!(isTrue(isAdmin))}
                                    helperText={`IDR ${uang.disscount}`}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    {isi?.image !== null ? (
                                        <Image type="png" withPng src={`${isi?.image}&size=100&watermark=no`} dataSrc={`${isi?.image}&watermark=no`} fancybox />
                                    ) : <Typography>No Image</Typography>}
                                </div>
                                <div style={{marginTop:15}}>
                                    <div className='flex-header'>
                                        <Button disabled={loading||!dataToko||!(isTrue(isAdmin))} outlined onClick={openFileManager} size="small">Add image</Button>
                                        <Button disabled={loading||!dataToko||!(isTrue(isAdmin))} variant='outlined' color="secondary" onClick={()=>handleEdit("image",null)}>Remove image</Button>
                                    </div>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <FormGroup key='output-switch'>
                                    <FormControlLabel
                                        style={{marginTop:0}}
                                        control={
                                            <Switch disabled={loading||!dataToko||!(isTrue(isAdmin))} checked={isi?.active} onChange={e=>handleEdit('active',e.target.checked)} color="primary" />
                                        }
                                        label="Active"
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{mr:1}} disabled={loading} outlined onClick={()=>{!loading && handleBack()}}>Cancel</Button>
                        <Button disabled={loading||!dataToko||!(isTrue(isAdmin))} isloading={loading} type="submit" icon={dialog==='edit' ? "save" : "submit"}>{dialog==='edit' ? "Save" : "Add"}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Recaptcha ref={captchaRef} />
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
        </React.Fragment>
    );
}
const TokoItem = React.memo(TokoItemComp)

/* ============================ SETTING ============================= */
let isChange=false;
const TokoSettingComp=({classes,onBack,user})=>{
    const [input,setInput]=React.useState(null)
    const [loading,setLoading]=React.useState(false)
    const router=useRouter()
    const {toko_id}=router.query;
    const {post,get,put,del}=useAPI();
    const {setNotif} = useNotif();
    const [dialog,setDialog]=React.useState(false)
    const [dialogIsi,setDialogIsi]=React.useState(null)
    const [openUsername,setOpenUsername]=React.useState(false)
    const [loadingUsername,setLoadingUsername]=React.useState(false);
    const [option,setOption]=React.useState(['']);
    const {data:dataToko,mutate}=useToko()
    const [browser,setBrowser] = React.useState(false);
    const captchaRef = React.useRef(null);
    //const {data,error,mutate}=useSWR(`/v1/toko/${toko_id}/users?page=${page}`)

    useScrollLock()

    useMousetrap(['ctrl+s','meta+s'],(e)=>{
        handleSubmit(e)
    },true)

    const isAdmin = React.useMemo(()=>{
        if(dataToko && user) {
            const filter = dataToko.users.find(u=>u.id == user.id);
            if(filter) {
                return filter.admin;
            }
        }
        return false;
    },[dataToko,user])
    const isOwner = React.useMemo(()=>{
        if(dataToko && user) {
            const filter = dataToko.users.find(u=>u.id == user.id);
            if(filter) {
                return filter.owner;
            }
        }
        return false;
    },[dataToko,user])

    React.useEffect(()=>{
        if(dataToko && !isChange) {
            const logo = dataToko.logo === staticUrl('img/content?image=notfound.png') ? null : dataToko.logo;
            setInput({...dataToko,logo})
        }
    },[dataToko])

    React.useEffect(()=>{
        if(router?.query?.slug?.[0]!='setting') {
            isChange=false;
        }
    },[router])

    const handleEdit=React.useCallback((name,value)=>{
        isChange=true
        setInput({...input,[name]:value})
    },[input])

    const handleSubmit=React.useCallback((e)=>{
        if(e && e.preventDefault) e.preventDefault();
        setLoading(true)
        captchaRef.current?.execute()
        .then(recaptcha=>put(`/v1/toko/${toko_id}`,{...input,recaptcha}))
        .then(()=>{
            isChange=false

        })
        .catch((e)=>{
            if(e instanceof ApiError) {

            } else {
                console.log(e)
                setNotif(e?.message,true)
            }
        })
        .finally(()=>setLoading(false))
    },[put,toko_id,input,setNotif])

    const openFileManager=React.useCallback(()=>{
        setBrowser(true)
    },[])

    const handleSelectedImage=React.useCallback((dt)=>{
        isChange=true
        setInput({...input,logo:staticUrl(`img/url?image=${encodeURIComponent(dt.url)}`)})
    },[input])
    
    const openDialog=React.useCallback((type,dt)=>()=>{
        if(isAdmin) {
            if(type==='add') {
                setDialogIsi({admin:false,username:'',type:'add'})
                setDialog(true)
            } else if (type=='edit') {
                setDialogIsi({type:'edit',...dt})
                setDialog(true)
            } else {
                setDialogIsi({type:'delete',...dt})
                setDialog(true)
            }
        }
    },[isAdmin])

    const handleUsernameChange=React.useCallback((event, newValue) => {
        if(newValue) {
            setDialogIsi({...dialogIsi,username:newValue})
        }
    },[dialogIsi])

    const handleDelete=React.useCallback((userid)=>()=>{
        setLoading(true)
        del(`/v1/toko/${toko_id}/users/${userid}`)
        .then(()=>{
            setDialog(false)
            mutate()
        })
        .catch((err)=>{
            
        })
        .finally(()=>setLoading(false))
    },[del,toko_id])

    const handleUsers=React.useCallback(async(e)=>{
        if(e?.preventDefault) e.preventDefault()
        setLoading(true)
        const uuu = dialogIsi?.type==='add' ? 'add' : 'edit';
        const dt={admin:dialogIsi.admin}
        try {
            if(uuu==='add') {
                const recaptcha = await captchaRef.current?.execute();
                await post(`/v1/toko/${toko_id}/users`,{...dt,username:dialogIsi.username,recaptcha});
            } else {
                await put(`/v1/toko/${toko_id}/users/${dialogIsi.id}`,{...dt});
            }
            setDialog(false)
            mutate()
        } catch(e) {
            if(e instanceof ApiError) {

            } else {
                console.log(e)
                setNotif(e?.message,true)
            }
        } finally {
            setLoading(false)
        }
    },[post,put,toko_id,dialogIsi,setNotif])

    React.useEffect(() => {
        if(openUsername && option.length<=1) {
            setLoadingUsername(true)
            get(`/v1/user/list`,{error_notif:false,success_notif:false})
            .then(([res])=>{
                setLoadingUsername(false)
                setOption(res?.filter(r=>r != user?.user_login));
            }).catch((err)=>{
                setLoadingUsername(false)
            })
        }
    }, [openUsername]);

    const handleInputChange=(e,value,reason)=>{
        if(reason==="input") {
            const filter=option.filter(item=>item.toLowerCase().indexOf(value.toLowerCase()) > -1);
            if(filter?.length === 0){
                setLoadingUsername(true)
                get(`/v1/user/list?q=${encodeURIComponent(value)}`,{error_notif:false,success_notif:false})
                .then(([res])=>{
                    let b=option;
                    res?.filter(r=>r != user?.user_login)?.forEach((rs)=>{
                        if(option.indexOf(rs)===-1) b=b.concat(rs)
                    })
                    setOption(b);
                }).catch((err)=>{
                    
                }).finally(()=>setLoadingUsername(false))
            }
        }
    }

    return (
        <React.Fragment>
            <AppBar enableColorOnDark position="sticky">
                <Toolbar className={classes.toolbar}>
                    <IconButton edge="start" style={{marginRight:15}} onClick={onBack} size="large">
                        <Close />
                    </IconButton>
                    <Typography variant='h5' style={{flex:1}}>Setting</Typography>
                    <Button
                        disabled={!dataToko || !isTrue(isAdmin)}
                        variant='text'
                        color='grey'
                        sx={{color:'white'}}
                        size="medium"
                        onClick={handleSubmit}>Save</Button>
                </Toolbar>
            </AppBar>
            <Paper className={classes.con}>
                <Grid container justifyContent='center' spacing={0}>
                    <Grid item xs={12} md={10} lg={8}>
                        <PaperBlock title="Toko Setting" whiteBg style={{marginBottom:20}}>
                            <Grid container justifyContent='center' spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Toko Name'
                                        value={input?.name}
                                        onChange={(e)=>handleEdit('name',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        required
                                        disabled={loading || !dataToko || !isTrue(isAdmin)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Toko Slogan'
                                        value={input?.slogan||""}
                                        onChange={(e)=>handleEdit('slogan',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        disabled={loading || !dataToko || !isTrue(isAdmin)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Toko Description'
                                        value={input?.description||""}
                                        onChange={(e)=>handleEdit('description',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        multiline
                                        rows={3}
                                        disabled={loading || !dataToko || !isTrue(isAdmin)}
                                        InputProps={{
                                            className:classes.scrollBar
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Toko Address'
                                        value={input?.address||""}
                                        onChange={(e)=>handleEdit('address',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        multiline
                                        rows={3}
                                        disabled={loading || !dataToko || !isTrue(isAdmin)}
                                        InputProps={{
                                            className:classes.scrollBar
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label='Toko Footer Text'
                                        value={input?.footer||""}
                                        onChange={(e)=>handleEdit('footer',e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        disabled={loading || !dataToko || !isTrue(isAdmin)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <div style={{display:'flex',justifyContent:'center'}}>
                                        {input?.logo !== null ? (
                                            <Image type="png" withPng src={`${input?.logo}&size=100&watermark=no`} dataSrc={`${input?.logo}&watermark=no`} fancybox />
                                        ) : <Typography>No logo</Typography>}
                                    </div>
                                    <div style={{marginTop:15}}>
                                        <div className='flex-header'>
                                            <Button disabled={loading || !dataToko || !isTrue(isAdmin)} outlined onClick={openFileManager} size="small">Add logo</Button>
                                            <Button disabled={loading || !dataToko || !isTrue(isAdmin)} variant='outlined' color="secondary" onClick={()=>handleEdit("logo",null)}>Remove logo</Button>
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </PaperBlock>
                        <PaperBlock title="User Setting" style={{marginBottom:55}} noPadding divider={false} action={
                            <Button disabled={loading || !dataToko || !isTrue(isAdmin)} onClick={openDialog('add',{})}>Add Users</Button>
                        }>
                            {dataToko?.users?.length === 0 ? (
                                <center><Typography variant="h5">No data</Typography></center>
                            ) : (
                                <List>
                                    {dataToko?.users.map((dt,i)=>(
                                        <ListItem key={i} divider button alignItems="flex-start" onClick={openDialog('edit',dt)}>
                                            <ListItemAvatar>
                                                <Avatar alt={dt?.name} {...(dt?.picture !== null ? {children:<Image webp src={`${dt?.picture}&size=40&watermark=no`} style={{width:40}} alt={dt.name} />} : {children:dt?.name})} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography>{dt.name}</Typography>}
                                                secondary={`@${dt?.username}${dt?.admin ? " - ADMIN" : ""}`}
                                            />
                                            {(isOwner && !dt?.owner && dt?.username!=user.user_login) && (
                                                <ListItemSecondaryAction>
                                                    <IconButton onClick={openDialog('delete',dt)} size="large">
                                                        <Delete />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </PaperBlock>
                    </Grid>
                </Grid>
            </Paper>
            <Dialog
                open={dialog&&dialogIsi!==null&&isOwner}
                aria-labelledby='dialog'
                maxWidth='md'
                fullWidth={dialogIsi?.type!=='delete'}
                scroll='body'
                TransitionProps={{
                    onExited: ()=>setDialogIsi(null)
                }}>
                <form onSubmit={handleUsers}>
                    <DialogTitle>{dialogIsi?.type==='edit' ? "Edit Users" : dialogIsi?.type==='delete' ? "Are You Sure?" : "Add Users"}</DialogTitle>
                    <DialogContent dividers>
                        {dialogIsi?.type==='delete' ? (
                            <Typography>{`Delete @${dialogIsi?.username}?`}</Typography>
                        ) : (
                            <Grid container justifyContent='center' spacing={2}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        open={openUsername}
                                        value={dialogIsi?.username}
                                        onChange={handleUsernameChange}
                                        onInputChange={handleInputChange}
                                        id="usernameInput"
                                        isOptionEqualToValue={(option, value) => {
                                            if(typeof value==='string') return option===value;
                                        }}
                                        getOptionLabel={(option) => {
                                            if (typeof option === 'string') {
                                                return option;
                                            }
                                        }}
                                        options={option}
                                        disabled={loading||dialogIsi?.owner||dialogIsi?.username==user.user_login||dialogIsi?.type!=='add'}
                                        loading={loadingUsername || option.length===0 && openUsername}
                                        onOpen={() => {
                                            setOpenUsername(true);
                                        }}
                                        onClose={() => {
                                            setOpenUsername(false);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Username"
                                                variant="outlined"
                                                required
                                                fullWidth
                                                disabled={loading||dialogIsi?.owner||dialogIsi?.username==user.user_login||dialogIsi?.type!=='add'}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                    <React.Fragment>
                                                        {loadingUsername ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormGroup key='output-switch'>
                                        <FormControlLabel
                                            style={{marginTop:0}}
                                            control={
                                                <Switch disabled={loading||dialogIsi?.owner} checked={dialogIsi?.admin} onChange={e=>setDialogIsi({...dialogIsi,admin:e.target.checked})} color="primary" />
                                            }
                                            label="Admin"
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{mr:1}} disabled={loading} onClick={()=>setDialog(false)} color='secondary'>Cancel</Button>
                        {dialogIsi?.type==='delete' ? (
                            <Button sx={{mr:1}} disabled={loading} loading={loading} onClick={handleDelete(dialogIsi.id)} icon='delete'>Delete</Button>
                        ) : (
                            <Button disabled={loading} loading={loading} type="submit" icon='save'>Save</Button>
                        )}
                    </DialogActions>
                </form>
            </Dialog>
            <Backdrop open={loading||input===null} />
            <Recaptcha ref={captchaRef} />
            <Browser open={browser} onSelected={handleSelectedImage} onClose={()=>setBrowser(false)} />
        </React.Fragment>
    );
}
const TokoSetting = React.memo(TokoSettingComp)

/* ============================ HOME ============================= */
const TokoDetail=({classes,meta,err,user})=>{
    if(err) return <ErrorPage statusCode={err} />
    const router=useRouter()
    const {toko_id,slug}=router.query;
    const {del}=useAPI()
    const [dialog,setDialog]=React.useState(false)
    const [loadingDel,setLoadingDel]=React.useState(false)
    const {data,error}=useToko()
    const [sudahHome,setSudahHome]=React.useState(false);
    const [title,setTitle]=React.useState(meta.title)
    const [slugg,setSlugg]=React.useState()
    const [dialogMenu,setDialogMenu]=React.useState(false);

    const handleDelete=React.useCallback((id)=>()=>{
        setLoadingDel(true)
        del(`/v1/toko/${id}`)
        .then(()=>{
            router.push(`/toko`)
            setDialog(false)
        })
        .catch((err)=>{
            
        })
        .finally(()=>setLoadingDel(false))
    },[])

    const handleBack=React.useCallback(()=>{
        if(sudahHome) {
            router.back();
            setSlugg(undefined)
        }
        else {
            router.replace('/toko/[toko_id]/[[...slug]]',`/toko/${toko_id}`,{shallow:true});
            setSlugg(undefined)
        }
    },[sudahHome,toko_id])

    const downloadQR=React.useCallback(()=>{
        window?.open(`${process.env.CONTENT_URL}/download_qr/toko/${toko_id}?token=${data?.token_download_qr}`)
        setDialogMenu();
    },[toko_id,data])

    React.useEffect(()=>{
        setSlugg(slug)
        if(typeof slug==='undefined') {
            setSudahHome(true)
            setTitle(meta.title)
        } else if(slug?.[0]=='setting') {
            setTitle(`Setting - ${meta.title}`)
        } else if(slug?.[0]=='insight') {
            setTitle(`Insight - ${meta.title}`)
        } else if(slug?.[0]=='product') {
            setTitle(`Product - ${meta.title}`)
        } else if(slug?.[0]=='report') {
            setTitle(`Report - ${meta.title}`)
        } else if(slug?.[0]=='cashier') {
            setTitle(`Cashier - ${meta.title}`)
        }
    },[slug])

    return (
        <Header title={title} navTitle={meta?.title} desc={meta?.description} canonical={`/toko/${toko_id}${slug && slug.length > 0 ? `/${slug.join("/")}` : ''}`} >
            <Grid container justifyContent="center">
                <Grid item xs={12} md={10} lg={8}>
                    {!data && !error ? (
                        <Skeleton type="grid" image number={6} gridProps={{xs:6,sm:4}} />
                    ) : error ? (
                        <Typography variant="h5">{error}</Typography>
                    ) : (
                        <React.Fragment>
                            <div>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <div>
                                        {data?.logo !== null && (
                                            <center><Image type="png" withPng src={`${data?.logo}&watermark=no&size=100`} style={{maxWidth:100}} /></center>
                                        )}
                                        <center><Typography variant='h4' component='h4'>{data?.name}</Typography>
                                        {data?.address !== null && <Typography variant='body2'>{data?.address}</Typography>}</center>
                                    </div>
                                </div>
                            </div>
                            <Divider style={{margin:'20px 0'}} />
                            <div>
                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item xs={6} sm={4}>
                                        <Link href={`/toko/${toko_id}/cashier`} passHref shallow><Button component='a' variant="outlined" color="primary" className={`${classes.button} ${classes.buttonLabel}`}>
                                            <Receipt className={classes.buttonIcon} />
                                            <span>Cashier</span>
                                        </Button></Link>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Link href={`/toko/${toko_id}/product`} passHref shallow><Button component='a' variant="outlined" color="primary" className={`${classes.button} ${classes.buttonLabel}`}>
                                            <MenuBook className={classes.buttonIcon} />
                                            <span>Product</span>
                                        </Button></Link>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Link href={`/toko/${toko_id}/insight`} passHref shallow><Button component='a' variant="outlined" color="primary" className={`${classes.button} ${classes.buttonLabel}`}>
                                            <BarChart className={classes.buttonIcon} />
                                            <span>Insight</span>
                                        </Button></Link>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Link href={`/toko/${toko_id}/report`} passHref shallow><Button component='a' variant="outlined" color="primary" className={`${classes.button} ${classes.buttonLabel}`}>
                                            <Storage className={classes.buttonIcon} />
                                            <span>Report</span>
                                        </Button></Link>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Link href={`/toko/${toko_id}/setting`} passHref shallow><Button component='a' variant="outlined" color="primary" className={`${classes.button} ${classes.buttonLabel}`}>
                                            <Settings className={classes.buttonIcon} />
                                            <span>Setting</span>
                                        </Button></Link>
                                    </Grid>
                                    <Grid item xs={6} sm={4}>
                                        <Button variant="outlined" color="secondary" onClick={()=>setDialog(true)} className={`${classes.button} ${classes.buttonLabel}`}>
                                            <Delete className={classes.buttonIcon} />
                                            <span>Delete Toko</span>
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" color="primary" onClick={()=>setDialogMenu(true)} className={`${classes.button} ${classes.buttonLabel}`}>
                                            <span>Menu Online</span>
                                        </Button>
                                    </Grid>
                                </Grid>
                            </div>
                        </React.Fragment>
                    )}
                </Grid>
            </Grid>
            <Portal>
                <Slide appear={false} direction="up" in={!error && data && typeof slugg !== 'undefined'}>
                    <div id="portal-menu" style={{position:'fixed',top:0,width:0,height:'100%',width:'100%',zIndex:1000,overflowY:'auto'}}>
                        {slug?.[0] === 'setting' ? <TokoSetting onBack={handleBack} classes={classes} user={user} />
                        : slug?.[0] === 'product' ? <TokoItem onBack={handleBack} classes={classes} user={user} />
                        : slug?.[0] === 'cashier' ? <TokoKasir onBack={handleBack} classes={classes} user={user} />
                        : slug?.[0] === 'report' ? <TokoData onBack={handleBack} classes={classes} user={user} />
                        : slug?.[0] === 'insight' ? <TokoGrafik onBack={handleBack} classes={classes} />
                        : null}
                    </div>
                </Slide>
            </Portal>
            <Dialog open={dialog} aria-labelledby='dialog'>
                <DialogTitle>Are You Sure?</DialogTitle>
                <DialogContent dividers>
                    <Typography>{`Delete toko ${data?.name}?`}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button disabled={loadingDel} onClick={()=>{!loadingDel && setDialog(false)}} outlined>Cancel</Button>
                    <Button disabled={loadingDel} color="secondary" loading={loadingDel} onClick={handleDelete(data?.slug)} icon='delete'>Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogMenu} onClose={(_,r)=>{r !== 'backdropClick' && setDialogMenu(false)}} aria-labelledby='dialog' maxWidth='sm' fullWidth scroll='body'>
                <DialogTitle>Menu QR Code</DialogTitle>
                <DialogContent dividers>
                    <center>
                        <pre>
                            <code>{`${process.env.URL}/toko/${toko_id}/menu`}</code>
                        </pre>
                        <Typography gutterBottom sx={{mt:1}}><a className={`a-blank ${classes.alink}`} href={`/toko/${toko_id}/menu?utm_source=toko+dashboard&utm_medium=button+code&utm_campaign=toko`} target="_blank">MENU</a></Typography>
                        <Image src={`${process.env.CONTENT_URL}/qr/toko/${toko_id}`} style={{width:'100%',maxWidth:400,margin:'auto'}} alt={`${data?.name}'s Menu QR Code`} />
                    </center>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setDialogMenu(false)} outlined>Close</Button>
                    <Button onClick={downloadQR} icon='download'>Download</Button>
                </DialogActions>
            </Dialog>
        </Header>
    )
}

export default connect(state=>({user:state.user}))(withStyles(TokoDetail,styles))