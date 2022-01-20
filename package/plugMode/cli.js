module.exports = (api, options) => {

    // 如果默认创建的
    if (options.hasDefault) {

    } else {
        // 手动选项创建
        const {plugins} = options
        options.includes = ['vue']
        for (const plugin in plugins) {
            console.log('plugins[plugin].include',plugins[plugin].include);
            if (plugins[plugin].include) {
                options.includes.push(plugin)
            }
        }
    }

    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
    console.log('options', options);
    // Todo vendor 文件下的编译过的文件出现不符合promise规范,导致ejs无法渲染报错
    api.render('./template', options)
}
