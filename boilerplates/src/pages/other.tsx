import { Observable } from 'rxjs'
import * as React from 'react'

export default function Other(sources) {

    return {
        REACT: Observable.of(
            <div>other</div>,
        ),
    }
}
