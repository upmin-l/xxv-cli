
module.exports = cli => {
    cli.injectFeature({
        name: 'typeScript',
        value: 'typeScript',
        description: 'javscript 超集',
        link: 'https://www.tslang.cn/'
    })


    cli.onPromptComplete((answers, options) => {
        if (answers.features.includes('typeScript')) {
            options.plugins['typeScript'] = {

            }
        }
    })
}
