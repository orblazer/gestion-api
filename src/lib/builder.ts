import util from 'util'
import Path from 'path'
import { execFile } from 'child_process'
import { extract } from 'tar'
import fs from 'fs-extra'
import { mergeDeep } from 'apollo-utilities'
import SFTPClient from 'ssh2-sftp-client'
import FTPClient from 'jsftp'
import {
  Instance as WebsiteTemplate,
  WebsiteTemplatePackager
} from '../database/WebsiteTemplate'
import { Instance as Website, WebsiteFTPProtocol } from '../database/Website'
import { walk } from '../lib/directory'

const exec = util.promisify(execFile)

async function build (
  website: Website,
  template: null | WebsiteTemplate = null
): Promise<void> {
  const logger = global.loggers.builder.child({
    website: {
      id: website._id,
      name: website.name
    },
    buildStep: 'build'
  })
  const start = Date.now()
  const path = website.directory
  const folderExist = await fs.pathExists(path)

  logger.debug(
    `Building website ` +
      (template !== null
        ? `with template ${template.name}`
        : 'without template') +
      '...'
  )

  // Create directory (if not exist)
  if (!folderExist) {
    await fs.mkdirp(path)
  }

  if (template) {
    // Extract template (if not exist)
    if (!folderExist) {
      await extract({
        cwd: path,
        file: template.file.fullPath
      })
    }

    let file = ''
    let args = [template.build.script]
    switch (template.build.packager) {
      case WebsiteTemplatePackager.NPM:
        file = 'npm'
        args = ['run', template.build.script]
        break
      case WebsiteTemplatePackager.YARN:
        file = 'yarn'
        break
    }

    const proc = await exec(file, args, {
      cwd: path,
      env: mergeDeep({}, process.env, {
        WEBSITE: JSON.stringify(website)
      })
    }).catch(
      (err): void => {
        logger.error(`Website building failed, ${err}`)
        throw err
      }
    )

    if (proc) {
      logger.debug(proc.stdout)
      logger.debug(proc.stderr)
    }
  }

  const times = (Date.now() - start) / 1000
  logger.debug(`Website has been builded in ${times}s`)
}

async function upload (website: Website, uploadFolder: string): Promise<void> {
  const logger = global.loggers.builder.child({
    website: {
      id: website._id,
      name: website.name
    },
    buildStep: 'upload'
  })
  const start = Date.now()
  const folder = Path.resolve(website.directory + '/' + uploadFolder)
  const files = (await walk(folder)).map(
    (file): { local: string; remote: string } => {
      return {
        local: file,
        remote: file.replace(folder, '.')
      }
    }
  )

  logger.debug('Uploading website...')

  if (website.ftp.protocol === WebsiteFTPProtocol.FTP) {
    const ftp = new FTPClient({
      host: website.ftp.host,
      port: website.ftp.port,
      user: website.ftp.user,
      pass: website.ftp.password
    })

    await new Promise(
      (resolve, reject): void => {
        ftp.once(
          'connect',
          async (): Promise<void> => {
            const put = util.promisify(ftp.put)

            await Promise.all(
              files.map((file): Promise<void> => put(file.local, file.remote))
            ).catch(reject)

            ftp.destroy()
            resolve()
          }
        )
        ftp.once('error', reject)
        ftp.once('timeout', reject)
      }
    ).catch(
      (err): void => {
        logger.error(`Website uploading failed, ${err}`)
        throw err
      }
    )
  } else {
    const sftp = new SFTPClient()

    await sftp
      .connect({
        host: website.ftp.host,
        port: website.ftp.port,
        username: website.ftp.user,
        password: website.ftp.password
      })
      .then(
        (): Promise<string[]> => {
          return Promise.all(
            files.map(
              (file): Promise<string> => sftp.fastPut(file.local, file.remote)
            )
          )
        }
      )
      .then((): Promise<void> => sftp.end())
  }

  const times = (Date.now() - start) / 1000
  logger.debug(`Website has been uploaded in ${times}s`)
}

export default {
  build,
  upload
}
