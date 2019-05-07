import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import { Min, Max } from 'class-validator/decorator/decorators'
import { GraphQLScalarType } from 'graphql'

@TypeGQL.ArgsType()
export default class PaginationArgs {
  @TypeGQL.Field((): GraphQLScalarType => TypeGQL.Int, { nullable: true })
  @Min(0)
  public offset?: number

  @TypeGQL.Field((): GraphQLScalarType => TypeGQL.Int, { defaultValue: 50 })
  @Min(0)
  @Max(50)
  public limit?: number
}
