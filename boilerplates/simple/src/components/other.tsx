import { Observable, of } from 'rxjs'
import * as React from 'react'
import { initialState } from '../utils/index'
import styles from './other.scss'

export default function Other(sources) {
    return {
        react: of(
            <div className={styles.ok}>other</div>,
        ),
        onion: initialState({ test2: 1 }),
    }
}
