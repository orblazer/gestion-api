import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { ObjectId } from 'mongodb'
import { ReturnTypeFuncValue } from 'type-graphql/dist/decorators/types'
import TextLocalized from '../textLocalized'
import UploadedFile from '../uploadedFile.type'
import Website from '../admin/website'
import User from '../admin/user'

@TypeGQL.ObjectType()
export default class Content {
  @TypeGQL.Field()
  public readonly _id: ObjectId

  @TypeGQL.Field((): ReturnTypeFuncValue => Website)
  public website: Website

  @TypeGQL.Field((): ReturnTypeFuncValue => TextLocalized)
  public title: TextLocalized

  @TypeGQL.Field((): ReturnTypeFuncValue => UploadedFile)
  public image: UploadedFile

  @TypeGQL.Field((): ReturnTypeFuncValue => TextLocalized)
  public description: TextLocalized

  @TypeGQL.Field({ defaultValue: false })
  public visible: boolean = false

  @TypeGQL.Field((): ReturnTypeFuncValue => User)
  public author: User

  @TypeGQL.Field()
  public createdAt: Date

  @TypeGQL.Field({ nullable: true })
  public updatedAt?: Date
}
