import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Span } from "@design/components/Dom";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Button from "@comp/Button";
import Divider from "@mui/material/Divider";
import useNotification from "@design/components/Notification";

export default function RandomNumberPages() {
    const [result,setResult] = React.useState(0)
    const [value,setValue] = React.useState({min:'0',max:'0'});
    const [error,setError] = React.useState({min:false,max:false});
    const [errText,setErrText] = React.useState<{min:string[],max:string[]}>({min:[],max:[]});
    const [loading,setLoading] = React.useState(false);
    const [animation,setAnimation] = React.useState(true);
    const setNotif = useNotification();

    const handleChange=React.useCallback((name: 'max'|'min')=>(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        setError({
            max:false,
            min:false
        });
        const val = e.target.value;
        const valNum = Number.parseInt(e.target.value);
        setValue({
            ...value,
            [name]:val
        })
        if(name==='min'){
            const valMax = Number(value.max);
            if(val.length === 0 || valNum < 0 || valMax <= valNum) {
                setError({
                    ...error,
                    min:true
                });
                const text=[];
                if(val.length === 0) text.push("Please specify a minimum number");
                if(valNum < 0) text.push("The minimum number must be greater than 0")
                if(valMax < valNum) text.push("The minimum number must be less than the maximum number")
                if(valMax === valNum) text.push("The minimum number and the maximum number can not be the same number")
                setErrText({
                    max:[],
                    min:text
                })
            } else {
                setErrText({
                    max:[],
                    min:[]
                });
            }
        } else if(name==='max'){
            const valMin = Number(value.min);
            if(val.length === 0 || valNum > 10000 || valMin >= valNum) {
                setError({
                    ...error,
                    max:true
                });
                const text=[];
                if(val.length === 0) text.push("Please specify a maximum number");
                if(valNum > 10000) text.push("The maximum number must be less than 10000")
                if(valMin > valNum) text.push("The maximum number must be greater than the minimum number")
                if(valMin === valNum) text.push("The minimum number and the maximum number can not be the same number")
                setErrText({
                    min:[],
                    max:text
                })
            } else {
                setErrText({
                    min:[],
                    max:[]
                });
            }
        }
    },[value]);

    const handleReset=React.useCallback(()=>{
        setResult(0)
        setValue({
            min:'0',
            max:'0'
        })
        setError({
            min:false,
            max:false
        })
        setErrText({
            min:[],
            max:[]
        })
    },[])

    const handleGenerate=React.useCallback(()=>{
        if(value.min.length === 0 || value.max.length === 0 || Number(value.min) >= Number(value.max) || Number(value.min) < 0 || Number(value.max) > 10000 || error.min || error.max) return setNotif("Minimum number or maximum number error",true);
        let min=value.min,max=value.max,durasi=2000,started = new Date().getTime();
        if(animation) {
            setLoading(true);
            let generator=setInterval(function(){
                if (new Date().getTime() - started > durasi) {
                    clearInterval(generator);
                    setLoading(false)
                } else {
                    let number=Math.floor(Math.random() * (+max+1 - +min)) + +min;
                    setResult(number)
                }
            },50);
        } else {
            const number=Math.floor(Math.random() * (+max+1 - +min)) + +min;
            setResult(number)
        }
    },[value,setNotif,animation])

    const handleFocus=React.useCallback((e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        e.target.select();
    },[])

    return (
        <Pages title="Random Number Generator">
            <DefaultLayout maxWidth='sm'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={3}>
                    <Typography variant='h4' component='h1'>Random Number Generator</Typography>
                </Box>

                <Box textAlign='center' mb={3}>
                    <Typography sx={{fontSize:54}}>{result}</Typography>
                </Box>

                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Min"
                                value={value.min}
                                onChange={handleChange('min')}
                                fullWidth
                                required
                                type='number'
                                disabled={loading}
                                error={error.min}
                                onFocus={handleFocus}
                                helperText={
                                    errText.min.map((err)=>(
                                        <React.Fragment key={err}>
                                            <Span>{err}</Span>
                                            <br/>
                                        </React.Fragment>
                                    ))
                                }
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Max"
                                value={value.max}
                                onChange={handleChange('max')}
                                fullWidth
                                required
                                type='number'
                                disabled={loading}
                                error={error.max}
                                onFocus={handleFocus}
                                helperText={
                                    errText.max.map((err)=>(
                                        <React.Fragment key={err}>
                                            <Span>{err}</Span>
                                            <br/>
                                        </React.Fragment>
                                    ))
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormGroup>
                                <FormControlLabel control={
                                    <Switch disabled={loading} checked={animation} onChange={event=>setAnimation(event.target.checked)} color="primary" />
                                }
                                label="Animation" />
                            </FormGroup>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{my:3}} />

                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Button disabled={loading} loading={loading} onClick={handleGenerate}>Generate</Button>
                    <Button color='error' disabled={loading} onClick={handleReset}>Reset</Button>
                </Stack>
            </DefaultLayout>
        </Pages>
    )
}