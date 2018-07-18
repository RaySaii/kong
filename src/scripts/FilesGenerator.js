import paths, {appKong} from '../config/paths'
import {join} from 'path'
import isEmpty from 'lodash/isEmpty'
import getRouteConfigFromDir from './routes/getRouteConfigFromDir'
import * as mkdirp from 'mkdirp'
import getPaths from './getPaths'
import watch from './watch'

const { readFileSync, writeFileSync, existsSync } = require('fs')

class IFilesGenerator {
    requestedRoutes = {}
    watcher = null

    closeWatcher() {
        this.watcher.close()
    }

    generateEntry() {
        mkdirp.sync(appKong())
        // Generate umi.js
        let entryContent = readFileSync(
            join(getPaths('templates/entry.js.tpl')),
            'utf-8',
        )
        writeFileSync(join(appKong(), 'kong.js'), entryContent, 'utf-8')
    }

    sleep(dur) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), dur)
        })
    }

    resolveRoutes(routes) {
        if (process.env.NODE_ENV === 'production') {
            return Object.keys(routes).reduce((str, key) => str + `'${key}':require('..${key}').default,`, '{') + '}'
        }
        return Object.keys(routes)
            .reduce(
                (str, key) => str + `'${key}':require('${
                    routes[ key ] ? '..' + key : getPaths('scripts/Compiling.js')
                    }').default,`, '{',
            ) + '}'
    }

    async generateRoutes(routePath) {
        const trueRoutes = await getRouteConfigFromDir()
        if (isEmpty(this.requestedRoutes)) {
            Object.keys(trueRoutes).forEach(key => this.requestedRoutes[ key ] = 0)
        }
        if (routePath) {
            this.requestedRoutes[ routePath ] = 1
        }
        let routes = this.resolveRoutes(this.requestedRoutes)
        let routesContent = readFileSync(
            join(getPaths('templates/router.js.tpl')),
            'utf-8',
        )
            .replace('<%= ROUTES %>', routes)
        writeFileSync(join(appKong(), 'router.js'), routesContent, 'utf-8')
    }

    reBuild = (routePath) => {
        this.generateRoutes(routePath)
    }

    async generate() {
        this.generateEntry()
        await this.generateRoutes()
        await this.sleep(800)
        if(process.env.NODE_ENV==='development'){
            this.watcher = watch(paths.appSrcPages)
                .on('add', (e, path) => this.reBuild())
                .on('unlink', (e, path) => this.reBuild())
        }
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
