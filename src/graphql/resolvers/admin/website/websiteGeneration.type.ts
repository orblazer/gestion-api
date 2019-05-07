import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'

export interface WebsiteGenerationPayload {
  id: string;
  status: WebsiteGenerationStatus;
  reason: string;
}

export enum WebsiteGenerationStatus {
  PROCESSING,
  FAIL,
  SUCCESS
}

TypeGQL.registerEnumType(WebsiteGenerationStatus, {
  name: 'WebsiteGenerationStatus'
})

@TypeGQL.ObjectType()
export default class WebsiteGeneration {
  @TypeGQL.Field((): ReturnTypeFuncValue => TypeGQL.ID)
  public id: string

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteGenerationStatus)
  public status: WebsiteGenerationStatus

  @TypeGQL.Field()
  public reason: string

  @TypeGQL.Field()
  public startDate: Date = new Date()
}
