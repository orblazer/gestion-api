import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import fs from 'fs-extra'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import uploadImage, { UploadImageOptions } from '@/lib/uploadImage'
import { normalize } from '@/lib/directory'
import { UserJWT } from '@/database/admin/User'
import ServiceDB, { Instance as ServiceInstance } from '@/database/modules/Service'
import HasKey from '../../../decorators/HasKey'
import createBaseResolver from '../../content/resolver'
import ServiceInput from './input'
import Service from '.'
import { TextLocalized } from '@types'

const ContentBaseResolver = createBaseResolver<ServiceInstance>({ plural: 'Services', single: 'Service' }, Service, ServiceDB)
const subFolder = 'services'
const imageOptions: UploadImageOptions = {
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
export default class ServiceResolver extends ContentBaseResolver {
  /**
   * Mutation
   */

  /**
   * Create an new service
   *
   * @param website the website id
   * @param input the service data
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async createService (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => ServiceInput) input: ServiceInput,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<ServiceInstance> {
    return new ServiceDB({
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
    }).save()
  }

  /**
   * Update an service
   *
   * @param website the website id
   * @param id the service id
   * @param input the new service data
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async updateService (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => ServiceInput) input: ServiceInput
  ): Promise<ServiceInstance> {
    const service = await ServiceDB.findOne({ _id: id, websiteId: website })
    service.title = input.title as TextLocalized
    if (input.image) {
      const image = await uploadImage(input.image, Object.assign({}, imageOptions, { path: this.getFolder(website) }))
      await fs.remove(normalize(`${this.getFolder(website)}/${service.image.id}`))
      service.image = image
    }
    service.description = input.description as TextLocalized
    service.visible = input.visible || false
    service.updatedAt = new Date()

    return service.save()
  }

  /**
   * Delete an service
   *
   * @param website the website if
   * @param id the service id
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Service)
  public async deleteService (@TypeGQL.Arg('website') website: ObjectId, @TypeGQL.Arg('id') id: ObjectId): Promise<ServiceInstance> {
    const service = await ServiceDB.findOne({ _id: id, websiteId: website })
    await fs.remove(normalize(`${this.getFolder(website)}/${service.image.id}`))

    return service.remove()
  }

  /**
   * Utils
   */
  private getFolder (website: ObjectId): string {
    return `${process.env.UPLOAD_DIR}/${website}/${subFolder}`
  }
}
