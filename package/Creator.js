/**
 *
 * @param name 项目名字
 * @param context
 * @param promptModules  返回一个数组，每个元素都是一个可执行函数，由createTools文件(getPromptModules)传入进来
 */
const {defaults, loadOptions, savePreset} = require("./options");
const inquirer = require('inquirer')
const ResolveMultistage = require("./ResolveMultistage");
const cloneDeep = require('lodash.clonedeep')
const writeFileTree = require('./util/writeFileTree')
const SetupTemplate = require('./SetupTemplate')
const fetch = require('node-fetch')
const sortObject = require('./util/sortObject')
const PackageManager = require("./util/PackageManager");
const path = require("path");
const fs = require('fs-extra')
const isManualMode = answers => answers.preset === '__manual__'
module.exports = class Creator {
    /**
     *
     * @param name 项目名称
     * @param context  执行命令的当前目录
     * @param promptModules 预选项
     */
    constructor(name, context, promptModules) {
        this.name = name
        this.context = context
        this.injectedPrompts = []
        this.savePrompts = this.resolveSavePrompts()
        this.promptCompleteCbs = []
        // 建立问答
        const {presetPrompt, featurePrompt} = this.resolveIntroPrompts()
        this.presetPrompt = presetPrompt
        this.featurePrompt = featurePrompt
        // 把 presetPrompt, featurePrompt问答 传进 ResolveMultistage 注入注册
        const promptAPI = new ResolveMultistage(this)
        promptModules.forEach(m => m(promptAPI))
    }

    async create(cliOptions = {}, preset = null) {
        const {name, context} = this
        if (!preset) {
            preset = await this.promptAndResolvePreset();
            preset = cloneDeep(preset);
            preset.plugins['cli'] = Object.assign({
                projectName: name
            }, preset)
            // console.log('preset',preset);
            if (preset.plugins['vue-router']) {
                if (preset.historyMode) {
                    preset.plugins['vue-router'].historyMode = true
                }
            }
            // 包管理
            const packageManager = 'npm';
            const pm = new PackageManager({context, forcePackageManager: packageManager})

            // 定义package.js 内容
            const pkg = {
                name,
                version: '0.1.0',
                private: true,
                dependencies: {},
                scripts: {
                    dev: "vite",
                    build: "vite build",
                    preview: "vite preview"
                },
                devDependencies: {}
            }

            pkg.dependencies.vue = '^3.2.16';
            console.log(preset.plugins);
            const deps = Object.keys(preset.plugins)
            deps.forEach(dep => {
                // TODO  这里获取git上的版本
                if(dep!=='cli')pkg.devDependencies[dep] = 'latest'

            })

            // 创建 package.json
            await writeFileTree(context, {
                'package.json': JSON.stringify(pkg, null, 2)
            })
            //依赖下载
            // await pm.install();

            // //  获得插件依赖入口
            const plugins = await this.resolvePlugins(preset.plugins, pkg)
            const setupTemplate = new SetupTemplate(context, {
                pkg,
                plugins,
            })

            await setupTemplate.generate({
                extractConfigFiles: preset.useConfigFiles
            })


            // todo 安全考虑开发环境不能一直使用请求GitHub
            // const data = await fetch('https://api.github.com/repos/vuejs/vue-next/tags')
            // data.json().then(async (res) => {
            //     console.log(res);
            //     pkg.dependencies.vue = res[0].name.replace('v', '^');
            //     const deps = Object.keys(preset.plugins)
            //     deps.forEach(dep => {
            //         // TODO  这里获取git上的版本
            //         pkg.devDependencies[dep] = 'latest'
            //     })
            //     // 创建 package.json
            //     await writeFileTree(context, {
            //         'package.json': JSON.stringify(pkg, null, 2)
            //     })
            //     //依赖下载
            //     await pm.install();
            //
            //     const plugins = await this.resolvePlugins(preset.plugins, pkg)
            //     const setupTemplate = new SetupTemplate(context, {
            //         pkg,
            //         plugins,
            //     })
            //
            //     await setupTemplate.generate({
            //         extractConfigFiles: preset.useConfigFiles
            //     })
            // })
        }
    }

    async promptAndResolvePreset(answers = null) {
        if (!answers) {
            // 获取版本
            // await clearConsole(true);
            answers = await inquirer.prompt(this.resolveFinalPrompts())
        }
        let preset;
        if (answers.preset && answers.preset !== '__manual__') {
            preset = await this.resolvePreset(answers.preset)
        } else {
            // 手动选择
            preset = {
                useConfigFiles: answers.useConfigFiles === 'files',
                hasDefault:false,
                plugins: {}
            }
            answers.features = answers.features || []
            // 运行cb回调注册提示模块，完成预设
            this.promptCompleteCbs.forEach(cb => cb(answers, preset))
        }
        if (answers.save && answers.saveName) {
            savePreset(answers.saveName, preset)
        }
        return preset
    }

    resolveFinalPrompts() {

        this.injectedPrompts.forEach(prompt => {
            const originalWhen = prompt.when || (() => true)
            prompt.when = answers => {
                return isManualMode(answers) && originalWhen(answers)
            }
        })
        return [
            this.presetPrompt,
            this.featurePrompt,
            ...this.injectedPrompts,
            ...this.savePrompts
        ]
    }

    getPresets() {
        const savedOptions = loadOptions();
        return Object.assign({}, savedOptions.presets, defaults.presets)
    }

    resolveIntroPrompts() {
        // 获取默认设置跟 缓存设置
        const presets = this.getPresets();
        const presetChoices = Object.entries(presets).map(([name, preset]) => {
            let displayName;
            switch (name) {
                case 'u_earth':
                    displayName = 'u_earth (vite + Vue 3 地图项目)';
                    break;
                case 'default':
                    displayName = 'Default (vite + Vue 3 园区项目)'
                    break;
                default:
                    displayName = `${name} ()`
                    break
            }
            return {
                name: displayName,
                value: name
            }
        })
        //第一个问答
        const presetPrompt = {
            name: 'preset',
            type: 'list',
            message: `请选择预置:`,
            choices: [
                ...presetChoices,
                {
                    name: '手动选择',
                    value: '__manual__'
                }
            ]
        }

        const featurePrompt = {
            name: 'features',
            when: isManualMode,
            type: 'checkbox',
            message: '手动选择需要的功能:',
            choices: [],
            pageSize: 10
        }

        return {
            presetPrompt,
            featurePrompt
        }
    }

    resolveSavePrompts() {
        const savePrompts = [
            {
                name: 'save',
                when: isManualMode,
                type: 'confirm',
                message: '将其保存为未来项目的预置?',
                default: false
            },
            {
                name: 'saveName',
                when: answers => answers.save,
                type: 'input',
                message: '保存名称:'
            }
        ]
        return savePrompts
    }

    async resolvePreset(name) {
        let preset;
        // 去取 默认集合 然后判断拿与name 一样的对象
        const savedPresets = this.getPresets()
        if (name in savedPresets) {
            preset = savedPresets[name]
        }
        return preset
    }

    // 处理插件依赖
    async resolvePlugins(rawPlugins, pkg) {
        rawPlugins = sortObject(rawPlugins, ['cli'], true)
        const plugins = [];
        for (const id of Object.keys(rawPlugins)) {
            if (!['@vitejs/plugin-vue'].includes(id)) {
                const pluginPath = path.resolve(__dirname, `plugMode/${id}.js`)
                // 获取插件依赖入口
                const apply = require(pluginPath) || (() => {
                })
                //处理 '名字 入口方法 配置项'
                let options = rawPlugins[id] || {}
                plugins.push({id, apply, options})
            }
        }
        return plugins
    }
}
