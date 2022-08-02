import axios from 'axios'

const API = axios.create({
    baseURL:process.env.API_URL,
    timeout:0,
})

export const APILocal = axios.create({
    baseURL:process.env.API_LOCAL_URL,
    timeout:10000,
})

export const APIContent = axios.create({
    baseURL:process.env.CONTENT_URL,
    timeout:0,
})

export default API;