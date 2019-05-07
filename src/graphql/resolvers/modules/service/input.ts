import 'reflect-metadata'
import * as TypeGQL from 'type-graphql'
import ContentInput from '../../content/input'

@TypeGQL.InputType()
export default class ServiceInput extends ContentInput {}
