const fs = require("fs-extra");
let cachedOptions;
const rcPath = '';
exports.loadOptions = () => {
    if (cachedOptions) {
        return cachedOptions
    }

    if (fs.existsSync(rcPath)) {

    } else {
        return {}
    }
}

exports.defaultPreset = {
    useConfigFiles: false,
    cssPreprocessor: undefined,
    plugins: {
        '@vue/cli-plugin-babel': {},
        '@vue/cli-plugin-eslint': {
            config: 'base',
            lintOn: ['save']
        }
    }
}

exports.defaults = {
    presets: {
        'default': Object.assign({vueVersion: '3'}, exports.defaultPreset),
        'u_earth': Object.assign({vueVersion: '3'}, exports.defaultPreset),
    }
}

