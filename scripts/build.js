const vfs = require('vinyl-fs')
const babel = require('@babel/core')
const through = require('through2')
const chalk = require('chalk')
const rimraf = require('rimraf')
const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs')
const { join } = require('path')
const chokidar = require('chokidar')
const shell = require('shelljs')
const slash = require('slash2')

const nodeBabelConfig = {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                targets: {
                    node: 6,
                },
            },
        ],
    ],
    plugins: [
        require.resolve('@babel/plugin-proposal-export-default-from'),
        require.resolve('@babel/plugin-proposal-do-expressions'),
        require.resolve('@babel/plugin-proposal-class-properties'),
    ],
}
const browserBabelConfig = {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                targets: {
                    browsers: [ 'last 2 versions', 'IE 10' ],
                },
            },
        ],
        require.resolve('@babel/preset-react'),
    ],
    plugins: [
        require.resolve('@babel/plugin-proposal-export-default-from'),
        require.resolve('@babel/plugin-proposal-do-expressions'),
    ],
}

const BROWSER_FILES = [
    'src/scripts/Compiling.js',
]

function isBrowserTransform(path) {
    return BROWSER_FILES.includes(path.replace(`${slash(cwd)}/`, ''))
}

const cwd = process.cwd()


function transform(opts = {}) {
    const { content, path } = opts
    const winPath = slash(path)
    const isBrowser = isBrowserTransform(winPath)
    console.log(
        chalk[ isBrowser ? 'yellow' : 'blue' ](
            `[TRANSFORM] ${winPath.replace(`${cwd}/`, '')}`,
        ),
    )
    const config = isBrowser ? browserBabelConfig : nodeBabelConfig
    return babel.transform(content, config).code
}

function buildPkg() {
    rimraf.sync(join(cwd, 'lib'))
    const stream = vfs
        .src([
            `./src/**/*.js`,
            `./src/**/*.tpl`,
            `!./src/**/fixtures/**/*.js`,
            `!./src/**/*.test.js`,
        ])
        .pipe(
            through.obj((f, enc, cb) => {
                f.contents = f.path.includes('templates') ?
                    f.contents
                    : new Buffer( // eslint-disable-line
                        transform({
                            content: f.contents,
                            path: f.path,
                        }),
                    )
                cb(null, f)
            }),
        )
        .pipe(vfs.dest(`./lib/`))
}

function build() {
    const dirs = readdirSync(join(cwd, 'src'))
    const arg = process.argv[ 2 ]
    const isWatch = arg === '-w' || arg === '--watch'
    dirs.forEach(pkg => {
        if (pkg.charAt(0) === '.') return
        buildPkg(pkg)
        if (isWatch) {
            const watcher = chokidar.watch(join(cwd, 'src'), {
                ignoreInitial: true,
            })
            watcher.on('all', (event, fullPath) => {
                if (!existsSync(fullPath)) return
                const relPath = fullPath.replace(`${cwd}/src/`, '')
                const content = readFileSync(fullPath, 'utf-8')
                try {
                    const code = fullPath.includes('templates') ? content : transform({
                        content,
                        path: fullPath,
                    })
                    writeFileSync(
                        join(cwd, 'lib', relPath),
                        code,
                        'utf-8',
                    )
                } catch (e) {
                    console.log(chalk.red('Compiled failed.'))
                    console.log(chalk.red(e.message))
                }
            })
        }
    })
}

build()
