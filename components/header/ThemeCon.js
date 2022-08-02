import React from 'react'
import {ArrowBack} from '@mui/icons-material'
import {Popover,Grid,Typography,FormControl,Radio,RadioGroup,FormControlLabel} from '@mui/material'
import {useDarkTheme} from 'portal/utils/useDarkTheme'
import dynamic from 'next/dynamic'

const Divider=dynamic(()=>import('@mui/material/Divider'),{ssr:false})
const IconButton=dynamic(()=>import('@mui/material/IconButton'),{ssr:false})


const Themes = ({anchorEl,openMenu,handleClose,setOpenMenu,setAnchorEl,mobile})=>{
    const {theme,setTheme}=useDarkTheme()

    const handleChange=(e)=>{
        setTheme(e?.target?.value||"auto")
    }

    return (
        <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={openMenu === 'theme'}
            onClose={handleClose}
        >
            <div>
                <div style={{padding:'8px 8px 0 8px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <IconButton
                            sx={{
                                mr:5
                            }}
                            onClick={(event)=>{
                                if(mobile) {
                                    setAnchorEl(null);
                                    setOpenMenu(null);
                                }
                                else setOpenMenu('user-setting')
                            }}
                            size="large"><ArrowBack /></IconButton>
                        <Typography variant="h5" sx={{mr:16}}>Themes</Typography>
                    </div>
                </div>
                <Divider style={{margin:'10px 0'}} />
                <div style={{padding:'0 8px 10px 8px'}}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12}>
                            <FormControl component='fieldset'>
                                <RadioGroup aria-label="themes" name="themes" value={theme} onChange={handleChange}>
                                    <FormControlLabel sx={{ml:0}} value="auto" control={<Radio />} label="System Theme" />
                                    <FormControlLabel sx={{ml:0}} value="light" control={<Radio />} label="Light Theme" />
                                    <FormControlLabel sx={{ml:0}} value="dark" control={<Radio />} label="Dark Theme" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </Popover>
    );
}
export default Themes