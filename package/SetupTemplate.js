const PackageManager = require("./util/PackageManager");
const writeFileTree = require('./util/writeFileTree')
const ejs = require('ejs')
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
        files = []
    }) {
        this.context = context;
        this.pkg = Object.assign({}, pkg)
        this.pm = new PackageManager({context})
        this.files = files
        this.plugins = plugins
        this.fileMiddlewares = []
        this.configTransforms = {}
        console.log(plugins);
        this.files = Object.keys(files).length
            ? watchFiles(files, this.filesModifyRecord = new Set())
            : files
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
    }

    async generate({configFiles = false, checkExisting = false}) {
        const initialFiles = Object.assign({}, this.files)

        this.extractConfigFiles(configFiles, checkExisting)

        await this.resolveFiles()

        this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'

        // console.log(this.context, this.files, initialFiles, this.filesModifyRecord);
        // await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
    }
    extractConfigFiles (extractAll, checkExisting) {
        const configTransforms = Object.assign({},
            this.configTransforms,
        )
    }
    async resolveFiles() {
        const files = this.files
        for (const middleware of this.fileMiddlewares) {
            await middleware(files, ejs.render)
        }
    }

    // 获得所有插件
    resolveAllPlugins() {
        const allPlugins = []
        Object.keys(this.pkg.dependencies || {})
            .concat(Object.keys(this.pkg.devDependencies || {}))
            .forEach(id => {
                allPlugins.push({
                    id, apply: (() => {
                    })
                })
            })
        return allPlugins
    }
}
