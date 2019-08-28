import http from 'http'
import Fastify from 'fastify'
import FastifyCORS from 'fastify-cors'
import pino from 'pino'
import responseTime from './plugins/responseTime'
import uploads from './routes/uploads'

export type FastifyInstance = Fastify.FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>

export default function (): FastifyInstance {
  // Initialize
  const logger: pino.LoggerOptions = {
    redact: ['req.headers.authorization'],
    prettyPrint: global.isProduction
      ? false
      : {
        // forceColor: true
      },
    level: global.isProduction ? 'info' : 'debug',
    serializers: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req (req: any): any {
        return {
          method: req.method,
          url: req.url,
          headers: req.headers,
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.connection.remotePort
        }
      }
    }
  }
  const fastify: FastifyInstance = Fastify({
    logger
  })

  // Decorate fastify
  fastify.decorateRequest('user', false)

  // Register plugins
  fastify.register(responseTime)
  fastify.register(FastifyCORS)

  // Register routes
  fastify.register(uploads, { prefix: '/uploads' })

  return fastify
}
