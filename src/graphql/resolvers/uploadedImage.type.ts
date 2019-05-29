import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { UploadImageResult } from '@/lib/uploadImage'

@TypeGQL.ObjectType()
export default class UploadedImage implements UploadImageResult {
  @TypeGQL.Field()
  public id: string

  @TypeGQL.Field()
  public filename: string

  @TypeGQL.Field()
  public mimetype: string

  @TypeGQL.Field()
  public encoding: string

  @TypeGQL.Field()
  public path: string

  @TypeGQL.Field()
  public fullPath: string

  @TypeGQL.Field()
  public folderPath: string

  @TypeGQL.Field({ nullable: true })
  public thumbnail?: string

  @TypeGQL.Field({ nullable: true })
  public preview?: string
}
