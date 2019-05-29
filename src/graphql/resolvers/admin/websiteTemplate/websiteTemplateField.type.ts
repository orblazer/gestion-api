import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { Lang } from '../../textLocalized'
import { JSONScalar, JSONType } from '../../scalars/JSON'
import { FieldValue, FieldValueScalar } from '../../scalars/FieldValue'
import WTFOption from './WTFOption.type'

@TypeGQL.ObjectType()
export default class WebsiteTemplateField {
  @TypeGQL.Field()
  public type: string

  @TypeGQL.Field((): ReturnTypeFuncValue => Lang, { nullable: true })
  public localize?: Lang

  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public label: string

  @TypeGQL.Field({ nullable: true })
  public errorName?: string

  @TypeGQL.Field({ nullable: true })
  public placeholder?: string

  @TypeGQL.Field((): ReturnTypeFuncValue => FieldValueScalar, {
    nullable: true
  })
  public defaultValue?: FieldValue

  @TypeGQL.Field((): ReturnTypeFuncValue => JSONScalar, { nullable: true })
  public validate?: JSONType

  @TypeGQL.Field((): ReturnTypeFuncValue => [WTFOption], { nullable: true })
  public options?: WTFOption[]

  @TypeGQL.Field()
  public private?: boolean
}
