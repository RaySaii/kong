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
    isFirstBuild = true

    closeWatcher() {
        this.watcher.close()
    }

    generateEntry() {
        if (existsSync(appKong()) && existsSync(appKong('kong.js'))) return
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
        // if (process.env.NODE_ENV === 'production') {
        return Object.keys(routes).reduce((str, key) => str + `'${key}':require('../pages${key}').default,\n`, '{\n') + '}'
        // }
        // return Object.keys(routes)
        //     .reduce(
        //         (str, key) => str + `'${key}':require('${
        //             routes[ key ] ? '../pages' + key : getPaths('scripts/Compiling.js')
        //             }').default,`, '{',
        //     ) + '}'
    }

    async generateRoutes(routePath) {
        if (this.isFirstBuild && existsSync(appKong()) && existsSync(appKong('router.js'))) return
        this.isFirstBuild = false
        const trueRoutes = await getRouteConfigFromDir()
        // if (isEmpty(this.requestedRoutes)) {
        //     Object.keys(trueRoutes).forEach(key => this.requestedRoutes[ key ] = 0)
        // } else {
        //     const curRoutes = {}
        //     Object.keys(trueRoutes).forEach(key => curRoutes[ key ] = this.requestedRoutes[ key ])
        //     this.requestedRoutes = curRoutes
        // }
        // if (routePath) {
        //     this.requestedRoutes[ routePath ] = 1
        // }
        let routes = this.resolveRoutes(trueRoutes)
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
        if (process.env.NODE_ENV === 'development') {
            if (this.watcher) return
            this.watcher = watch(paths.appSrcPages)
                .on('add', (e, path) => this.reBuild())
                .on('unlink', (e, path) => this.reBuild())
        }
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
