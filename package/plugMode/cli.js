module.exports = (api, options) => {
    console.log('options', options);

    // 如果默认创建的
    if (options.hasDefault) {

    } else {
        // 手动选项创建
        console.log('我是手动选择')
    }

    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
    // Todo vendor 文件下的编译过的文件出现不符合promise规范,导致ejs无法渲染报错
    api.render('./template', {
        hasDefault: true,
    })
}
