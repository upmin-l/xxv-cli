
/*
* 负责处理路径模块
*
* */

const path = require("path");
const os = require("os");

exports.getRcPath = file => {
    return  path.join(os.homedir(), file)
}
