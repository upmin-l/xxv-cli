#!/usr/bin/env node

const {outputHelp, Command} = require('commander')
const logger = require('../utils/logger')
const minimist = require('minimist')
const program = new Command()
program.version(`${require('../package.json').version}`).usage('<command> [options]')

program.command('create <app-name>')
    .description('创建一个新的项目')
    .option('-d, --default', 'Skip prompts and use default preset')
    .option('-f, --default', 'Skip prompts and use default preset')
    .option('-s, --default', 'Skip prompts and use default preset')
    .option('-skip', 'Skip displaying "Get started" instructions')
    .action((name, options) => {
        if (minimist(process.argv.slice(3))._.length > 1) {
            logger.success('\n Info:你提供了多个参数。第一个将用作应用程序的名称，其余的将被忽略！')
        }
        require('../package/create')(name, options)
    })


program.command('preview')
    .description('生产环境预览(本地启动nginx预览)')
    .action(() => {

    })

program.command('build')
    .description('一键打包部署')
    .action(() => {
         // TODO  项目地址打包 更新到目标地址
    })

program.command('tool')
    .description('xxv工具')
    .action(() => {
        // TODO 各数据转换 gojson 地铁站点各市生成 webGis 功能 普通功能方法生成
    })

program.command('test')
    .description('自动化配置测试')
    .action(() => {
        // TODO vue 组件测试
    })

program.on('command:*', ([cmd]) => {
    outputHelp()
    logger.warning(`\nUnknown command ${cmd}.\n`)
    process.exitCode = 1
})

program.parse(process.argv)
