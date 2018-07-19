import paths from '../../config/paths'
import finder from 'findit'

export default function getRouteConfigFromDir() {
    const find = finder(paths.appSrcPages)

    let routes = []

    find.on('file', (absPath, stat) => {
        const ignoreExtRex = /\.(sc|sa|le|c)ss$/
        if (ignoreExtRex.test(absPath)) return
        let validPath = absPath.replace(/.*(?<=pages)/g, '')
            .replace(/\.(js|ts)x?/g, '')
            .replace(/\/index$/, '/')
        if (validPath.startsWith('/.')) return

        const routePath = validPath.replace(/\/\$/, '/:')
        const filePath = '..' + validPath
        routes[ routePath ] = filePath
    })

    return new Promise(resolve => {
        find.on('end', () => resolve(routes))
    })
}
