import { UseMiddleware, ForbiddenError } from 'type-graphql'
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types'

export function HasKey (keyFn?: () => string): MethodAndPropDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return UseMiddleware(({ context: { key } }, next): Promise<any> => {
    // Is graphql editor
    if (key === 'admin:yc6p39p7BYFx7QAiYqzJ29Ku2Hr46fS2' && !global.isProduction) {
      return next()
    }

    const tryKey = typeof keyFn === 'function' ? keyFn() : true

    if ((tryKey === true && key === null) || key !== tryKey) {
      throw new ForbiddenError()
    }
    return next()
  })
}
