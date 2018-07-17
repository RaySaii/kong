import paths from '../config/paths'
import {join} from 'path'
import getRouteConfigFromDir from './route/getRouteConfigFromDir'
import * as mkdirp from 'mkdirp'
import getPaths from './getPaths'

const { readFileSync, writeFileSync, existsSync } = require('fs')

class IFilesGenerator {
    generateEntry() {
        console.log(existsSync(join(paths.appSrcPages, '.kong/kong.js')))
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

    async generateRoutes() {
        let routes = await getRouteConfigFromDir()
        let routesContent = readFileSync(
            join(getPaths('templates/router.js.tpl')),
            'utf-8',
        )
            .replace('<%= ROUTES %>', routes)
        writeFileSync(join(paths.appSrcPages, '.kong/router.js'), routesContent, 'utf-8')
    }

    reBuild() {
        this.generateRoutes()
    }

    async generate() {
        this.generateEntry()
        await this.generateRoutes()
        await this.sleep(800)
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
