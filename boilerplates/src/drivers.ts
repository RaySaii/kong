import { makeHistoryDriver } from '@cycle/history'
import makeReactDOMDriver from '@sunny-g/cycle-react-driver'
import { makeHTTPDriver } from '@cycle/http'
import storageDriver from '@cycle/storage'

export default function mkDrivers() {
    return {
        react: makeReactDOMDriver(document.querySelector('#root')),
        history: makeHistoryDriver(), // create history driver as usual,but it gets proxied by routerify
        http: makeHTTPDriver(),
        storage: storageDriver,
    }

}
