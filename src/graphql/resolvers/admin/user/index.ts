import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { UserRole } from '@/database/admin/User'
import UserPassword from './userPassword.type'

TypeGQL.registerEnumType(UserRole, {
  name: 'UserRole'
})

@TypeGQL.ObjectType()
export default class User {
  @TypeGQL.Field()
  public readonly _id: ObjectId

  @TypeGQL.Field()
  public username: string

  @TypeGQL.Field((): ReturnTypeFuncValue => UserPassword)
  public password: UserPassword

  @TypeGQL.Field()
  public displayName: string

  @TypeGQL.Field((): ReturnTypeFuncValue => UserRole)
  public role: UserRole

  @TypeGQL.Field()
  public createdAt: Date
}
