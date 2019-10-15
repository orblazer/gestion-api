import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { Lang } from '../../textLocalized'
import { JSONScalar, JSONType } from '../../scalars/JSON'
import WTFOption from './WTFOption.type'

@TypeGQL.ObjectType()
export default class WebsiteTemplateField {
  @TypeGQL.Field()
  public type: string

  @TypeGQL.Field((): ReturnTypeFuncValue => [Lang], { nullable: true })
  public localization?: Lang[]

  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public label: string

  @TypeGQL.Field({ nullable: true })
  public errorName?: string

  @TypeGQL.Field({ nullable: true })
  public placeholder?: string

  @TypeGQL.Field((): ReturnTypeFuncValue => JSONScalar, {
    nullable: true
  })
  public defaultValue?: JSONType

  @TypeGQL.Field((): ReturnTypeFuncValue => JSONScalar, { nullable: true })
  public validate?: JSONType

  @TypeGQL.Field((): ReturnTypeFuncValue => [WTFOption], { nullable: true })
  public options?: WTFOption[]

  @TypeGQL.Field()
  public private?: boolean
}
