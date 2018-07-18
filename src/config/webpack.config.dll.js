import paths from './paths'
import {optimization} from './weboack.config.base'

const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

export default function getConfig(env) {
    const opt = env === 'development' ? {} : { optimization }
    return {
        devtool: 'source-map',
        mode: env,
        entry: {
            vendor: [
                'react',
                'rxjs',
                'react-dom',
                '@cycle/rxjs-run',
                '@cycle/history',
                '@sunny-g/cycle-react-driver',
                'switch-path',
                'cyclic-router',
            ], // common模块打包到一个动态连接库
        },
        output: {
            path: paths.appDll,
            filename: '[name].dll.js', // 输出动态连接库的文件名称
            library: '_dll_[name]_[hash]', // 全局变量名称
        },
        ...opt,
        plugins: [
            // new CleanWebpackPlugin([ 'kong-dll' ], { root: paths.appNodeModules }),
            new webpack.DllPlugin({
                context: paths.appSrc,
                name: '_dll_[name]_[hash]', // 和output.library中一致，也就是输出的manifest.json中的 name值
                path: path.join(paths.appDll, '[name].manifest.json'),
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env),
            }),
        ],
    }

}

