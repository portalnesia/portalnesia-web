import Pages from "@comp/Pages";
import DashboardLayout from "@layout/dashboard";
import wrapper, { BackendError } from "@redux/store";
import { getDayJs } from "@utils/main";
import React from "react";
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import useAPI, { ApiError } from "@design/hooks/api";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import { IPages } from "@type/general";
import Recaptcha from "@design/components/Recaptcha";
import submitForm from "@utils/submit-form";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { ucwords } from "@portalnesia/utils";
import Stack from "@mui/material/Stack";
import dynamic from "next/dynamic";
import PaperBlock from "@design/components/PaperBlock";
import { CalendarDetail, PANCAWARA, SAPTAWARA, WUKU } from "@model/calendar";
import Textarea from "@design/components/Textarea";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import TextField from "@mui/material/TextField";
import ConfirmationDialog from "@design/components/ConfirmationDialog";
import { AxiosRequestConfig } from "axios";

const Backdrop = dynamic(()=>import("@design/components/Backdrop"));
const Dialog = dynamic(()=>import("@design/components/Dialog"));
const DialogActions = dynamic(()=>import("@design/components/DialogActions"));
const Select = dynamic(()=>import("@design/components/Select").then(m=>m.default),{ssr:false});
const SelectItem = dynamic(()=>import("@design/components/Select").then(m=>m.SelectItem),{ssr:false});
const FileManager = dynamic(()=>import("@comp/FileManager"));
const Image = dynamic(()=>import("@comp/Image"));

export const getServerSideProps = wrapper<CalendarDetail>(async({redirect,session,params,resolvedUrl,fetchAPI})=>{
    if(!session || !session.user.isAdmin('blog')) return redirect(); 
    const slug = params?.slug;
    if(typeof slug !== 'string') return redirect();
    
    try {
        const data: CalendarDetail = await fetchAPI<CalendarDetail>(`/v2/calendar/${slug}`);
        return {
            props:{
                data,
                meta:{
                    title:"Edit Calendar"
                }
            }
        }
    } catch(e) {
        if(e instanceof BackendError) {
            if(e?.status === 404) return redirect();
        }
        throw e;
    }
})

