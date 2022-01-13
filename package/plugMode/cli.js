module.exports = (api, options) => {
    console.log('options', options);
    api.render('./template', {
        hasDefault:true
    })
    // 如果默认创建的
    if (options.hasDefault) {

    } else {
        // 手动选项创建
    }
}
