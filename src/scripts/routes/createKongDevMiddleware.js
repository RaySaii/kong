export const COMPILING_PREFIX = '/__kong_dev/compiling'

export default function createKongDevMiddleware(callback) {
    return (req, res, next) => {
        const { path } = req
        if (!path.startsWith(COMPILING_PREFIX)) {
            return next()
        }

        const routePath = path.replace(COMPILING_PREFIX, '')

        callback(routePath)

        res.end('done')
    }
}
