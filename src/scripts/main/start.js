import getPaths from '../getPaths'
import {fork} from 'child_process'

process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'
// import send, {RESTART} from './send'

function start(devScriptPath) {
    const devProcess = fork(devScriptPath, process.argv.slice(2))
    devProcess.on('message', data => {
        const type = (data && data.type) || null
        if (type === 'RESTART') {
            devProcess.kill('SIGINT')
            start(devScriptPath)
        }
        // send(data)
    })
}

start(getPaths('scripts/main/dev'))
