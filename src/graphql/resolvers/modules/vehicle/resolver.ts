import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import fs from 'fs-extra'
import { ObjectId } from 'mongodb'
import { Lib, Database } from '@types'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { DocumentQuery, Document } from 'mongoose'
import uploadImage from '../../../../lib/uploadImage'
import { normalize } from '../../../../lib/directory'
import VehicleDB, { Instance as VehicleInstance } from '../../../../database/Vehicle'
import WebsiteDB, { Instance as WebsiteInstance } from '../../../../database/Website'
import UserDB, { Instance as UserInstance, UserJWT } from '../../../../database/User'
import PaginationArgs from '../../paginationArgs'
import Website from '../../admin/website'
import User from '../../admin/user'
import { HasKey } from '../../../decorators/Auth'
import VehicleInput from './input'
import Vehicle from '.'

const subFolder = 'vehicles'
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

@TypeGQL.Resolver(Vehicle)
export default class VehicleResolver {
  /**
   * Query
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => [Vehicle], { nullable: true })
  public allVehicles (@TypeGQL.Arg('website') website: ObjectId): DocumentQuery<VehicleInstance[], Document> {
    return VehicleDB.find({ websiteId: website }).sort({
      createdAt: -1
    })
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Query((): ReturnTypeFuncValue => Vehicle, { nullable: true })
  public getVehicle (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('id') id: ObjectId
  ): DocumentQuery<VehicleInstance, Document> {
    return VehicleDB.findOne({ _id: id, websiteId: website })
  }

  @TypeGQL.Authorized()
  @HasKey()
  @TypeGQL.Query((): ReturnTypeFuncValue => [Vehicle], { nullable: true })
  public getVehicles (@TypeGQL.Args() { offset, limit }: PaginationArgs, @TypeGQL.Ctx('key') key: string): DocumentQuery<VehicleInstance[], Document> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { sort: { createdAt: 1 } }
    if (offset) { options.offset = offset }
    if (limit) { options.limit = limit }

    return VehicleDB.find({ visible: true, websiteId: key }, null, options)
  }

  /**
   * Mutation
   */
  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async createVehicle (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => VehicleInput) input: VehicleInput,
    @TypeGQL.Ctx('user') user: UserJWT
  ): Promise<VehicleInstance> {
    const vehicle = new VehicleDB({
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

    return vehicle.save()
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async updateVehicle (
    @TypeGQL.Arg('website') website: ObjectId,
    @TypeGQL.Arg('id') id: ObjectId,
    @TypeGQL.Arg('input', (): ReturnTypeFuncValue => VehicleInput) input: VehicleInput
  ): Promise<VehicleInstance> {
    const vehicle = await VehicleDB.findOne({ _id: id, websiteId: website })
    vehicle.title = input.title as Database.TextLocalized
    if (input.image) {
      const image = await uploadImage(input.image, Object.assign({}, imageOptions, { path: this.getFolder(website) }))
      await fs.remove(normalize(`${this.getFolder(website)}/${vehicle.image.id}`))
      vehicle.image = image
    }
    vehicle.description = input.description as Database.TextLocalized
    vehicle.visible = input.visible || false
    vehicle.updatedAt = new Date()

    return vehicle.save()
  }

  @TypeGQL.Authorized()
  @HasKey((): string => process.env.PANEL_KEY)
  @TypeGQL.Mutation((): ReturnTypeFuncValue => Vehicle)
  public async deleteService (@TypeGQL.Arg('website') website: ObjectId, @TypeGQL.Arg('id') id: ObjectId): Promise<VehicleInstance> {
    const vehicle = await VehicleDB.findOne({ _id: id, websiteId: website })
    await fs.remove(normalize(`${this.getFolder(website)}/${vehicle.image.id}`))

    return vehicle.remove()
  }

  /**
   * Field
   */
  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => Website)
  public website (@TypeGQL.Root('websiteId') websiteId: ObjectId): DocumentQuery<WebsiteInstance, Document> {
    return WebsiteDB.findById(websiteId)
  }

  @TypeGQL.FieldResolver((): ReturnTypeFuncValue => User)
  public author (@TypeGQL.Root('authorId') authorId: ObjectId): DocumentQuery<UserInstance, Document> {
    return UserDB.findById(authorId)
  }

  /**
   * Utils
   */
  private getFolder (website: ObjectId): string {
    return `${process.env.UPLOAD_DIR}/${website}/${subFolder}`
  }
}
