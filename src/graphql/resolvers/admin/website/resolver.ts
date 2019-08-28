/* eslint-disable @typescript-eslint/no-explicit-any */
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import { PubSubConstants } from '../../pubSub'
import PaginationArgs from '../../paginationArgs'
import WebsiteGeneration, {
  WebsiteGenerationPayload,
  WebsiteGenerationStatus,
  WebsiteGenerationStep
} from './websiteGeneration.type'
import WebsiteInput from './input'
import Website from '.'
import builder from '@/lib/builder'
import HasKey, { isEditorKey } from '@/graphql/decorators/HasKey'
import Auth from '@/graphql/lib/Auth'
import UserDB, { Instance as UserInstance, UserRole, UserJWT, User } from '@/database/admin/User'
import WebsiteDB, { Instance as WebsiteInstance } from '@/database/admin/Website'
import { normalize } from '@/lib/directory'
import WebsiteTemplateDB, { Instance as WebsiteTemplateInstance } from '@/database/admin/WebsiteTemplate'

@TypeGQL.Resolver(Website)
export default class WebsiteResolver {
  /**
   * Query
   */

  /**
   * Get all websites
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [Website], { nullable: 'items' })
  public allWebsites (@TypeGQL.Ctx('user') user: UserJWT): DocumentQuery<WebsiteInstance[], Document> {
    const filter = Auth.hasRole(user, UserRole.ADMIN) ? {} : { users: user.id }
    return WebsiteDB.find(filter).sort({
      createdAt: -1
    })
  }

  /**
   * Get specific website
   *
   * @param id the website id
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => Website, { nullable: true })
  public getWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Ctx('user') user: UserJWT
  ): DocumentQuery<WebsiteInstance, Document> {
    if (Auth.hasRole(user, UserRole.ADMIN)) {
      return WebsiteDB.findById(id)
    } else {
      return WebsiteDB.findOne({
        _id: id,
        users: user.id,
        enabled: true
      })
    }
  }

  /**
   * Mutation
   */

