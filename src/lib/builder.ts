import { extract } from 'tar'
import fs from 'fs-extra'
import { Instance as WebsiteTemplate } from '../database/WebsiteTemplate'
import { Instance as Website } from '../database/Website'
import { normalize } from './directory'

export default class Builder {
  public async build (
    template: WebsiteTemplate,
    website: Website
  ): Promise<boolean> {
    const path = normalize(`${process.env.WEBSITE_DIR}/${website.id}`)

    // Create directory
    await fs.mkdirp(path)

    // Extract file
    await extract({
      cwd: path,
      file: template.file.fullPath
    })

    // TODO build the website

    return true
  }
}
