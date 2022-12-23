import db from './db';
import { BuildOptions, DataTypes, Op, Model } from 'sequelize';
import User, { UserPagination } from './user';
import type { NullishPropertiesOf } from 'sequelize/types/utils';
import schema from './scopes.json'

export type AppsPagination = {
    name: string,
    icon: string|null,
    id: string
}

type SecuritySchema = keyof typeof schema;

export type AppsDetail = {
    id: string,
    name: string,
    redirect_uri: string[]|null,
    grant_types: string[]|null,
    origin: string[]|null,
    scope: string[]|null,
    publish: boolean,
    website: string|null,
    description: string|null,
    icon: string|null,
    terms_url: string|null,
    privacy_url: string|null
    test_users: UserPagination[]
}

export type IScopes = {
    id: string,
    pending: boolean,
    approved: boolean,
    requested: boolean,
    description: string|null
}

export type ClientAttribute = {
    id?:string
    client_id?: string
    client_secret: string|null
    redirect_uri: string|null
    origin: string|null
    grant_types: string|null
    scope: string|null
    user_id: number
    name: string
    description: string|null
    website: string|null
    icon: string|null
    terms_url: string|null
    privacy_url: string|null
    test_user_id: string|null
    block?: boolean
    internal?: boolean
    publish?: boolean
}
export class Client extends Model<ClientAttribute> {
    content_type = undefined
    
    declare client_id: string
    declare client_secret: string|null
    declare redirect_uri: string[]|null
    declare origin: string[]|null
    declare grant_types: string[]|null
    declare scope: string[]|null
    declare user_id: number
    declare name: string
    declare description: string|null
    declare website: string|null
    declare icon: string|null
    declare terms_url: string|null
    declare privacy_url: string|null
    declare test_user_id: number[]|null
    declare block: boolean
    declare internal: boolean
    declare publish: boolean
    declare user?: User
    declare scopePermission?: ScopePermission[]

    toPagination(): {id:string,name: string,icon: string|null} {
        const {client_id:id,name,icon} = this
        
        return {
            id,
            name,
            icon
        }
    }

    async getScopePermissions() {
        const scopes = await ScopePermission.findAll({
            where:{
                client_id: this.client_id
            },
            include:{
                model:Scope,
                where:{
                    scope:{
                        [Op.notIn]: ['basic','superuser']
                    }
                }
            }
        })
        let scope: IScopes[]=[]
        if(scopes) {
            scope = scopes.map(s=>{
                const secScope = schema;
                const description = secScope?.[s.scope.scope as SecuritySchema] ? secScope[s.scope.scope as SecuritySchema] : null;
                return {
                    id:s.scope.scope,
                    pending: Boolean(s.pending),
                    approved: Boolean(s.approved),
                    requested: s.client_id == this.client_id,
                    description
                }
            })
        }
        scope.unshift({
            id:'basic',
            pending:false,
            approved:true,
            requested:false,
            description: "Basic access to endpoint."
        })
        return scope;
    }
}
Client.init({
    client_id:{
        type: DataTypes.UUID,
        primaryKey : true,
        defaultValue: DataTypes.UUIDV4
    },
    client_secret:{
        type: DataTypes.STRING(80),
        allowNull:true
    },
    redirect_uri:{
        type: DataTypes.STRING(2000),
        allowNull:true,
        get() {
            const val = this.getDataValue("redirect_uri")
            return val && val.length > 0 ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("redirect_uri",value)
        }
    },
    origin:{
        type: DataTypes.TEXT,
        allowNull:true,
        get() {
            const val = this.getDataValue("origin")
            return val && val.length > 0 ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("origin",value)
        }
    },
    grant_types:{
        type: DataTypes.STRING(80),
        allowNull: true,
        get() {
            const val = this.getDataValue("grant_types")
            return val && val.length > 0 ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("grant_types",value)
        }
    },
    scope:{
        type: DataTypes.STRING(4000),
        allowNull: true,
        get() {
            const val = this.getDataValue("scope")
            return val && val.length > 0 ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("scope",value)
        }
    },
    user_id: {
        type: DataTypes.BIGINT
    },
    name:{
        type: DataTypes.TEXT
    },
    description:{
        type: DataTypes.TEXT,
        allowNull:true
    },
    website:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    terms_url:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    privacy_url:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    test_user_id:{
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const val = this.getDataValue("test_user_id")
            return val && val.length > 0 ? val.split(" ").map(s=>Number.parseInt(s)) : null
        },
        set(val: string|number[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("test_user_id",value)
        }
    },
    block: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    internal: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    publish: {
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
},{
    sequelize:db.db,
    modelName:'client',
    tableName:`${db.prefix}oauth_clients`,
    scopes:{
        active:{
            where:{
                block:false
            }
        }
    },
    underscored:true
})
/* ==================================================== */

export type ScopeAttribute = {
    id: number
    scope: string
    is_default: boolean
    description: string|null
}
export class Scope extends Model<ScopeAttribute> {
    content_type = undefined

    declare id: number
    declare scope: string
    declare is_default: boolean
    declare description: string|null

    toPaginationInternal(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    
}
Scope.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    scope:{
        type: DataTypes.STRING(80),
    },
    is_default:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    description:{
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    sequelize:db.db,
    modelName:'scope',
    tableName:`${db.prefix}oauth_scopes`,
    timestamps: false,
    underscored:true
})

/* ==================================================== */

export type ScopePermissionAttribute = {
    id: number
    scope_id: number
    client_id: string
    pending: boolean
    approved: boolean
    reason: string|null
}
export class ScopePermission extends Model<ScopePermissionAttribute> {
    content_type = undefined

    declare id: number
    declare scope_id: number
    declare client_id: string
    declare pending: boolean
    declare approved: boolean
    declare reason: string|null
    declare scope: Scope
    declare client: Client
    
    toPaginationInternal(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}
ScopePermission.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    scope_id:{
        type: DataTypes.INTEGER,
    },
    client_id:{
        type: DataTypes.STRING(80)
    },
    pending:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    },
    approved:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    reason:{
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    sequelize:db.db,
    modelName:'scopePermission',
    tableName:`${db.prefix}scope_permission`,
    underscored:true
})
/* ==================================================== */

