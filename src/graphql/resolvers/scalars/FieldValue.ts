/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLScalarType, Kind } from 'graphql'

export type FieldValue = string | string[]
export const FieldValueScalar = new GraphQLScalarType({
  name: 'FieldValue',
  description: 'FieldValue custom scalar type',
  // value from the client input variables
  parseValue (value): any {
    if (typeof value !== 'string') {
      return JSON.parse(value)
    } else {
      return value
    }
  },
  // value sent to the client
  serialize (value): any {
    if (typeof value !== 'string') {
      return JSON.stringify(value)
    } else {
      return value
    }
  },
  // value from the client query
  parseLiteral (ast): any {
    if (ast.kind === Kind.STRING) {
      return ast.value
    } else if (ast.kind === Kind.LIST) {
      return ast.values.map((astVal): any => {
        if (astVal.kind === Kind.STRING) {
          return astVal.value
        }

        return null
      })
    }
    return null
  }
})
