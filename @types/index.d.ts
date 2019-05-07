import { Website as WebsiteDB } from 'src/database/Website'
import { UserJWT } from 'src/database/User'

declare interface ReplaceFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (substring: string, ...args: any[]): string;
}

declare namespace Lib {
  interface UploadFileOptions {
    newName?: string;
    path?: string;
    absolute?: boolean;
    folder?: boolean;
    id?: false | string;
  }
  interface UploadFileResult {
    id: false | string;
    filename: string;
    mimetype: string;
    encoding: string;
    path: string;
    fullPath: string;
    folderPath: string;
  }

  interface UploadImageOptions extends UploadFileOptions {
    image?:
    | false
    | {
      width?: number;
      height?: number;
      quality?: number;
    };
    thumbnail?:
    | false
    | {
      width?: number;
      height?: number;
      quality?: number;
    };
    preview?:
    | false
    | {
      width?: number;
    };
  }
  interface UploadImageResult extends UploadFileResult {
    thumbnail?: string;
    preview?: string;
  }
}

declare namespace Database {
  interface UserPassword {
    salt: string;
    hash: string;
    iterations: number;
  }

  interface TextLocalized {
    [key: string]: string;
  }
}

declare namespace Website {
  type InitializeFunction = (context: InitializeContext, website: WebsiteDB, apiKey: string) => Promise<void> | void

  interface InitializeContext {
    readonly apiURL: string;
    markdown (text: string, baseUrl?: string): string;
    replaceName (name: string, limiter?: string): RegExp;
    replaceInFile (
      path: string,
      replaces?: { search: string | RegExp; value: string | ReplaceFunction }[]
    ): Promise<string>;
  }
}

declare interface GraphqlContext {
  user: false | UserJWT;
  key: null | string;
}
