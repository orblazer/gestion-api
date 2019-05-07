import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { FieldValueScalar, FieldValue } from '../../scalars/FieldValue'

@TypeGQL.ObjectType()
export default class WebsiteField {
  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field((): ReturnTypeFuncValue => FieldValueScalar)
  public value: FieldValue
}
