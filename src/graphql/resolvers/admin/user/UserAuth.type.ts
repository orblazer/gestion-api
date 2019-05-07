import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import User from '.'

@TypeGQL.ObjectType()
export default class UserAuth {
  @TypeGQL.Field()
  public readonly token: string

  @TypeGQL.Field((): ReturnTypeFuncValue => User)
  public user: User
}
