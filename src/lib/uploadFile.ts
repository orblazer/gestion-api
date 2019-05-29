import Path from 'path'
import fs from 'fs-extra'
import generate from './generateId'
import { normalize } from './directory'

export interface UploadFileOptions {
  newName?: string;
  path?: string;
  absolute?: boolean;
  folder?: boolean;
  id?: false | string;
}
export interface UploadFileResult {
  id: false | string;
  filename: string;
  mimetype: string;
  encoding: string;
  path: string;
  fullPath: string;
  folderPath: string;
}

/**
 * Upload an file from graphql-upload
 *
 * @param upload the upload stream
 * @param options the upload options
 */
export default async function uploadFile (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload: any,
  {
    newName,
    path = process.env.UPLOAD_DIR,
    absolute = false,
    folder = false,
    id = generate()
  }: UploadFileOptions
): Promise<UploadFileResult> {
  const file = await upload
  const stream = file.createReadStream()

  if (typeof stream === 'undefined') {
    throw new SyntaxError("The 'stream' is not defined")
  }

  // Rename output file
  let filename = file.filename
  if (typeof newName !== 'undefined') {
    if (filename.endsWith('.tar.gz')) {
      filename = newName + '.tar.gz'
    } else {
      filename = newName + Path.extname(filename)
    }
  }

  // Get path of output file
  let filePath =
    id !== false
      ? folder
        ? `${path}/${id}/${filename}`
        : `${path}/${id}-${filename}`
      : `${path}/${filename}`
  if (absolute) {
    filePath = Path.resolve(filePath)
  } else {
    filePath = normalize(filePath)
  }

  // Get full path and ensure output dir exist
  const fullPath = Path.resolve(filePath)
  const folderPath = Path.dirname(fullPath)
  await fs.ensureDir(folderPath)

  // Write file from upload stream
  return new Promise(
    (resolve, reject): void => {
      stream
        .pipe(fs.createWriteStream(fullPath))
        .on(
          'error',
          (err: Error): void => {
            if (stream.truncated) {
              // Delete the truncated file
              fs.remove(folderPath)
                .then((): void => reject(err))
                .catch((): void => reject(err))
            } else {
              reject(err)
            }
          }
        )
        .on(
          'finish',
          (): void =>
            resolve({
              id,
              filename,
              mimetype: file.mimetype,
              encoding: file.encoding,
              path: filePath,
              fullPath,
              folderPath
            })
        )
    }
  )
}
