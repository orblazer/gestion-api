import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { UserRole } from '@/database/User'

@TypeGQL.InputType()
export default class UserInput {
  @TypeGQL.Field()
  public displayName: string

  @TypeGQL.Field()
  public username: string

  @TypeGQL.Field()
  public password: string

  @TypeGQL.Field((): ReturnTypeFuncValue => UserRole, {
    defaultValue: UserRole.CLIENT
  })
  public role: UserRole = UserRole.CLIENT
}
