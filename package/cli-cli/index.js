const fs = require('fs-extra')
const path = require('path')
const {info} = require('../../utils/logger')


function copyFiles([...ags], ulrStr) {
    const destPath = path.resolve(process.cwd(), ...ags);
    const rcPath = path.resolve(__dirname, ulrStr)
    fs.copySync(rcPath, destPath)
}

module.exports = (api, options) => {
    const {plugins} = options
    options.includes = ['vue']
    options.useEarth =options.useEarth || Object.prototype.hasOwnProperty.call(plugins, 'uearth')
    // 如果默认创建的
    if (options.hasDefault) {

    } else {
        // 手动选项创建
        // vite.config.js 的 include
        for (const plugin in plugins) {
            if (plugins[plugin].include) {
                options.includes.push(plugin)
            }
        }

    }
    info(`★ copy required files in ${options.projectName}...`)

    copyFiles([options.projectName || '.', './public/vendor'], '../plugMode/vendor')
    console.log('options', options);

    if (options.useEarth) {
        copyFiles([options.projectName || '.', './public/map'], `../plugMode/mapThemes/${options.thmems}`)
    }
    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
    // Todo vendor 文件下的编译过的文件出现不符合promise规范,导致ejs无法渲染报错
    api.render('../plugMode/template', options)
}
