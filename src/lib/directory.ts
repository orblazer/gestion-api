import Path from 'path'
import fs from 'fs-extra'

export function normalize (path: string): string {
  return (
    Path.posix
      .normalize(path)
      // eslint-disable-next-line no-useless-escape
      .split(/[\\\/]/g)
      .join('/')
  )
}

export async function walk (dir: string): Promise<string[]> {
  const stat = await fs.stat(dir)
  if (!stat.isDirectory()) {
    throw new Error(`The path "${dir}" is not directory`)
  }

  const files = await Promise.all(
    (await fs.readdir(dir)).map(
      async (file): Promise<string[] | string> => {
        file = Path.join(dir, file)
        return (await fs.stat(file)).isDirectory() ? walk(file) : file
      }
    )
  )
  return Array.prototype.concat(...files)
}
