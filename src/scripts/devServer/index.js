import paths from '../../config/paths'
import config from '../../config/webpack.config.dev'
import createDevServerConfig from './webpackDevServer.config'
import {createCompiler, prepareProxy, prepareUrls} from './WebpackDevServerUtils'
import openBrowser from 'react-dev-utils/openBrowser'
import clearConsole from 'react-dev-utils/clearConsole'
import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import chalk from 'chalk'

const isInteractive = process.stdout.isTTY


export default function createDevServer(HOST, port, middlewares) {
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const appName = require(paths.appPackageJson).name
    const urls = prepareUrls(protocol, HOST, port)
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler(webpack, config, appName, urls)
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic)
    // Serve webpack assets generated by the compiler over a web sever.
    const serverConfig = createDevServerConfig(
        proxyConfig,
        urls.lanUrlForConfig,
        middlewares,
    )
    const devServer = new WebpackDevServer(compiler, serverConfig)
    devServer.listen(port, HOST, err => {
        if (err) {
            return console.log(err)
        }
        if (isInteractive) {
            // clearConsole()
        }
        console.log(chalk.cyan('Starting the development server...\n'))
        openBrowser(urls.localUrlForBrowser)
    })
    return devServer
}
