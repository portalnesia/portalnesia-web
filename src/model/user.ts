/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import db from './db'
import {DataTypes, FindOptions, Model, Op, Sequelize} from 'sequelize'
import {ucwords} from '@portalnesia/utils';
import type {
	HasManyAddAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyHasAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyRemoveAssociationsMixin,
	HasManyCountAssociationsMixin,
	HasManyGetAssociationsMixin,
	HasManySetAssociationsMixin,
	HasManyCreateAssociationMixin,
	BelongsToGetAssociationMixin,
	BelongsToSetAssociationMixin
} from "sequelize";
import {SubscribeEmail, SubscribeEmailAttribute} from './session';
import {HasManyAddAssociationMixin} from './types'
import {profileUrl} from '@utils/main';

export const USER_GENDER = ["Male", "Female"];

export interface UserDetail extends UserPagination {
	about: string;
	private: boolean;
	verify: boolean;
	suspend: boolean;
	paid?: boolean;
	media_private: boolean;
	isFollowing: boolean;
	isFollower: boolean;
	isFollowPending: boolean;
	twitter?: { label: string, url: string } | null;
	facebook?: { label: string, url: string };
	telegram?: { label: string, url: string } | null;
	birthday?: Date,
	follower_count: number;
	following_count: number;
	email?: string;
	token_qr?: string;
	website: { label: string, url: string } | null;
}

export type UserPagination = {
	id: number,
	picture: string | null,
	name: string,
	username: string,
}

export type IMe = UserPagination & ({
	email: string
	session_id?: number;
	session_group_id?: string;
})

export type UserRolesType = "comment" | "pages" | "chord" | "blog" | "url" | "thread" | "support" | "event" | "developer"

export type UserAttribute = {
	id?: number;
	user_login: string;
	user_email: string;
	user_nama: string | null;
	gambar: string | null;
	active: boolean;
	private: boolean;
	block: boolean;
	suspend: boolean;
	verify: boolean;
	remove: boolean;
}

export class User extends Model<UserAttribute> {
	declare id: number
	declare user_login: string
	declare user_email: string
	declare user_nama: string | null
	declare gambar: string | null
	declare active: boolean
	declare block: boolean
	declare suspend: boolean
	declare private: boolean;
	declare verify: boolean
	declare remove: boolean
	declare userRoles?: UserRoles[]

	declare getUserRoles: HasManyGetAssociationsMixin<UserRoles>;

	toPagination() {
		return {
			id: this.id,
			name: this.user_nama || "",
			username: this.user_login,
			picture: profileUrl(this.gambar),
			verify: this.verify,
			email: this.user_email
		}
	}

	async initUserRoles() {
		this.userRoles = await this.getUserRoles({
			where: {
				[Op.or]: {
					superadmin: true,
					roles: {
						[Op.not]: null
					}
				}
			}
		})
	}

	isAdmin(roles?: UserRolesType, superadmin = false, apps = 'portalnesia') {
		if (!this.userRoles) return false;
		const userRoles = (roles || superadmin) ? this.userRoles.filter(r => {
			return r.apps === apps && (
				(typeof roles !== 'undefined' && r.roles === roles) || r.superadmin
			)
		}) : this.userRoles;

		return userRoles.length > 0
	}
}

User.init({
	id: {
		type: DataTypes.BIGINT,
		primaryKey: true,
		autoIncrement: true
	},
	user_login: {
		type: DataTypes.STRING(60),
		allowNull: false
	},
	user_email: {
		type: DataTypes.STRING,
		allowNull: false
	},
	user_nama: {
		type: DataTypes.STRING,
	},
	gambar: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	private: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	block: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	suspend: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	verify: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	remove: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
}, {
	sequelize: db.db,
	modelName: "user",
	tableName: `${db.prefix}users`,
	createdAt: "registrasi",
	scopes: {
		active: {
			where: {
				active: true,
				block: false,
				remove: false,
				suspend: false
			}
		}
	},
	updatedAt: 'updated_at'
})

type UserRolesAttribute = {
	id?: number
	userid: number
	apps: string | null
	superadmin: boolean
	roles: string | null
}

export class UserRoles extends Model<UserRolesAttribute> {
	declare id: number
	declare userid: number
	declare apps: string | null
	declare superadmin: boolean
	declare roles: string | null
	declare user?: User
}

UserRoles.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	userid: {
		type: DataTypes.BIGINT,
		allowNull: false
	},
	apps: {
		type: DataTypes.TEXT,
	},
	superadmin: {
		type: DataTypes.BOOLEAN
	},
	roles: {
		type: DataTypes.TEXT,
	}
}, {
	sequelize: db.db,
	modelName: "userRole",
	tableName: `${db.prefix}users_roles`,
	timestamps: false,
	underscored: true
})


export default User