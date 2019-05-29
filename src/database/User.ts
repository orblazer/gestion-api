import crypto from 'crypto'
import {
  prop,
  Typegoose,
  staticMethod,
  instanceMethod,
  ModelType,
  InstanceType
} from 'typegoose'
import mongoose, { DocumentQuery, Document } from 'mongoose'
import { ObjectId } from 'mongodb'
import isEmail from 'validator/lib/isEmail'

export interface UserPassword {
  salt: string;
  hash: string;
  iterations: number;
}

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin'
}

export interface UserJWT {
  id: ObjectId;
  displayName: string;
  username: string;
  role: UserRole;
}

export class User extends Typegoose {
  @prop({ default: '' })
  public displayName: string

  @prop({
    required: true,
    unique: true,
    validate: { validator: isEmail, message: '{VALUE} is not a valid email' }
  })
  public username: string

  @prop({ required: true, unique: true, _id: false })
  public password: UserPassword

  @prop({ default: UserRole.CLIENT, enum: UserRole })
  public role: UserRole

  @prop({ default: Date.now })
  public createdAt: Date

  @instanceMethod
  public comparePassword (this: Instance, password: string): boolean {
    return (
      this.password.hash ===
      crypto
        .pbkdf2Sync(
          password,
          this.password.salt,
          this.password.iterations,
          256,
          'sha256'
        )
        .toString('hex')
    )
  }

  /**
   * Statics
   */
  @staticMethod
  public static generatePassword (password: string): UserPassword {
    const salt = crypto.randomBytes(64).toString('hex')
    return {
      salt,
      hash: crypto
        .pbkdf2Sync(password, salt, 10000, 256, 'sha256')
        .toString('hex'),
      iterations: 10000
    }
  }

  @staticMethod
  public static findByUsername (
    this: ModelType<User> & typeof User,
    username: string
  ): DocumentQuery<Instance | null, Document> {
    return this.findOne({ username })
  }
}

export type Instance = InstanceType<User>

export default new User().getModelForClass(User, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'users', timestamps: true }
})
