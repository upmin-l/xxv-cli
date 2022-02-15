const fetch = require('node-fetch')

// TODO 并行处理 获取GitHub 版本
    module.exports = async () => {

    const data = await fetch('https://api.github.com/repos/vuejs/vue-next/tags')

    return new Promise((resolve, reject) => {
    })
}
