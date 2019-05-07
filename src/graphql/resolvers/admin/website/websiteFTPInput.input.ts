import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'

@TypeGQL.InputType()
export default class WebsiteFTPInput {
  @TypeGQL.Field()
  public host: string

  @TypeGQL.Field()
  public user: string

  @TypeGQL.Field()
  public password: string

  @TypeGQL.Field()
  public directory: string
}
