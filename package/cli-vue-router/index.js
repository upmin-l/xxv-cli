module.exports = (api,options) => {
    console.log('vue-router-options',options);
    api.injectImports(api.entryFile, `import router from '@/router'`)
    api.transformScript(api.entryFile, require('./injectUseRouter'))

    api.render('./src',Object.assign({type:'router'},options))
}
