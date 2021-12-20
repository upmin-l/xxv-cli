module.exports = cli => {
    cli.injectFeature({
        name: 'spray',
        value: 'spray',
        description: '一个构建自适应布局可视化场景的组件包',
        link: 'https://www.yuque.com/khth0u/ngd5zk'
    })
    cli.onPromptComplete((answers, options) => {
        if (answers.features.includes('spray')) {
            options.plugins["spray"] = true
        }
    })
}
