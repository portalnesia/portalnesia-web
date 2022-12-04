import db from './db'
import { DataTypes, FindOptions, Model, Op, Sequelize } from 'sequelize'
import { ucwords } from '@portalnesia/utils';
import type { HasManyAddAssociationsMixin, HasManyRemoveAssociationMixin, HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin, HasManyRemoveAssociationsMixin, HasManyCountAssociationsMixin, 
    HasManyGetAssociationsMixin,HasManySetAssociationsMixin,HasManyCreateAssociationMixin,BelongsToGetAssociationMixin,BelongsToSetAssociationMixin } from "sequelize";
import { SubscribeEmail, SubscribeEmailAttribute } from './session';
import {HasManyAddAssociationMixin} from './types'
import { profileUrl } from '@utils/main';

export const USER_GENDER=["Male","Female"];

export type UserPagination={
    id: number,
    picture: string|null,
    name: string,
    username: string,
    //verify: boolean
}

export type IMe = UserPagination & ({
    email: string
})

export interface UserDetail extends UserPagination {
    about: string;
    private:boolean;
    verify: boolean;
    suspend: boolean;
    paid?: boolean;
    media_private: boolean;
    isFollowing: boolean;
    isFollower: boolean;
    isFollowPending: boolean;
    //instagram?: string|null;
    twitter?: string|null;
    facebook?: string;
    telegram?: string|null;
    //line?: string|null;
    birthday?: Date,
    follower_count: number;
    following_count:number;
    //media_count:number;
    email?: string
}

export type UserWebAuthn = {
    key: string,
    id: string,
    datetime: string,
    device: string
}

type FollowFn<D=void> = (user: User) => Promise<D>

export type UserRolesType = "comment" | "pages" | "chord" | "blog" | "url" | "thread" | "support"

export type UserAttribute = {
    id?: number
    user_login: string
    user_pass: string|null
    user_email: string|null
    user_nama: string|null
    gender: number|null
    birthday: Date|null
    country_telephone: string|null
    telephone: string|null
    full_telp: string|null
    firebase_uid: string|null
    line: string|null
    line_id: string|null
    google: string|null
    google_email: string|null
    telegram: {id: string,first_name: string,last_name: string,username: string,auth_date: number,photo_url: string,hash: string} | null | null
    telegram_id: string|null
    ig_token: {token: string,id: string} | null
    instagram: string|null
    biodata: string|null
    gambar: string|null
    api: string|null
    user_activation_key: string|null
    active?: boolean
    private?: boolean
    media_private?: boolean
    block?: boolean
    suspend?: boolean
    verify?: boolean
    registrasi: Date|null
    location: string|null
    remove?: boolean
    remove_date: Date|null
    twitter: string|null
    twitter_token: {oauth_token: string,oauth_token_secret: string,screen_name: string,user_id: string} | null
    fa_enable?: boolean
    FA: string|null
    security_key: UserWebAuthn[]|null
    new_email: string|null
    last_change_username: Date|null
    mail_queue?: boolean
    paid?: boolean
    paid_expired: Date|null
    prkey?: string|null
    pukey?: string|null
    updated_at?: Date
}

export class User extends Model<UserAttribute> {
    declare id: number
    declare user_login: string
    declare user_pass: string|null
    declare user_email: string
    declare user_nama: string|null
    declare gender: "Male"|"Female"|null
    declare birthday: Date|null
    declare birth: string|null
    declare country_telephone: string|null
    declare telephone: string|null
    declare full_telp: string|null
    declare firebase_uid: string|null
    //declare line: string|null
    //declare line_id: string|null
    declare google: string|null
    declare google_email: string|null
    declare telegram: {id: string,first_name: string,last_name: string,username: string,auth_date: number,photo_url: string,hash: string} | null
    declare telegram_id: string|null
    declare ig_token: {token: string,id: string} | null
    //declare instagram: string|null
    declare biodata: string|null
    declare gambar: string|null
    declare api: string|null
    declare user_activation_key: string|null
    declare active: boolean
    declare private: boolean
    declare media_private: boolean
    declare block: boolean
    declare suspend: boolean
    declare verify: boolean
    declare registrasi: Date|null
    declare location: string|null
    declare remove: boolean
    declare remove_date: Date|null
    declare twitter: string|null
    declare twitter_token: {oauth_token: string,oauth_token_secret: string,screen_name: string,user_id: string} | null
    declare fa_enable: boolean
    declare FA: string|null
    declare security_key: UserWebAuthn[]|null
    declare new_email: string|null
    declare last_change_username: Date|null
    declare mail_queue: boolean
    declare paid: boolean
    declare paid_expired: Date|null
    declare prkey: string|null
    declare pukey: string|null
    declare session_id?: string
    declare session_id_number?: number
    declare session_datetime?: string
    declare pkey?: string
    /**
     * Only with getFollowers | getFollowings
     */
    declare follow?: Follow
    declare followers?: User[]
    declare followings?: User[]
    declare userRoles?: UserRoles[]
    declare emailSubcriptions?: SubscribeEmail[]

