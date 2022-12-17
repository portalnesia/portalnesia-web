import Link from '@design/components/Link';
import NativeChip,{ChipProps as NativeChipProps,ChipTypeMap} from '@mui/material/Chip'
import { href } from '@utils/main';
import { useMemo } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent'

const Chips = NativeChip as OverridableComponent<ChipTypeMap<{href?:string,component?:string}>>

export interface ChipProps extends NativeChipProps {
    outlined?: boolean;
    link?: string
}

export default function Chip({outlined,link,variant:variantProps,...props}: ChipProps) {

    const variant = useMemo(()=>{
        if(outlined) return 'outlined';
        return variantProps;
    },[variantProps,outlined])

    const {isInternalLink,url} = useMemo(()=>{
        
        if(link) {
            const url = href(link);
            if(!/^https?/.test(url)) {
                return {
                    isInternalLink:true,
                    url
                }
            }
            return {
                isInternalLink:false,
                url
            }
        }
        return {
            isInternalLink:false,
            url:link
        }
    },[link]);

    if(isInternalLink && url) {
        return (
            <Link href={url} passHref legacyBehavior>
                <Chips component='a' variant={variant} className='no-underline' {...props} />
            </Link>
        )
    }
    return <Chips href={url} variant={variant} {...props} />
}