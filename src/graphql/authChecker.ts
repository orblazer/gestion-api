import { AuthChecker } from 'type-graphql'
import { GraphqlContext } from '@types'

const customAuthCheck: AuthChecker<GraphqlContext> = ({ context: { user, key } }, roles): boolean => {
  // Is graphql editor
  if (user === false && key === 'admin:yc6p39p7BYFx7QAiYqzJ29Ku2Hr46fS2' && !global.isProduction) {
    return true
  }

  if (roles.length === 0) {
    // if `@Authorized()`, check only is user exist
    return user !== false
  }

  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false
  }
  if (roles.includes(user.role)) {
    // grant access if the roles overlap
    return true
  }

  // no roles matched, restrict access
  return false
}

export default customAuthCheck
