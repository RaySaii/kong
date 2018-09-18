import {join, basename} from 'path'
import vfs from 'vinyl-fs'
import {renameSync} from 'fs'
import through from 'through2'
import {sync as emptyDir} from 'empty-dir'
import leftPad from 'left-pad'
import chalk from 'chalk'
import {existsSync} from 'fs'
import spawn from 'cross-spawn'

function info(type, message) {
    console.log(`${chalk.green.bold(leftPad(type, 12))}  ${message}`)
}

function error(message) {
    console.error(chalk.red(message))
}

function success(message) {
    console.error(chalk.green(message))
}

function init() {
    const appName = process.argv[ 2 ]
    const type = process.argv[ 3 ]
    const map = {
        'Simple': 'simple',
        'WithRouter': 'with-router',
    }
    const cwd = join(__dirname, `../../../boilerplates/${map[ type ]}`)
    const dest = process.cwd()
    const appDir = join(dest, appName)

    if (existsSync(appDir)) {
        error(`Existing ${appName} here!`)
        process.exit(1)
    }

    console.log(`Creating ${appName} in ${dest}.`)
    console.log()

    vfs.src([ '**/*', '!node_modules/**/*' ], { cwd: cwd, cwdbase: true, dot: true })
        .pipe(template(dest, cwd))
        .pipe(vfs.dest(appDir))
        .on('end', function () {
            info('rename', 'gitignore -> .gitignore')
            renameSync(join(appDir, 'gitignore'), join(appDir, '.gitignore'))
            info('run', 'npm install')
            require('../install').default(appDir, printSuccess)
        })
        .resume()

    function printSuccess() {
        success(`
Success! Created ${appName} at ${dest}.
Inside that directory, you can run several commands:
  * kong start: Starts the development server.
  * kong build: Bundles the app into dist for production.
  * npm test: Run test.
We suggest that you begin by typing:
  cd ${appName}
  kong start
Happy hacking!`)
    }
}

function template(dest, cwd) {
    return through.obj(function (file, enc, cb) {
        if (!file.stat.isFile()) {
            return cb()
        }

        info('create', file.path.replace(cwd + '/', ''))
        this.push(file)
        cb()
    })
}

init()
