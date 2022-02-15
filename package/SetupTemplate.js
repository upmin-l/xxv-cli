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
        files = {},
        invoking = false
    }) {
        this.context = context;
        this.pkg = Object.assign({}, pkg)
        this.pm = new PackageManager({context})
        this.plugins = plugins
        this.fileMiddlewares = []
        this.configTransforms = {}
        this.imports = {}
        this.invoking = invoking
        this.files = Object.keys(files).length
            ? watchFiles(files, this.filesModifyRecord = new Set())
            : files
        // todo 把不是插件配置的cli 取出来 后续需要
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
            // 这里apply 执行的就是每个依赖入口  plugMode
            await apply(api, options, rootOptions, invoking)
        }
    }

    async generate() {
        // 执行各个插件内部逻辑
        await this.initPlugins()

        const initialFiles = Object.assign({}, this.files)

        // 取出依赖id
        // const pluginIds = this.plugins.map(p => p.id)
        console.log('this.files',this.files)

        await this.resolveFiles()

        this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
        await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
    }


    async resolveFiles() {

        const files = this.files
        for (const middleware of this.fileMiddlewares) {
            await middleware(files, ejs.render)
        }
        normalizeFilePaths(files)

        // 处理 语句 注入
        Object.keys(files).forEach(file => {
            let imports = this.imports[file]
            imports = imports instanceof Set ? Array.from(imports) : imports
        })
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
