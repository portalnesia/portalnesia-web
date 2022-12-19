import type { InstanceUpdateOptions } from "sequelize"

interface HasManyAddAssociationMixinOptions<TModel,ModelAttribute,ThroughAttribute> extends InstanceUpdateOptions<ModelAttribute> {
    through?: {
        [T in keyof ThroughAttribute]?: ThroughAttribute[T]
    }
}

export type HasManyAddAssociationMixin<TModel, TModelPrimaryKey,ModelAttribute=any,ThroughAttribute=any> = (
    newAssociation?: TModel | TModelPrimaryKey,
    options?: HasManyAddAssociationMixinOptions<TModel,ModelAttribute,ThroughAttribute>
) => Promise<void>;