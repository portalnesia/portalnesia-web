import db from "./db";
import { DataTypes, Model } from "sequelize";

export const SAPTAWARA = [
    "Redite",
    "Soma",
    "Anggara",
    "Buddha",
    "Wrespati",
    "Sukra",
    "Saniscara"
]

export const PANCAWARA = [
    "Umanis",
    "Paing",
    "Pon",
    "Wage",
    "Kliwon"
]

export const WUKU = ['sinta','landep','ukir','kulantir','tolu','gumbreg','wariga','warigadian','julungwangi','sungsang','dungulan','kuningan','langkir','medangsia','pujut','pahang','krulut','merakih','tambir','medangkungan','matal','uye','menail','prangbakat','bala','ugu','wayang','kelawu','dukut','watugunung'];

export type CalendarDetail = {
    id: number
    type: 'tilem'|'purnama'|'sasih'|'wuku'|'other'
    bali?: boolean
    text: string|null
    full_text: string|null
    date: Date
    date_bali: string|null
    image: string|null
    public: boolean
    group: boolean
    publish?: boolean
}

export type CalendarAttribute = {
    id?: number
    jenis?:'tilem'|'purname'|'other'
    jenis_bali: 'sasih'|'wuku'|null
    text: string|null
    full_text: string|null
    date: Date
    date_bali: string|null
    photo?: string
    umum?: boolean
    grup?: boolean
    publish?: boolean
    bali?: boolean
}
export class Calendar extends Model<CalendarAttribute> {
    declare id: number
    declare jenis:'tilem'|'purname'|'other'
    declare jenis_bali: 'sasih'|'wuku'|null
    declare text: string|null
    declare full_text: string|null
    declare date: Date
    declare date_bali: string|null
    declare photo: string
    declare umum: boolean
    declare grup: boolean
    declare publish: boolean
    declare bali: boolean
}

Calendar.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    jenis:{
        type: DataTypes.STRING(10),
        allowNull:false,
        defaultValue:"other"
    },
    jenis_bali:DataTypes.STRING(5),
    text:DataTypes.TEXT,
    full_text:DataTypes.TEXT,
    date:{
        type: DataTypes.DATE,
        allowNull:false
    },
    date_bali: DataTypes.TEXT,
    photo:{
        type: DataTypes.TEXT,
        allowNull:false
    },
    umum:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    },
    grup:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    publish:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    bali:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
},{
    sequelize:db.db,
    tableName:`${db.prefix}hari_penting`,
    modelName:"calendar",
    underscored:true
})

export default Calendar;