import Path from 'path'
import fs from 'fs-extra'
import generate from './generateId'
import { Lib } from '@types'

export default function uploadFile (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload: any,
  { newName, path = process.env.UPLOAD_DIR, absolute = false, folder = false, id = generate() }: Lib.UploadFileOptions
): Promise<Lib.UploadFileResult> {
  return new Promise(async (resolve, reject): Promise<void> => {
    const file = await upload
    const stream = file.createReadStream()

    if (typeof stream === 'undefined') {
      reject(new SyntaxError("The 'stream' is not defined"))
      return
    }

    let filename = file.filename
    if (typeof newName !== 'undefined') {
      if (filename.endsWith('.tar.gz')) {
        filename = newName + '.tar.gz'
      } else {
        filename = newName + Path.extname(filename)
      }
    }

    let filePath =
      id !== false ? (folder ? `${path}/${id}/${filename}` : `${path}/${id}-${filename}`) : `${path}/${filename}`
    if (absolute) { filePath = Path.resolve(filePath) } else { filePath = Path.posix.normalize(filePath) }

    const fullPath = Path.resolve(filePath)
    const folderPath = Path.dirname(fullPath)
    fs.ensureDir(folderPath)
      .then((): void => {
        stream
          .pipe(fs.createWriteStream(fullPath))
          .on('error', (err: Error): void => {
            if (stream.truncated) {
              // Delete the truncated file
              fs.remove(folderPath)
                .then((): void => reject(err))
                .catch((): void => reject(err))
            } else {
              reject(err)
            }
          })
          .on('finish', (): void =>
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
      })
      .catch(reject)
  })
}
