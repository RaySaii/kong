import {appSrcPages} from '../config/paths'
import {join} from 'path'
import getRouteConfigFromDir from './route/getRouteConfigFromDir'
import * as mkdirp from 'mkdirp'
import getPaths from './getPaths'

const { readFileSync, writeFileSync } = require('fs')

class IFilesGenerator {
    generateEntry() {
        mkdirp.sync(join(appSrcPages, '.kong'))
        // Generate umi.js
        let entryContent = readFileSync(
            join(getPaths('templates/entry.js.tpl')),
            'utf-8',
        )
        writeFileSync(join(appSrcPages, '.kong/kong.js'), entryContent, 'utf-8')
    }

    async generateRoutes() {
        let routes = await getRouteConfigFromDir()
        let routesContent = readFileSync(
            join(getPaths('templates/router.js.tpl')),
            'utf-8',
        )
            .replace('<%= ROUTES %>', routes)
        writeFileSync(join(appSrcPages, '.kong/router.js'), routesContent, 'utf-8')
    }

    async generate() {
        this.generateEntry()
        await this.generateRoutes()
    }
}

const FilesGenerator = new IFilesGenerator()
export default FilesGenerator
