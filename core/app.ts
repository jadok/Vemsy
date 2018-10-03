import * as express from 'express'
import * as path from 'path'
const includeAll = require('include-all')

import './json'

import { mergeConfiguration } from './config'
import * as systemConfigs from './configs/files.json'
import * as logsConfigs from './configs/logs.json'

import { logMiddleware } from './middlewares/logs'

import { defineContentReader } from './content/md'
import { ThemeManager } from './theme'
import { arrayUnique } from './utils/array'

/**
 * Express constructor
 */
export class App {
  public express: express.Express
  public configs: any = {}
  public theme: ThemeManager | null = null

  /**
   * Set up express and middleware
   */
  constructor() {
    this.express = express()
    this.setConfigFiles()
    this.setLoggers()
    this.setPublic()
    this.setContentEngine()
    this.setTheme()
    this.routes()
  }

  public setLoggers() {
    this.express.use(logMiddleware)
  }

  public setConfigFiles() {
    console.log('Loading Configs Files')
    const configs: any = includeAll({
      dirname: path.join(process.cwd(), 'app', 'configs'),
      excludeDirs: /^\.(git|svn)$/,
      filter: /(.+)\.ts$/,
      optional: true
    })
    const coreConfigs: any = {
      files: systemConfigs,
      logs: logsConfigs
    }
    this.configs.global = arrayUnique(Object.keys(configs).concat(Object.keys(coreConfigs)))
      .reduce((accumulator: any, key: any) => {
        accumulator[key] = mergeConfiguration(coreConfigs[key], configs[key])
        return accumulator
      }, {})
    console.log('Configs Files Loaded')
  }

  public setPublic() {
    console.log('setting static dir')
    this.express.use(
      express.static(
        this.configs.global.files.app_path.public
      )
    )
  }

  public setTheme() {
    console.log('setting theme')
    this.theme = new ThemeManager(
      this.express,
      this.configs.global.files
    )
  }

  /**
   * Set Principal template
   */
  public setContentEngine() {
    console.log('setting ContentEngine')
    this.express.use(
      defineContentReader(
        this.configs.global.files.app_path.contents
      )
    )
  }

  public routes() {
    console.log('setting route resolver')
    this.express.get('/*', (req: any, res: express.Response) => {
      console.log(req.originalUrl)
      if (req.originalUrl.indexOf('.') === -1 && this.theme !== null) {
        this.theme.pageResolver(req, res)
      }
      else {
        res.sendFile(req.path)
      }
    })
  }
}
