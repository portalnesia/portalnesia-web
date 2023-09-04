import Pages from "@comp/Pages";
import useSWR from "@design/hooks/swr";
import Typography from "@mui/material/Typography";
import DefaultLayout from "@layout/default";
import Box from "@mui/material/Box";
import React from "react";
import Grid from "@mui/material/Grid";
import { ApiError, PaginationResponse } from "@design/hooks/api";
import { copyTextBrowser } from "@portalnesia/utils";
import Button from "@comp/Button";
import TextField from "@mui/material/TextField";
import useNotification from "@design/components/Notification";
import useAPI from "@design/hooks/api";
import { Span } from "@design/components/Dom";
import IconButton from "@mui/material/IconButton";
import { Close } from "@mui/icons-material";
import dynamic from "next/dynamic";
import Recaptcha from "@design/components/Recaptcha";
import Divider from "@mui/material/Divider";
import { usePagination } from "@design/components/Pagination";
import Textarea from "@design/components/Textarea";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import SWRPages from "@comp/SWRPages";
import Ads300 from "@comp/ads/Ads300";
import Stack from "@mui/material/Stack";
import AdsNative from "@comp/ads/AdsNative";

const Dialog = dynamic(() => import("@design/components/Dialog"))
const InputAdornment = dynamic(() => import("@mui/material/InputAdornment"))
const List = dynamic(() => import("@mui/material/List"))
const ListItemButton = dynamic(() => import("@mui/material/ListItemButton"))
const ListItemText = dynamic(() => import("@mui/material/ListItemText"))
const Pagination = dynamic(() => import("@design/components/Pagination"))


type IEpsg = {
    code: string,
    name: string | null,
    area: string | null
}

