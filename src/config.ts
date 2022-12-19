import jsonConfig from '../config.json'

const config = jsonConfig;

export const domainCookie = process.env.NODE_ENV==="production" ? ".portalnesia.com" : "localhost";

export default config;