export type AccessTokenAttribute = {
    id?: number
    access_token: string
    client_id: string
    user_id: number|null
    expires: Date
    grant_type: string|null
    scope: string|null
    device_id: string|null
}
export class AccessToken extends Model<AccessTokenAttribute> {
    content_type = undefined

    declare access_token: string
    declare client_id: string
    declare user_id: number|null
    declare expires: Date
    declare grant_type: string|null
    declare scope: string[]|null
    declare device_id: string|null
    declare client: Client
    declare user?: User
    declare refreshToken?: RefreshToken
    
}
AccessToken.init({
    access_token:{
        type: DataTypes.STRING(55),
        primaryKey: true
    },
    client_id:{
        type: DataTypes.STRING(80),
    },
    user_id:{
        type: DataTypes.BIGINT,
        allowNull: true
    },
    expires:{
        type: DataTypes.DATE,
        allowNull:false
    },
    grant_type:{
        type: DataTypes.STRING(80),
        allowNull: true
    },
    scope:{
        type: DataTypes.STRING(4000),
        allowNull: true,
        get() {
            const val = this.getDataValue("scope")
            return val ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("scope",value)
        }
    },
    device_id:{
        type:DataTypes.STRING(50),
        allowNull: true
    }
},{
    sequelize:db.db,
    modelName:'accessToken',
    name:{singular:"accessToken",plural:"accessTokens"},
    tableName:`${db.prefix}oauth_access_tokens`,
    timestamps:false,
    underscored:true
})

/* ==================================================== */

export type RefreshTokenAttribute = {
    id?: number
    refresh_token: string
    access_token: string
    client_id: string
    user_id: number
    expires: Date
    grant_type: string|null
    scope: string|null
    device_id: string|null
    pkce?: boolean
    /**
     * IP Address when this refresh token initiated first.
     */
     ip_address: string
     /**
      * Date when this refresh token initiated first.
      */
     createdAt?: Date
}
export class RefreshToken extends Model<RefreshTokenAttribute> {
    content_type = undefined

