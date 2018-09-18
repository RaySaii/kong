import {run} from '@cycle/rxjs-run'
import onionify from 'cycle-onionify'
import 'antd/dist/antd.css'
import mkDrivers from '../drivers'
import main from '../main'

<%= WRAPMAIN %>

const App=wrapMain(main)

run(App, mkDrivers())

if (module.hot) {
    module.hot.accept('../main', () => {
        const newMain = require('../main').default
        run(wrapMain(newMain), mkDrivers())
   })
}




