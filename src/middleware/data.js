import fs from 'fs'
import util from 'util'

import filePathToPath from '../utils/path.js'
import asyncHandler from '../utils/async.js'

const readFile = util.promisify(fs.readFile)

const dataMiddleware = async (req, res, next) => {
  if (!req.variables.file) {
    return next()
  }
  try {
    const filePath = req.variables.file
    const data = await readFile(filePathToPath(filePath), 'utf-8')
    req.variables.data = data
  }
  catch (e) {
    console.error(e, req.variables, req.variables.file)
    req.variables.data = ''
  }
  return next()
}

export default asyncHandler(dataMiddleware)
