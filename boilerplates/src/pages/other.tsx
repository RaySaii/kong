import { Observable } from 'rxjs'
import * as React from 'react'
import { initialState } from '../utils'
import styles from './other.scss';

export default function Other(sources) {
    return {
        react: Observable.of(
            <div className={styles.ok}>other</div>,
        ),
        onion: initialState({ test2: 1 }),
    }
}
