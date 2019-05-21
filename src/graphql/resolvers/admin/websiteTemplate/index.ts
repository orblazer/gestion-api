import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteTemplateModule } from '../../../../database/WebsiteTemplate'
import { Lang } from '../../textLocalized'
import UploadedFile from '../../uploadedFile.type'
import UploadedImage from '../../uploadedImage.type'
import User from '../user'
import WebsiteTemplateField from './websiteTemplateField.type'
import WebsiteTemplateBuild from './websiteTemplateBuild.type'

TypeGQL.registerEnumType(WebsiteTemplateModule, {
  name: 'WebsiteTemplateModule'
})

@TypeGQL.ObjectType()
export default class WebsiteTemplate {
  @TypeGQL.Field()
  public readonly _id: ObjectId

  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public description: string

  @TypeGQL.Field()
  public version: string

  @TypeGQL.Field()
  public enabled: boolean

  @TypeGQL.Field()
  public createdAt: Date

  @TypeGQL.Field((): ReturnTypeFuncValue => User)
  public author: User

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateModule])
  public modules: WebsiteTemplateModule[]

  @TypeGQL.Field((): ReturnTypeFuncValue => [Lang])
  public localization: Lang[]

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateField])
  public fields: WebsiteTemplateField[]

  @TypeGQL.Field((): ReturnTypeFuncValue => UploadedFile)
  public file: UploadedFile

  @TypeGQL.Field((): ReturnTypeFuncValue => UploadedImage)
  public preview: UploadedImage

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteTemplateBuild)
  public build: WebsiteTemplateBuild
}
