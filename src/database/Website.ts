import { Typegoose, prop, arrayProp, Ref, InstanceType } from 'typegoose'
import mongoose from 'mongoose'
import isURL from 'validator/lib/isURL'
import { FieldValue } from '../graphql/resolvers/scalars/FieldValue'
import { User } from './User'
import { WebsiteTemplate, WebsiteTemplateModule } from './WebsiteTemplate'

export interface Field {
  name: string;
  value: FieldValue;
}

export enum WebsiteFTPProtocol {
  FTP = 'FTP',
  SFTP = 'SFTP'
}

export interface WebsiteFTP {
  protocol: WebsiteFTPProtocol;
  host: string;
  port: number;
  user: string;
  password: string;
  directory: string;
}

export class Website extends Typegoose {
  @prop({ default: null })
  public ftp: WebsiteFTP = null

  @prop({ required: true })
  public name: string

  @prop({ default: '' })
  public description: string

  @prop({
    required: true,
    unique: true,
    validate: {
      validator: isURL,
      message: '{VALUE} is not a valid url'
    }
  })
  public url: string

  @prop({ default: false })
  public enabled: boolean = false

  @prop({ default: Date.now })
  public createdAt: Date = new Date()

  @prop({ ref: User })
  public authorId: Ref<User>

  @arrayProp({ itemsRef: User })
  public users: Ref<User>[]

  @prop({ ref: WebsiteTemplate })
  public template: Ref<WebsiteTemplate>

  @prop({ _id: false })
  public enabledModules: WebsiteTemplateModule[]

  @prop({ _id: false })
  public fields: Field[]

  @prop()
  public directory: string
}

export type Instance = InstanceType<Website>

export default new Website().getModelForClass(Website, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'websites', timestamps: true }
})
