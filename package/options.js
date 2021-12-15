const fs = require("fs-extra");
const { getRcPath } = require('./util/rcPath')
const logger = require('../utils/logger')
const cloneDeep = require('lodash.clonedeep')
let cachedOptions;
const rcPath = exports.rcPath = getRcPath('.xxvrc');
exports.loadOptions = () => {
    if (cachedOptions) {
        return cachedOptions
    }
    // 读取缓存配置文件
    if (fs.existsSync(rcPath)) {
        try {
            cachedOptions  = JSON.parse(fs.readFileSync(rcPath,'utf-8'))
        }catch (e){
            logger.error(`加载缓存保存配置错误:`+
                `~/.xxvrc 可能损坏或有格式错误. ` +
                `请删除/修复它，或者重新运行xxv-cli 重新保存`+
                `(${e.message})`
            )
            process.exit(1)
        }
        return cachedOptions
    } else {
        return {}
    }
}

exports.saveOptions = toSave => {
    // 合并
    const options = Object.assign(cloneDeep(exports.loadOptions()), toSave)
    for (const key in options) {
        if (!(key in exports.defaults)) {
            delete options[key]
        }
    }
    try {
        fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
        return true
    } catch (e) {
        logger.error(
            `保存配置错误: ` +
            `确保你有访问权限 ${rcPath}.\n` +
            `(${e.message})`
        )
    }
}

exports.savePreset = (name, preset) => {
    const presets = cloneDeep(exports.loadOptions().presets || {})
    presets[name] = preset
    return exports.saveOptions({ presets })
}

exports.defaultPreset = {
    useConfigFiles: false,
    plugins: {
        'vite': {},
        '@vitejs/plugin-vue': {}
    }
}

exports.defaults = {
    presets: {
        'default': Object.assign({vueVersion: '3'}, exports.defaultPreset),
        'u_earth': Object.assign({vueVersion: '3'}, exports.defaultPreset),
    }
}