  /**
   * Create an new website
   *
   * @param input the website data
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public createWebsite (
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput)
      input: WebsiteInput,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<WebsiteInstance> {
    const _id = new ObjectId()

    return new WebsiteDB({
      _id,
      ftp: input.ftp,
      name: input.name,
      description: input.description,
      url: input.url,
      enabled: input.enabled,
      authorId: user.id,
      users: input.users,
      template: input.template,
      enabledModules: input.enabledModules,
      fields: input.fields,
      directory: normalize(this.getPath() + '/' + _id)
    }).save()
  }

  /**
   * Update an website
   *
   * @param id the website id
   * @param input the new website data
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public async updateWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput)
      input: WebsiteInput
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)

    // Apply modification
    Object.keys(input).forEach((key): void => {
      ;(website as any)[key] = (input as any)[key]
    })
    website.updatedAt = new Date()

    return website.save()
  }

  /**
   * Delete an website
   *
   * @param id the website id
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public async deleteWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.PubSub(PubSubConstants.WEBSITE_GENERATION)
      publish: TypeGQL.Publisher<WebsiteGenerationPayload>
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)
    const logger = global.loggers.builder.child({
      website: {
        id,
        name: website.name
      }
    })
    const start = new Date()
    const notify = (
      status: WebsiteGenerationStatus,
      step?: WebsiteGenerationStep,
      reason = 'deleting website',
      endDate?: Date
    ): Promise<void> => {
      return publish({
        id: id.toHexString(),
        reason,
        status,
        step,
        startDate: start,
        endDate
      })
    }

    // Notify subscriber for delete website
    logger.debug('Deleting website...')
    await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.CLEAN)

    return builder
      .clean(website)
      .then(
        async (): Promise<WebsiteInstance> => {
          await website.remove()

          // Notify subscriber for delete website
          const times = (Date.now() - start.getTime()) / 1000
          logger.debug(`Website as been deleted, in ${times}s`)
          await notify(WebsiteGenerationStatus.SUCCESS, WebsiteGenerationStep.IDLE, undefined, new Date())

          return website
        }
      )
      .catch(
        async (err: Error): Promise<WebsiteInstance> => {
          // Notify subscriber for update website
          logger.debug('Website could not be deleted')
          await notify(
            WebsiteGenerationStatus.FAIL,
            WebsiteGenerationStep.CLEAN,
            `deleting website (err: ${err.message})`,
            new Date()
          )

          throw err
        }
      )
  }

  /**
   * Build an website
   *
   * @param id the website id
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website, { nullable: true })
  public async buildWebsite (
    @TypeGQL.Arg('id') id: ObjectId,
      @TypeGQL.Arg('reason', { defaultValue: 'force' }) reason: string = 'force',
    @TypeGQL.PubSub(PubSubConstants.WEBSITE_GENERATION)
      publish: TypeGQL.Publisher<WebsiteGenerationPayload>
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)
    const logger = global.loggers.graphql.child({
      website: {
        id,
        name: website.name
      }
    })
    const start = new Date()
    const notify = (
      status: WebsiteGenerationStatus,
      step?: WebsiteGenerationStep,
      reason = 'building website',
      endDate?: Date
    ): Promise<void> => {
      return publish({
        id: id.toHexString(),
        reason,
        status,
        step,
        startDate: start,
        endDate
      })
    }

    // Retrieve template
    let template: null | WebsiteTemplateInstance = null
    if (website.template) {
      template = await WebsiteTemplateDB.findById(website.template)
    }

    logger.debug(`Building ans uploading website (from: ${reason})...`)

    let step: WebsiteGenerationStep
    try {
      // Build website
      await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.BUILD)
      await builder.build(website, template).catch(
        (err): Promise<void> => {
          step = WebsiteGenerationStep.BUILD
          throw err
        }
      )

      // Upload website
      await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.UPLOAD)
      await builder.upload(website, template.build.directory).catch(
        (err): Promise<void> => {
          step = WebsiteGenerationStep.UPLOAD
          throw err
        }
      )
    } catch (err) {
      // Notify subscriber for new website
      logger.debug('Website could not be builded and uploaded')
      await notify(
        WebsiteGenerationStatus.FAIL,
        step,
        `building and uploading (from: ${reason}) website (err: ${err.message})`,
        new Date()
      )

      throw err
    }

    // Notify subscriber for new website
    const times = (Date.now() - start.getTime()) / 1000
    logger.debug(`Website as been builded and uploaded (from: ${reason}), in ${times}s`)
    await notify(WebsiteGenerationStatus.SUCCESS, WebsiteGenerationStep.IDLE, undefined, new Date())

    return website
  }

  /**
   * Subscription
   */

  /**
   * Subscription change when an website generate
   *
   * @param website the website id
   */
  @TypeGQL.Subscription({
    topics: PubSubConstants.WEBSITE_GENERATION,
    filter ({ payload, args }: TypeGQL.ResolverFilterData<WebsiteGenerationPayload, { ids: string[] }>): boolean {
      if (args.ids.length === 1 && isEditorKey(args.ids[0])) {
        return true
      }

      for (const id of args.ids) {
        if (payload.id === id) {
          return true
        }
      }

      return false
    }
  })
  public websitesGeneration (
    @TypeGQL.Arg('ids', (): ReturnTypeFuncValue => [String]) _ids: string[],
    @TypeGQL.Root() payload: WebsiteGenerationPayload
  ): WebsiteGeneration {
    const logger = global.loggers.builder.child({
      website: {
        id: payload.id
      }
    })

    logger.debug(payload, `Subscription ${PubSubConstants.WEBSITE_GENERATION} : `)

    return payload
  }

  /**
   * Field
   */

  /**
   * Retrieve user from ids
   *
   * @param offset the pagination offset
   * @param limit the pagination limit
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public users (
    @TypeGQL.Args() { offset, limit }: PaginationArgs,
    @TypeGQL.Root() website: WebsiteInstance
  ): DocumentQuery<UserInstance[], Document> {
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
   * Retrieve template from id
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public template (@TypeGQL.Root('template') templateId: ObjectId): DocumentQuery<WebsiteTemplateInstance, Document> {
    if (templateId === null) {
      return null
    }

    return WebsiteTemplateDB.findById(templateId)
  }

  /**
   * utils
   */
  private getPath (): string {
    return `${process.env.WEBSITE_DIR}`
  }
}