    /**
     * Source code in `./associations-function`
     */
    declare acceptPendingFollower: FollowFn
    /**
     * Source code in `./associations-function`
     */
    declare followUser: FollowFn<{following:boolean,pending: boolean}>

    declare addFollower: HasManyAddAssociationMixin<User, number,UserAttribute,FollowAttribute>;
    declare removeFollower: HasManyRemoveAssociationMixin<User, number>;
    declare hasFollower: HasManyHasAssociationMixin<User, number>;
    declare addFollowers: HasManyAddAssociationsMixin<User, number>;
    declare removeFollowers: HasManyRemoveAssociationsMixin<User, number>;
    declare hasFollowers: HasManyHasAssociationsMixin<User, number>;
    declare countFollowers: HasManyCountAssociationsMixin;
    declare getFollowers: HasManyGetAssociationsMixin<User>;
    declare setFollowers: HasManySetAssociationsMixin<User, number>;

    declare addFollowing: HasManyAddAssociationMixin<User, number,UserAttribute,FollowAttribute>;
    declare removeFollowing: HasManyRemoveAssociationMixin<User, number>;
    declare hasFollowing: HasManyHasAssociationMixin<User, number>;
    declare addFollowings: HasManyAddAssociationsMixin<User, number>;
    declare removeFollowings: HasManyRemoveAssociationsMixin<User, number>;
    declare hasFollowings: HasManyHasAssociationsMixin<User, number>;
    declare countFollowings: HasManyCountAssociationsMixin;
    declare getFollowings: HasManyGetAssociationsMixin<User>;
    declare setFollowings: HasManySetAssociationsMixin<User, number>;

    declare addUserRole: HasManyAddAssociationMixin<UserRoles, number,UserRolesAttribute>;
    declare removeUserRole: HasManyRemoveAssociationMixin<UserRoles, number>;
    declare hasUserRole: HasManyHasAssociationMixin<UserRoles, number>;
    declare addUserRoles: HasManyAddAssociationsMixin<UserRoles, number>;
    declare removeUserRoles: HasManyRemoveAssociationsMixin<UserRoles, number>;
    declare hasUserRoles: HasManyHasAssociationsMixin<UserRoles, number>;
    declare countUserRoles: HasManyCountAssociationsMixin;
    declare getUserRoles: HasManyGetAssociationsMixin<UserRoles>;
    declare setUserRoles: HasManySetAssociationsMixin<UserRoles, number>;
    declare createUserRole: HasManyCreateAssociationMixin<UserRoles,"userid">

    declare addEmailSubcription: HasManyAddAssociationMixin<SubscribeEmail, number, SubscribeEmailAttribute>;
    declare removeEmailSubcription: HasManyRemoveAssociationMixin<SubscribeEmail, number>;
    declare hasEmailSubcription: HasManyHasAssociationMixin<SubscribeEmail, number>;
    declare addEmailSubcriptions: HasManyAddAssociationsMixin<SubscribeEmail, number>;
    declare removeEmailSubcriptions: HasManyRemoveAssociationsMixin<SubscribeEmail, number>;
    declare hasEmailSubcriptions: HasManyHasAssociationsMixin<SubscribeEmail, number>;
    declare countEmailSubcriptions: HasManyCountAssociationsMixin;
    declare getEmailSubcriptions: HasManyGetAssociationsMixin<SubscribeEmail>;
    declare setEmailSubcriptions: HasManySetAssociationsMixin<SubscribeEmail, number>;
    declare createEmailSubcription: HasManyCreateAssociationMixin<SubscribeEmail,"userid">