    declare id: number
    declare refresh_token: string|null
    declare access_token: string|null
    declare client_id: string
    declare user_id: number
    declare expires: Date
    declare grant_type: string|null
    declare scope: string[]|null
    declare device_id: string|null
    declare pkce: boolean
    declare client?: Client
    declare user?: User
    declare accessToken?: AccessToken
}
RefreshToken.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    refresh_token:{
        type: DataTypes.STRING(50),
    },
    access_token:{
        type: DataTypes.STRING(55)
    },
    client_id:{
        type: DataTypes.STRING(80),
    },
    user_id:{
        type: DataTypes.BIGINT,
        allowNull: false
    },
    expires:{
        type: DataTypes.DATE,
        allowNull:false
    },
    grant_type:{
        type: DataTypes.STRING(80),
        allowNull: true
    },
    scope:{
        type: DataTypes.STRING(4000),
        allowNull: true,
        get() {
            const val = this.getDataValue("scope")
            return val ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("scope",value)
        }
    },
    device_id:{
        type:DataTypes.STRING(50),
        allowNull: true
    },
    pkce:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    ip_address:{
        type: DataTypes.BOOLEAN,
        allowNull:false
    }
},{
    sequelize:db.db,
    modelName:'refreshToken',
    name:{singular:"refreshToken",plural:"refreshTokens"},
    tableName:`${db.prefix}oauth_refresh_tokens`,
    updatedAt:false,
    underscored:true
})

/* ==================================================== */

export type AuthorizationCodeAttribute = {
    id?: number
    authorization_code: string
    client_id: string
    user_id: number
    redirect_uri: string|null
    expires: Date
    scope: string|null
    code_challenge: string|null
    nonce: string|null
}
export class AuthorizationCode extends Model<AuthorizationCodeAttribute> {
    content_type = undefined

    declare authorization_code: string
    declare client_id: string
    declare user_id: number
    declare redirect_uri: string|null
    declare expires: Date
    declare scope: string[]|null
    declare nonce: string|null
    declare code_challenge: string|null
    declare client?: Client
    declare user?: User
}
AuthorizationCode.init({
    authorization_code:{
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    client_id:{
        type: DataTypes.STRING(80),
    },
    user_id:{
        type: DataTypes.BIGINT,
        allowNull: true
    },
    redirect_uri:{
        type: DataTypes.STRING(2000),
        allowNull:true
    },
    expires:{
        type: DataTypes.DATE,
        allowNull:false
    },
    scope:{
        type: DataTypes.STRING(4000),
        allowNull: true,
        get() {
            const val = this.getDataValue("scope")
            return val ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("scope",value)
        }
    },
    nonce:{
        type:DataTypes.STRING(1000),
    },
    code_challenge:{
        type: DataTypes.TEXT,
        allowNull:true
    }
},{
    sequelize:db.db,
    modelName:'authorizationCode',
    tableName:`${db.prefix}oauth_authorization_codes`,
    timestamps:false,
    underscored:true
})

export type OauthSessionAttribute = {
    id?: number
    client_id: string
    user_id: number|null
    scope: string|null
    grant_type: string|null
    ip_address: string|null
    expires: Date
}

export class OauthSession extends Model<OauthSessionAttribute> {
    content_type = undefined;
    declare id: number
    declare client_id: string
    declare user_id: number
    declare scope: string[]
    declare grant_type: string
    declare expires: Date
    declare ip_address: string|null
    declare user?: User
    declare client?: Client
    declare createdAt: Date
    declare updatedAt: Date
}
OauthSession.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    client_id:{
        type: DataTypes.STRING(80),
        allowNull:false
    },
    user_id: DataTypes.BIGINT,
    scope:{
        type: DataTypes.STRING(4000),
        allowNull: true,
        get() {
            const val = this.getDataValue("scope")
            return val ? val.split(" ") : null
        },
        set(val: string|string[]|null) {
            let value:string|null=null
            if(typeof val === "string" && val.length > 0) {
                value = val;
            } else if(Array.isArray(val) && val.length > 0) {
                value = val.join(" ")
            }
            this.setDataValue("scope",value)
        }
    },
    grant_type: DataTypes.STRING(80),
    ip_address: DataTypes.TEXT,
    expires:{
        type: DataTypes.DATE,
        allowNull:false
    }
},{
    sequelize:db.db,
    modelName:"oauthSession",
    tableName:`${db.prefix}oauth_session`,
    underscored:true
})