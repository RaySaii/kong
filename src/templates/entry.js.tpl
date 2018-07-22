import {Observable} from 'rxjs'
import {run, setup} from '@cycle/rxjs-run'
import isolate from '@cycle/isolate'
import {makeHistoryDriver} from '@cycle/history'
import makeReactDOMDriver from '@sunny-g/cycle-react-driver'
import switchPath from 'switch-path'
import onionify from 'cycle-onionify'
import {routerify} from 'cyclic-router'
import 'antd/dist/antd.css'
import mkDrivers from '../drivers'
import main from '../main'

const wrapMain = (main) => routerify(onionify(main), switchPath)
const App=wrapMain(main)

run(App, mkDrivers())

if (module.hot) {
    module.hot.accept('../main', () => {
        const newMain = require('../main').default
        run(wrapMain(newMain), mkDrivers())
   })
}




