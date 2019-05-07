import { AuthenticationError, ForbiddenError } from 'apollo-server-core'
import { UserJWT, UserRole } from '../../database/User'

export function isAuth (user: UserJWT | false, throwErr: boolean = false): boolean {
  if (throwErr) {
    if (user === false) {
      throw new AuthenticationError('Access denied! You are not logged !')
    }
    return true
  } else {
    return user !== false
  }
}

export function hasPermission (
  user: UserJWT | false,
  role: UserRole[] | UserRole = UserRole.CLIENT,
  throwErr: boolean = false
): boolean {
  if (throwErr) {
    if (user === false) {
      throw new AuthenticationError('Access denied! You are not logged !')
    }
    if ((typeof user.role === 'string' && user.role !== role) || !role.includes(user.role)) {
      throw new ForbiddenError("Access denied! You don't have permission for this action!")
    }
    return true
  } else {
    return user !== false ? (typeof user.role === 'string' && user.role === role) || role.includes(user.role) : false
  }
}

export function hasKey (key: string, tryKey: string | true = null, throwErr: boolean = false): boolean {
  if (throwErr) {
    if ((tryKey === true && key === null) || key !== tryKey) {
      throw new ForbiddenError("Access denied! You don't have permission for this action! (The key is incorrect)")
    }
    return true
  } else {
    return (tryKey === true && key !== null) || key === tryKey
  }
}
