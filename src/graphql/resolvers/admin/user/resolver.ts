import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ApolloError } from 'apollo-server-errors'
import jwt from 'jsonwebtoken'
import { DocumentQuery, Document } from 'mongoose'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import UserDB, { Instance as UserInstance, UserRole, UserJWT } from '../../../../database/User'
import { HasKey } from '../../../decorators/Auth'
import UserInput from './input'
import UserAuth from './UserAuth.type'
import User from '.'

@TypeGQL.Resolver(User)
export default class UserResolver {
  /**
   * Query
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [User], { nullable: 'items' })
  public allUsers (): DocumentQuery<UserInstance[], Document> {
    return UserDB.find({}).sort({
      createdAt: -1
    })
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => User, { nullable: true })
  public getUser (@TypeGQL.Arg('id') id: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(id)
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => User)
  public user (@TypeGQL.Ctx('user') user: UserJWT): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(user.id)
  }

  /**
   * Mutation
   */
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => UserAuth)
  public async login (@TypeGQL.Arg('username') username: string, @TypeGQL.Arg('password') password: string): Promise<UserAuth> {
    let user: UserInstance = null
    try {
      user = await UserDB.findByUsername(username)
    } catch {
      throw new ApolloError('Username not found', 'AUTH_ERROR')
    }

    if (!user.comparePassword(password)) {
      throw new ApolloError('Invalid username or password', 'AUTH_ERROR')
    }

    const userJWT: UserJWT = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
    return {
      token: jwt.sign(userJWT, process.env.JWT_SECRET, {
        expiresIn: '7d'
      }),
      user
    }
  }

  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Boolean)
  public logout (): boolean {
    return true
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => User)
  public createUser (@TypeGQL.Arg('input', (): ReturnTypeFuncValue => UserInput) input: UserInput): Promise<UserInstance> {
    const user = new UserDB({
      displayName: input.displayName,
      username: input.username,
      password: UserDB.generatePassword(input.password),
      role: input.role
    })

    return user.save()
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => User)
  public updateUser (@TypeGQL.Arg('id') id: ObjectId, @TypeGQL.Arg('input', (): ReturnTypeFuncValue => UserInput) input: UserInput): DocumentQuery<UserInstance, Document> {
    if (input.password !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.password = UserDB.generatePassword(input.password) as any
    } else {
      delete input.password
    }

    return UserDB.findByIdAndUpdate(id, input, { new: true })
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => User)
  public deleteUser (@TypeGQL.Arg('id') id: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findByIdAndRemove(id)
  }
}
