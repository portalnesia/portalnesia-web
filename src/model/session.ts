import db from './db'
import { DataTypes, Model } from 'sequelize'
import type {User} from './user'

export type SessionPagination = {
    id: SessionAttribute['id'];
    timestamp: Date;
    browser: SessionAttribute['browser'];
    ip_address: SessionAttribute['ip_address'];
    location: SessionAttribute['location'];
    this_browser: boolean;
    info: Record<string,any>|null
}

export type SessionAttribute = {
    id?: number
    userid: number
    browser: string
    location: string|null
    ip_address: string
    KLsubsID: string|null
    device_id: string|null
    timestamp?: Date
    sess_time: Date|null
    sess_id: string|null
    online?: boolean
    last_online: Date|null
    pkey: string|null
    info: Record<string,any>|null
    notif_birthday?: boolean
    notif_komen?: boolean
    notif_news?: boolean
    notif_fitur?: boolean
    notif_pesan?: boolean
    updated_at?: Date;
}

export class Session extends Model<SessionAttribute> {
    content_type=undefined

    declare id: number
    /**
     * @deprecated
     */
    declare auth_key: string|null
    declare userid: number
    declare browser: string
    declare location: string|null
    declare ip_address: string
    declare KLsubsID: string|null
    declare device_id: string|null
    declare timestamp: Date
    declare sess_time: Date|null
    declare sess_id: string|null
    declare online: boolean
    declare last_online: Date|null
    declare pkey: string|null
    declare info: Record<string,any>|null
    declare notif_birthday: boolean
    declare notif_komen: boolean
    declare notif_news: boolean
    declare notif_fitur: boolean
    declare notif_pesan: boolean
    declare user: User
}
Session.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userid:{
        type: DataTypes.BIGINT
    },
    browser:{
        type: DataTypes.TEXT
    },
    location:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    ip_address:{
        type: DataTypes.TEXT
    },
    KLsubsID:{
        type: DataTypes.STRING(200),
        allowNull: true
    },
    device_id:{
        type: DataTypes.STRING(50),
        allowNull: true
    },
    timestamp:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    sess_time:{
        type: DataTypes.DATE,
        allowNull: true
    },
    sess_id:{
        type: DataTypes.STRING(100),
        allowNull:true
    },
    online:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    last_online:{
        type: DataTypes.DATE,
        allowNull: true
    },
    pkey:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    info:{
        type: DataTypes.JSON
    },
    notif_birthday:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notif_komen:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notif_news:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notif_fitur:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notif_pesan:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},{
    sequelize:db.db,
    modelName:'session',
    tableName:`${db.prefix}session`,
    createdAt:'timestamp',
    updatedAt:"updated_at"
})

export type SubscribeEmailAttribute = {
    id?: number
    userid: number|null
    email: string|null
    name: string|null
    jenis: string
    subcribe?: boolean
}

export class SubscribeEmail extends Model<SubscribeEmailAttribute,any> {
    content_type=undefined

    declare id: number
    declare userid: number|null
    declare email: string|null
    declare name: string|null
    declare jenis: 'komentar'|'birthday'|'feature'
    declare subcribe: boolean
    declare user?: User
}
SubscribeEmail.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    userid:{
        type: DataTypes.BIGINT,
        allowNull: true
    },
    email:{
        type: DataTypes.STRING(50),
        allowNull: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    jenis:{
        type: DataTypes.TEXT,
        allowNull:false
    },
    subcribe:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},{
    sequelize:db.db,
    modelName:"subcribe_email",
    tableName:`${db.prefix}subcribe_email`,
    underscored:true
})

// SubscribeEmail.sync({alter:{drop:false}})