import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'

@TypeGQL.ObjectType()
export default class WTFOption {
  @TypeGQL.Field()
  public name: string

  @TypeGQL.Field()
  public value: string
}
