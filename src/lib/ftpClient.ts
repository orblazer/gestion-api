import { posix as Path } from 'path'
import SFTPClient from 'ssh2-sftp-client'
import _FTPClient from 'jsftp'
import { readFile } from 'fs-extra'

interface ErrnoError extends Error {
  code?: number;
}

export interface FTPClientOptions {
  sftp?: boolean;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

export default class FTPClient {
  private readonly options: FTPClientOptions
  private connected: boolean
  private client: SFTPClient | _FTPClient

  public constructor (options?: FTPClientOptions) {
    this.options = Object.assign(
      {
        sftp: false,
        host: 'localhost',
        port: 21
      },
      options
    )
  }

  public getClient<T extends SFTPClient | _FTPClient> (): T {
    return this.client as T
  }

  /**
   * Create a new FTP/SFTP connection to a remote FTP/SFTP server
   */
  public async connect (): Promise<void> {
    if (this.options.sftp) {
      this.client = new SFTPClient()

      await this.client
        .connect({
          host: this.options.host,
          port: this.options.port,
          username: this.options.user,
          password: this.options.password
          /* debug (info): void {
          console.log(info)
        } */
        })
        .then((): void => {
          this.connected = true
        })
    } else {
      const ftp = (this.client = new _FTPClient({
        host: this.options.host,
        port: this.options.port,
        user: this.options.user,
        pass: this.options.password
      }))

      return new Promise((resolve, reject): void => {
        ftp.once('connect', (): void => {
          this.connected = true
          resolve()
        })
        ftp.on('error', (err: Error): void => {
          reject(err)
        })
        ftp.once('timeout', (): void => {
          this.connected = false
          reject(new Error('The connection timeout'))
        })
      })
    }
  }

  /**
   * Close the FTP/SFTP connection
   */
  public async close (): Promise<void> {
    this.checkConnection()

    if (this.options.sftp) {
      await this.getClient<SFTPClient>()
        .end()
        .then((): void => {
          this.connected = false
        })
    } else {
      try {
        this.getClient<_FTPClient>().destroy()
        this.connected = false
        return Promise.resolve()
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }

  /**
   * Make a directory on remote server
   *
   * @param remotePath remote directory path.
   * @param recursive if true, recursively create directories
   */
  public mkdir (remotePath: string, recursive = false): Promise<string> {
    this.checkConnection()

    const doMkdir = async (path: string): Promise<string> => {
      const exist = await this.exists(path)
      if (exist) {
        return Promise.resolve(null)
      }

      if (this.options.sftp) {
        return this.getClient<SFTPClient>().mkdir(path)
      } else {
        return new Promise((resolve, reject): void => {
          this.getClient<_FTPClient>().raw('mkd', path, (err): void => {
            if (err) {
              reject(new Error(`Failed to create directory ${path}: ${err.message}`))
            } else {
              resolve()
            }
          })
        })
      }
    }

    if (!recursive) {
      return doMkdir(remotePath)
    }
    const mkdir = async (path: string): Promise<string> => {
      const { dir } = Path.parse(path)
      const exist = await this.exists(dir)
      if (!exist) {
        await mkdir(dir)
      }

      return doMkdir(path)
    }

    return mkdir(remotePath)
  }

  /**
   * Upload file
   *
   * @param localPath local directory path.
   * @param remotePath remote directory path.
   */
  public put (localPath: string, remotePath: string): Promise<void> {
    this.checkConnection()

    if (this.options.sftp) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.getClient<SFTPClient>().fastPut(localPath, remotePath) as any
    } else {
      return readFile(localPath).then((file) => {
        return new Promise((resolve, reject): void => {
          this.getClient<_FTPClient>().put(file, remotePath, (err): void => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      })
    }
  }

  /**
   * Tests to see if an object exists. If it does, return the type of that object
   * (in the format returned by list). If it does not exist, return false.
   *
   * @param remotePath path to the object on the sftp server.
   */
  public async exists (remotePath: string): Promise<boolean> {
    this.checkConnection()

    // NOTE: need fix ?
    if (remotePath === '/') {
      return true
    }

    if (this.options.sftp) {
      const exist = await this.getClient<SFTPClient>().exists(remotePath)
      return !!exist
    } else {
      const { dir, base } = Path.parse(remotePath)
      return new Promise((resolve, reject): void => {
        this.getClient<_FTPClient>().ls(dir, (err: ErrnoError, list): void => {
          if (err) {
            if (err.code === 2) {
              resolve(false)
            } else {
              reject(new Error(`Error listing ${dir}: code: ${err.code} ${err.message}`))
            }
          } else {
            resolve(list.filter((item): boolean => item.name === base).length > 0)
          }
        })
      })
    }
  }

  private checkConnection (): void {
    if (!this.client) {
      throw new Error('The client is not defined, please connect first')
    } else if (!this.connected) {
      throw new Error('The client is not connected, please connect first')
    }
  }
}
