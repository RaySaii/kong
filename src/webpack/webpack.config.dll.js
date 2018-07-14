const path = require('path')
const paths = require('../config/paths')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const config = {
    devtool: 'source-map',
    entry: {
        vendor: [ 'react','rxjs','react-dom' ], // common模块打包到一个动态连接库
    },
    output: {
        path: paths.appDll,
        filename: '[name].dll.js', // 输出动态连接库的文件名称
        library: '_dll_[name]_[hash]', // 全局变量名称
    },
    plugins: [
        new CleanWebpackPlugin([ 'dll' ], { root: paths.appSrc }),
        new webpack.DllPlugin({
            context: paths.appSrc,
            name: '_dll_[name]_[hash]', // 和output.library中一致，也就是输出的manifest.json中的 name值
            path: path.join(paths.appDll, '[name].manifest.json'),
        }),
    ],
}
const DEV = {
    ...config,
    plugins: [
        ...config.plugins,
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],
}
const PROD = {
    ...config,
    plugins: [
        ...config.plugins,
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false,
            },
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
    ],
}
module.exports = {
    development: DEV,
    production: PROD,
}
