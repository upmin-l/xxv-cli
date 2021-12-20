module.exports = cli => {
    cli.injectFeature({
        name: 'thingjs',
        value: 'thing',
        description: '面向物联网的3D可视化开发平台',
        link: 'https://www.thingjs.com/guide/?m=main'
    })
    cli.onPromptComplete((answers, options) => {
        if (answers.features.includes('thingjs')) {
            options.plugins["thingjs"] = true
        }
    })
}
