'use strict'

const path = require('path')
const fs = require('fs')
const url = require('url')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())

export const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

export const resolveTsConfig = relativePath => path.resolve(appDirectory, 'tsconfig.json')

export const appKong = () => path.join(resolveApp('src'), '.kong' + (process.env.NODE_ENV === 'production' ? '-production' : ''))

export const appIndex = () => resolveApp(appKong() + '/kong.js')

const paths = {
    appBuild: resolveApp('build'),
    appDll: resolveApp('node_modules/kong-dll'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appNodeModules: resolveApp('node_modules'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appSrcPages: resolveApp('src/pages'),
    testsSetup: resolveApp('src/setupTests.js'),
    publicPath: './',
}
export default paths
