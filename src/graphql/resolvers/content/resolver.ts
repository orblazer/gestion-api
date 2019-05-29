import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document, Model } from 'mongoose'
import WebsiteDB, {
  Instance as WebsiteInstance
} from '@/database/admin/Website'
import UserDB, { Instance as UserInstance } from '@/database/admin/User'
import Website from '../admin/website'
import User from '../admin/user'
import PaginationArgs from '../paginationArgs'
import Content from '.'
import HasKey from '@/graphql/decorators/HasKey'

export default function createBaseResolver<D extends Document> (
  suffix: {
    plural: string;
    single: string;
  },
  objectTypeCls: TypeGQL.ClassType,
  databaseCls: Model<D>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  @TypeGQL.Resolver(Content, { isAbstract: true })
  abstract class ContentBaseResolver {
    /**
     * Query
     */

    /**
     * Get all content
     *
     * @param website the website id
     */
    @TypeGQL.Authorized()
    @HasKey((): string => process.env.PANEL_KEY)
    @TypeGQL.Query((): ReturnTypeFuncValue => [objectTypeCls], {
      nullable: true,
      name: `all${suffix.plural}`
    })
    public all (
      @TypeGQL.Arg('website') website: ObjectId
    ): DocumentQuery<D[], Document> {
      return databaseCls.find({ websiteId: website }).sort({
        createdAt: -1
      })
    }

    /**
     * Get specific content
     *
     * @param website the website id
     * @param id the content id
     */
    @TypeGQL.Authorized()
    @HasKey((): string => process.env.PANEL_KEY)
    @TypeGQL.Query((): ReturnTypeFuncValue => objectTypeCls, {
      nullable: true,
      name: `get${suffix.single}`
    })
    public get (
      @TypeGQL.Arg('website') website: ObjectId,
        @TypeGQL.Arg('id') id: ObjectId
    ): DocumentQuery<D, Document> {
      return databaseCls.findOne({ _id: id, websiteId: website })
    }

    /**
     * Get all visibles content (at specific website)
     *
     * @param offset the pagination offset
     * @param limit the pagination limit
     */
    @TypeGQL.Authorized()
    @HasKey()
    @TypeGQL.Query((): ReturnTypeFuncValue => [objectTypeCls], {
      nullable: true,
      name: `get${suffix.plural}`
    })
    public getVisibles (
      @TypeGQL.Args() { offset, limit }: PaginationArgs,
        @TypeGQL.Ctx('key') key: string
    ): DocumentQuery<D[], Document> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = { sort: { createdAt: 1 } }
      if (offset) {
        options.offset = offset
      }
      if (limit) {
        options.limit = limit
      }

      return databaseCls.find({ visible: true, websiteId: key }, null, options)
    }

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

  return ContentBaseResolver
}
