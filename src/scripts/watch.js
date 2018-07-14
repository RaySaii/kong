const chokidar = require('chokidar')

export default function watch(files) {
    const watcher = chokidar.watch(files, {
        ignoreInitial: true,
        cwd: process.cwd(),
    })
    return watcher
}

