#!/usr/bin/env node


// fetch('https://api.github.com/orgs/vitejs/repos')
// const ora = require("ora");
/*
*  1，创建 项目
*       1：园区项目
*       2，uearth 项目
*       3，uearth + 园区项目
*           1，主题选择
*   2， 多选项
*       1，spray
*       2，vuex
*       3，vue-router
*
*
* */
// const wrapFetchAddLoading = (fn, message) => async (...args) => {
//     const spinner = ora(message);
//     spinner.start(); // 开始loading
//     const result = await fn(...args);
//     spinner.succeed(); // 结束loading
//     return result;
// };

const minimist = require("minimist");
const path = require("path");
const fs = require('fs-extra')
const Creator = require('./Creator')
const {getPackageModules} = require("./util/packageModules");
module.exports = async (projectName, options) => {
    const inCurrent = projectName === '.';
    const cwd = options.cwd || process.cwd()
    // 如果没有传如目录，拿到当前目录，如个 inCurrent是true则返回当前目录
    const name = inCurrent ? path.relative('../', cwd) : projectName;
    // 拿到执行命令的当前目录
    const targetDir = path.resolve(cwd, projectName || '.');

    // 判断路径是否存在
    if (fs.existsSync(targetDir)) {
        console.log('存在 ');
        return
    }
    // getPackageModules 获取 手动选择配置项 item  返回可执行函数
    const creator = new Creator(name, targetDir, getPackageModules())
    await creator.create(options)
}
