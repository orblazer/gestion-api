import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteTemplateModule } from '@/database/admin/WebsiteTemplate'
import User from '../user'
import WebsiteTemplate from '../websiteTemplate'
import WebsiteField from './websiteField.type'
import WebsiteFTP from './websiteFTP.type'

@TypeGQL.ObjectType()
export default class Website {
  @TypeGQL.Field()
  public readonly _id: ObjectId

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteFTP)
  public ftp: WebsiteFTP

  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public description: string

  @TypeGQL.Field()
  public url: string

  @TypeGQL.Field()
  public createdAt: Date

  @TypeGQL.Field((): ReturnTypeFuncValue => [User])
  public users: User[]

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteTemplate, { nullable: true })
  public template: WebsiteTemplate

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateModule])
  public enabledModules: WebsiteTemplateModule[]

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteField])
  public fields: WebsiteField[]

  @TypeGQL.Field({ defaultValue: false })
  public enabled: boolean
}
