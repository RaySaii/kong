import { Observable } from 'rxjs'
import { run } from '@cycle/rxjs-run'
import { makeHistoryDriver } from '@cycle/history'
import makeReactDOMDriver from '@sunny-g/cycle-react-driver'
import switchPath from 'switch-path'
import { routerify } from 'cyclic-router'
import  'antd/dist/antd.css';

function main(sources) {
    console.log(require('./router').default)
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

const mainWithRouting = routerify(main, switchPath)

run(mainWithRouting, {
    REACT: makeReactDOMDriver(document.querySelector('#root')),
    history: makeHistoryDriver(), // create history driver as usual,
    // but it gets proxied by routerify
})
