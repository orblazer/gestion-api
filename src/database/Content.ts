import { Typegoose, Ref, prop } from 'typegoose'
import { TextLocalized } from '@types'
import { Website } from './admin/Website'
import { User } from './admin/User'

export default class Content extends Typegoose {
  @prop({ required: true, ref: Website })
  public websiteId: Ref<Website>

  @prop()
  public title: TextLocalized

  @prop()
  public description: TextLocalized

  @prop({ default: false })
  public visible: boolean

  @prop({ required: true, ref: User })
  public authorId: Ref<User>

  @prop({ default: Date.now })
  public createdAt: Date

  @prop()
  public updatedAt?: Date
}
