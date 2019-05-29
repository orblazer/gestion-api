import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ApolloError } from 'apollo-server-errors'
import jwt from 'jsonwebtoken'
import { DocumentQuery, Document } from 'mongoose'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import UserDB, { Instance as UserInstance, UserRole, UserJWT } from '@/database/admin/User'
import HasKey from '@/graphql/decorators/HasKey'
import UserInput from './input'
import UserAuth from './UserAuth.type'
import User from '.'

@TypeGQL.Resolver(User)
export default class UserResolver {
  /**
   * Query
   */

  /**
   * Get all users
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [User], { nullable: 'items' })
  public allUsers (): DocumentQuery<UserInstance[], Document> {
    return UserDB.find({}).sort({
      createdAt: -1
    })
  }

  /**
   * Get specific user
   *
   * @param id the user id
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => User, { nullable: true })
  public getUser (@TypeGQL.Arg('id') id: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(id)
  }

  /**
   * Get the current user
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => User)
  public user (@TypeGQL.Ctx('user') user: UserJWT): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(user.id)
  }

  /**
   * Mutation
   */

  /**
   * Login an user
   *
   * @param username the user name
   * @param password the user password
   */
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => UserAuth)
  public async login (@TypeGQL.Arg('username') username: string, @TypeGQL.Arg('password') password: string): Promise<UserAuth> {
    // Retrieve user from username
    const user: UserInstance = await UserDB.findByUsername(username).catch((): UserInstance => {
      throw new ApolloError('Username not found', 'AUTH_ERROR')
    })
    if (user === null) {
      throw new ApolloError('Username not found', 'AUTH_ERROR')
    }

    // Check if is right password
    if (!user.comparePassword(password)) {
      throw new ApolloError('Invalid username or password', 'AUTH_ERROR')
    }

    // Return user public data with JWT token
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

  /**
   * Logout an user
   * (NOTE: this make nothing)
   */
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Boolean)
  public logout (): boolean {
    return true
  }

  /**
   * Create an new user
   *
   * @param input the user data
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => User)
  public createUser (@TypeGQL.Arg('input', (): ReturnTypeFuncValue => UserInput) input: UserInput): Promise<UserInstance> {
    return new UserDB({
      displayName: input.displayName,
      username: input.username,
      password: UserDB.generatePassword(input.password),
      role: input.role
    }).save()
  }

  /**
   * Update an user
   *
   * @param id the user id
   * @param input the new user data
   */
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(input as any).updatedAt = new Date()

    return UserDB.findByIdAndUpdate(id, input)
  }

  /**
   * Delete an user
   *
   * @param id the user id
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => User)
  public deleteUser (@TypeGQL.Arg('id') id: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findByIdAndRemove(id)
  }
}
