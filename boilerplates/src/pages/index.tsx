import { Observable } from 'rxjs'
import * as React from 'react'
import { Button} from 'antd'
import { cloneDeep } from 'lodash'

export default function Home(sources) {
    const router = sources.REACT.event('goOther').mapTo('/other')
    return {
        REACT: Observable.of(
            <div>
                Home page
                <Button onClick={sources.REACT.handler('goOther')}>Go other</Button>
            </div>,
        ),
        router,
    }
}
