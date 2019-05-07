import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'

export enum Lang {
  FR = 'FR',
  EN = 'EN'
}
TypeGQL.registerEnumType(Lang, {
  name: 'Lang'
})

@TypeGQL.ObjectType()
export default class TextLocalized {
  @TypeGQL.Field({ nullable: true })
  public FR?: string

  @TypeGQL.Field({ nullable: true })
  public EN?: string
}
