import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'

@TypeGQL.ObjectType()
export default class UserPassword {
  @TypeGQL.Field()
  public salt: string

  @TypeGQL.Field()
  public hash: string

  @TypeGQL.Field((): ReturnTypeFuncValue => TypeGQL.Int)
  public iterations: number
}
