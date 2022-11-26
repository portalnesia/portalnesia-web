import axios from 'axios'

const API = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL,
    timeout:0,
})

export default API;