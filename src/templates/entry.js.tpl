import {Observable} from 'rxjs'
import {run, setup} from '@cycle/rxjs-run'
import {rerunner} from 'cycle-restart'
import isolate from '@cycle/isolate'
import {makeHistoryDriver} from '@cycle/history'
import makeReactDOMDriver from '@sunny-g/cycle-react-driver'
import switchPath from 'switch-path'
import onionify from 'cycle-onionify'
import {routerify} from 'cyclic-router'
import 'antd/dist/antd.css'
import mkDrivers from '../drivers'

function main(sources) {
    const match$ = sources.router.define(require('./router').default)
    const page$ = match$.map(({ path, value }) => {
        return value(Object.assign({}, sources, {
            router: sources.router.path(path), // notice use of 'router' source name,
            // which proxies raw 'history' source with
            // additional functionality
        }))
    })
    return {
        REACT: page$.switchMap(c => c.REACT),
        router: page$.filter(c => c.router).switchMap(c => c.router), // Notice use of 'router' sink name,
        // which proxies the original 'history' sink
    }
}

const wrapMain = (main) => routerify(onionify(main), switchPath)
const App=wrapMain(main)

run(App, mkDrivers())

if (module.hot) {
    module.hot.accept('./router', () => {
        run(App, mkDrivers())
   })
}




