import mongoose from 'mongoose'
mongoose.Promise = global.Promise

export function ObjectId (
  id?: string | number | mongoose.Types.ObjectId
): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id)
}

export function connect (): Promise<mongoose.Mongoose> {
  return mongoose.connect(
    `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${
      process.env.MONGODB_HOST
    }/${process.env.MONGODB_DATABASE}`,
    { useCreateIndex: true, useNewUrlParser: true }
  )
}
