/* import Path from 'path'
import fs from 'fs-extra'
import { ReplaceFunction, Website } from '@types'

export default {
  get apiURL () {
    return process.env.API_URL
  },
  replaceName (name: string, limiter: string = '\\$\\$') {
    return new RegExp(`${limiter}${name}${limiter}`, 'g')
  },
  replaceInFile (
    path: string,
    replaces: { search: string | RegExp; value: string | ReplaceFunction }[] = []
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      path = Path.resolve(path)
      fs.readFile(path, { encoding: 'UTF-8' })
        .then((data) => {
          replaces.forEach((replace) => {
            if (
              typeof replace === 'object' &&
              (typeof replace.search === 'string' || replace.search instanceof RegExp) &&
              ['string', 'function'].indexOf(typeof replace.value) !== -1
            ) {
              data = data.replace(replace.search, replace.value as any)
            } else {
              console.error('replace is not valid', replace)
            }
          })

          return fs.writeFile(path, data, { encoding: 'UTF-8' }).then(() => data)
        })
        .then(data => resolve(data))
        .catch(reject)
    })
  }
} as Website.InitializeContext */
