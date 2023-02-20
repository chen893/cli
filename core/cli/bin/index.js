#!/usr/bin/env node
// console.log('hello world')
// const utils = require('@imooc-cli-dev-csl/utils')
// console.log('utils', utils())

const importLocal = require('import-local')
// console.log('local', importLocal(__filename), __filename)
if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用imooc-cli本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}
