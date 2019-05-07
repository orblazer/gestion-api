import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import fs from 'fs-extra'
import { ObjectId } from 'mongodb'
import { Lib, Database } from '@types'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import uploadImage from '../../../../lib/uploadImage'
import { normalize } from '../../../../lib/directory'
import WebsiteDB, { Instance as WebsiteInstance } from '../../../../database/Website'
import UserDB, { Instance as UserInstance, UserJWT } from '../../../../database/User'
import ServiceDB, { Instance as ServiceInstance } from '../../../../database/Service'
import PaginationArgs from '../../paginationArgs'
import Website from '../../admin/website'
import User from '../../admin/user'
import { HasKey } from '../../../decorators/Auth'
import ServiceInput from './input'
import Service from '.'

const subFolder = 'services'
const imageOptions: Lib.UploadImageOptions = {
  image: {
    width: 940,
    height: 480,
    quality: 80
  },
  thumbnail: false,
  preview: {
    width: 35
  }
}

@TypeGQL.Resolver(Service)
export default class ServiceResolver {
  /**
   * Query
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [Service], { nullable: true })
  public allServices (@TypeGQL.Arg('website') website: ObjectId): DocumentQuery<ServiceInstance[], Document> {
    return ServiceDB.find({ websiteId: website }).sort({
      createdAt: -1
    })
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => Service, { nullable: true })
  public getService (@TypeGQL.Arg('website') website: ObjectId, @TypeGQL.Arg('id') id: ObjectId): DocumentQuery<ServiceInstance, Document> {
    return ServiceDB.findOne({ _id: id, websiteId: website })
  }

  @TypeGQL.Authorized()
  @HasKey()
  @TypeGQL.Query((): ReturnTypeFuncValue => [Service], { nullable: true })
  public getServices (@TypeGQL.Args() { offset, limit }: PaginationArgs, @TypeGQL.Ctx('key') key: string): DocumentQuery<ServiceInstance[], Document> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { sort: { createdAt: 1 } }
    if (offset) { options.offset = offset }
    if (limit) { options.limit = limit }

    return ServiceDB.find({ visible: true, websiteId: key }, null, options)
  }

  /**
   * Mutation
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async createService (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => ServiceInput) input: ServiceInput,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<ServiceInstance> {
    const service = new ServiceDB({
      websiteId: website,
      title: input.title,
      image: await uploadImage(
        input.image,
        Object.assign({}, imageOptions, { path: this.getFolder(website) })
      ),
      description: input.description,
      visible: input.visible,
      authorId: user.id,
      updatedAt: new Date()
    })

    return service.save()
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async updateService (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => ServiceInput) input: ServiceInput
  ): Promise<ServiceInstance> {
    const service = await ServiceDB.findOne({ _id: id, websiteId: website })
    service.title = input.title as Database.TextLocalized
    if (input.image) {
      const image = await uploadImage(input.image, Object.assign({}, imageOptions, { path: this.getFolder(website) }))
      await fs.remove(normalize(`${this.getFolder(website)}/${service.image.id}`))
      service.image = image
    }
    service.description = input.description as Database.TextLocalized
    service.visible = input.visible || false
    service.updatedAt = new Date()

    return service.save()
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async deleteService (@TypeGQL.Arg('website') website: ObjectId, @TypeGQL.Arg('id') id: ObjectId): Promise<ServiceInstance> {
    const service = await ServiceDB.findOne({ _id: id, websiteId: website })
    await fs.remove(normalize(`${this.getFolder(website)}/${service.image.id}`))

    return service.remove()
  }

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

  /**
   * Utils
   */
  private getFolder (website: ObjectId): string {
    return `${process.env.UPLOAD_DIR}/${website}/${subFolder}`
  }
}
