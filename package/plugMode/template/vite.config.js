import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const { resolve } = require('path')


export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd())

    return defineConfig({
        plugins: [
            vue(),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        optimizeDeps: {
            include:<%- JSON.stringify(includes) %>,
        },
        build: {
            terserOptions: {
                compress: {
                    drop_console: true,
                    pure_funcs: ['console.log'],
                },
            },
        },
    })
}
