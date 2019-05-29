import { Typegoose, prop, Ref, InstanceType } from 'typegoose'
import mongoose from 'mongoose'
import { Lang } from '@/graphql/resolvers/textLocalized'
import { JSONType } from '@/graphql/resolvers/scalars/JSON'
import { FieldValue } from '@/graphql/resolvers/scalars/FieldValue'
import { User } from './User'
import { UploadFileResult } from '@/lib/uploadFile'
import { UploadImageResult } from '@/lib/uploadImage'

export interface InputFields {
  type: string;
  localize?: Lang;
  name: string;
  label: string;
  errorName?: string;
  placeholder?: string;
  defaultValue?: FieldValue;
  validate?: JSONType;
  options?: { name: string; value: string }[];
  private?: boolean;
}

export enum WebsiteTemplateModule {
  BLOG_ARTICLES = 'BLOG_ARTICLES',
  BLOG_CATEGORIES = 'BLOG_CATEGORIES',
  SERVICES = 'SERVICES',
  VTC_VEHICLES = 'VTC_VEHICLES',
  REST_MENU = 'REST_MENU'
}

export enum WebsiteTemplatePackager {
  YARN = 'YARN',
  NPM = 'NPM'
}

export interface WebsiteTemplateBuild {
  packager: WebsiteTemplatePackager;
  script: string;
  directory: string;
}

export class WebsiteTemplate extends Typegoose {
  @prop({ required: true })
  public name: string

  @prop({ default: '' })
  public description: string

  @prop({ default: '1.0.0' })
  public version: string

  @prop({ default: false })
  public enabled: boolean = false

  @prop({ default: Date.now })
  public createdAt: Date = new Date()

  @prop({ ref: User })
  public authorId: Ref<User>

  @prop({ _id: false })
  public modules: WebsiteTemplateModule[]

  @prop({ _id: false })
  public localization: Lang[]

  @prop({ _id: false })
  public fields: InputFields[]

  @prop()
  public file: UploadFileResult

  @prop()
  public preview: UploadImageResult

  @prop({ default: null })
  public build: WebsiteTemplateBuild = null
}

export type Instance = InstanceType<WebsiteTemplate>

export default new WebsiteTemplate().getModelForClass(WebsiteTemplate, {
  existingMongoose: mongoose,
  schemaOptions: { collection: 'website_templates', timestamps: true }
})
