import { resolve } from 'path'
import fastifyStatic from 'fastify-static'
import { FastifyInstance } from '../server'

export default function<T> (
  fastify: FastifyInstance,
  opts: T,
  next: (err?: Error) => void
): void {
  fastify.register(fastifyStatic, {
    root: resolve(process.env.UPLOAD_DIR)
  })

  next()
}
