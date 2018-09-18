import React from 'react'
import isolate from '@cycle/isolate'
import * as Lens from './lens'
import { once } from 'lodash'
import { combineLatest, Observable, pipe, merge } from 'rxjs'
import Test from './components/test'
import { other, test } from './lens'
import Ok from './components/ok'
import Other from './components/other'
import { ok } from 'assert'
import { map } from 'rxjs/operators'


export default function main(sources) {
    sources.onion.state$
        .subscribe(val => {
            console.group('%c onion-state$', 'color:white;font-weight:bold;background:blue')
            console.log(val)
            console.groupEnd()
        })
    const testSinks = isolate(Test, { onion: test })(sources)
    const okSinks = isolate(Ok)(sources)
    const otherSinks = isolate(Other, { onion: other })(sources)
    return {
        react: combineLatest(testSinks.react, okSinks.react, otherSinks.react)
            .pipe(map(([test, ok, other]) => (
                <div>
                    {test}
                    {ok}
                    {other}
                </div>
            ))),
        http: merge(testSinks.http),
        onion: merge(testSinks.onion, okSinks.onion, otherSinks.onion),
    }
}
