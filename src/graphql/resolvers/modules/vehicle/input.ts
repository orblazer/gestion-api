import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import ContentInput from '../../content/input'

@TypeGQL.InputType()
export default class VehicleInput extends ContentInput {
  @TypeGQL.Field({ nullable: true })
  public type?: string
}
