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

        this.injectedPrompts = []
        this.outroPrompts = []
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
        console.log('answers=',answers);
    }

    resolveFinalPrompts() {
        console.log('injectedPrompts=',this.injectedPrompts);
        //  这里需要更改的原因是防止选择 默认配置 问答报错
        this.injectedPrompts.forEach(prompt => {
            const originalWhen = prompt.when || (() => true)
            prompt.when = answers => {
                return isManualMode(answers) && originalWhen(answers)
            }
        })
        console.log([
            this.presetPrompt,
            this.featurePrompt,
            ...this.injectedPrompts,
            ...this.outroPrompts
        ]);
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
            let displayName;
            switch (name){
                case 'u_earth':
                    displayName = 'u_earth (vite + Vue 3 地图项目)';
                    this.injectedPrompts.push({
                        name: 'select spray',
                        when: true,
                        type: 'confirm',
                        message: `是否配置spray来控制自适应布局?`,
                        description: `一个构建自适应布局可视化场景的组件包`,
                        link: 'https://www.yuque.com/khth0u/ngd5zk'
                    })
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
        // console.log('presetChoices=',presetChoices);
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
}
