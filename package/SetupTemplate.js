const PackageManager = require("./util/PackageManager");
const writeFileTree = require('./util/writeFileTree')
module.exports = class SetupTemplate {
    constructor(context,{
        pkg = {},
        files = []
    }) {
        this.context = context;
        this.pkg = Object.assign({}, pkg)
        this.pm = new PackageManager({ context })
        this.files = files
        this.fileMiddlewares = []
        console.log('this.pm',this.pm);
    }
    async generate({configFiles=false}){
        const initialFiles = Object.assign({},this.files)
        await this.resolveFiles()

        this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'

        console.log(this.context, this.files, initialFiles, this.filesModifyRecord);
        // await writeFileTree(this.context, this.files, initialFiles, this.filesModifyRecord)
    }
    async resolveFiles(){
        const files = this.files
        for (const middleware of this.fileMiddlewares) {
            await middleware(files, ejs.render)
        }
    }
}
