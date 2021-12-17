
const chalk = require('chalk')
// const wrapFetchAddLoading = (fn, message) => async (...args) => {
//     const spinner = ora(message);
//     spinner.start(); // 开始loading
//     const result = await fn(...args);
//     spinner.succeed(); // 结束loading
//     return result;
// };
module.exports = {
    info(text) {
        console.log(chalk.blue(text))
    },
    success(text) {
        console.log(chalk.cyan(text))
    },
    warning(text) {
        console.log(chalk.yellow(text))
    },
    error(text) {
        console.log(chalk.red(text))
    },

}


