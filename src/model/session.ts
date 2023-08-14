import db from './db'
import { DataTypes, Model } from 'sequelize'
import type { User } from './user'

export type SessionAttribute = {
    id?: number
    userid: number;
}

export class Session extends Model<SessionAttribute> {
    content_type = undefined

    declare id: number
    declare userid: number

    declare user: User
}
Session.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userid: {
        type: DataTypes.BIGINT
    },
}, {
    sequelize: db.db,
    modelName: 'session',
    tableName: `${db.prefix}session`,
    createdAt: 'timestamp',
    updatedAt: "updated_at"
})

export type SubscribeEmailAttribute = {
    id?: number
    userid: number | null
    email: string | null
    name: string | null
    jenis: string
    subcribe?: boolean
}

export class SubscribeEmail extends Model<SubscribeEmailAttribute, any> {
    content_type = undefined

    declare id: number
    declare userid: number | null
    declare email: string | null
    declare name: string | null
    declare jenis: 'komentar' | 'birthday' | 'feature'
    declare subcribe: boolean
    declare user?: User
}
SubscribeEmail.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userid: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    jenis: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    subcribe: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: db.db,
    modelName: "subcribe_email",
    tableName: `${db.prefix}subcribe_email`,
    underscored: true
})

// SubscribeEmail.sync({alter:{drop:false}})