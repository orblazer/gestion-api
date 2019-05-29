import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { FieldValue, FieldValueScalar } from '../../scalars/FieldValue'

@TypeGQL.InputType()
export default class WebsiteFieldInput {
  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field((): ReturnTypeFuncValue => FieldValueScalar, {
    nullable: true
  })
  public value?: FieldValue
}
