import paths, {appDll} from './paths'
import {optimization} from './webpack.config.base'
import {resolve} from 'path'

const { readFileSync, writeFileSync, existsSync } = require('fs')
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const isSimple = !existsSync(resolve(paths.appSrc, 'pages'))
const vendor = [
    'react',
    'rxjs',
    'react-dom',
    '@cycle/rxjs-run',
    '@sunny-g/cycle-react-driver',
]
export default function getConfig(env) {
    const dev = env === 'development'
    const opt = dev ? {} : { optimization }
    return {
        devtool: dev ? 'source-map' : false,
        mode: env,
        entry: {
            vendor: isSimple ? vendor : vendor.concat([ '@cycle/history',  'switch-path', 'cyclic-router' ]),  // common模块打包到一个动态连接库
        },
        output: {
            path: appDll(env),
            filename: '[name].dll.js', // 输出动态连接库的文件名称
            library: '_dll_[name]_[hash]', // 全局变量名称
        },
        ...opt,
        plugins: [
            new CleanWebpackPlugin([ 'kong-dll-' + env ], { root: paths.appNodeModules }),
            new webpack.DllPlugin({
                context: paths.appSrc,
                name: '_dll_[name]_[hash]', // 和output.library中一致，也就是输出的manifest.json中的 name值
                path: path.join(appDll(env), '[name].manifest.json'),
            }),
        ],
    }

}

