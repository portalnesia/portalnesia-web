import {Model} from 'sequelize';
import db from './db'
import { DataTypes } from 'sequelize'
import type {User,UserPagination} from './user'
import type { ISeen,IDate,Without } from '@type/general';
import { analyzeStaticUrl } from '@utils/main';

export const types = {
    pages:'',
    developer:''
}
export type TypesTypes = keyof typeof types;

export type PagesAttribute = {
    id?: number,
    slug: string
    type: 'blog'|'pages'|'developer'
    title: string
    text: string|null
    photo: string|null
    datetime?: Date
    datetime_edit?: Date|null
    userid: number
    userid_edit: number
    kategori: number
    tag: string|null
    format: "html"|"markdown"
    block?: boolean
    publish?: boolean
    sudah_publish?: boolean
    dilihat?: number
    dilihat_bulanan?: number
}

export const BLOG_CATEGORY = ["uncategory","tutorial","blog"];

export type BlogPagination = {
    id:number,
    title:string,
    created: IDate,
    image: string,
    slug:string,
    link:string,
    seen:ISeen,
    category: string,
    tags: string[],
    publish: boolean,
    last_modified:IDate|null;
    user:UserPagination
}

export interface BlogDetail extends BlogPagination {
    text: string;
    format:string;
    block: boolean;
    liked?: boolean;
    comment_count?: ISeen;
}

export interface BlogDashboard extends BlogDetail {

}

export type PagesDetail = Without<BlogDetail,'tags'|'category'|'block'|'liked'|'comment_count'>

export class Pages extends Model<PagesAttribute,BlogPagination> {
    content_type?: 'blog' | 'pages' | 'news' | 'chord' | 'url' | 'thread' | 'files' | undefined = 'blog';
    declare slug: string
    declare type: 'blog'|'pages'|'developer'
    declare title: string
    declare text: string|null
    declare photo: string|null
    declare datetime: Date
    declare datetime_edit: Date|null
    declare userid: number
    declare userid_edit: number
    declare kategori: string
    declare tag: string[]
    declare format: "html"|"markdown"
    declare block: boolean
    declare publish: boolean
    declare sudah_publish: boolean
    declare dilihat: number
    declare dilihat_bulanan: number
    declare user?: User
    declare editUser?: User

    
}
Pages.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    slug:{
        type: DataTypes.STRING(100),
        allowNull:true
    },
    type:{
        type: DataTypes.STRING(20),
        allowNull:false
    },
    title:{
        type: DataTypes.TEXT
    },
    text:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    photo:{
        type: DataTypes.TEXT,
        allowNull:true,
        get() {
            const val = this.getDataValue("photo")
            return val ? analyzeStaticUrl(val) : null
        },
    },
    datetime:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    datetime_edit:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    userid: {
        type: DataTypes.BIGINT,
    },
    userid_edit: {
        type: DataTypes.BIGINT,
        allowNull:true
    },
    kategori:{
        type: DataTypes.INTEGER,
        allowNull:true,
        defaultValue:0,
        get() {
            const val = this.getDataValue("kategori")
            return val !== null && typeof BLOG_CATEGORY[val] !== "undefined" ? BLOG_CATEGORY[val] : null
        },
        set(val: string|null) {
            if(val === null) {
                this.setDataValue("kategori",0)
                return;
            }
            const i = BLOG_CATEGORY.indexOf(val.toLowerCase())
            if(i > -1) {
                this.setDataValue("kategori",i)
            }
        },
    },
    tag:{
        type:DataTypes.TEXT,
        allowNull:true,
        get() {
            const val = this.getDataValue("tag")
            return typeof val === "string" && val.length > 0 ? val.split(",") : []
        },
        set(val: string[]|string|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(",")
            }
            this.setDataValue("tag",value)
        }
    },
    format:{
        type:DataTypes.STRING(10),
        defaultValue:"html"
    },
    block:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    publish:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    sudah_publish:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    dilihat:{
        type:DataTypes.BIGINT,
        defaultValue:1
    },
    dilihat_bulanan:{
        type:DataTypes.INTEGER,
        defaultValue:1
    },
},{
    sequelize:db.db,
    modelName:"page",
    tableName:`${db.prefix}pages`,
    timestamps:true,
    createdAt: 'datetime',
    updatedAt:'datetime_edit',
    underscored:true
})
export default Pages