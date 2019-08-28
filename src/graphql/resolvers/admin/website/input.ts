import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import WebsiteFieldInput from './websiteField.input'
import WebsiteFTPInput from './websiteFTP.input'
import { WebsiteTemplateModule } from '@/database/admin/WebsiteTemplate'

@TypeGQL.InputType()
export default class WebsiteInput {
  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteFTPInput)
  public ftp: WebsiteFTPInput

  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public description: string

  @TypeGQL.Field()
  public url: string

  @TypeGQL.Field((): ReturnTypeFuncValue => [String])
  public users: string[] = []

  @TypeGQL.Field({ defaultValue: '' })
  public template: string = ''

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateModule])
  public enabledModules: WebsiteTemplateModule[] = []

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteFieldInput])
  public fields: WebsiteFieldInput[] = []

  @TypeGQL.Field({ defaultValue: false })
  public enabled: boolean = false
}
