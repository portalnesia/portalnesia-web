import {useCallback, useState,forwardRef} from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput,{OutlinedInputProps} from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export interface PasswordFormProps extends OutlinedInputProps {
    helperText?: string
}

const PasswordForm = forwardRef<any,PasswordFormProps>((props,ref)=>{
    const {fullWidth,id,label,helperText,error,type:_a,...rest} = props
    const [show,setShow] = useState(false);

    const handleShowPassword = useCallback(()=>{
        setShow(true);
    },[])
    const handleHidePassword = useCallback(()=>{
        setShow(false);
    },[])

    return (
        <FormControl error={error} fullWidth={fullWidth}>
            <InputLabel htmlFor={id}>{label}</InputLabel>
            <OutlinedInput
                ref={ref}
                id={id}
                type={show ? 'text' : 'password'}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            tabIndex={-1}
                            disableRipple
                            aria-label="toggle password visibility"
                            onMouseDown={handleShowPassword}
                            onMouseUp={handleHidePassword}
                            onTouchStart={handleShowPassword}
                            onTouchEnd={handleHidePassword}
                            title="Show Password"
                            edge="end"
                        >
                            {!show ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                label={label}
                error={error}
                {...rest}
            />
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    )
})
PasswordForm.displayName="PasswordForm"
export default PasswordForm;