    toPagination() {
        return {
            id: this.id,
            name: this.user_nama||"",
            username: this.user_login,
            picture: profileUrl(this.gambar),
            verify: this.verify,
            email: this.user_email
        }
    }
}
User.init({
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    user_login:{
        type: DataTypes.STRING(60),
        allowNull:false
    },
    user_pass:{
        type: DataTypes.STRING(255),
    },
    user_email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    user_nama:{
        type:DataTypes.STRING,
    },
    gender:{
        type: DataTypes.INTEGER,
        get() {
            const val = this.getDataValue("gender");
            return val !== null && typeof USER_GENDER[val] !== "undefined" ? USER_GENDER[val] : null
        },
        set(val: string) {
            const i = USER_GENDER.indexOf(ucwords(val))
            if(i > -1) {
                this.setDataValue("gender",i)
            }
        },
    },
    birthday:{
        type: DataTypes.DATEONLY,
    },
    country_telephone:{
        type:DataTypes.STRING(5),
    },
    telephone:{
        type:DataTypes.STRING(20),
    },
    full_telp:{
        type:DataTypes.TEXT,
    },
    firebase_uid:{
        type:DataTypes.STRING(50),
    },
    line:{
        type:DataTypes.STRING(100),
    },
    line_id:{
        type:DataTypes.STRING(100),
    },
    google:{
        type:DataTypes.STRING(50),
    },
    google_email:{
        type:DataTypes.TEXT,
    },
    telegram:{
        type:DataTypes.JSON
    },
    telegram_id:{
        type:DataTypes.TEXT,
    },
    ig_token:{
        type:DataTypes.JSON
    },
    instagram:{
        type:DataTypes.TEXT,
    },
    biodata:{
        type:DataTypes.TEXT,
    },
    gambar:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    api: {
        type:DataTypes.STRING(100),
    },
    user_activation_key:{
        type: DataTypes.STRING(255),
    },
    active:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    private:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    media_private:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    block:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    suspend:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    verify:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    registrasi:{
        type: DataTypes.DATE,
    },
    location:{
        type: DataTypes.TEXT,
    },
    remove:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    remove_date:{
        type: DataTypes.DATE,
    },
    twitter:{
        type:DataTypes.STRING(50),
    },
    twitter_token:{
        type:DataTypes.JSON
    },
    fa_enable:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    FA:{
        type:DataTypes.STRING(200),
    },
    security_key:{
        type:DataTypes.JSON
    },
    new_email:{
        type: DataTypes.STRING(100),
    },
    last_change_username:{
        type:DataTypes.DATE,
    },
    mail_queue:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    paid:{
        type:DataTypes.BOOLEAN,
    },
    paid_expired:{
        type:DataTypes.DATE,
    },
    prkey:{
        type:DataTypes.STRING,
    },
    pukey:{
        type:DataTypes.STRING,
    },
    updated_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    sequelize:db.db,
    modelName:"user",
    tableName:`${db.prefix}users`,
    createdAt:"registrasi",
    scopes:{
        active:{
            where:{
                active:true,
                block:false,
                remove:false,
                suspend:false
            }
        }
    },
    updatedAt:'updated_at'
})

type UserRolesAttribute = {
    id?: number
    userid: number
    apps: string|null
    superadmin: boolean
    roles: string|null
}
export class UserRoles extends Model<UserRolesAttribute> {
    declare id: number
    declare userid: number
    declare apps: string|null
    declare superadmin: boolean
    declare roles: string|null
    declare user?: User

    declare getUser: BelongsToGetAssociationMixin<User>
    declare setUser: BelongsToSetAssociationMixin<User,"userid">
}
UserRoles.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    userid:{
        type: DataTypes.BIGINT,
        allowNull:false
    },
    apps:{
        type: DataTypes.TEXT,
    },
    superadmin:{
        type: DataTypes.BOOLEAN
    },
    roles:{
        type: DataTypes.TEXT,
    }
},{
    sequelize:db.db,
    modelName:"userRole",
    tableName:`${db.prefix}users_roles`,
    timestamps:false,
    underscored:true
})

export type FollowAttribute = {
    difollow: number
    yangfollow: number
    pending: boolean
    tanggal?: Date
}
export class Follow extends Model {

}
Follow.init({
    difollow: {
        type: DataTypes.BIGINT,
        allowNull:false
    },
    yangfollow: {
        type: DataTypes.BIGINT,
        allowNull:false
    },
    pending:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    tanggal:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    sequelize:db.db,
    modelName:"follow",
    tableName:`${db.prefix}follow`,
    createdAt:"tanggal",
    underscored:true
})

export default User