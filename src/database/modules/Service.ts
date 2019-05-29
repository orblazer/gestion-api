import { InstanceType, prop } from 'typegoose'
import mongoose from 'mongoose'
import Content from '../Content'
import { UploadImageResult } from '@/lib/uploadImage'

export class Service extends Content {
  @prop()
  public image: UploadImageResult
}

export type Instance = InstanceType<Service>

export default new Service().getModelForClass(Service, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'services', timestamps: true }
})
