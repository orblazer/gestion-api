import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import { WebsiteFTPProtocol } from '../../../../database/Website'

TypeGQL.registerEnumType(WebsiteFTPProtocol, {
  name: 'WebsiteFTPProtocol'
})

@TypeGQL.ObjectType()
export default class WebsiteFTP {
  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteFTPProtocol)
  public protocol: WebsiteFTPProtocol

  @TypeGQL.Field()
  public host: string

  @TypeGQL.Field()
  public port: number

  @TypeGQL.Field()
  public user: string

  @TypeGQL.Field()
  public password: string

  @TypeGQL.Field()
  public directory: string
}
