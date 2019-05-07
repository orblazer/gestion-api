import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import WebsiteDB, { Instance as WebsiteInstance } from '../../../database/Website'
import UserDB, { Instance as UserInstance } from '../../../database/User'
import Website from '../admin/website'
import User from '../admin/user'
import Content from '.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createBaseResolver (): any {
  @TypeGQL.Resolver(Content, { isAbstract: true })
  abstract class ContentBaseResolver {
    /**
     * Field
     */
    @TypeGQL.FieldResolver((): ReturnTypeFuncValue => Website)
    public website (@TypeGQL.Root('website_id') websiteId: ObjectId): DocumentQuery<WebsiteInstance, Document> {
      return WebsiteDB.findById(websiteId)
    }

    @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
    public author (@TypeGQL.Root('author_id') authorId: ObjectId): DocumentQuery<UserInstance, Document> {
      return UserDB.findById(authorId)
    }
  }

  return ContentBaseResolver
}
