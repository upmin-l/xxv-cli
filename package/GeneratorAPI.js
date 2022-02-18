const fs = require("fs");
const path = require("path");
const globby = require('globby')
const {isBinaryFileSync} = require("isbinaryfile")
const yaml = require('yaml-front-matter')
const ejs = require('ejs')
const {runTransformation} = require("vue-codemod");

class GeneratorAPI {
    /**
     *
     * @param id 依赖id
     * @param generator 调用生成器实例
     * @param options 生成器 选项
     * @param rootOptions 根选项(整个预设)
     */
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
        // 如果是ts 项目需要指定 不同格式文件
        return (this._entryFile = fs.existsSync(this.resolve('src/main.ts')) ? 'src/main.ts' : 'src/main.js')
    }

    resolve(..._paths) {
        return path.resolve(this.generator.context, ..._paths)
    }

    /**
     *
     * @param source {string | object | FileMiddleware} source -
     *  1,目录的绝对路径-
     *  2，template 映射源
     *  3，一个中间件函数
     * @param additionalData 插件的 options 选项
     * @param ejsOptions ejs options选项
     */
    render(source, additionalData = {}, ejsOptions = {}) {
        const baseDir = this.getCallDir()
        if (typeof source === 'string') {
            source = path.resolve(baseDir, source)
            // 注入 apply
            this.injectFileMiddleware(async (file) => {
                // 合并 插件的 options 选项
                const data = this.resolveData(additionalData)
                const files = await globby(['**/*'], {cwd: source, dot: true})
                for (const rcPath of files) {
                    // string 切成数组重写一些 特殊文件名，在以 / 拼接转 string
                    const targetPath = rcPath.split('/').map(filename => {
                        if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
                            return `.${filename.slice(1)}`
                        }
                        if (filename.charAt(0) === '_' && filename.charAt(1) === '_') {
                            return `${filename.slice(1)}`
                        }
                        return filename
                    }).join('/')
                    // 获取文件路径
                    const sourcePath = path.resolve(source, rcPath)
                    //处理文件内容
                    const content = this.renderFile(sourcePath, data, ejsOptions)
                    // 只有文件不是空文件才添加
                    if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
                        file[targetPath] = content
                    }
                }
            })
        } else if (typeof source === 'object') {
            this.injectFileMiddleware((file) => {
                const data = this.resolveData(additionalData)
                for (const targetPath of data) {
                    const sourcePath = path.resolve(baseDir, source[targetPath])
                    const content = this.renderFile(sourcePath, data, ejsOptions)
                    if (Buffer.isBuffer(content) || content.trim()) {
                        file[targetPath] = content
                    }
                }
            })

        } else if (typeof source === 'function') {
            this.injectFileMiddleware(source)
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

        // 在指定函数内调用时堆栈的正则
        const namedStackRegExp = /\s\((.*):\d+:\d+\)$/
        // 在匿名对象内部调用时堆栈的正则
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
    normalizePath (p) {
        if (path.isAbsolute(p)) {
            p = path.relative(this.generator.context, p)
        }

        return p.replace(/\\/g, '/')
    }
    transformScript (file, codemod, options) {
        const normalizedPath = this.normalizePath(file)

        this.injectFileMiddleware(files => {
            if (typeof files[normalizedPath] === 'undefined') {
                error(`Cannot find file ${normalizedPath}`)
                return
            }

            files[normalizedPath] = runTransformation(
                {
                    path: this.resolve(normalizedPath),
                    source: files[normalizedPath]
                },
                codemod,
                options
            )
        })
    }

}

module.exports = GeneratorAPI
