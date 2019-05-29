import { GraphQLScalarType, Kind } from 'graphql'
import { ObjectId } from 'mongodb'

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo object id scalar type',
  // value from the client input variables
  parseValue (value: string): ObjectId {
    return new ObjectId(value)
  },
  // value sent to the client
  serialize (value: ObjectId): string {
    return value.toHexString()
  },
  // value from the client query
  parseLiteral (ast): ObjectId {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value)
    }
    return null
  }
})
