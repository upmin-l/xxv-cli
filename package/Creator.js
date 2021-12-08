/**
 *
 * @param name 项目名字
 * @param context
 * @param promptModules  返回一个数组，每个元素都是一个可执行函数，由createTools文件(getPromptModules)传入进来
 */
const {defaults, loadOptions} = require("./options");
const inquirer = require('inquirer')
const ResolveMultistage = require("./ResolveMultistage");
const isManualMode = answers => answers.preset === '__manual__'
module.exports = class Creator {
    constructor(name, context, promptModules) {
        this.name = name
        // 获取问答
        const {presetPrompt, featurePrompt} = this.resolveIntroPrompts()
        this.presetPrompt = presetPrompt
        this.featurePrompt = featurePrompt
        this.injectedPrompts = []
        this.outroPrompts = []
        this.promptCompleteCbs = []

        // 把 presetPrompt, featurePrompt问答 传进 PromptModuleAPI 注入注册
        const promptAPI = new ResolveMultistage(this)
        promptModules.forEach(m => m(promptAPI))
    }

    async create(cliOptions = {}, preset = null) {
        if (!preset) {
            if (cliOptions.preset) {

            } else if (cliOptions.default) {

            } else if (cliOptions.inlinePreset) {

            } else {
                preset = await this.promptAndResolvePreset()
            }
        }
    }

    async promptAndResolvePreset(answers = null) {
        if (!answers) {
            // 获取版本
            // await clearConsole(true);
            answers = await inquirer.prompt(this.resolveFinalPrompts())
        }
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
            ...this.outroPrompts
        ]
    }

    getPresets() {
        const savedOptions = loadOptions()
        return Object.assign({}, savedOptions.presets, defaults.presets)
    }

    resolveIntroPrompts() {
        const presets = this.getPresets();
        const presetChoices = Object.entries(presets).map(([name, preset]) => {
            let displayName = name
            switch (name){
                case 'u_earth':
                    displayName = 'u_earth (vite + Vue 3 地图项目)'
                    break;
                default:
                    displayName = 'Default (vite + Vue 3 园区项目)'
                    break
            }
            return {
                name: `${displayName}`,
                value: name
            }
        })

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
}
