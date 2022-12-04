import {FormEvent} from 'react'

type Callback<D> = (event?:FormEvent<HTMLFormElement>) => D;

export default function submitForm<D>(callback: Callback<D>) {
    return (e?: FormEvent<HTMLFormElement>)=>{
        if(e && typeof e.preventDefault === 'function') e.preventDefault();
        return callback(e);
    }
}