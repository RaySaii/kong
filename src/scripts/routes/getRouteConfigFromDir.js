import paths from '../../config/paths'
import finder from 'findit'

export default function getRouteConfigFromDir() {
    const find = finder(paths.appSrcPages)

    let routes = []

    find.on('file', (absPath, stat) => {
        const ignoreExtRex = /\.(sc|sa|le|c)ss$/
        if (ignoreExtRex.test(absPath)) return
        let keyPath = absPath.replace(/.*(?<=pages)/g, '')
            .replace(/\.(js|ts)x?/g, '')
            .replace(/\/index$/, '/')
            .replace(/\/\$/, '/:')
        const filePath = '..' + absPath.replace(/.*(?=\/pages)/g, '')
        routes[ keyPath ] = filePath
    })

    return new Promise(resolve => {
        find.on('end', () => resolve(routes))
    })
}
