/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLScalarType, Kind, ValueNode } from 'graphql'

export type FieldValue =
  | number
  | boolean
  | string
  | (number | boolean | string)[]
export const FieldValueScalar = new GraphQLScalarType({
  name: 'FieldValue',
  description: 'FieldValue custom scalar type',
  // value from the client input variables
  parseValue (value: number | boolean | string): FieldValue {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
    return value
  },
  // value sent to the client
  serialize (value: FieldValue): number | boolean | string {
    if (Array.isArray(value)) {
      return JSON.stringify(value)
    } else {
      return value
    }
  },
  // value from the client query
  parseLiteral (ast: ValueNode): FieldValue {
    if (
      ast.kind === Kind.INT ||
      ast.kind === Kind.FLOAT ||
      ast.kind === Kind.BOOLEAN ||
      ast.kind === Kind.STRING
    ) {
      return ast.value
    } else if (ast.kind === Kind.LIST) {
      return ast.values.map(
        (ast): number | boolean | string => {
          if (
            ast.kind === Kind.INT ||
            ast.kind === Kind.FLOAT ||
            ast.kind === Kind.BOOLEAN ||
            ast.kind === Kind.STRING
          ) {
            return ast.value
          }
          return null
        }
      )
    }
    return null
  }
})
