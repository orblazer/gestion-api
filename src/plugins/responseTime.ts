import fastifyPlugin from 'fastify-plugin'

const symbolRequestTime = Symbol('RequestTimer')
const symbolServerTiming = Symbol('ServerTiming')

function genTick (
  name: string,
  duration?: number | string,
  description?: string
): string {
  let val = name
  // Parse duration. If could not be converted to float, does not add it
  if (typeof duration === 'string') {
    duration = parseFloat(duration)
  }
  if (!isNaN(duration)) {
    val += `;dur=${duration}`
  }
  // Parse the description. If empty, doest not add it. If string with space, double quote value
  if (typeof description === 'string') {
    val += `;desc=${
      description.includes(' ') ? `"${description}"` : description
    }`
  }

  return val
}

export interface ResponseTimeOptions {
  digits?: number;
  header?: string;
}

export default fastifyPlugin(function (
  fastify,
  opts: ResponseTimeOptions,
  next
): void {
  // Check the options, and corrects with the default values if inadequate
  if (isNaN(opts.digits) || opts.digits < 0) {
    opts.digits = 2
  }
  opts.header = opts.header || 'X-Response-Time'

  // Can be used to add custom timing information
  fastify.decorateReply('setServerTiming', function (
    name: string,
    duration: string | number,
    description: string
  ): boolean {
    // Reference to the res object storing values …
    const serverTiming = this.res[symbolServerTiming]
    // … return if value already exists (all subsequent occurrences MUST be ignored without signaling an error) …
    if (serverTiming.hasOwnProperty(name)) {
      return false
    }
    // … add the value the the list to send later
    serverTiming[name] = genTick(name, duration, description)
    // … return true, the value was added to the list
    return true
  })

  // Hook to be triggered on request (start time)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fastify.addHook('onRequest', function (request: any, reply: any, next): void {
    // Store the start timer in nanoseconds resolution
    // istanbul ignore next
    if (request.req && reply.res) {
      // support fastify >= v2
      request.req[symbolRequestTime] = process.hrtime()
      reply.res[symbolServerTiming] = {}
    } else {
      request[symbolRequestTime] = process.hrtime()
      reply[symbolServerTiming] = {}
    }

    next()
  })

  // Hook to be triggered just before response to be send
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fastify.addHook('onSend', function (request: any, reply: any, payload, next): void {
    // check if Server-Timing need to be added
    const serverTiming = reply.res[symbolServerTiming]
    const headers = []
    for (const name of Object.keys(serverTiming)) {
      headers.push(serverTiming[name])
    }
    if (headers.length) {
      reply.header('Server-Timing', headers.join(','))
    }

    // Calculate the duration, in nanoseconds …
    const hrDuration = process.hrtime(request.req[symbolRequestTime])
    // … convert it to milliseconds …
    const duration = (hrDuration[0] * 1e3 + hrDuration[1] / 1e6).toFixed(
      opts.digits
    )
    // … add the header to the response
    reply.header(opts.header, duration)

    next()
  })

  next()
})
