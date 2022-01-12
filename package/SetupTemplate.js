const PackageManager = require("./util/PackageManager");
const writeFileTree = require('./util/writeFileTree')
const GeneratorAPI = require('./GeneratorAPI')
const ejs = require('ejs')
const path = require("path");
const normalizeFilePaths = require('./util/normalizeFilePaths')
const watchFiles = (files, set) => {
    return new Proxy(files, {
        set(target, key, value, receiver) {
            set.add(key)
            return Reflect.set(target, key, value, receiver)
        },
        deleteProperty(target, key) {
            set.delete(key)
            return Reflect.deleteProperty(target, key)
        }
    })
}
module.exports = class SetupTemplate {
    constructor(context, {
        pkg = {},
        plugins = [],
        afterInvokeCbs = [],
        afterAnyInvokeCbs = [],
        files = [],
        invoking = false
    }) {
        this.context = context;
        this.pkg = Object.assign({}, pkg)
        this.pm = new PackageManager({context})
        this.plugins = plugins
        this.fileMiddlewares = []
        this.configTransforms = {}
        this.invoking = invoking
        this.files = Object.keys(files).length
            ? watchFiles(files, this.filesModifyRecord = new Set())
            : files
        // 把不是插件配置的cli 取出来
        this.rootOption = plugins.find(p => p.id === 'cli')
        // console.log('rootOption', this.rootOption);
        /*
        * [
              { id: 'vue', apply: [Function: apply] },
              { id: 'uearth', apply: [Function: apply] },
              { id: 'spray', apply: [Function: apply] },
              { id: 'vuex', apply: [Function: apply] },
              { id: 'vue-router', apply: [Function: apply] }
            ]
        * */
        this.allPlugins = this.resolveAllPlugins()
        // console.log('allPlugins', this.allPlugins);
    }

    async initPlugins() {
        const {rootOptions, invoking} = this
        // console.log('plugins', this.plugins);
        // for (const key of this.allPlugins) {
        //     const {id, apply} = key
        //     const api = new GeneratorAPI(id, this, {}, rootOptions)
        //     await apply(api, {}, rootOptions, invoking)
        // }

        for (const plugin of this.plugins) {
            const {id, apply, options} = plugin
            const api = new GeneratorAPI(id, this, options, rootOptions)
            await apply(api, options, rootOptions, invoking)
        }
    }

    async generate({configFiles = false, checkExisting = false}) {
        // 执行各个插件内部逻辑
        await this.initPlugins()

        const initialFiles = Object.assign({}, this.files)

        // 取出依赖id
        // const pluginIds = this.plugins.map(p => p.id)

        this.extractConfigFiles(configFiles, checkExisting)

        await this.resolveFiles()

        this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
        await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
        // await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
    }

    extractConfigFiles(extractAll, checkExisting) {
        const configTransforms = Object.assign({},
            this.configTransforms,
        )
        const extract = key => {
            if (
                configTransforms[key] &&
                this.pkg[key] &&
                // do not extract if the field exists in original package.json
                !this.originalPkg[key]
            ) {
                const value = this.pkg[key]
                const configTransform = configTransforms[key]
                const res = configTransform.transform(
                    value,
                    checkExisting,
                    this.files,
                    this.context
                )
                const {content, filename} = res
                this.files[filename] = ensureEOL(content)
                delete this.pkg[key]
            }
        }
        if (extractAll) {
            for (const key in this.pkg) {
                extract(key)
            }
        } else {
            if (!process.env.VUE_CLI_TEST) {
                // by default, always extract vue.config.js
                extract('vue')
            }
            // always extract babel.config.js as this is the only way to apply
            // project-wide configuration even to dependencies.
            // TODO: this can be removed when Babel supports root: true in package.json
            extract('babel')
        }
    }

    async resolveFiles() {
        const files = this.files
        for (const middleware of this.fileMiddlewares) {
            await middleware(files, ejs.render)
        }
        normalizeFilePaths(files)
        console.log('files=', files);
    }

    // 获得所有插件
    resolveAllPlugins() {
        const allPlugins = []
        Object.keys(this.pkg.dependencies || {})
            .concat(Object.keys(this.pkg.devDependencies || {}))
            .forEach(id => {
                if (!['vite', '@vitejs/plugin-vue', 'vue'].includes(id)) {
                    const pluginPath = path.resolve(__dirname, `plugMode/${id}.js`)
                    const apply = require(pluginPath) || (() => {
                    })
                    allPlugins.push({id, apply, options: {}})
                }
            })
        return allPlugins
    }
}
