'use strict'
const { isObject } = require('@imooc-cli-dev-csl/util')
const formatPath = require('@imooc-cli-dev-csl/format-path')
const pkgDir = require('pkg-dir').sync
const path = require('path')
const npminstall = require('npminstall')

const { getDefaultRegistry } = require('@imooc-cli-dev-csl/get-npm-info')
class Package {
  constructor (options) {
    if (!options) {
      throw new Error('Package类的options不能为空')
    } 
    if (!isObject(options)) {
      throw new Error('Package类的options必须为对象')
    }
    this.targetPath = options.targetPath

    // 缓存路径
    this.storePath = options.storePath

    this.packageName = options.packageName

    this.packageVersion = options.packageVersion
    // console.log('Package constructor'
  }

  // 判断当前Package是否存在
  exists () {

  }

  // 安装Package
  install () {
    npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion
        }
      ]
    })
  }

  // 更新Package
  update () {

  }

  // 获取入口文件的路径
  getRootFilePath () {
    // 1.获取package.json所在目录 -pkg-dir
    // 2.获取package.json -require()
    // 3.寻找main/lib -path
    // 4.路径的兼容（mac/window）

    const dir = pkgDir(this.targetPath)
    if (dir) {
      const pkgFile = require(path.resolve(dir, './package.json'))
      if (pkgFile && (pkgFile.main)) {
        return formatPath(path.resolve(dir, pkgFile.main))
      }
      return null
    }
  }
}

module.exports = Package
