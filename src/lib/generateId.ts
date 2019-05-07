import generate from 'nanoid/generate'

export default function (
  size: number = 8,
  alphabet: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string {
  return generate(alphabet, size)
}
