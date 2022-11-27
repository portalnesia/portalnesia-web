import {Model} from 'sequelize';
import db from './db'
import type { ISeen,IDate } from "@type/general"
import type { User,UserPagination } from "./user"
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes } from 'sequelize';

export type ChordPagination = {
    id: number,
    title: string,
    artist:string,
    slug: string,
    slug_artist: string,
    seen: ISeen,
    created: IDate,
    user: UserPagination,
    link: string,
    last_modified: IDate|null,
    publish: boolean
}

export interface ChordDetail extends ChordPagination {
    text: string,
    liked?: boolean;
    block: boolean;
    comment_count?: ISeen;
    dilihat_bulanan?: number;
    dilihat?: number;
    text_format?:string;
    original?: string;
    token_print?:string
}

export interface ChordDashboard extends ChordDetail {
    [key: string]: any
}

export type ChordAttribute = {
    id?: number
    userid: number
    slug: string
    slug_artist: string|null
    artist: string
    title: string
    text: string
    original: string|null
    datetime?: Date
    datetime_edit?: Date
    publish?: boolean
    sudah_publish?: boolean
    block?: boolean
    dilihat?: number
    dilihat_bulanan?: number
    youtube: string|null
    share?: boolean
    ifttt?: boolean
}

export class Chord extends Model<ChordAttribute> {
    content_type?: 'chord' | 'pages' | 'news' | 'url' | 'blog' | 'thread' | 'files' | undefined = 'chord'
    declare id: number
    declare userid: number
    declare slug: string
    declare slug_artist: string|null
    declare artist: string
    declare title: string
    declare text: string
    declare original: string|null
    declare datetime: Date
    declare datetime_edit: Date
    declare publish: boolean
    declare sudah_publish: boolean
    declare block: boolean
    declare dilihat: number
    declare dilihat_bulanan: number
    declare user: User

    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User,"userid">
    
}

Chord.init({
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    userid:{
        type: DataTypes.BIGINT
    },
    slug:{
        type:DataTypes.STRING(100)
    },
    slug_artist:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    artist:{
        type:DataTypes.STRING(100)
    },
    title:{
        type:DataTypes.STRING(100)
    },
    text:{
        type: DataTypes.TEXT
    },
    original: {
        type: DataTypes.TEXT,
        allowNull:true
    },
    datetime:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    datetime_edit:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    publish:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    sudah_publish:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    block:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    dilihat:{
        type: DataTypes.BIGINT,
        defaultValue:1
    },
    dilihat_bulanan:{
        type: DataTypes.INTEGER,
        defaultValue:1
    },
    youtube: DataTypes.TEXT,
    share:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},{
    sequelize:db.db,
    modelName:'chord',
    tableName:`${db.prefix}chord`,
    createdAt:'datetime',
    updatedAt:'datetime_edit',
    underscored:true
})

export default Chord