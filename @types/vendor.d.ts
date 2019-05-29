/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/indent */
import { UserJWT } from '@/database/admin/User'
import { FastifyInstance } from 'src/server'
import { Logger } from 'pino'

declare global {
  namespace NodeJS {
    interface Global {
      fastify: FastifyInstance;
      isProduction: boolean;
      loggers: { [key: string]: Logger };
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
