
module.exports = cli => {
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: 'vue3 路由控制',
    link: 'https://router.vuejs.org/'
  })

  cli.injectPrompt({
    name: 'historyMode',
    when: answers => answers.features.includes('router'),
    type: 'confirm',
    message: `使用 history 路由模式?`,
    description: `通过使用HTML5 History API, url不再需要'#'字符`,
    link: 'https://router.vuejs.org/guide/essentials/history-mode.html'
  })
  cli.onPromptComplete((answers, options) => {
    if (answers.features.includes('router')) {
      options.plugins['vue-router'] = {
        historyMode: answers.historyMode,
        include:true
      }
    }
  })
}
