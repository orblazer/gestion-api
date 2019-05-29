import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import UploadedFile from '../../uploadedFile.type'
import Content from '../../content'

@TypeGQL.ObjectType()
export default class Vehicle extends Content {
  @TypeGQL.Field((): ReturnTypeFuncValue => UploadedFile)
  public image: UploadedFile

  @TypeGQL.Field({ nullable: true })
  public type?: string
}
