import { resolve } from 'path'
import { ApolloServer } from 'apollo-server-fastify'
import { GraphQLSchema, GraphQLError } from 'graphql'
import { buildSchema } from 'type-graphql'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { FastifyInstance } from '../server'
import { UserJWT } from '../database/admin/User'
import resolvers from './resolvers'
import authChecker from './authChecker'
import { ObjectIdScalar } from './resolvers/scalars/ObjectId'
import { GraphqlContext } from '@types'

export interface ContextData {
  key: string;
  user: false | UserJWT;
}

export default async function (fastify: FastifyInstance): Promise<void> {
  const schema: GraphQLSchema | void = await buildSchema({
    resolvers,
    authChecker,
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    emitSchemaFile: resolve(__dirname, 'schema.gql')
  }).catch((err): void => {
    global.loggers.graphql.error(err)

    if (err.details) {
      err.details.forEach((detail: Error): void => {
        global.loggers.graphql.error(detail)
      })
    }
  })
  if (typeof schema === 'undefined') {
    return
  }

  const server = new ApolloServer({
    schema,
    subscriptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onConnect (connectionParams: any): GraphqlContext {
        const res: GraphqlContext = {
          user: false,
          key: null
        }

        if (typeof connectionParams.authorization === 'string') {
          const parts = connectionParams.authorization.split(' ')
          if (parts.length === 2) {
            const scheme = parts[0]
            const credentials = parts[1]

            if (/^Bearer$/i.test(scheme)) {
              try {
                res.user = jwt.verify(credentials, process.env.JWT_SECRET) as UserJWT
                // tslint:disable-next-line: no-empty
              } catch (err) {}
            }
          }
        }
        if (typeof connectionParams.key === 'string') {
          res.key = connectionParams.key
        }

        return res
      }
    },
    introspection: !global.isProduction,
    playground: !global.isProduction,
    uploads: true,
    formatError (err): GraphQLError {
      if (!global.isProduction) {
        fastify.log.error(err)
        return err
      }

      return new GraphQLError(err.message)
    },
    context (request): GraphqlContext {
      const res: GraphqlContext = {
        user: false,
        key: null
      }

      if (request.headers) {
        if (typeof request.headers.authorization === 'string') {
          const parts = request.headers.authorization.split(' ')
          if (parts.length === 2) {
            const scheme = parts[0]
            const credentials = parts[1]

            if (/^Bearer$/i.test(scheme)) {
              try {
                res.user = jwt.verify(credentials, process.env.JWT_SECRET) as UserJWT
                // tslint:disable-next-line: no-empty
              } catch (err) {}
            }
          }
        }
        if (typeof request.headers.key === 'string') {
          res.key = request.headers.key
        }
      }

      return res
    }
  })

  server.installSubscriptionHandlers(fastify.server)
  fastify.register(server.createHandler())
}