const placeholder = "Decimal values formats, example:\r\n- 18.5;54.2\r\n- 113.4 46.78\r\n- 16.9,67.8\r\n\r\nGeodetic or GPS formats, example:\r\n- 41°26'47\"N 71°58'36\"W\r\n- 42d26'47\"N;72d58'36\"W\r\n- 43d26'46\"N,73d56'55\"W"
export default function TransformCoordinate() {
    const [srcEpsg, setSrcEpsg] = React.useState({ from: '4326', to: '4326' })
    const [textEpsg, setTextEpsg] = React.useState({ from: 'WGS 84 (EPSG:4326)', to: 'WGS 84 (EPSG:4326)' })
    const [switchVal, setSwitch] = React.useState({ switch: false, add_input: false })
    const [input, setInput] = React.useState("")
    const [output, setOutput] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [dialog, setDialog] = React.useState<'input' | 'output' | null>(null)
    const [page, setPage] = usePagination(1);
    const [search, setSearch] = React.useState("");
    const [q, setQ] = React.useState("");
    const setNotif = useNotification();
    const { post } = useAPI();
    const { data: epsg, error: errEpsg } = useSWR<PaginationResponse<IEpsg>>(!dialog ? null : `/v2/geodata/epsg?page=${page}&q=${encodeURIComponent(q)}`);

    const closeDialog = React.useCallback(() => {
        setDialog(null)
    }, [])

    const openDialog = React.useCallback((type: 'input' | 'output') => () => {
        setDialog(type)
        setPage(undefined, 1)
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [])

    const captchaRef = React.useRef<Recaptcha>(null)

    const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const recaptcha = await captchaRef.current?.execute();
            const result = await post<string[]>(`/v2/geodata/transform-coordinates`, { input, ...switchVal, ...srcEpsg, recaptcha });
            if (result?.length > 0) setOutput(result?.join("\n"));
        } catch (e) {
            if (e instanceof ApiError) {
                setNotif(e.message, true)
            }
        } finally {
            setLoading(false)
        }
    }, [setNotif, post, input, switchVal, srcEpsg]);

    const handleSearch = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(undefined, 1);
        setQ(search)
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [search])

    const removeSearch = React.useCallback(() => {
        setQ("")
        setSearch("")
        setPage(undefined, 1)
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [])

    const handleDataClick = React.useCallback((type: 'input' | 'output', dt: IEpsg) => () => {
        if (type === 'input') {
            setSrcEpsg({
                ...srcEpsg,
                from: dt.code
            })
            setTextEpsg({
                ...textEpsg,
                from: `${dt.name} (EPSG:${dt.code})`
            })
            closeDialog()
        } else {
            setSrcEpsg({
                ...srcEpsg,
                to: dt.code
            })
            setTextEpsg({
                ...textEpsg,
                to: `${dt.name} (EPSG:${dt.code})`
            })
            closeDialog()
        }
    }, [closeDialog, srcEpsg, textEpsg])

    const handleCopy = React.useCallback((data: string) => () => {
        copyTextBrowser(data);
        setNotif('Text copied', 'default');
    }, [setNotif])

    return (
        <Pages title="Transform Coordinate - Geodata" canonical="/geodata/transform">
            <DefaultLayout>
                <Box borderBottom={theme => `2px solid ${theme.palette.divider}`} pb={0.5} mb={2}>
                    <Typography variant='h4' component='h1'>Transform Coordinate</Typography>
                </Box>
                <Box>
                    <Typography paragraph>{`This on-line tool allows you to insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection. You can insert value pairs to the text area labeled as "Input coordinate pairs" - also by using copy/paste even from MS Excell or similar programs. This tool accepts various input formats of value pairs - only what you need is to have one pair by a row. Please see examples in the input text area window.`}</Typography>
                    <Typography paragraph>{`It is necessary to set appropriate input coordinate system and to set desired output coordinate system to which you want to transform the input coordinate pairs.`}</Typography>
                </Box>

                <Stack my={3}><AdsNative /></Stack>

                <Divider sx={{ my: 3 }} />

                <Box width='100%'>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" component='h3' paragraph>Input Coordinate System / Projection</Typography>
                            <Typography paragraph>{textEpsg.from}</Typography>
                            <Button outlined color='inherit' onClick={openDialog('input')}>Choose Coordinate System</Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" component='h3' paragraph>Output Coordinate System / Projection</Typography>
                            <Typography paragraph>{textEpsg.to}</Typography>
                            <Button outlined color='inherit' onClick={openDialog('output')}>Choose Coordinate System</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                <form onSubmit={handleSubmit}>
                    <Box>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant='h6' gutterBottom>Input Coordinate Pairs*</Typography>
                                <Textarea
                                    fullWidth
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    multiline
                                    rows={15}
                                    required
                                    placeholder={placeholder}
                                    disabled={loading}
                                />
                                <FormGroup key='input-switch' sx={{ mt: 1 }}>
                                    <FormControlLabel control={
                                        <Switch disabled={loading} checked={switchVal.switch} onChange={event => setSwitch({ ...switchVal, switch: event.target.checked })} color="primary" />
                                    }
                                        label="Switch X <--> Y" />
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant='h6' gutterBottom>Output Coordinate Pairs</Typography>
                                <Textarea
                                    fullWidth
                                    value={output}
                                    InputProps={{ readOnly: true }}
                                    multiline
                                    rows={15}
                                    disabled={loading}
                                    onFocus={handleCopy(output)}
                                />
                                <FormGroup key='output-switch' sx={{ mt: 1 }}>
                                    <FormControlLabel control={
                                        <Switch disabled={loading} checked={switchVal.add_input} onChange={event => setSwitch({ ...switchVal, add_input: event.target.checked })} color="primary" />
                                    }
                                        label="Include input coordinates" />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography><Span sx={{ color: 'error.main', fontWeight: 'bold' }}>Beware!</Span>{` Inserted values pairs needs to be in order X-coordinate and then Y-coordinate. If you are inserting latitude/longitude values in decimal format, then the longitude should be first value of the pair (X-coordinate) and latitude the second value (Y-coordinate). Otherwise you can use choice "Switch XY" bellow the input text area window.`}</Typography>

                        <Stack my={4}>
                            <Ads300 />
                        </Stack>
                        <Box textAlign={'center'}>
                            <Button icon='submit' disabled={loading} loading={loading} type='submit'>Transform</Button>
                        </Box>
                    </Box>
                </form>
            </DefaultLayout>

            <Dialog open={dialog !== null} handleClose={closeDialog} title="Coordinate Reference System" content={{ sx: { px: 0 } }} sx={{ px: 0 }}>
                <Box mb={2} px={3}>
                    <form onSubmit={handleSearch}>
                        <TextField
                            fullWidth
                            variant='outlined'
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Type EPSG or name or area to search..."
                            {...(search.length > 0 ? {
                                InputProps: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onMouseDown={e => e.preventDefault()}
                                                edge="end"
                                                onClick={removeSearch}
                                            >
                                                <Close />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            } : {})}
                        />
                    </form>
                </Box>
                <SWRPages loading={!epsg && !errEpsg} error={errEpsg}>
                    {dialog && epsg && epsg?.data?.length > 0 ? (
                        <List>
                            {epsg?.data?.map(e => (
                                <ListItemButton key={e.code} sx={{ px: 3 }} divider onClick={handleDataClick(dialog, e)}>
                                    <ListItemText
                                        primary={<Typography sx={{ fontSize: '1rem' }}>{e.code}</Typography>}
                                        secondary={
                                            <>
                                                <Typography sx={{ fontSize: 14 }}>{e.name}</Typography>
                                                <Typography sx={{ fontSize: 14 }}>{e.area}</Typography>
                                            </>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ) : (
                        <Box textAlign='center' px={3} my={10}>
                            <Typography>No data</Typography>
                        </Box>
                    )}

                    <Box px={3}>
                        <Pagination page={page} count={epsg?.total_page || 1} onChange={setPage} />
                    </Box>
                </SWRPages>
            </Dialog>
            <Recaptcha ref={captchaRef} />
        </Pages>
    )
}