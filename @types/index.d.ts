import { UserJWT } from '@/database/admin/User'

declare interface ReplaceFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (substring: string, ...args: any[]): string;
}

declare interface TextLocalized {
  [key: string]: string;
}

declare interface GraphqlContext {
  user: false | UserJWT;
  key: null | string;
}
