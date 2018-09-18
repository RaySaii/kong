import { Observable, of } from 'rxjs'
import { initialState } from '../utils/index'
import * as React from 'react'

export default function Ok() {
    return {
        react:of(
            <div>ok</div>,
        ),
        onion: initialState({ test2: 1 }),
    }
}
