import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteTemplatePackager } from '@/database/WebsiteTemplate'

@TypeGQL.InputType()
export default class WebsiteTemplateBuildInput {
  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteTemplatePackager, {
    defaultValue: WebsiteTemplatePackager.NPM
  })
  public packager: WebsiteTemplatePackager = WebsiteTemplatePackager.NPM

  @TypeGQL.Field({ defaultValue: 'build' })
  public script: string = 'build'

  @TypeGQL.Field({ defaultValue: 'dist/' })
  public directory: string = 'dist/'
}
