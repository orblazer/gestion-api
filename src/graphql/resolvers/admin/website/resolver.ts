/* eslint-disable @typescript-eslint/no-explicit-any */
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import builder from '@/lib/builder'
import HasKey, { isEditorKey } from '@/graphql/decorators/HasKey'
import Auth from '@/graphql/lib/Auth'
import UserDB, { Instance as UserInstance, UserRole, UserJWT, User } from '@/database/admin/User'
import WebsiteDB, { Instance as WebsiteInstance } from '@/database/admin/Website'
import { normalize } from '@/lib/directory'
import { PubSubConstants } from '../../pubSub'
import WebsiteTemplateDB, { Instance as WebsiteTemplateInstance } from '@/database/admin/WebsiteTemplate'
import PaginationArgs from '../../paginationArgs'
import WebsiteGeneration, { WebsiteGenerationPayload, WebsiteGenerationStatus, WebsiteGenerationStep } from './websiteGeneration.type'
import WebsiteInput from './input'
import Website from '.'

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
  public allWebsites (
    @TypeGQL.Ctx('user') user: UserJWT
  ): DocumentQuery<WebsiteInstance[], Document> {
    const filter = Auth.hasRole(user, UserRole.ADMIN)
      ? {}
      : { users: user.id }
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
  public async createWebsite (
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput)
      input: WebsiteInput,
      @TypeGQL.Ctx('user') user: UserJWT,
      @TypeGQL.PubSub(PubSubConstants.WEBSITE_GENERATION) publish: TypeGQL.Publisher<WebsiteGenerationPayload>
  ): Promise<WebsiteInstance> {
    const _id = new ObjectId()
    const logger = global.loggers.graphql.child({
      website: {
        id: _id,
        name: input.name
      }
    })
    const start = new Date()
    const notify = (status: WebsiteGenerationStatus, step?: WebsiteGenerationStep, reason: string = 'creating website', endDate?: Date): Promise<void> => {
      return publish({
        id: _id.toHexString(),
        reason,
        status,
        step,
        startDate: start,
        endDate
      })
    }

    // Retrieve template
    let template: null | WebsiteTemplateInstance = null
    if (input.template) {
      template = await WebsiteTemplateDB.findById(input.template)
    }

    // Notify subscriber for new website
    logger.debug('Creating website...')
    await notify(WebsiteGenerationStatus.PROCESSING)

    let step: WebsiteGenerationStep
    return new WebsiteDB({
      _id,
      ftp: input.ftp,
      name: input.name,
      description: input.description,
      url: input.url,
      enabled: input.enabled,
      authorId: user.id,
      users: input.users,
      template: template ? template._id : null,
      enabledModules: input.enabledModules,
      fields: input.fields,
      directory: normalize(this.getPath() + '/' + _id)
    }).save().then(
      async (data): Promise<WebsiteInstance> => {
        // Build website
        await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.BUILD)
        await builder.build(data, template).catch((err): Promise<void> => {
          step = WebsiteGenerationStep.BUILD
          throw err
        })

        // Upload website
        await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.UPLOAD)
        await builder.upload(data, template.build.directory).catch((err): Promise<void> => {
          step = WebsiteGenerationStep.UPLOAD
          throw err
        })

        // Notify subscriber for new website
        const times = (Date.now() - start.getTime()) / 1000
        logger.debug(`Website as been created, in ${times}s`)
        await notify(WebsiteGenerationStatus.SUCCESS, undefined, undefined, new Date())

        return data
      }
    ).catch(async (err: Error): Promise<WebsiteInstance> => {
      // Notify subscriber for new website
      logger.debug(`Website could not be created`)
      await notify(WebsiteGenerationStatus.FAIL, step, `creating website (err: ${err.message})`, new Date())

      throw err
    })
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
      input: WebsiteInput,
      @TypeGQL.PubSub(PubSubConstants.WEBSITE_GENERATION) publish: TypeGQL.Publisher<WebsiteGenerationPayload>
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)
    const logger = global.loggers.graphql.child({
      website: {
        id,
        name: input.name || website.name
      }
    })
    const start = new Date()
    const notify = (status: WebsiteGenerationStatus, step?: WebsiteGenerationStep, reason: string = 'updating website', endDate?: Date): Promise<void> => {
      return publish({
        id: id.toHexString(),
        reason,
        status,
        step,
        startDate: start,
        endDate
      })
    }

    // Apply modification
    Object.keys(input).forEach((key): void => {
      (website as any)[key] = (input as any)[key]
    })
    website.updatedAt = new Date()

    // Retrieve template
    let template: null | WebsiteTemplateInstance = null
    if (website.template) {
      template = await WebsiteTemplateDB.findById(website.template)
    }

    // Notify subscriber for update website
    logger.debug('Updating website...')
    await notify(WebsiteGenerationStatus.PROCESSING)

    let step: WebsiteGenerationStep
    return website.save().then(async (): Promise<WebsiteInstance> => {
      // Build website
      await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.BUILD)
      await builder.build(website, template).catch((err): Promise<void> => {
        step = WebsiteGenerationStep.BUILD
        throw err
      })

      // Upload website
      await notify(WebsiteGenerationStatus.PROCESSING, WebsiteGenerationStep.UPLOAD)
      await builder.upload(website, template.build.directory).catch((err): Promise<void> => {
        step = WebsiteGenerationStep.UPLOAD
        throw err
      })

      // Notify subscriber for update website
      const times = (Date.now() - start.getTime()) / 1000
      logger.debug(`Website as been updated, in ${times}s`)
      await notify(WebsiteGenerationStatus.SUCCESS, undefined, undefined, new Date())

      return website
    }).catch(async (err: Error): Promise<WebsiteInstance> => {
      // Notify subscriber for update website
      logger.debug(`Website could not be updated`)
      await notify(WebsiteGenerationStatus.FAIL, step, `updating website (err: ${err.message})`, new Date())

      throw err
    })
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
    @TypeGQL.PubSub(PubSubConstants.WEBSITE_GENERATION) publish: TypeGQL.Publisher<WebsiteGenerationPayload>
  ): Promise<WebsiteInstance> {
    const website = await WebsiteDB.findById(id)
    const logger = global.loggers.builder.child({
      website: {
        id,
        name: website.name
      }
    })
    const start = new Date()
    const notify = (status: WebsiteGenerationStatus, step?: WebsiteGenerationStep, reason: string = 'deleting website', endDate?: Date): Promise<void> => {
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

    return builder.clean(website).then(async (): Promise<WebsiteInstance> => {
      await website.remove()

      // Notify subscriber for delete website
      const times = (Date.now() - start.getTime()) / 1000
      logger.debug(`Website as been deleted, in ${times}s`)
      await notify(WebsiteGenerationStatus.SUCCESS, WebsiteGenerationStep.CLEAN, undefined, new Date())

      return website
    }).catch(async (err: Error): Promise<WebsiteInstance> => {
      // Notify subscriber for update website
      logger.debug(`Website could not be deleted`)
      await notify(WebsiteGenerationStatus.FAIL, WebsiteGenerationStep.CLEAN, `deleting website (err: ${err.message})`, new Date())

      throw err
    })
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
    filter ({ payload, args }: TypeGQL.ResolverFilterData<WebsiteGenerationPayload, {website: string}>): boolean {
      return isEditorKey(args.website) || payload.id === args.website
    }
  })
  public websiteGeneration (
    @TypeGQL.Arg('website') website: string,
    @TypeGQL.Root() payload: WebsiteGenerationPayload
  ): WebsiteGeneration {
    const logger = global.loggers.builder.child({
      website: {
        id: payload.id
      }
    })

    logger.debug(
      payload,
      `Subscription ${PubSubConstants.WEBSITE_GENERATION} : `
    )

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
   * utils
   */
  private getPath (): string {
    return `${process.env.WEBSITE_DIR}`
  }
}
