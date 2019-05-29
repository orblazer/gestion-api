import { prop, InstanceType } from 'typegoose'
import mongoose from 'mongoose'
import Content from '../Content'
import { UploadImageResult } from '@/lib/uploadImage'

export class Vehicle extends Content {
  @prop()
  public image: UploadImageResult

  @prop()
  public type?: string
}

export type Instance = InstanceType<Vehicle>

export default new Vehicle().getModelForClass(Vehicle, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'vehicles', timestamps: true }
})
