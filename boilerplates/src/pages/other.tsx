import { Observable } from 'rxjs'
import * as React from 'react'
import { initialState } from '../utils'

export default function Other(sources) {
    return {
        REACT: Observable.of(
            <div>other</div>,
        ),
        onion: initialState({ test2: 1 }),
    }
}
