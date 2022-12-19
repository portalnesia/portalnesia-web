import { Session, SubscribeEmail } from "./session"
import User, { Follow, UserRoles } from "./user"
import dbOri,{DB} from './db'
import './calendar'

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

    UserRoles.belongsTo(User.scope("active"),{foreignKey:"userid",targetKey:"id",onDelete:"CASCADE"})
    User.hasMany(UserRoles,{foreignKey:"userid",sourceKey:"id",onDelete:"CASCADE"})

    Session.belongsTo(User.scope("active"),{targetKey:'id',foreignKey:'userid',onDelete:"CASCADE"})
    SubscribeEmail.belongsTo(User.scope("active"),{targetKey:'id',foreignKey:'userid',onDelete:"CASCADE"})
    User.hasMany(SubscribeEmail,{sourceKey:'id',foreignKey:'userid',onDelete:"CASCADE",as:{singular:"emailSubcription",plural:"emailSubcriptions"},scope:{subcribe:true}})
}