'use strict'

import paths, { appIndex,} from './paths'
import {commonLoader, commonNode, commonResolve, getCommonPlugins, getStyleLoader} from './webpack.config.base'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'
import HappyPack from 'happypack'
import os from 'os'

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const eslintFormatter = require('react-dev-utils/eslintFormatter')

const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
        modules: true,
        importLoaders: 1,
        localIdentName: '[path][name]__[local]___[hash:base64:5]',
    },
}

const babelLoader = {
    loader: require.resolve('babel-loader'),
    options: {
        presets: [ require.resolve('@babel/preset-react') ],
        plugins: [
            [ require.resolve('babel-plugin-lodash') ],
            [ require.resolve('@babel/plugin-syntax-dynamic-import') ],
            [ require.resolve('@babel/plugin-proposal-class-properties') ],
            // [ 'import', { style: 'css', libraryName: 'antd' } ],
        ],
        cacheDirectory: true,
        highlightCode: true,
    },
}
const happybabel = {
    loader: require.resolve('happypack/loader'),
    options: {
        id: 'happybabel',
    },
}
module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: [ appIndex(), require.resolve('./polyfills'), require.resolve('react-dev-utils/webpackHotDevClient') ],
    output: {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: 'static/js/[name].async.js',
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    resolve: commonResolve,
    module: {
        strictExportPresence: true,
        rules: [
            // TODO: Disable require.ensure as it's not a standard language feature.
            // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
            { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            // {
            //     test: /\.(js|jsx|mjs)$/,
            //     enforce: 'pre',
            //     use: [
            //         {
            //             options: {
            //                 formatter: eslintFormatter,
            //                 eslintPath: require.resolve('eslint'),

            //             },
            //             loader: require.resolve('eslint-loader'),
            //         },
            //     ],
            //     include: paths.appSrc,
            // },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    ...getStyleLoader('development', cssLoader),
                    {
                        test: /\.tsx?$/,
                        include: paths.appSrc,
                        exclude: [ /node_modules/ ],
                        use: [
                            happybabel,
                            {
                                loader: require.resolve('awesome-typescript-loader'),
                                options: {
                                    transpileOnly: true,
                                    silent: true,
                                    useCache: true,
                                    cacheDirectory: 'node_modules/.cache/at-loader',
                                },
                            } ],
                    },
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: paths.appSrc,
                        exclude: [ /node_modules/ ],
                        use: [ happybabel ],
                    },
                    ...commonLoader,
                ],
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ],
    },
    plugins: [
        new HappyPack({
            id: 'happybabel',
            loaders: [ babelLoader ],
            threadPool: happyThreadPool,
            // verbose: true,
        }),
        // new HardSourceWebpackPlugin(),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        // new InterpolateHtmlPlugin({ PUBLIC_URL: '/' }),
        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebookincubator/create-react-app/issues/186
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
        ...getCommonPlugins('development')
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: commonNode,
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
}
