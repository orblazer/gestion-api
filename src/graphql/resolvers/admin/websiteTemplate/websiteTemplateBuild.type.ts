import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteTemplatePackager } from '../../../../database/WebsiteTemplate'

TypeGQL.registerEnumType(WebsiteTemplatePackager, {
  name: 'WebsiteTemplatePackager'
})

@TypeGQL.ObjectType()
export default class WebsiteTemplateBuild {
  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteTemplatePackager)
  public packager: WebsiteTemplatePackager

  @TypeGQL.Field()
  public script: string

  @TypeGQL.Field()
  public directory: string
}
