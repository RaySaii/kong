'use strict'

import FilesGenerator from '../FilesGenerator'
import paths from '../../config/paths'
import createKongDevMiddleware from '../routes/createKongDevMiddleware'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err
})
process.env.NODE_ENV = 'development'
// Ensure environment variables are read.
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
    .then(() => choosePort(HOST, DEFAULT_PORT))
    .then((port) => {
            const createDevServer = require('../devServer').default
            if (port !== null) {
                // We have not found a port.
                const devServer = createDevServer(HOST, port, [ createKongDevMiddleware(FilesGenerator.reBuild) ])
                return devServer
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
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message)
        }
        process.exit(1)
    })


