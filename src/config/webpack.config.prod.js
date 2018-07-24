'use strict'
import paths, {appDll, appIndex} from './paths'
import {
    commonLoader,
    commonNode,
    getStyleLoader,
    commonResolve,
    getCommonPlugins,
    optimization,
} from './webpack.config.base'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const eslintFormatter = require('react-dev-utils/eslintFormatter')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.publicPath
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
// Source maps are resource heavy and can cause out of memory issue for large source files.
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
// Get environment variables to inject into our app.

// Note: defined here because it will be used more than once.

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.

const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
        importLoaders: 1,
        modules: true,
        localIdentName: '[local]___[hash:base64:5]',
    },
}
const babelLoader = {
    loader: require.resolve('babel-loader'),
    options: {
        presets: [ require.resolve('babel-preset-react-app') ],
        plugins: [
            [ require.resolve('babel-plugin-lodash') ],
            // [ 'import', { style: 'css', libraryName: 'antd' } ],
        ],
        compact: true,
        highlightCode: true,
    },
}
// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    mode: 'production',
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: false,
    // In production, we only want to load the polyfills and the app code.
    entry: [ appIndex(), require.resolve('./polyfills') ],
    output: {
        // The build folder.
        path: paths.appBuild,
        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        // We don't currently advertise code splitting but Webpack supports it.
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath: publicPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path
                .relative(paths.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/'),
    },
    resolve: commonResolve,
    optimization,
    // First, run the linter.
    // It's important to do this before Babel processes the JS.
    // {
    //   test: /\.(js|jsx|mjs)$/,
    //   enforce: 'pre',
    //   use: [
    //     {
    //       options: {
    //         formatter: eslintFormatter,
    //         eslintPath: require.resolve('eslint'),

    //       },
    //       loader: require.resolve('eslint-loader'),
    //     },
    //   ],
    //   include: paths.appSrc,
    // },
    module: {
        strictExportPresence: true,
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        rules: [
            { parser: { requireEnsure: false } },
            {
                oneOf: [
                    ...getStyleLoader('production', cssLoader),
                    // Process JS with Babel.
                    {
                        test: /\.tsx?$/,
                        include: paths.appSrc,
                        exclude: [ /node_modules/ ],
                        use: [
                            babelLoader,
                            {
                                loader: require.resolve('awesome-typescript-loader'),
                                options: {
                                    transpileOnly: true,
                                    silent: true,
                                    // useCache: true,
                                    // cacheDirectory: 'node_modules/.cache/at-loader',
                                },
                            } ],
                    },
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: paths.appSrc,
                        exclude: [ /node_modules/ ],
                        use: [ babelLoader ],
                    },
                    ...commonLoader,
                ],
            },
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        // Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.

        // new InterpolateHtmlPlugin(env.raw),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        // Generate a service worker script that will precache, and keep up to date,
        // the HTML & assets that are part of the Webpack build.
        new SWPrecacheWebpackPlugin({
            // By default, a cache-busting query parameter is appended to requests
            // used to populate the caches, to ensure the responses are fresh.
            // If a URL is already hashed by Webpack, then there is no concern
            // about it being stale, and the cache-busting can be skipped.
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            filename: 'service-worker.js',
            logger(message) {
                if (message.indexOf('Total precache size is') === 0) {
                    // This message occurs for every build and is a bit too noisy.
                    return
                }
                if (message.indexOf('Skipping static resource') === 0) {
                    // This message obscures real errors so we ignore it.
                    // https://github.com/facebookincubator/create-react-app/issues/2612
                    return
                }
                console.log(message)
            },
            minify: true,
            // For unknown URLs, fallback to the index page
            navigateFallback: publicPath + 'index.html',
            // Ignores URLs starting from /__ (useful for Firebase):
            // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
            navigateFallbackWhitelist: [ /^(?!\/__).*/ ],
            // Don't precache sourcemaps (they're large) and build asset manifest:
            staticFileGlobsIgnorePatterns: [ /\.map$/, /asset-manifest\.json$/ ],
        }),
        ...getCommonPlugins('production'),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: commonNode,
}
