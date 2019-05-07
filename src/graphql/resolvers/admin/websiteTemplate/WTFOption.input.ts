import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'

@TypeGQL.InputType()
export default class WTFOptionInput {
  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public value: string
}
