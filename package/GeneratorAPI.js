const fs = require("fs");
const path = require("path");
const globby = require('globby')
const {isBinaryFileSync} = require("isbinaryfile")
const yaml = require('yaml-front-matter')
const ejs = require('ejs')
class GeneratorAPI {
    constructor(id, generator, options, rootOptions) {
        this.id = id;
        this.generator = generator
        this.options = options
        this.rootOptions = rootOptions
        this._entryFile = undefined


        this.pluginsData = generator.plugins
            .filter(({id}) => id !== `cli`)
            .map(({id}) => ({
                name: id,
                link: ''
            }))
    }

    // 入口源
    get entryFile() {
        if (this._entryFile) return this._entryFile
        return (this._entryFile = fs.existsSync(this.resolve('src/main.ts')) ? 'src/main.ts' : 'src/main.js')
    }

    resolve(..._paths) {
        return path.resolve(this.generator.context, ..._paths)
    }


    render(source, additionalData = {}, ejsOptions = {}) {
        const baseDir = this.getCallDir()
        if (typeof baseDir === 'string') {
            source = path.resolve(baseDir, source)
            // 注入 apply
            this.injectFileMiddleware(async () => {
                const data = this.resolveData(additionalData)
                const files = await globby(['**/*'], {cwd: source, dot: true})
                for (const rcPath of files) {
                    const targetPath = rcPath.split('/').map(filename => {
                        if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
                            return `.${filename.slice(1)}`
                        }
                        if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
                            return `${filename.slice(1)}`
                        }
                        return filename
                    }).join('/')
                    const sourcePath = path.resolve(source, rcPath)
                    const content = this.renderFile(sourcePath, data, ejsOptions)
                    // 只有文件不是空文件才添加
                    if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
                        files[targetPath] = content
                    }
                }
            })
        }
    }

    injectFileMiddleware(middleware) {
        this.generator.fileMiddlewares.push(middleware)
    }

    /**
     *
     * @param file  文件地址
     * @param imports 语句
     */
    injectImports(file, imports) {
        const _imports = (this.generator.imports[file] || (this.generator.imports[file] = new Set()));
        (Array.isArray(imports) ? imports : [imports]).forEach(imp => {
            _imports.add(imp)
        })
    }

    getCallDir() {
        // 使用错误堆栈提取api.render()调用站点文件位置
        const obj = {}
        Error.captureStackTrace(obj)
        const callSite = obj.stack.split('\n')[3]

        // the regexp for the stack when called inside a named function
        const namedStackRegExp = /\s\((.*):\d+:\d+\)$/
        // the regexp for the stack when called inside an anonymous
        const anonymousStackRegExp = /at (.*):\d+:\d+$/

        let matchResult = callSite.match(namedStackRegExp)
        if (!matchResult) {
            matchResult = callSite.match(anonymousStackRegExp)
        }

        const fileName = matchResult[1]
        return path.dirname(fileName)
    }

    resolveData(additionalData) {
        return Object.assign({
            options: this.options,
            rootOptions: this.rootOptions,
            plugins: this.pluginsData
        }, additionalData)
    }

    renderFile(name, data, ejsOptions) {
        if (isBinaryFileSync(name)) return fs.readFileSync(name) // return buffer
        const template = fs.readFileSync(name, 'utf-8')
        const parsed = yaml.loadFront(template)
        const content = parsed.__content
        let finalTemplate = content.trim() + `\n`
        return ejs.render(finalTemplate, data, ejsOptions)
    }
}

module.exports = GeneratorAPI
