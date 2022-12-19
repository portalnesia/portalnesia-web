import { Div } from "@design/components/Dom";
import { SortableContainer, SortableHandle } from "react-sortable-hoc";


export const SortContainer=SortableContainer<{children: React.ReactNode}>(({children}: {children: React.ReactNode})=>(
    <Div sx={{position:'relative',zIndex:0,my:1,bgcolor:'Background.default'}}>{children}</Div>
))

export const DragHandle=SortableHandle(()=>(
    <Div sx={{
        position:'relative',
        cursor:'row-resize',
        top:1,
        display:'block',
        width:18,
        height:11,
        opacity:'.55',
        mr:2,
        background:'linear-gradient(180deg,#000,#000 20%,#fff 0,#fff 40%,#000 0,#000 60%,#fff 0,#fff 80%,#000 0,#000)'
    }} />
));