export default function CalendarAdminDetail({data:{id,type,bali,date:dateProps,date_bali,...data},meta}: IPages<CalendarDetail>) {    const [loading,setLoading] = React.useState(false)
    const {post,del,put} = useAPI();
    const setNotif = useNotification();
    const [input,setInput] = React.useState(data);
    const [date,setDate] = React.useState(getDayJs(dateProps))
    const [dateBali,setDateBali] = React.useState(date_bali?.split("-").map(s=>Number.parseInt(s))||null)
    const confirmRef = React.useRef<ConfirmationDialog>(null);
    const captchaRef = React.useRef<Recaptcha>(null);
    const inputEl = React.useRef<HTMLInputElement>(null);

    const handleTextChange = React.useCallback((key: 'text'|'full_text')=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setInput({
            ...input,
            [key]:e.target.value
        })
    },[input])
    const handleBooleanChange = React.useCallback((key: 'group'|'public'|'publish')=>(e: React.ChangeEvent<HTMLInputElement>)=>{
        setInput({
            ...input,
            [key]:e.target.checked
        })
    },[input])
    const handleKalenderBaliChange = React.useCallback((type: 'saptawara'|'pancawara'|'wuku')=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        const value = Number.parseInt(e.target.value);
        if(Number.isNaN(value)) return;
        const bali = [...(dateBali ? dateBali : [0,1,1])];
        if(type === 'saptawara') bali[0] = value;
        else if(type === "pancawara") bali[1] = value;
        else if(type === "wuku") bali[2] = value;
        setDateBali(bali);
    },[dateBali])

    const handleUploadImage = React.useCallback(async(e: React.ChangeEvent<HTMLInputElement>)=>{
        try {
            if(e.target.files && e.target.files.length === 1) {
                const files = e.target.files[0];
                if(files.size > 5242880) return setNotif("Sorry, your file is too large. Maximum images size is 5 MB",true);
                const type = files.type.toLowerCase();
                if(!['image/jpeg','image/png','image/jpg'].includes(type)) return setNotif("File not supported, only jpg, jpeg, png",true);
        
                setLoading(true);
                const form = new FormData();
                form.append('image',files);
                const opt: AxiosRequestConfig={
                    headers:{
                        'Content-Type':'multipart/form-data'
                    }
                }
                const res = await post<{image:string|null}>(`/v2/calendar/${id}/image`,form,opt);
                setInput({...input,image:res.image})
            } else {
                return setNotif("Something went wrong, we couldn't find your image",true);
            }
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            if(inputEl.current) inputEl.current.value = '';
            setLoading(false)
        }
    },[setNotif,post,input,id])

    const handleDeleteImage = React.useCallback(async()=>{
        try {
            const confirm = await confirmRef.current?.show();
            if(!confirm) return;

            await del(`/v2/calendar/${id}/image`);
            setInput({...input,image:null})
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    },[setNotif,del,input,id])

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    const handleSubmit = React.useCallback(submitForm(async()=>{
        try {
            setLoading(true)
            const recaptcha = await captchaRef.current?.execute();
            const data = {
                ...input,
                date:date.toISOString(),
                date_bali:dateBali ? {
                    saptawara: dateBali[0],
                    pancawara: dateBali[1],
                    wuku: dateBali[2]
                } : null,
                recaptcha
            }
            await put(`/v2/calendar/${id}`,data);
        } catch(e) {
            if(e instanceof ApiError) setNotif(e.message,true)
        } finally {
            setLoading(false)
        }
    }),[setNotif,put,input,date,dateBali])

    return (
        <Pages title={meta?.title} noIndex canonical={`/admin/calendar/${id}`}>
            <DashboardLayout adminPage>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={5}>
                    <Typography variant='h3' component='h1'>Edit Calendar</Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} lg={4}>
                                <PaperBlock title="Event's Photo">
                                    {input?.image!==null && input?.image?.length > 0 && (
                                        <Stack mb={2}><Image alt={"Thumbnail"} src={`${input?.image}&size=350&watermark=no`} dataSrc={`${input?.image}&watermark=no`} fancybox webp sx={{width:'100%',maxHeight:350,objectFit:'contain'}} /></Stack>
                                    )}
                                    <Stack direction='row' spacing={1}>
                                        {input?.image!==null && input?.image?.length > 0 ? (
                                            <Button outlined color='inherit' sx={{width:'100%'}} onClick={handleDeleteImage}>Remove</Button>
                                        ) : (
                                            <Button outlined color='inherit' sx={{width:'100%'}} onClick={()=>inputEl.current?.click()}>{"Select"}</Button>
                                        )}
                                        <input ref={inputEl} type="file" accept="image/*" style={{display:'none'}} onChange={handleUploadImage} />
                                    </Stack>
                                </PaperBlock>
                            </Grid>
                            <Grid item xs={12} lg={8}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        <Textarea
                                            value={input.text||""}
                                            onChange={handleTextChange("text")}
                                            multiline
                                            fullWidth
                                            rows={2}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Textarea
                                            value={input.full_text||""}
                                            onChange={handleTextChange("full_text")}
                                            multiline
                                            fullWidth
                                            minRows={5}
                                            maxRows={10}
                                            helperText={`Full text length: ${(input.full_text||"").length}`}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        {bali ? (
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} lg={4}>
                                                    <Select value={dateBali?.[0]||0} onChange={handleKalenderBaliChange('saptawara')} fullWidth select>
                                                        {SAPTAWARA.map((s,i)=>(
                                                            <SelectItem key={s} value={i}>{s}</SelectItem>
                                                        ))}
                                                    </Select>
                                                </Grid>
                                                <Grid item xs={12} lg={4}>
                                                    <Select value={dateBali?.[1]||1} onChange={handleKalenderBaliChange('pancawara')} fullWidth select>
                                                        {PANCAWARA.map((s,i)=>(
                                                            <SelectItem key={s} value={i+1}>{s}</SelectItem>
                                                        ))}
                                                    </Select>
                                                </Grid>
                                                <Grid item xs={12} lg={4}>
                                                    <Select value={dateBali?.[2]||1} onChange={handleKalenderBaliChange('wuku')} fullWidth select>
                                                        {WUKU.map((s,i)=>(
                                                            <SelectItem key={s} value={i+1}>{ucwords(s)}</SelectItem>
                                                        ))}
                                                    </Select>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <DatePicker
                                                inputFormat='DD MMM YYYY'
                                                value={date}
                                                onChange={e=>e && setDate(e)}
                                                renderInput={params=><TextField required fullWidth {...params} />}
                                                disableMaskedInput
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} lg={3}>
                                                <Stack alignItems="flex-start">
                                                    <FormGroup>
                                                        <FormControlLabel control={
                                                            <Switch checked={input.group} onChange={handleBooleanChange('group')} color="primary" />
                                                        }
                                                        label="Group" />
                                                    </FormGroup>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} lg={3}>
                                                <Stack alignItems="flex-start">
                                                    <FormGroup>
                                                        <FormControlLabel control={
                                                            <Switch checked={input.public} onChange={handleBooleanChange('public')} color="primary" />
                                                        }
                                                        label="Public" />
                                                    </FormGroup>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} lg={3}>
                                                <Stack alignItems="flex-start">
                                                    <FormGroup>
                                                        <FormControlLabel control={
                                                            <Switch checked={input.publish} onChange={handleBooleanChange('publish')} color="primary" />
                                                        }
                                                        label="Publish" />
                                                    </FormGroup>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} lg={3}>
                                                <Button sx={{width:'100%'}} icon="save" type="submit">Save</Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </form>
            </DashboardLayout>
            <Recaptcha ref={captchaRef} />
            <ConfirmationDialog ref={confirmRef} body={"Remove photo?"} />
            <Backdrop open={loading} />
        </Pages>
    )
}