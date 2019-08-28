import generate from 'nanoid/generate'

export default function (
  size = 8,
  alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
  return generate(alphabet, size)
}
