/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import fs from 'fs-extra'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import WebsiteTemplateInput from './input'
import WebsiteTemplateInputCreate from './input-create'
import WebsiteTemplate from '.'
import HasKey from '@/graphql/decorators/HasKey'
import uploadFile from '@/lib/uploadFile'
import uploadImage from '@/lib/uploadImage'
import UserDB, { Instance as UserInstance, UserRole, UserJWT, User } from '@/database/admin/User'
import WebsiteTemplateDB, { Instance as WebsiteTemplateInstance } from '@/database/admin/WebsiteTemplate'

const folder = 'websiteTemplates'

@TypeGQL.Resolver(WebsiteTemplate)
export default class WebsiteTemplateResolver {
  /**
   * Query
   */

  /**
   * Get all website templates
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [WebsiteTemplate], { nullable: 'items' })
  public allWebsiteTemplates (): DocumentQuery<WebsiteTemplateInstance[], Document> {
    return WebsiteTemplateDB.find({}).sort({
      createdAt: -1
    })
  }

  /**
   * Get all enabled templates
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [WebsiteTemplate], { nullable: 'items' })
  public enabledWebsiteTemplates (): DocumentQuery<WebsiteTemplateInstance[], Document> {
    return WebsiteTemplateDB.find({ enabled: true }).sort({
      createdAt: -1
    })
  }

  /**
   * Get an specific website template
   *
   * @param id the template id
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => WebsiteTemplate)
  public getWebsiteTemplate (@TypeGQL.Arg('id') id: ObjectId): DocumentQuery<WebsiteTemplateInstance, Document> {
    return WebsiteTemplateDB.findById(id)
  }

  /**
   * Mutation
   */

  /**
   * Create an new website template
   *
   * @param input The website template data
   */
  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => WebsiteTemplate)
  public async createWebsiteTemplate (
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteTemplateInputCreate) input: WebsiteTemplateInputCreate,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<WebsiteTemplateInstance> {
    // Upload file and preview
    const file = await uploadFile(input.file, {
      path: this.getPath(),
      folder: true,
      newName: 'website'
    })
    let preview
    if (input.preview) {
      preview = await uploadImage(input.preview, {
        path: this.getPath(),
        id: file.id,
        newName: 'preview'
      })
    }

    return new WebsiteTemplateDB({
      name: input.name,
      description: input.description,
      version: input.version,
      enabled: input.enabled,
      authorId: user.id,
      modules: input.modules,
      localization: input.localization,
      fields: input.fields,
      file,
      preview
    }).save()
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => WebsiteTemplate)
  public async updateWebsiteTemplate (
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => WebsiteTemplateInput) input: WebsiteTemplateInput
  ): Promise<WebsiteTemplateInstance> {
    const websiteTemplate = await WebsiteTemplateDB.findById(id)
    if (input.file) {
      input.file = await uploadFile(input.file, {
        path: this.getPath(),
        id: websiteTemplate.file.id,
        folder: true,
        newName: 'website'
      }) as any
    } else {
      delete input.file
    }
    if (input.preview) {
      input.preview = await uploadImage(input.preview, {
        path: this.getPath(),
        id: websiteTemplate.file.id,
        newName: 'preview'
      }) as any
    } else {
      delete input.preview
    }

    // Apply modification
    Object.keys(input).forEach((key): void => {
      (websiteTemplate as any)[key] = (input as any)[key]
    })
    websiteTemplate.updatedAt = new Date()

    return websiteTemplate.save()
  }

  @TypeGQL.Authorized(UserRole.ADMIN)
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => WebsiteTemplate)
  public async deleteWebsiteTemplate (@TypeGQL.Arg('id') id: ObjectId): Promise<WebsiteTemplateInstance> {
    const websiteTemplate = await WebsiteTemplateDB.findById(id)
    await fs.remove(websiteTemplate.file.folderPath)

    return websiteTemplate.remove()
  }

  /**
   * Field
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public author (@TypeGQL.Root('authorId') authorId: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(authorId)
  }

  /**
   * utils
   */
  private getPath (): string {
    return `${process.env.UPLOAD_DIR}/${folder}`
  }
}
