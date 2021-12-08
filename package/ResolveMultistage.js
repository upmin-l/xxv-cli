module.exports = class ResolveMultistage {
    constructor (creator) {
        this.creator = creator
    }
    // 如果是多级 问答的 注入进来
    injectFeature (feature) {
        this.creator.featurePrompt.choices.push(feature)
    }

    injectPrompt (prompt) {
        this.creator.injectedPrompts.push(prompt)
    }

    injectOptionForPrompt (name, option) {
        this.creator.injectedPrompts.find(f => {
            return f.name === name
        }).choices.push(option)
    }

    onPromptComplete (cb) {
        this.creator.promptCompleteCbs.push(cb)
    }
}
