'use strict'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
import getConfig from '../config/webpack.config.dll'
import {existsSync} from 'fs'
import {sync as isEmptyDir} from 'empty-dir'

process.on('unhandledRejection', err => {
    throw err
})

// Ensure environment variables are read.
import paths, {appDll} from '../config/paths'

const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const printBuildError = require('react-dev-utils/printBuildError')

const measureFileSizesBeforeBuild =
    FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
function buildDll(env) {
    process.env.NODE_ENV = env
    if (existsSync(appDll(env)) && !isEmptyDir(appDll(env))) return Promise.resolve()
    return measureFileSizesBeforeBuild(appDll(env))
        .then(previousFileSizes => {
            // Remove all content but keep the directory so that
            // if you're in it, you don't end up in Trash
            fs.emptyDirSync(appDll(env))
            // Merge with the public folder
            // Start the webpack build
            return build(previousFileSizes, env)
        })
        .then(
            ({ stats, previousFileSizes, warnings }) => {
                if (warnings.length) {
                    console.log(chalk.yellow('Compiled with warnings.\n'))
                    console.log(warnings.join('\n\n'))
                    console.log(
                        '\nSearch for the ' +
                        chalk.underline(chalk.yellow('keywords')) +
                        ' to learn more about each warning.',
                    )
                    console.log(
                        'To ignore, add ' +
                        chalk.cyan('// eslint-disable-next-line') +
                        ' to the line before.\n',
                    )
                } else {
                    console.log(chalk.green('Compiled successfully.\n'))
                }

                console.log('File sizes after gzip:\n')
                printFileSizesAfterBuild(
                    stats,
                    previousFileSizes,
                    appDll(env),
                    WARN_AFTER_BUNDLE_GZIP_SIZE,
                    WARN_AFTER_CHUNK_GZIP_SIZE,
                )
                console.log()
            },
            err => {
                console.log(chalk.red('Failed to compile.\n'))
                printBuildError(err)
                process.exit(1)
            },
        )
}

// Create the production build and print the deployment instructions.
function build(previousFileSizes, env) {
    console.log(`Creating an optimized dll ${env} build...`)
    const config = getConfig(env)
    let compiler = webpack(config)
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err)
            }
            const messages = formatWebpackMessages(stats.toJson({}, true))
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1
                }
                return reject(new Error(messages.errors.join('\n\n')))
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                        'Most CI servers set it automatically.\n',
                    ),
                )
                return reject(new Error(messages.warnings.join('\n\n')))
            }
            return resolve({
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            })
        })
    })
}

module.exports = buildDll

