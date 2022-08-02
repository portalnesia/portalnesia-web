import * as clr from '@mui/material/colors';

const colors=['deepOrange', 'deepPurple','red','pink','purple','blue','brown','blueGrey','green','lightBlue','lightGreen','yellow','amber','cyan','teal','orange'] as Array<keyof typeof clr>;

export const color=(theme: any)=>{
    let obj: Record<string,{color:string,backgroundColor: string}>={}
    colors.map((dt)=>{
        const color = clr?.[dt] as Record<number,string>;
        obj[dt]={
            color: theme.palette.getContrastText(color?.[500]),
            backgroundColor: color?.[500],
        }
    })
    return obj;
}

export const getAvatarColor=()=>{
    const l=colors.length
    const random=Math.floor(Math.random() * l);
    return colors?.[random]
}