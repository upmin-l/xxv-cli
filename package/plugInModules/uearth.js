module.exports = cli => {
    cli.injectFeature({
        name: 'Uearth',
        value: 'uearth',
        description: '面向物联网的3D可视化开发平台',
        link: 'https://www.thingjs.com/guide/?m=main'
    })
    cli.injectPrompt({
        name: 'themes',
        when: answers => answers.features.includes('uearth'),
        type: 'list',
        message: '选择主题:',
        default: 'day',
        choices: [
            {value: 'day', themes: 'Day(蔚蓝)'},
            {value: 'glimmer', themes: 'Glimmer(微光城市)'},
            {value: 'future', themes: 'Future(回到未来)'},
        ],
        pageSize: 10
    })

    cli.onPromptComplete((answers, options) => {
        if (answers.features.includes('uearth')) {
            options.plugins["uearth"] = {}
        }
    })
}
