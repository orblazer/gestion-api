import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { GraphQLScalarType } from 'graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { GraphQLUpload } from 'graphql-upload'
import ContentInput from '../../content/input'

@TypeGQL.InputType()
export default class ServiceInput extends ContentInput {
  @TypeGQL.Field((): ReturnTypeFuncValue => GraphQLUpload)
  public image: GraphQLScalarType

  @TypeGQL.Field({ nullable: true })
  public type?: string
}
