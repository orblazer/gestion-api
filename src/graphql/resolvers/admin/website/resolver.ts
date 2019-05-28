/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import builder from '../../../../lib/builder'
import { HasKey } from '../../../../graphql/decorators/Auth'
import * as Auth from '../../../../graphql/lib/Auth'
import UserDB, {
  Instance as UserInstance,
  UserRole,
  UserJWT,
  User
} from '../../../../database/User'
import WebsiteDB, {
  Instance as WebsiteInstance
} from '../../../../database/Website'
import { normalize } from '../../../../lib/directory'
import { PubSubConstants } from '../../pubSub'
import PaginationArgs from '../../paginationArgs'
import WebsiteTemplateDB, {
  Instance as WebsiteTemplateInstance
} from '../../../../database/WebsiteTemplate'
import WebsiteGeneration, {
  WebsiteGenerationPayload
} from './websiteGeneration.type'
import WebsiteInput from './input'
import Website from '.'

@TypeGQL.Resolver(Website)
export default class WebsiteResolver {
  /**
   * Query
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [Website], { nullable: 'items' })
  public allWebsites (
    @TypeGQL.Ctx('user') user: UserJWT
  ): DocumentQuery<WebsiteInstance[], Document> {
    const filter = Auth.hasPermission(user, UserRole.ADMIN)
      ? {}
      : { users: user.id }
    return WebsiteDB.find(filter).sort({
      createdAt: -1
    })
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => Website, { nullable: true })
  public getWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
      @TypeGQL.Ctx('user') user: UserJWT
  ): DocumentQuery<WebsiteInstance, Document> {
    if (Auth.hasPermission(user, UserRole.ADMIN)) {
      return WebsiteDB.findById(id)
    } else {
      return WebsiteDB.findOne({
        users: user.id,
        enabled: true
      })
    }
  }

  /**
   * Mutation
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public async createWebsite (
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput)
      input: WebsiteInput,
      @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<WebsiteInstance> {
    const _id = new ObjectId()

    // Retrieve template
    let template: null | WebsiteTemplateInstance = null
    if (input.template) {
      template = await WebsiteTemplateDB.findById(input.template)
    }

    const website = {
      _id,
      ftp: input.ftp,
      name: input.name,
      description: input.description,
      url: input.url,
      enabled: input.enabled,
      authorId: user.id,
      users: input.users,
      template: input.template,
      fields: input.fields,
      directory: normalize(this.getPath() + '/' + _id)
    }

    return new WebsiteDB(website).save().then(
      async (data): Promise<WebsiteInstance> => {
        // Build and upload website
        await builder.build(data, template)
        await builder.upload(data, template.build.directory)
        return data
      }
    )
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public async updateWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
      @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput)
      input: WebsiteInput
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)

    ;(input as any).updatedAt = Date.now()

    // Apply modification
    Object.keys(input).forEach((key): void => {
      (website as any)[key] = (input as any)[key]
    })

    let template: null | WebsiteTemplateInstance = null
    if (website.template) {
      template = await WebsiteTemplateDB.findById(website.template)
    }

    return website.save().then(async (): Promise<WebsiteInstance> => {
      await builder.build(website, template)
      await builder.upload(website, template.build.directory)
      return website
    })
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public deleteWebsite (@TypeGQL.Arg('id') id: ObjectId): void {
    /* return WebsiteDB.findById(id).then((data) => {
      console.log(data.template)
      global.fastify.log.debug(`deleting website ${data.name} (${data.template})...`)
      return fs
        .remove(data.directory)
        .then(() => fs.remove(normalize(`${process.env.UPLOAD_DIR}/${id}`)))
        .then(() => {
          return data.remove().then((data) => {
            global.fastify.log.debug(`Website ${data.name} has been deleted`)
            return data
          })
        })
    }) */
  }

  /**
   * Subscription
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Subscription({ topics: PubSubConstants.WEBSITE_GENERATION })
  public websiteGeneration (
    @TypeGQL.Root() payload: WebsiteGenerationPayload
  ): WebsiteGeneration {
    global.fastify.log.debug(
      payload,
      `Subscription ${PubSubConstants.WEBSITE_GENERATION} : `
    )
    return {
      ...payload,
      startDate: new Date()
    }
  }

  /**
   * Field
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public users (
    @TypeGQL.Args() { offset, limit }: PaginationArgs,
      @TypeGQL.Root() website: WebsiteInstance
  ): DocumentQuery<UserInstance[], Document> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { sort: { createdAt: 1 } }
    if (offset) {
      options.offset = offset
    }
    if (limit) {
      options.limit = limit
    }

    return UserDB.find({ _id: { $in: website.users } }, null, options)
  }

  /**
   * utils
   */
  private getPath (): string {
    return `${process.env.WEBSITE_DIR}`
  }
}
