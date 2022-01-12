module.exports = (api, options) => {
    console.log('options', options);
    api.render('./template', {})
    // 如果默认创建的
    if (options.hasDefault) {

    } else {
        // 手动选项创建
    }
}
