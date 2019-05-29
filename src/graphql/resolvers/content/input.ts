import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import TextLocalizedInput from '../textLocalized/input'

@TypeGQL.InputType()
export default class ContentInput {
  @TypeGQL.Field((): ReturnTypeFuncValue => TextLocalizedInput)
  public title: TextLocalizedInput

  @TypeGQL.Field((): ReturnTypeFuncValue => TextLocalizedInput)
  public description: TextLocalizedInput

  @TypeGQL.Field({ defaultValue: false })
  public visible: boolean = false
}
