module.exports = class ResolveMultistage {
    constructor (creator) {
        this.creator = creator
    }
    // 预选项
    injectFeature (feature) {
        this.creator.featurePrompt.choices.push(feature)
    }
    // 如果是多级 问答的 注入进来
    injectPrompt (prompt) {
        this.creator.injectedPrompts.push(prompt)
    }

    injectOptionForPrompt (name, option) {
        this.creator.injectedPrompts.find(f => {
            return f.name === name
        }).choices.push(option)
    }
    // 处理选择完成后的回调
    onPromptComplete (cb) {
        this.creator.promptCompleteCbs.push(cb)
    }
}
