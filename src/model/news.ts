import {Model} from 'sequelize';
import db from './db'
import {staticUrl} from '@utils/main'
import type { IDate, ISeen } from '@type/general';
import { DataTypes, Op, Sequelize } from 'sequelize';

export type NewsPagination = {
    id: number,
    title: string,
    source: string,
    link: string,
    source_link: string,
    created: IDate,
    image: string,
    seen: ISeen,
    text?: string
}

export interface NewsDetail extends NewsPagination {
    text: string;
    liked?: boolean;
    comment_count?:ISeen;
    dilihat?: number;
}

export type NewsAttribute = {
    id?: number
    source: string
    title: string
    text: string
    foto: string
    url: string
    datetime?: Date
    share?: boolean
    dilihat?: number
}

/*export class News extends Model<NewsAttribute> {

    declare id: number
    declare source: string
    declare title: string
    declare text: string
    declare foto: string
    declare url: string
    declare datetime: Date
    declare share: boolean
    declare dilihat: number
}
News.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    source:{
        type: DataTypes.TEXT,
        get() {
            const val = this.getDataValue("source")
            return val.toLowerCase()
        },
        set(val: string) {
            this.setDataValue("source",val.toLowerCase())
        }
    },
    title:{
        type: DataTypes.STRING(200)
    },
    text:{
        type: DataTypes.TEXT
    },
    foto: {
        type: DataTypes.TEXT,
        get() {
            const val = this.getDataValue("foto")
            return staticUrl(!val ? undefined : `img/url?export=twibbon&size=400&image=${encodeURIComponent(val)}`)
        }
    },
    url:{
        type: DataTypes.TEXT
    },
    datetime:{
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    share: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    dilihat:{
        type: DataTypes.BIGINT,
        defaultValue:1
    }
},{
    sequelize:db.db,
    modelName:"news",
    tableName:`${db.prefix}news`,
    createdAt:"datetime",
    updatedAt:false,
    underscored:true
})

export default News*/