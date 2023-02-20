'use strict'

module.exports = exec
const Package = require('@imooc-cli-dev-csl/package')
const log = require('@imooc-cli-dev-csl/log')
const path = require('path')
const CACHE_DIR = 'dependencies'
const SETTINGS = {
  init: '@imooc-cli-dev/init'
}
function exec () {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  console.log('homePath', homePath)
  log.verbose('exec', targetPath, homePath)
  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  let pkg
  let storePath = ''
  // console.log('cmdName', cmdObj, cmdName)
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storePath = path.resolve(targetPath, 'node_modules')
    pkg = new Package({ targetPath, packageName, packageVersion, storePath })
    if (pkg.exists()) {
      pkg.update()
    } else {
      pkg.install()
    }
  } else {
    pkg = new Package({ targetPath, packageName, packageVersion, storePath })
    const rootFile = pkg.getRootFilePath()
    require(rootFile).apply(null, arguments)
  }

  // console.log('path', process.env.CLI_TARGET_PATH)
}
