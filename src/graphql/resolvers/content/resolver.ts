import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import WebsiteDB, {
  Instance as WebsiteInstance
} from '@/database/admin/Website'
import UserDB, { Instance as UserInstance } from '@/database/admin/User'
import Website from '../admin/website'
import User from '../admin/user'
import Content from '.'

@TypeGQL.Resolver(Content, { isAbstract: true })
export abstract class ContentBaseResolver {
  /**
   * Field
   */

  /**
   * Retrieve website from id
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => Website)
  public website (
    @TypeGQL.Root('websiteId') websiteId: ObjectId
  ): DocumentQuery<WebsiteInstance, Document> {
    return WebsiteDB.findById(websiteId)
  }

  /**
   * Retrieve author from id
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public author (
    @TypeGQL.Root('authorId') authorId: ObjectId
  ): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(authorId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createBaseResolver (): typeof ContentBaseResolver {
  return ContentBaseResolver
}
