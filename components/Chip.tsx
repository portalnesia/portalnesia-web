
import React from 'react'
import {Chip as Chipss,ChipProps as ChipPropss,ChipTypeMap} from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import Link from 'next/link'

const Chips = Chipss as OverridableComponent<ChipTypeMap<{href?:string}>>

export interface ChipProps extends ChipPropss {
    outlined?: boolean;
    as?: string;
    href?:string;
    component?: React.ElementType<any>;
}

function ChipComp(props: ChipProps) {
    const {href,outlined,variant:vari,as,...rest} = props;

    const variant = React.useMemo(()=>{
        if(outlined) return 'outlined'
        return variant;
    },[vari,outlined])

    if(href && !/^https?/.test(href)) {
        return (
            <Link as={as} href={href} passHref>
                <Chips component={(props)=><a {...props} className={`${props?.className} no-format`} />} variant={variant} {...rest} />
            </Link>
        )
    } else {
        return <Chips href={href} variant={variant} {...rest} />
    }
}

/**
 * 
 * Chip Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Chip = React.memo(ChipComp);
export default Chip