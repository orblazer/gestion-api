import { AuthChecker } from 'type-graphql'
import { GraphqlContext } from '@types'
import { isEditorKey } from './decorators/HasKey'

const customAuthCheck: AuthChecker<GraphqlContext> = (
  { context: { user, key } },
  roles
): boolean => {
  // if no user but graphql editor key
  if (user === false && isEditorKey(key)) {
    return true
  }

  // if no user, restrict access
  if (!user) {
    return false
  }

  // grant access if no roles defined
  if (roles.length === 0) {
    return true
  }

  // grant access if the roles overlap
  if (roles.includes(user.role)) {
    return true
  }

  // no roles matched, restrict access
  return false
}

export default customAuthCheck
