import {memo} from 'react'
import {MenuItem} from '@mui/material'
import {isMobile} from 'react-device-detect'
import {uuid} from '@portalnesia/utils'

export interface SelectProps {
    value: string|number;
    children: string|number;
    key?: string
}

const SelectComp = (props: SelectProps)=>{
    const {key,...rest} = props;

    if(isMobile) {
        return <option key={key ? `mobile-${key}`: uuid('mobile-select')} {...rest} />
    } else {
        return <MenuItem key={key ? `desktop-${key}` : uuid('desktop-select')} {...rest} />
    }
}

const Select = memo(SelectComp);
export default Select;