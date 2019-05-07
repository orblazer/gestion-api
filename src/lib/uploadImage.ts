import Path from 'path'
import { rescrop, thumbnail, resize } from 'easyimage'
import { Lib } from '@types'
import uploadFile from './uploadFile'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function uploadImage (upload: any, options: Lib.UploadImageOptions = {}): Promise<Lib.UploadImageResult> {
  return new Promise(async (resolve): Promise<void> => {
    options = Object.assign(
      {},
      /* {
        image: {
          width: 940,
          height: 480,
          quality: 80
        },
        thumbnail: {
          width: 470,
          height: 240,
          quality: 80
        },
        preview: {
          width: 35
        }
      }, */
      options
    )

    const uploadOptions: Lib.UploadFileOptions = {
      folder: true
    }
    if (typeof options.newName !== 'undefined') {
      uploadOptions.newName = options.newName
    }
    if (typeof options.path !== 'undefined') {
      uploadOptions.path = options.path
    }
    if (typeof options.absolute !== 'undefined') {
      uploadOptions.absolute = options.absolute
    }
    if (typeof options.folder !== 'undefined') {
      uploadOptions.folder = options.folder
    }
    if (typeof options.id !== 'undefined') {
      uploadOptions.id = options.id
    }

    const uploadedFile = await uploadFile(upload, uploadOptions)
    const extension = Path.extname(uploadedFile.fullPath)
    const thumbnailPath = uploadedFile.fullPath.replace(extension, '-thumbnail' + extension)
    const previewPath = uploadedFile.fullPath.replace(extension, '-preview' + extension)

    if (options.image) {
      await rescrop({
        src: uploadedFile.fullPath,
        dst: uploadedFile.fullPath,
        width: options.image.width,
        gravity: 'center',
        cropWidth: options.image.width,
        cropheight: options.image.height,
        quality: options.image.quality
      })
    }
    if (options.thumbnail) {
      await thumbnail({
        src: uploadedFile.fullPath,
        dst: thumbnailPath,
        width: options.thumbnail.width,
        height: options.thumbnail.height,
        quality: options.thumbnail.quality
      })
    }
    if (options.preview) {
      await resize({
        src: uploadedFile.fullPath,
        dst: previewPath,
        width: options.preview.width
      })
    }

    resolve(
      Object.assign({}, uploadedFile, {
        thumbnail: options.thumbnail ? thumbnailPath : undefined,
        preview: options.preview ? previewPath : undefined
      })
    )
  })
}
