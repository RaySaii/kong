import {join} from 'path'

export default function getPaths(path) {
    return join(__dirname, '../', path)
}
