import { Observable } from 'rxjs'
import { initialState } from '../utils'
import * as React from 'react'

export default function () {
    return {
        react: Observable.of(
            <div>other</div>,
        ),
        onion: initialState({ test2: 1 }),
    }
}
