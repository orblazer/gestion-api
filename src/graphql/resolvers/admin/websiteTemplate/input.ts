import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { GraphQLUpload } from 'graphql-upload'
import { GraphQLScalarType } from 'graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteTemplateModule } from '../../../../database/WebsiteTemplate'
import { Lang } from '../../textLocalized'
import WebsiteTemplateFieldInput from './websiteTemplateField.input'
import WebsiteTemplateBuildInput from './websiteTemplateBuild.input'

@TypeGQL.InputType()
export default class WebsiteTemplateInput {
  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field({ defaultValue: '' })
  public description: string = ''

  @TypeGQL.Field({ defaultValue: '1.0.0' })
  public version: string = '1.0.0'

  @TypeGQL.Field({ defaultValue: false })
  public enabled: boolean = false

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateModule])
  public modules: WebsiteTemplateModule[] = []

  @TypeGQL.Field((): ReturnTypeFuncValue => [Lang])
  public localization: Lang[] = []

  @TypeGQL.Field((): ReturnTypeFuncValue => [WebsiteTemplateFieldInput])
  public fields: WebsiteTemplateFieldInput[] = []

  @TypeGQL.Field((): ReturnTypeFuncValue => GraphQLUpload, { nullable: true })
  public file?: GraphQLScalarType

  @TypeGQL.Field((): ReturnTypeFuncValue => GraphQLUpload, { nullable: true })
  public preview?: GraphQLScalarType

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteTemplateBuildInput, {
    nullable: true
  })
  public build?: WebsiteTemplateBuildInput
}
