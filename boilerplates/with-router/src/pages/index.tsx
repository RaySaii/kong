import { Observable, merge, of } from 'rxjs'
import * as React from 'react'
import { Button } from 'antd'
import { initialState } from '../utils/index'
import styles from './index.scss'
import { mapTo, map } from 'rxjs/operators'

export default function Home(sources) {
    const router = sources.react.event('goOther').pipe(mapTo('/other'))
    const initReducer = initialState({
        test: 1,
    })
    const addReducer = sources.react.event('add').pipe(
        mapTo(state => {
            return ({
                ...state,
                test: state.test + 1,
            })
        }),
    )
    return {
        react: sources.onion.state$.pipe(
            map(state =>
                <div className={styles.ok}>
                    {state.test}
                    dfasddsdsdsdsdsd
                    <Button onClick={sources.react.handler('goOther')}>Go other</Button>
                    <Button onClick={sources.react.handler('add')}>add</Button>
                </div>,
            ),
        ),
        onion: merge(initReducer, addReducer),
        router,
        http: of({ url: 'https://api.ldxxjs.cn/mushroom/map/level' }),
    }
}
