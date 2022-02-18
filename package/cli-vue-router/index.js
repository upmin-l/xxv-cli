module.exports = (api) => {
    console.log('vue-router');
    api.injectImports(api.entryFile, `import Router from '@/router'`)
    api.transformScript(api.entryFile, require('./injectUseRouter'))
}
