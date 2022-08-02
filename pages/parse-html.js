import {useState,useRef} from 'react'
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/Header'
import PaperBlock from 'portal/components/PaperBlock'
import Button from 'portal/components/Button'
import {useNotif} from 'portal/components/Notification'
import {AdsRect} from 'portal/components/Ads'
import {wrapper} from 'portal/redux/store';
import useAPI from 'portal/utils/api'
import {Grid,Typography,TextField} from '@mui/material'
import Recaptcha from 'portal/components/ReCaptcha'

export const getServerSideProps = wrapper()

const ParseHTML=({err})=>{
    if(err) return <ErrorPage statusCode={err} />
    const [value,setValue]=useState("");
    const [loading,setLoading]=useState(false)
    const {setNotif}=useNotif()
    const formEl=useRef(null);
    const {post} = useAPI()
    const captchaRef = useRef(null)

    const handleReset=()=>{
        setValue("");
    }

    const handleChange=(val)=>{
        setValue(val);
    }

    const handleGenerate=(e)=>{
        e.preventDefault();
        setLoading(true);
        captchaRef.current?.execute()
        .then(recaptcha=>post(`/v1/tools/parse-html`,{html:value,recaptcha},{},{success_notif:false}))
        .then(([res])=>{
            setLoading(false);
            setValue(res);
        }).catch(()=>{
            setLoading(false);
            setNotif("Something  went wrong",true);
        })
    }

    return (
        <Header navTitle="Parse HTML" iklan canonical='/parse-html' active='tools' subactive='parse_html' title='Parse HTML' desc='Parse HTML code into XML code compatible with all the Blogger templates or other blogs systems.'>
            <PaperBlock whiteBg title='Parse HTML' desc='Use this online converter to parse your adsense, chitika, adbrite and any HTML code into XML code compatible with all the Blogger templates or other blogs systems.'
            >
                <form ref={formEl} onSubmit={handleGenerate}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label='HTML' multiline variant='outlined' fullWidth rows={10} maxRows={30} placeholder="&lt;p class=&quot;class-example&quot;&gt;Text Example&lt;/p&gt;" value={value} onChange={(event)=>handleChange(event.target.value)} required />
                            <AdsRect />
                        </Grid>
                        <Grid item xs={12}>
                            <div className='flex-header'>
                                <Button type='submit' size='small' disabled={loading} loading={loading} icon='submit'>Generate</Button>
                                <Button disabled={loading} color='secondary' onClick={handleReset}>Reset</Button>
                            </div>
                        </Grid>
                    </Grid>
                </form>
            </PaperBlock>
            <Recaptcha ref={captchaRef} />
        </Header>
    );
}

export default ParseHTML