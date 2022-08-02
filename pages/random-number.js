import {useState,useRef} from 'react'
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import {AdsRect} from 'portal/components/Ads'
import {wrapper} from 'portal/redux/store';
import {Grid,Typography,TextField,FormControlLabel,FormGroup,Switch} from '@mui/material'


export const getServerSideProps = wrapper()

const RandomNumber=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const [result,setResult]=useState(0)
    const [value,setValue]=useState({min:0,max:0});
    const [error,setError]=useState({min:false,max:false});
    const [errText,setErrText]=useState({min:[],max:[]});
    const [loading,setLoading]=useState(false)
    const [animation,setAnimation]=useState(true);
    const {setNotif}=useNotif()
    const resultEl=useRef(null)

    const handleChange=(name,val)=>{
        setError({
            max:false,
            min:false
        });
        setValue({
            ...value,
            [name]:val
        })
        if(name==='min'){
            if(val.length === 0 || Number(val) < 0 || Number(value.max) <= Number(val)) {
                setError({
                    ...error,
                    min:true
                });
                const text=[];
                if(val.length === 0) text.push("Please specify a minimum number");
                if(Number(val) < 0) text.push("The minimum number must be greater than 0")
                if(Number(value.max) < Number(val)) text.push("The minimum number must be less than the maximum number")
                if(Number(value.max) === Number(val)) text.push("The minimum number and the maximum number can not be the same number")
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
            if(val.length === 0 || Number(val) > 10000 || Number(value.min) >= Number(val)) {
                setError({
                    ...error,
                    max:true
                });
                const text=[];
                if(val.length === 0) text.push("Please specify a maximum number");
                if(Number(val) > 10000) text.push("The maximum number must be less than 10000")
                if(Number(value.min) > Number(val)) text.push("The maximum number must be greater than the minimum number")
                if(Number(value.min) === Number(val)) text.push("The minimum number and the maximum number can not be the same number")
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
    }

    const handleReset=()=>{
        setResult(0)
        setValue({
            min:0,
            max:0
        })
        setError({
            min:false,
            max:false
        })
        setErrText({
            min:[],
            max:[]
        })
    }

    const handleGenerate=()=>{
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
    }

    return(
        <Header navTitle="Number Generator" iklan canonical='/random-number' active='tools' subactive='random_number' title='Random Number Generator' desc='Random Number Generator tools by Portalnesia'>
            <PaperBlock whiteBg title='Random Number Generator'
            footer={
                <div className='flex-header'>
                    <Button disabled={loading} loading={loading} icon='submit' onClick={handleGenerate}>Generate</Button>
                    <Button disabled={loading} color='secondary' onClick={handleReset}>Reset</Button>
                </div>
            }
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{textAlign:'center'}}>
                            <Typography variant='h1' ref={resultEl}>{result}</Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            id='minNumber'
                            disabled={loading}
                            type='number'
                            fullWidth
                            value={value.min}
                            onChange={(event)=>handleChange('min',event.target.value)}
                            label="Min"
                            error={error.min}
                            variant='outlined'
                            helperText={
                                errText.min.map((err,i)=>(
                                    <>
                                    <span key={`min-${i.toString()}`}>{err}</span><br key={`min-br-${i.toString()}`} />
                                    </>
                                ))
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField 
                            id='maxNumber'
                            type='number'
                            disabled={loading}
                            fullWidth
                            value={value.max}
                            onChange={(event)=>handleChange('max',event.target.value)}
                            label="Max"
                            error={error.max}
                            variant='outlined'
                            helperText={
                                errText.max.map((err,i)=>(
                                    <>
                                    <span key={`max-${i.toString()}`}>{err}</span><br key={`max-br-${i.toString()}`} />
                                    </>
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
                    <Grid item xs={12}>
                        <AdsRect />
                    </Grid>
                </Grid>
            </PaperBlock>
        </Header>
    )
}

export default RandomNumber