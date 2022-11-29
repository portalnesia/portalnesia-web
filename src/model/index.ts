import { Session, SubscribeEmail } from "./session"
import User, { Follow } from "./user"
import dbOri,{DB} from './db'

let db: DB|undefined;

export default async function getDatabase() {
    if(!db) {
        initRelation();
        await dbOri.db.sync();
        db = dbOri;
    }
    return db;
}

function initRelation() {
    User.belongsToMany(User.scope("active"),{through:Follow,foreignKey:"difollow",otherKey:"yangfollow",as:{singular:"follower",plural:"followers"}})
    User.belongsToMany(User.scope("active"),{through:Follow,foreignKey:"yangfollow",otherKey:"difollow",as:{singular:"following",plural:"followings"}})

    Session.belongsTo(User.scope("active"),{targetKey:'id',foreignKey:'userid',onDelete:"CASCADE"})
    SubscribeEmail.belongsTo(User.scope("active"),{targetKey:'id',foreignKey:'userid',onDelete:"CASCADE"})
    User.hasMany(SubscribeEmail,{sourceKey:'id',foreignKey:'userid',onDelete:"CASCADE",as:{singular:"emailSubcription",plural:"emailSubcriptions"},scope:{subcribe:true}})
}