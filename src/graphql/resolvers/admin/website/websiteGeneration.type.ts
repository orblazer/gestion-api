import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'

export interface WebsiteGenerationPayload {
  id: string;
  status: WebsiteGenerationStatus;
  step?: WebsiteGenerationStep;
  reason: string;
  startDate: Date;
  endDate?: Date;
}

export enum WebsiteGenerationStatus {
  IDLE,
  PROCESSING,
  FAIL,
  SUCCESS,
}

export enum WebsiteGenerationStep {
  IDLE,
  BUILD,
  UPLOAD,
  CLEAN,
}

TypeGQL.registerEnumType(WebsiteGenerationStatus, {
  name: 'WebsiteGenerationStatus'
})

TypeGQL.registerEnumType(WebsiteGenerationStep, {
  name: 'WebsiteGenerationStep'
})

@TypeGQL.ObjectType()
export default class WebsiteGeneration {
  @TypeGQL.Field()
  public id: string

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteGenerationStatus)
  public status: WebsiteGenerationStatus

  @TypeGQL.Field((): ReturnTypeFuncValue => WebsiteGenerationStep, {
    nullable: true
  })
  public step?: WebsiteGenerationStep

  @TypeGQL.Field()
  public reason: string

  @TypeGQL.Field()
  public startDate: Date

  @TypeGQL.Field({ nullable: true })
  public endDate?: Date
}
