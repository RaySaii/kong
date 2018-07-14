'use strict'

import FilesGenerator from '../FilesGenerator'
import startDevServer from '../devServer/index'

const paths = require('../../config/paths')

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err
})

// Ensure environment variables are read.
require('../../config/env')
const chalk = require('chalk')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const {
    choosePort,
} = require('react-dev-utils/WebpackDevServerUtils')
const buildDll = require('./buildDll')


// Warn and crash if required files are missing
if (!checkRequiredFiles([ paths.appHtml ])) {
    process.exit(1)
}


// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

if (process.env.HOST) {
    console.log(
        chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
                chalk.bold(process.env.HOST),
            )}`,
        ),
    )
    console.log(
        `If this was unintentional, check that you haven't mistakenly set it in your shell.`,
    )
    console.log(`Learn more here: ${chalk.yellow('http://bit.ly/2mwWSwH')}`)
    console.log()
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.

buildDll('development')
    .then(() => FilesGenerator.generate())
    .then(() => process.env.APP_INDEX = paths.resolveApp('src/pages/.kong/kong.js'))
    .then(() => choosePort(HOST, DEFAULT_PORT))
    .then((port) => {
            if (port !== null) {
                // We have not found a port.
                return startDevServer(HOST, port)
            }
        },
    )
    .then(devServer => {
        [ 'SIGINT', 'SIGTERM' ].forEach(function (sig) {
            process.on(sig, function () {
                devServer.close()
                process.exit()
            })
        })

        // const watcher = watch(paths.appConfig).on('all', (e, path) => {
        //     devServer.close()
        //     watcher.close()
        //     process.send({ type: 'RESTART' })
        // })
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message)
        }
        process.exit(1)
    })


