const execa = require('execa')
const stripAnsi = require('strip-ansi')
const semver = require('semver')

const {executeCommand} = require('./executeCommand')

const PACKAGE_MANAGER_CONFIG = {
    npm: {
        install: ['install', '--loglevel', 'error'],
        add: ['install', '--loglevel', 'error'],
        upgrade: ['update', '--loglevel', 'error'],
        remove: ['uninstall', '--loglevel', 'error']
    },
    yarn: {
        install: [],
        add: ['add'],
        upgrade: ['upgrade'],
        remove: ['remove']
    }
}


//  Todo 包管理 应该需要支持可以使用不同的命令来下载，
class PackageManager {
    constructor({context, forcePackageManager} = {}) {
        this.context = context || process.cwd();
        if (forcePackageManager) {
            this.bin = forcePackageManager
        } else {
            this.bin = 'npm'
        }

        if (this.bin === 'npm') {
            const MIN_NPM_VERSION = '6.9.0';
            const npmVersion = stripAnsi(execa.sync('npm', ['--version']).stdout);
            if (semver.lt(npmVersion, MIN_NPM_VERSION)) {
                throw new Error(
                    '你使用的是过时的NPM版本,\n' +
                    '请升级你的npm 版本.'
                )
            }
        }

    }

    async install() {
        return await this.runCommand('install')
    }

    async runCommand(command, args) {
        await executeCommand(
            this.bin,
            [
                ...PACKAGE_MANAGER_CONFIG[this.bin][command],
                ...(args || [])
            ],
            this.context
        )
    }
}


module.exports = PackageManager
