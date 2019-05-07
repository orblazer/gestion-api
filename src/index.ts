import * as database from './database'
import server, { FastifyInstance } from './server'
import graphql from './graphql'
import Builder from './lib/builder'

global.isProduction = process.env.NODE_ENV === 'production'
try {
  if (global.isProduction) {
    require('dotenv').config({
      path: '.env.production'
    })
  } else {
    require('dotenv').config()
  }
} catch (e) {
  throw new Error(e)
}

const HOST: string = process.env.SERVER_HOST || 'localhost'
const PORT: number = Number(process.env.SERVER_PORT) || 4000

// Normalize env pass
if (
  typeof process.env.UPLOAD_DIR === 'undefined' ||
  process.env.UPLOAD_DIR === ''
) {
  process.env.UPLOAD_DIR = 'uploads'
}
if (
  typeof process.env.WEBSITE_DIR === 'undefined' ||
  process.env.WEBSITE_DIR === ''
) {
  process.env.WEBSITE_DIR = 'websites'
}

database
  .connect()
  .then(async (): Promise<void> => {
    // Initialize builder
    global.builder = new Builder()

    // Initialize fastify
    const fastify: FastifyInstance = server()
    global.fastify = fastify

    // Initialize graphql
    await graphql(fastify)

    // Start fastify
    await fastify.ready()

    return fastify
      .listen(PORT, HOST)
      .then((): void => {
        if (!global.isProduction) {
          // eslint-disable-next-line no-console
          console.log('Routes :\n', fastify.printRoutes())
        }
      })
      .catch((err): void => {
        fastify.log.error('Error starting server:', err)
        process.exit(1)
      })
  })
  .catch((err): void => {
    throw err
  })
