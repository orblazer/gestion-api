import { AuthenticationError, ForbiddenError } from 'apollo-server-core'
import { UserJWT, UserRole } from '@/database/admin/User'

/**
 * Check if user is logged
 *
 * @param user the user info
 * @param throwErr the error is throw
 */
function isAuth (user: UserJWT | false, throwErr = false): boolean {
  if (user === false && throwErr) {
    throw new AuthenticationError('Access denied! You are not logged !')
  }

  return user !== false
}

/**
 * Check if user has role
 *
 * @param user the user data
 * @param roles the roles
 * @param throwErr thr error is throw
 */
function hasRole (user: UserJWT | false, roles: UserRole[] | UserRole = UserRole.CLIENT, throwErr = false): boolean {
  if (!isAuth(user, throwErr)) {
    return false
  }
  user = user as UserJWT // Fix type checking

  if ((typeof user.role === 'string' && user.role !== roles) || !roles.includes(user.role)) {
    if (throwErr) {
      throw new ForbiddenError("Access denied! You don't have permission for this action!")
    }

    return false
  }

  return true
}

function hasKey (key: string, tryKey: string | true = null, throwErr = false): boolean {
  if ((tryKey === true && key === null) || key !== tryKey) {
    if (throwErr) {
      throw new ForbiddenError("Access denied! You don't have permission for this action! (The key is incorrect)")
    }

    return false
  }

  return true
}

export default {
  isAuth,
  hasRole,
  hasKey
}
