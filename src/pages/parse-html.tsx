import Pages from "@comp/Pages";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import { ApiError } from "@design/hooks/api";
import Button from "@comp/Button";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import Stack from "@mui/material/Stack";
import Recaptcha from "@design/components/Recaptcha";
import Textarea from "@design/components/Textarea";

export default function ParseHTMLPages() {
    const [value,setValue] = React.useState("");
    const [loading,setLoading] = React.useState(false)
    const captchaRef = React.useRef<Recaptcha>(null);
    const setNotif = useNotification();
    const {post} = useAPI();

    const handleFocus=React.useCallback((e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>)=>{
        e.target.select();
    },[])

    const handleGenerate=React.useCallback(async(e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            setLoading(true);
            const recaptcha = await captchaRef.current?.execute();
            const result = await post<string>(`/v2/tools/parse-html`,{html:value,recaptcha});
            setValue(result);
        } catch(e) {
            if(e instanceof ApiError) {
                setNotif(e.message,true)
            }
        } finally {
            setLoading(false)
        }
    },[value])

    return (
        <Pages title="Parse HTML">
            <DefaultLayout maxWidth='sm'>
                <Box borderBottom={theme=>`2px solid ${theme.palette.divider}`} pb={0.5} mb={3}>
                    <Typography variant='h4' component='h1'>Parse HTML</Typography>
                </Box>
                <Box mb={3}>
                    <Typography paragraph>Use this online converter to parse your adsense, chitika, adbrite and any HTML code into XML code compatible with all the Blogger templates or other blogs systems.</Typography>
                </Box>
                
                <form onSubmit={handleGenerate}>
                    <Box>
                        <Textarea
                            label="HTML"
                            value={value}
                            onChange={e=>setValue(e.target.value)}
                            fullWidth
                            multiline
                            minRows={10}
                            maxRows={20}
                            required
                            disabled={loading}
                            onFocus={handleFocus}
                            placeholder="<p>Hello World</p>"
                        />
                    </Box>
                    <Stack sx={{mt:3}} direction='row' justifyContent='space-between' alignItems='center'>
                        <Button disabled={loading} loading={loading} type='submit' icon='submit'>Generate</Button>
                        <Button color='error' disabled={loading} onClick={()=>setValue("")}>Reset</Button>
                    </Stack>
                </form>
            </DefaultLayout>
        </Pages>
    )
}