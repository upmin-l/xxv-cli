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
            {value: 'day', name: 'Day(蔚蓝)'},
            {value: 'glimmer', name: 'Glimmer(微光城市)'},
            {value: 'future', name: 'Future(回到未来)'},
            {value: 'greenCity', name: 'GreenCity(绿色城市)'},
        ],
        pageSize: 10
    })

    cli.onPromptComplete((answers, options) => {
        if (answers.features.includes('uearth')) {
            options.plugins["uearth"] = {}
        }
    })
}
