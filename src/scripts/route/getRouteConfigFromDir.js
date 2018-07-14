import { appSrcPages} from '../../config/paths'
import finder from 'findit'

export default function getRouteConfigFromDir() {
    const find = finder(appSrcPages)
    let paths = ''

    find.on('file', (absPath, stat) => {
        let validPath = absPath.replace(/.*(?<=pages)/g, '')
            .replace(/\.(js|ts)x?/g, '')
            .replace(/\/index$/, '/')
        if (validPath.startsWith('/.')) return

        const routePath = validPath.replace(/\/\$/, '/:')
        const filePath = '..' + validPath
        paths += `'${routePath}':require('${filePath}').default,`
    })

    return new Promise(resolve => {
        find.on('end', () => resolve('{' + paths + '}'))
    })
}
