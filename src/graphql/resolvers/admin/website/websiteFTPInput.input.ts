import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteFTPProtocol } from '../../../../database/Website'

@TypeGQL.InputType()
export default class WebsiteFTPInput {
  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteFTPProtocol, {
    defaultValue: WebsiteFTPProtocol.FTP
  })
  public protocol: WebsiteFTPProtocol

  @TypeGQL.Field()
  public host: string

  @TypeGQL.Field({ defaultValue: 21 })
  public port: number = 21

  @TypeGQL.Field()
  public user: string

  @TypeGQL.Field()
  public password: string

  @TypeGQL.Field()
  public directory: string
}
