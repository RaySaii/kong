import { Observable } from 'rxjs'
import * as React from 'react'
import { Button} from 'antd'
import { cloneDeep } from 'lodash'
import { initialState } from '../utils'

export default function Home(sources) {
    const router = sources.REACT.event('goOther').mapTo('/other')
    console.count('home')
    const initReducer = initialState({
        test: 1,
    }).do(val => console.log('dsdsdsd', val))
    const addReducer = sources.REACT.event('add').mapTo(state => ({
        ...state,
        test: state.test + 1,
    }))
    return {
        REACT: sources.onion.state$.map(state =>
            <div>
                {state.test}
                <Button onClick={sources.REACT.handler('goOther')}>Go other</Button>
                <Button onClick={sources.REACT.handler('add')}>add</Button>
            </div>,
        ),
        onion: Observable.merge(initReducer, addReducer),
        router,
        HTTP:Observable.of({url:'https://api.ldxxjs.cn/mushroom/map/level'})
    }
}
