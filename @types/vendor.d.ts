/* eslint-disable @typescript-eslint/indent */
import { UserJWT } from 'src/database/User'
import { FastifyInstance } from 'src/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Builder from 'src/lib/builder'

declare global {
  namespace NodeJS {
    interface Global {
      fastify: FastifyInstance;
      isProduction: boolean;
      builder: Builder;
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
    authenticate: FastifyMiddleware<
      HttpServer,
      HttpRequest,
      HttpResponse,
      DefaultQuery,
      DefaultParams,
      DefaultHeaders,
      DefaultBody
    >;
  }

  interface FastifyRequest<
    HttpRequest,
    Query = DefaultQuery,
    Params = DefaultParams,
    Headers = DefaultHeaders,
    Body = DefaultBody
  > {
    user: false | UserJWT;
  }

  interface FastifyReply<HttpResponse> {
    setServerTiming(
      name: string,
      duration?: number | string,
      description?: string
    ): boolean;
  }
}
