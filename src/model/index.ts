/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import {Session, SubscribeEmail, SessionGroup} from "./session"
import User, {UserRoles} from "./user"
import dbOri, {DB} from './db'
import './calendar'

let db: DB | undefined;

export default async function getDatabase() {
	if (!db) {
		initRelation();
		await dbOri.db.sync();
		db = dbOri;
	}
	return db;
}

function initRelation() {
	UserRoles.belongsTo(User.scope("active"), {foreignKey: "userid", targetKey: "id", onDelete: "CASCADE"})
	User.hasMany(UserRoles, {foreignKey: "userid", sourceKey: "id", onDelete: "CASCADE"})

	Session.belongsTo(User.scope("active"), {targetKey: 'id', foreignKey: 'userid', onDelete: "CASCADE"})
	Session.belongsTo(SessionGroup, {targetKey: "id", foreignKey: "session_group_id", onDelete: "CASCADE"})
	SessionGroup.hasMany(Session, {foreignKey: "session_group_id", sourceKey: "id", onDelete: "CASCADE"})

	SubscribeEmail.belongsTo(User.scope("active"), {targetKey: 'id', foreignKey: 'userid', onDelete: "CASCADE"})
	User.hasMany(SubscribeEmail, {sourceKey: 'id', foreignKey: 'userid', onDelete: "CASCADE", as: {singular: "emailSubcription", plural: "emailSubcriptions"}, scope: {subcribe: true}})
}