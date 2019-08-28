import { UseMiddleware, ForbiddenError } from 'type-graphql'
import { MethodAndPropDecorator } from 'type-graphql/dist/decorators/types'

/**
 * Check if key id graphql editor key
 *
 * @param key the key
 */
export function isEditorKey (key: string): boolean {
  if (key === 'admin:yc6p39p7BYFx7QAiYqzJ29Ku2Hr46fS2' && !global.isProduction) {
    return true
  }
}

export default function HasKey (keyFn?: () => string): MethodAndPropDecorator {
  return UseMiddleware(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ context: { key } }, next): Promise<any> => {
      // Is graphql editor
      if (isEditorKey(key)) {
        return next()
      }

      // Check if key match to needed key
      const tryKey = typeof keyFn === 'function' ? keyFn() : true
      if ((tryKey === true && key === null) || key !== tryKey) {
        throw new ForbiddenError()
      }

      return next()
    }
  )
}
