import { Observable } from 'rxjs'
import * as React from 'react'
import { Button} from 'antd'
import { initialState } from '../utils'
import styles from './index.scss';

export default function Home(sources) {
    const router = sources.react.event('goOther').mapTo('/other')
    const initReducer = initialState({
        test: 1,
    })
    const addReducer = sources.react.event('add').mapTo(state => {
        return ({
            ...state,
            test: state.test + 1,
        })
    })
    return {
        react: sources.onion.state$.map(state =>
            <div className={styles.ok}>
                {state.test}
                dfasddsdsdsdsdsd
                <Button onClick={sources.react.handler('goOther')}>Go other</Button>
                <Button onClick={sources.react.handler('add')}>add</Button>
            </div>,
        ),
        onion: Observable.merge(initReducer, addReducer),
        router,
        http:Observable.of({url:'https://api.ldxxjs.cn/mushroom/map/level'})
    }
}
