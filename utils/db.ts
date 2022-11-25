import mysql from 'mysql2';
import {isEmptyObj} from '@portalnesia/utils'
import crypto from './crypto'
import dayjs from 'dayjs'
import {dataUserType} from 'portal/types/user'
import {GetServerSidePropsResult} from 'next'
import { verifyToken } from './Main';

export type DBValue = string|number|boolean|null|Date|object|Array<any>
export type RecordDB = {
    [column: string]: DBValue;
};
export type WhereDB = string|RecordDB;
export type GetOption = {
    group?: string,
    order?: string,
    asc?: boolean,
    limit?: number|[number,number]
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

class DB {
    prefix?:string;
    portalnesia?: {
        id:number,
        user_nama:string,
        user_login:string,
        gambar: string|null,
        [key: string]: any
    }

    constructor(prefix?: string) {
        this.prefix=prefix??"klekle_";
    }
    async insert<D=number>(table: string,set: RecordDB) {
        let query=`INSERT INTO ${this.prefix}${table} `;
        let params: string[]=[],values: DBValue[]=[],ask: string[]=[];
        Object.keys(set).map((key,i)=>{
            params.push(key);
            ask.push("?");
            const a = set[key];
            values.push(a);
        })
        query += `(${params.join(",")}) VALUES (${ask.join(",")})`;
        const result = await this.execute<Record<string,any>>(query,values);
        if(result) return (result?.insertId||result) as D;
        throw new Error();
    }
    async get<D=Record<string,any>>(table: string,where: WhereDB,options?: GetOption,value?: DBValue[]){
        let query=`SELECT * FROM ${this.prefix}${table}`;
        let params: string[]=[],values: DBValue[]=value||[];
        if(typeof where === 'string') {
            query += ` WHERE ${where}`;

        } else {
            if(!isEmptyObj(where)) {
                query += " WHERE ";
                Object.keys(where).map((key,i)=>{
                    params.push(`${key} = ?`)
                    const a = where[key];
                    values.push(a);
                })
                query += `${params.join(" AND ")}`;
            }
        }
        if(options?.group) {
            query += ` GROUP BY ?`
            values.push(options.group);
        }
        if(options?.order) {
            if(options.order === "RAND()") {
                query += " ORDER BY RAND()";
            } else {
                query += " ORDER BY ?";
                values.push(options.order);
            }
            if(options?.asc===true) {
                query+=" ASC";
            } else {
                query+=" DESC";
            }
        }
        if(options?.limit) {
            if(typeof options.limit === 'number') {
                query += ` LIMIT ?`
                values.push(options.limit);
            } else {
                query += ` LIMIT ?,?`
                values.push(options.limit[0],options?.limit[1]);
            }
        }
        const result = await this.execute<D[]>(query,values);
        if(!result || result && result?.length === 0) return undefined;
        if(options?.limit === 1) {
            return result[0] as D;
        } else return (result as unknown) as D;
    }
    async kata<D=Record<string,any>[]>(query:string,value?: DBValue[]) {
        const a = await this.execute(query,value);
        if(!a || a &&  a?.length === 0) return undefined;
        return (a as unknown) as D;
    }
    async update(table: string,set: RecordDB,where: RecordDB,value?: DBValue[]) {
        let query=`UPDATE ${this.prefix}${table}`;
        let set_params: string[]=[],where_params: string[]=[],values: DBValue[]=value||[];
        Object.keys(set).map((key,i)=>{
            set_params.push(`${key}=?`)
            const a = set[key];
            values.push(a);
            //values.push(typeof a === 'string' ? addslashes(a) : a);
        })
        Object.keys(where).map((key,i)=>{
            where_params.push(`${key}=?`)
            const a = where[key];
            values.push(a);
            //values.push(typeof a === 'string' ? addslashes(a) : a);
        })
        query += ` SET ${set_params.join(",")} WHERE ${where_params.join(" AND ")}`;
        const result = await this.execute<Record<string,any>>(query,values);
        if(result?.affectedRows > 0) return true;
        throw new Error();
    }
    async count(table: string,query?: string,value?: DBValue[],column="*") {
        query = `SELECT COUNT(${column}) as count FROM ${this.prefix}${table}${query ? ` WHERE ${query}` : ''}`;
        const result = await this.execute(query,value);
        if(!result) return 0;
        const res = Number.parseInt(result?.[0]?.count);
        if(!Number.isNaN(res)) return res
        return 0
    }
    async sum(table: string,column: string,query?: string,value?: DBValue[]) {
        query = `SELECT SUM(${column}) as sum FROM ${this.prefix}${table}${query ? ` WHERE ${query}` : ''}`;
        const result = await this.execute(query,value);
        if(!result) return 0;
        const res = Number.parseInt(result?.[0]?.sum);
        if(!Number.isNaN(res)) return res
        return 0
    }
    async delete(table: string,where: RecordDB) {
        let query = `DELETE FROM ${this.prefix}${table}`;
        let params: string[]=[],values: DBValue[]=[];
        Object.keys(where).map((key,i)=>{
            params.push(`${key} = ?`)
            const a = where[key];
            values.push(a);
        })
        query += ` WHERE ${params.join(" AND ")}`;
        const result = await this.execute<Record<string,any>>(query,values);
        if(result?.affectedRows > 0) return true;
        throw new Error();
    }
    public async isOnline(userid: number) {
        return (await this.get("session",{userid,online:1})) !== undefined;
    }
    private async getConfig() {
        const result = await this.kata<{config:string,var: string}[]>(`SELECT * FROM ${this.prefix}settings`);
        const config: Record<string,string>={};
        result?.map(element => {
            const inc = ["ad300",'ad468','ad728','adbutton','captcha_sitekey','default_lang','description','maintenance','native_version','title'];
            if(inc.includes(element.config)) config[element.config]=element.var;
        });
        return config;
    }
    private async checkLogin(cookie: string) {
        const info = verifyToken<{id?:number,userid?:number}>(cookie.replace("%3A",":"),[30,'day']);
        if(info && info.id && info.userid) {
            const user = await this.kata<dataUserType[]>(`SELECT p1.id,p1.user_login,p1.user_nama,p1.user_email,p1.gambar,p1.private,p1.remove,p1.admin,p1.suspend,p1.active,p1.block,p1.paid,p1.paid_expired,p1.verify,p2.id as 'session_id' FROM ${this.prefix}users p1 INNER JOIN (SELECT * FROM ${this.prefix}session  WHERE id = ? AND userid = ? LIMIT 1) p2 ON p1.id = p2.userid WHERE remove = '0' AND block='0' AND active='1' AND suspend='0' LIMIT 1`,[info.id,info.userid])
            if(!user || !user[0]) return undefined;
            const us=user[0];
            us.private=Boolean(us.private)
            us.paid=Boolean(us.paid)
            us.suspend=Boolean(us.suspend)
            us.remove=Boolean(us.remove)
            us.active=Boolean(us.active)
            us.block=Boolean(us.block)
            us.admin=Boolean(us.admin)
            us.verify=Boolean(us.verify)
            us.paid_expired = us.paid_expired != null ? dayjs(us.paid_expired).format("YYYY-MM-DD HH:mm:ss") : null;
            return us;
        }
        return undefined;
    }
    async getInitial(cookie?: string) {
        let user: dataUserType=null;
        const getconfigg = await this.getConfig();
        const config=getconfigg;
        if(process.env.NODE_ENV !== "production") {
            const auth_key = "$2a$08$j9jNyZvS.KFPHIMRAEE4k.ckWmeTMdv17E3QvftgbxEfAO0K94nDm2";
            const cookies = crypto.encrypt(JSON.stringify({datetime:"2022-12-12",key:auth_key}))
            const userr= await this.checkLogin(decodeURIComponent(cookies.replace("%3A",":")));
            if(userr) user=userr;
        } else {
            if(typeof cookie !== 'undefined') {
                const userr= await this.checkLogin(decodeURIComponent(cookie.replace("%3A",":")));
                if(userr) user=userr;
            }
        }
        return {config,user}
    }
    public redirect<P>(destination?:string){
        if(destination) {
            if(process.env.NODE_ENV==='production') {
                return {
                    redirect: {
                        destination,
                        permanent:false
                    }
                } as GetServerSidePropsResult<P>
            } else {
                console.log("DEVELOPER REDIRECT",destination);
                return {
                    notFound:true
                } as GetServerSidePropsResult<P>
            }
        } else {
            return {
                notFound:true
            } as GetServerSidePropsResult<P>
        }
    }
    public init=async()=>{
        if(!this.portalnesia) {
            this.portalnesia = await this.get("users",{id:1},{limit:1});
        }
        return Promise.resolve();
    }
    private async execute<D=Record<string,any>[]>(query: string,values?:DBValue[]) {
        const [result] = await db.promise().query(query,values);
        if(!result) return undefined;
        return (result as unknown) as D
    }
}
const database = new DB();
if(!process.browser) {
    database.init()
    .catch((e)=>console.error(e));
}
export default database;