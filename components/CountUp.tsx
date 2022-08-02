import React from 'react'
import CountUps from 'react-countup';

export interface CountUpProps {
    data:{
        number: number,
        format: string
    }
}

const CountUpComponent=(props: CountUpProps)=>{
    const {data} = props;

    const handleCountUp=(num: number)=>{
        if(num===data?.number) {
            return data?.format;
        } else {
            return `${num}`;
        }
    }

    return <CountUps delay={1} end={data?.number} formattingFn={handleCountUp} duration={3} preserveValue />
}

const CountUp = React.memo(CountUpComponent);
export default CountUp;