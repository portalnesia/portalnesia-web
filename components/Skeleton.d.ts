import React from 'react'
import {SkeletonProps as SKLProps} from '@mui/material/Skeleton'
import {GridProps as GRProps} from '@mui/material'

export interface SkeletonProps extends SKLProps {
    /**
     * Type of skeleton, others: manual
     */
    type?: 'paragraph'|'list'|'grid'|'table'|'carousel'|'ads'|string
    /**
     * The number of paragraph
     */
    number?: number
    image?: boolean
    gridProps?: GRProps
    carouselProps?:{
        responsive?: ResponsiveType,
    },
    tableProps?:{
        column:number
    }
}

/**
 * 
 * Skeleton Components
 * 
 * Homepage: [Portalnesia](https://portalnesia.com)
 * 
 */
const Skeleton: React.FunctionComponent<SkeletonProps>
export default Skeleton