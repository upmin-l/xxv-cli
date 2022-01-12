module.exports = (api) => {
    console.log('vue-router');
    api.injectImports(api.entryFile, `import router from './router'`)
}
