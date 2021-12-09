
const chalk = require('chalk')

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


