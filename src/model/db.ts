import { Sequelize } from 'sequelize'

export interface PNConfig extends Record<string,string> {
    /**
     * If string length > 0, CS CLOSE WITH REASON
     * else CS OPEN
     */
    cs_closed: string,
    /**
     * String of hours
     */
    corona_share: string,
    description: string,
    /**
     * String of number
     * 0 or 1
     */
    maintenance: string
    short_url: string
}

const sequelizeProd = new Sequelize({
    dialect:'mysql',
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.HOST,
    timezone:'+07:00',
    logging:false,
    dialectModule: require("mysql2")
});

class DB {
    db = sequelizeProd
    debug = false;
    prefix = process.env.DB_PREFIX as string

    async close() {
        await sequelizeProd.close()
        return Promise.resolve()
    }
}
export type {DB}

export const db = new DB();
export default db