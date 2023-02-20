// import rootCheck from 'root-check'
module.exports = core
const semver = require('semver')
const colors = require('colors')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const path = require('path')
const exec = require('@imooc-cli-dev-csl/exec')
//  require .js/.json/.node
// .js => module.exports/exports
// .node -> process.dlopen
const pkg = require('../package.json')
const log = require('@imooc-cli-dev-csl/log')
const constant = require('./const')
// const init = require('@imooc-cli-dev-csl/init')
async function core () {
  try {
    await prepare()
    registerCommand()
  } catch (err) {
    log.error('err', err.message)
  }
}

async function prepare () {
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv()

  await checkGlobalUpdate()
}
function registerCommand () {
  const commander = require('commander')
  const program = new commander.Command()
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [option]')
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <target>', '是否制定本地调试文件路径', '')
    .version(pkg.version)

  program.on('option:debug', function () {
    process.env.LOG_LEVEL = 'verbose'
    log.level = process.env.LOG_LEVEL
    log.verbose('debug')
  })
  program.on('option:targetPath', function () {
    // 已经被解析的选项和选项值 program.opts()
    process.env.CLI_TARGET_PATH = program.opts().targetPath
  })

  // 对未知命令监听
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令：' + availableCommands.join(',')))
    }
    if (program.args && program.args.length < 1) {
      program.outputHelp()
    }
  })

  program.command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec)

  program.parse(process.argv)
}

async function checkGlobalUpdate () {
  // 1.获取当前版本号
  // 2.调用npmAPI获取版本号
  // 3.提取所有版本号，比对那些版本号是大于当前版本号
  // 4.获取最新的版本号，提示用户更新到该版本
  const currentVersion = pkg.version
  const npmName = pkg.name
  const { getNpmSemverVersion } = require('@imooc-cli-dev-csl/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新${npmName}, 当前版本：${currentVersion}，最新版本${lastVersion}
      更新命令：npm install -g ${npmName}
    `))
  }
}

function checkPkgVersion () {
  log.notice('cli', pkg.version)
}

function checkNodeVersion () {
  // 第一步获取当前NODE版本号
  const currentVersion = process.version
  const lowestVersion = constant.LOWEST_NODE_VERSION
  //   console.log('currentVersion', currentVersion, ' lowestVersion', lowestVersion)
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`imooc-cli需要安装 v${lowestVersion} 以上的版本的Node.js`))
  }
}

function checkRoot () {
  // 降级到非root权限
  const rootCheck = require('root-check')
  rootCheck()
  // console.log(process.geteuid())
}

function checkUserHome () {
  if (!userHome || !pathExists(userHome)) {
    console.log(userHome, pathExists(userHome))
    throw new Error(colors.red('当前登陆用户主目录不存在！'))
  }
}

function checkEnv () {
  const dotEnv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')

  if (pathExists(dotenvPath)) {
    // 会将文件变量注入process.env
    dotEnv.config({
      path: dotenvPath
    })
  }

  createDefaultConfig()
  // log.verbose('PATH', process.env.CLI_HOME_PATH)
}

function createDefaultConfig () {
  const cliConfig = {
    home: userHome
  }
  // console.log(userHome, process.env.CLI_HOME, constant.DEFAULT_CLI_HOME)
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig.cliHome = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}
