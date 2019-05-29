import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import fs from 'fs-extra'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import uploadImage, { UploadImageOptions } from '@/lib/uploadImage'
import { normalize } from '@/lib/directory'
import { UserJWT } from '@/database/admin/User'
import VehicleDB, { Instance as VehicleInstance } from '@/database/modules/Vehicle'
import HasKey from '../../../decorators/HasKey'
import createBaseResolver from '../../content/resolver'
import VehicleInput from './input'
import Vehicle from '.'
import { TextLocalized } from '@types'

const ContentBaseResolver = createBaseResolver<VehicleInstance>({ plural: 'Vehicles', single: 'Vehicle' }, Vehicle, VehicleDB)
const subFolder = 'vehicles'
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

@TypeGQL.Resolver(Vehicle)
export default class VehicleResolver extends ContentBaseResolver {
  /**
   * Mutation
   */

  /**
   * Create an new vehicle
   *
   * @param website the website id
   * @param input the vehicle data
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async createVehicle (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => VehicleInput) input: VehicleInput,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<VehicleInstance> {
    return new VehicleDB({
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
   * Update an vehicle
   *
   * @param website the website id
   * @param id the vehicle id
   * @param input the new vehicle data
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async updateVehicle (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => VehicleInput) input: VehicleInput
  ): Promise<VehicleInstance> {
    const vehicle = await VehicleDB.findOne({ _id: id, websiteId: website })
    vehicle.title = input.title as TextLocalized
    if (input.image) {
      const image = await uploadImage(input.image, Object.assign({}, imageOptions, { path: this.getFolder(website) }))
      await fs.remove(normalize(`${this.getFolder(website)}/${vehicle.image.id}`))
      vehicle.image = image
    }
    vehicle.description = input.description as TextLocalized
    vehicle.visible = input.visible || false
    vehicle.updatedAt = new Date()

    return vehicle.save()
  }

  /**
   * Delete an vehicle
   *
   * @param website the website if
   * @param id the vehicle id
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async deleteVehicle (@TypeGQL.Arg('website') website: ObjectId, @TypeGQL.Arg('id') id: ObjectId): Promise<VehicleInstance> {
    const vehicle = await VehicleDB.findOne({ _id: id, websiteId: website })
    await fs.remove(normalize(`${this.getFolder(website)}/${vehicle.image.id}`))

    return vehicle.remove()
  }

  /**
   * Utils
   */
  private getFolder (website: ObjectId): string {
    return `${process.env.UPLOAD_DIR}/${website}/${subFolder}`
  }
}
