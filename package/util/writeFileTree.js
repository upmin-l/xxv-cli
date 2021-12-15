



const path = require("path");
const fs = require('fs-extra')

module.exports = async function writeFileTree(dir, files, previousFiles, include) {
    if (previousFiles) {
        console.log(123);
    }
    Object.keys(files).forEach((name) => {
        if (include && !include.has(name)) return
        const filePath = path.join(dir, name)
        fs.ensureDirSync(path.dirname(filePath))
        fs.writeFileSync(filePath, files[name])
    })
}
