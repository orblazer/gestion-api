import Path from 'path'
import { rescrop, thumbnail, resize } from 'easyimage'
import uploadFile, { UploadFileOptions, UploadFileResult } from './uploadFile'

export interface UploadImageOptions extends UploadFileOptions {
  image?:
  | false
  | {
    width: number;
    height?: number;
    quality?: number;
  };
  thumbnail?:
  | false
  | {
    width: number;
    height?: number;
    quality?: number;
  };
  preview?:
  | false
  | {
    width: number;
  };
}
export interface UploadImageResult extends UploadFileResult {
  thumbnail?: string;
  preview?: string;
}

/**
 * Upload an image from graphql-upload
 *
 * @param upload the upload stream
 * @param options the upload options
 */
export default async function uploadImage (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload: any,
  options: UploadImageOptions = {}
): Promise<UploadImageResult> {
  // Upload original image
  const uploadOptions: UploadFileOptions = {
    folder: options.folder || true,
    newName: options.newName,
    path: options.path,
    absolute: options.absolute,
    id: options.id
  }
  const uploadedFile = await uploadFile(upload, uploadOptions)

  // Get thumbnail and preview paths
  const extension = Path.extname(uploadedFile.fullPath)
  const thumbnailPath = uploadedFile.fullPath.replace(
    extension,
    '-thumbnail' + extension
  )
  const previewPath = uploadedFile.fullPath.replace(
    extension,
    '-preview' + extension
  )

  // Modify image with specific options
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

  // Return file result with optional thumbnail and preview paths
  return Object.assign({}, uploadedFile, {
    thumbnail: options.thumbnail ? thumbnailPath : undefined,
    preview: options.preview ? previewPath : undefined
  })
}
