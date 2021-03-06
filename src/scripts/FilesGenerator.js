import paths, {appKong} from '../config/paths'
import {join, resolve} from 'path'
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

    async generateEntry() {
        if (existsSync(appKong()) && existsSync(appKong('kong.js'))) return
        mkdirp.sync(appKong())
        // Generate umi.js
        const isSimple = !existsSync(resolve(paths.appSrc, 'pages'))
        const content = isSimple
            ? 'const wrapMain = (main) => onionify(main)'
            : 'import {routerify} from "cyclic-router" \n' +
            'import switchPath from "switch-path" \n ' +
            'const wrapMain = (main) => routerify(onionify(main), switchPath)'
        let entryContent = readFileSync(
            join(getPaths('templates/entry.js.tpl')),
            'utf-8',
        ).replace('<%= WRAPMAIN %>', content)
        writeFileSync(join(appKong(), 'kong.js'), entryContent, 'utf-8')
        !isSimple && await this.generateRoutes()
    }

    sleep(dur) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), dur)
        })
    }

    getChunkName(name) {
        return name.replace('../', '')
            .replace('/', '_')
            .replace(/\.(ts|js)x?/, '')
    }

    resolveRoutes(routes) {
        // if (process.env.NODE_ENV === 'production') {
        return Object.keys(routes).reduce((str, key) =>
            str + `'${key}':()=>import(/* webpackChunkName: "${this.getChunkName(routes[ key ])}" */'${routes[ key ]}'),\n`, '{\n')
            + '}'
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
        if (process.env.NODE_ENV === 'development') {
            if (this.watcher) return
            this.watcher = watch(paths.appSrcPages)
                .on('add', (e, path) => this.reBuild())
                .on('unlink', (e, path) => this.reBuild())
        }
    }

    reBuild = (routePath) => {
        this.generateRoutes(routePath)
    }

    async generate() {
        this.generateEntry()
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
