import Path from 'path'

export function normalize (path: string): string {
  return (
    Path.posix
      .normalize(path)
      // eslint-disable-next-line no-useless-escape
      .split(/[\\\/]/g)
      .join('/')
  )
}
