import { Typegoose, Ref, prop, InstanceType } from 'typegoose'
import mongoose from 'mongoose'
import { TextLocalized } from '@types'
import { Website } from './Website'
import { User } from './User'
import { UploadImageResult } from '@/lib/uploadImage'

export class Service extends Typegoose {
  @prop({ required: true, ref: Website })
  public websiteId: Ref<Website>

  @prop()
  public title: TextLocalized

  @prop()
  public description: TextLocalized

  @prop({ _id: false })
  public image: UploadImageResult

  @prop({ default: false })
  public visible: boolean

  @prop({ required: true, ref: User })
  public authorId: Ref<User>

  @prop({ default: Date.now })
  public createdAt: Date

  @prop()
  public updatedAt?: Date
}

export type Instance = InstanceType<Service>

export default new Service().getModelForClass(Service, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'services', timestamps: true }
})
