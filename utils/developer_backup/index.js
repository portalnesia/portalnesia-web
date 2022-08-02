import React from 'react'
import {wrapper} from 'portal/redux/store';
import ErrorPage from 'portal/pages/_error'
import Header from 'portal/components/developer/Header'

export const getServerSideProps = wrapper('login')

const Developer=({err})=>{
    if(err) return <ErrorPage statusCode={err} />

    return <div></div>
}

export default Developer