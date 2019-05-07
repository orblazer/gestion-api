import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import { HasKey } from '../../../../graphql/decorators/Auth'
import * as Auth from '../../../../graphql/lib/Auth'
import UserDB, { Instance as UserInstance, UserRole, UserJWT, User } from '../../../../database/User'
import WebsiteDB, { Instance as WebsiteInstance } from '../../../../database/Website'
import { PubSubConstants } from '../../pubSub'
import PaginationArgs from '../../paginationArgs'
import WebsiteGeneration, { WebsiteGenerationPayload } from './websiteGeneration.type'
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
  public allWebsites (@TypeGQL.Ctx('user') user: UserJWT): DocumentQuery<WebsiteInstance[], Document> {
    const filter = Auth.hasPermission(user, UserRole.ADMIN) ? {} : { users: user.id }
    return WebsiteDB.find(filter).sort({
      createdAt: -1
    })
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => Website, { nullable: true })
  public getWebsite (@TypeGQL.Arg('id') id: ObjectId, @TypeGQL.Ctx('user') user: UserJWT): DocumentQuery<WebsiteInstance, Document> {
    if (Auth.hasPermission(user, UserRole.ADMIN)) {
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
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public createWebsite (@TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput) input: WebsiteInput): void {
    // AssertValid.create(input)
    /* const _id = new ObjectId()
    const path = normalize(websiteDir + '/client/' + _id)
    let template: WebsiteTemplate = global.websiteTemplates[input.template]

    global.fastify.log.debug(
      `Creating website ${input.name}` + (template !== null ? ` (${template.name})` : '') + '...'
    )
    const website = {
      _id,
      name: input.name,
      description: input.description,
      url: input.url,
      users: input.users,
      template: input.template,
      fields: input.fields,
      directory: path
    }
    const apply = () => {
      return new WebsiteDB(website).save().then(data => {
        global.fastify.log.debug(`Website ${input.name} has been create`)
        return data
      })
    }

    if (template === null) {
      return fs.mkdirp(path).then(() => normalize(uploadDir + '/' + _id))
    }

    const internalModules =
      typeof template.internal_modules !== 'undefined' ? normalize(path + '/' + template.internal_modules.name) : null
    return fs
      .copy(template.content, path)
      .then(() => {
        if (internalModules === null) return Promise.resolve()

        return fs
          .remove(internalModules)
          .then(() => fs.ensureSymlink(template.internal_modules.path, internalModules, 'dir'))
      })
      .then(() => normalize(uploadDir + '/' + _id))
      .then(() => {
        if (typeof template.initialize === 'function') {
          return UserDB.find(
            { _id: { $in: input.users } },
            {
              _id: true,
              displayName: true,
              username: true,
              role: true,
              createdAt: true
            }
          ).then(users => {
            try {
              const res = template.initialize(
                initializeContext,
                Object.assign({}, website, { users, template }),
                path,
                website._id.toString()
              )

              if (res instanceof Promise) {
                return res.then(apply)
              } else {
                return apply()
              }
            } catch (err) {
              return Promise.reject(err)
            }
          })
        } else {
          return apply()
        }
      }) */
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Website)
  public updateWebsite (@TypeGQL.Arg('id') id: ObjectId, @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteInput) input: WebsiteInput): void {
    // AssertValid.update(input)
    /* let template: WebsiteTemplate = global.websiteTemplates[input.template]
    return WebsiteDB.findById(id).then(oldData => {
      global.fastify.log.debug(`Updating website ${input.name}${template !== null ? ` (${template.name})` : ''}...`)
      const apply = (website: WebsiteType) => {
        website.name = input.name
        website.description = input.description
        website.url = input.url
        website.template = input.template
        website.fields = input.fields

        return website.save().then(data => {
          global.fastify.log.debug(`Website ${input.name} has been updated`)
          return data
        })
      }

      if (template === null) {
        return fs
          .remove(oldData.directory)
          .then(() => fs.mkdirp(oldData.directory))
          .then(() => apply(oldData))
      }

      const internalModules =
        typeof template.internal_modules !== 'undefined'
          ? normalize(oldData.directory + '/' + template.internal_modules.name)
          : null
      return fs
        .remove(oldData.directory)
        .then(() => fs.copy(template.content, oldData.directory))
        .then(() => {
          if (internalModules === null) return Promise.resolve()

          return fs
            .remove(internalModules)
            .then(() => fs.ensureSymlink(template.internal_modules.path, internalModules, 'dir'))
        })
        .then(() => {
          if (typeof template.initialize === 'function') {
            const website = {
              _id: oldData._id,
              name: input.name,
              description: input.description,
              url: input.url,
              template: input.template,
              fields: input.fields,
              directory: oldData.directory
            }

            return UserDB.find(
              { _id: { $in: input.users } },
              {
                _id: true,
                displayName: true,
                username: true,
                role: true,
                createdAt: true
              }
            ).then(users => {
              try {
                const res = template.initialize(
                  initializeContext,
                  Object.assign({}, website, { users, template }),
                  website.directory,
                  website._id.toString()
                )

                if (res instanceof Promise) {
                  return res.then(() => apply(oldData))
                } else {
                  return apply(oldData)
                }
              } catch (err) {
                return Promise.reject(err)
              }
            })
          } else {
            return apply(oldData)
          }
        })
    }) */
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
  public websiteGeneration (@TypeGQL.Root() payload: WebsiteGenerationPayload): WebsiteGeneration {
    global.fastify.log.debug(payload, `Subscription ${PubSubConstants.WEBSITE_GENERATION} : `)
    return {
      ...payload,
      startDate: new Date()
    }
  }

  /**
   * Field
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public users (@TypeGQL.Args() { offset, limit }: PaginationArgs, @TypeGQL.Root() website: WebsiteInstance): DocumentQuery<UserInstance[], Document> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { sort: { createdAt: 1 } }
    if (offset) { options.offset = offset }
    if (limit) { options.limit = limit }

    return UserDB.find({ _id: { $in: website.users } }, null, options)
  }
}
