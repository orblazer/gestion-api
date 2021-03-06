import { Typegoose, prop, arrayProp, Ref, InstanceType } from 'typegoose'
import mongoose from 'mongoose'
import isURL from 'validator/lib/isURL'
import { User } from './User'
import { WebsiteTemplate, WebsiteTemplateModule } from './WebsiteTemplate'
import { FieldValue } from '@/graphql/resolvers/scalars/FieldValue'

export interface Field {
  name: string;
  value: FieldValue;
}

export enum WebsiteFTPProtocol {
  FTP = 'FTP',
  SFTP = 'SFTP',
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
  @prop({ required: true })
  public ftp: WebsiteFTP

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
  public enabled: boolean

  @prop({ default: new Date() })
  public createdAt: Date

  @prop({ default: new Date() })
  public updatedAt: Date

  @prop({ ref: User })
  public authorId: Ref<User>

  @arrayProp({ itemsRef: User })
  public users: Ref<User>[]

  @prop({ ref: WebsiteTemplate, default: null })
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
