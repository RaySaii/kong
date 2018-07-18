import paths from '../config/paths'
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

    constructor() {
        this.watcher = watch(paths.appSrcPages)
            .on('add', (e, path) => this.reBuild())
            .on('unlink', (e, path) => this.reBuild())
    }

    closeWatcher() {
        this.watcher.close()
    }

    generateEntry() {
        mkdirp.sync(join(paths.appSrcPages, '.kong'))
        // Generate umi.js
        let entryContent = readFileSync(
            join(getPaths('templates/entry.js.tpl')),
            'utf-8',
        )
        writeFileSync(join(paths.appSrcPages, '.kong/kong.js'), entryContent, 'utf-8')
    }

    sleep(dur) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), dur)
        })
    }

    resolveRoutes(routes) {
        // return Object.keys(routes).reduce((str, key) => str + `'${key}':${routes[ key ]}`, '{') + '}'
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
        writeFileSync(join(paths.appSrcPages, '.kong/router.js'), routesContent, 'utf-8')
    }

    reBuild = (routePath) => {
        this.generateRoutes(routePath)
    }

    async generate() {
        this.generateEntry()
        await this.generateRoutes()
        await this.sleep(800)
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
