/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import db from './db'
import {DataTypes, Model} from 'sequelize'
import type {User} from './user'
import {IMe} from "./user";

export type SessionPagination = {
	id: number;
	timestamp: Date;
	browser: string;
	ip_address: string;
	location: string | null;
	this_browser: boolean;
	info: Record<string, any> | null
	user?: IMe
	active?: boolean;
}

export type SessionAttribute = {
	id?: number
	userid: number;
	sess_time: Date;
	session_group_id: string | null;
	active: boolean;

}

export class Session extends Model<SessionAttribute> {
	content_type = undefined

	declare id: number
	declare userid: number
	declare sess_time: Date;
	declare session_group_id: string | null;
	declare active: boolean;

	declare user: User;
	declare session_group?: SessionGroup;
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
	sess_time: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	session_group_id: DataTypes.UUID
}, {
	sequelize: db.db,
	modelName: 'session',
	tableName: `${db.prefix}session`,
	createdAt: 'timestamp',
	updatedAt: "updated_at"
});

export type SessionGroupAttribute = {
	id?: string
	sess_time: Date | null
}

export class SessionGroup extends Model<SessionGroupAttribute> {
	declare id: string
	declare sess_time: Date | null
}

SessionGroup.init({
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	sess_time: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	}
}, {
	sequelize: db.db,
	modelName: 'session_group',
	tableName: `${db.prefix}session_group`,
	createdAt: false,
	updatedAt: "sess_time",
});

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