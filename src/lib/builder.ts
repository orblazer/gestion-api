import util from 'util'
import Path from 'path'
import { execFile } from 'child_process'
import { extract } from 'tar'
import fs from 'fs-extra'
import { mergeDeep } from 'apollo-utilities'
import { Instance as WebsiteTemplate, WebsiteTemplatePackager } from '../database/admin/WebsiteTemplate'
import { Instance as Website, WebsiteFTPProtocol } from '../database/admin/Website'
import { walk, normalize } from '../lib/directory'
import FTPClient from './ftpClient'

const exec = util.promisify(execFile)

async function build (website: Website, template: null | WebsiteTemplate = null): Promise<void> {
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
    'Building website ' + (template !== null ? `with template ${template.name}` : 'without template') + '...'
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
    }).catch((err): void => {
      logger.error(`Website building failed, ${err}`)
      throw err
    })

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
  const files = (await walk(folder)).map((file): { local: string; remote: string } => {
    return {
      local: file,
      remote: normalize(website.ftp.directory + file.replace(folder, '.'))
    }
  })

  logger.debug('Uploading website...')

  const client = new FTPClient({
    sftp: website.ftp.protocol === WebsiteFTPProtocol.SFTP,
    host: website.ftp.host,
    port: website.ftp.port,
    user: website.ftp.user,
    password: website.ftp.password
  })

  try {
    await client.connect()

    for (const file of files) {
      const { dir } = Path.posix.parse(file.remote)

      await client.mkdir(dir, true).then((): Promise<void> => client.put(file.local, file.remote))
    }

    await client.close()
  } catch (err) {
    logger.error(`Website uploading failed, ${err}`)
    throw err
  }

  const times = (Date.now() - start) / 1000
  logger.debug(`Website has been uploaded in ${times}s`)
}

async function clean (website: Website): Promise<void> {
  const logger = global.loggers.builder.child({
    website: {
      id: website._id,
      name: website.name
    },
    buildStep: 'upload'
  })
  const start = Date.now()
  logger.debug('Deleting website...')

  await fs.remove(website.directory)

  const times = (Date.now() - start) / 1000
  logger.debug(`Website has been deleted in ${times}s`)
}

export default {
  build,
  upload,
  clean
}
