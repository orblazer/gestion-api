import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'

@TypeGQL.InputType()
export default class TextLocalizedInput {
  @TypeGQL.Field({ nullable: true })
  public FR?: string

  @TypeGQL.Field({ nullable: true })
  public EN?: string
}
