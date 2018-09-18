import React from 'react'
import isolate from '@cycle/isolate'
import * as Lens from './lens'
import { once } from 'lodash'
import { Observable, from, of } from 'rxjs'
import { map, shareReplay, switchMap, filter } from 'rxjs/operators'


export default function main(sources) {
    sources.onion.state$
        .subscribe(val => {
            console.group('%c onion-state$', 'color:white;font-weight:bold;background:blue')
            console.log(val)
            console.groupEnd()
        })
    const match$ = sources.router.define(require('./.kong/router').default)
    const fac = (func, path) => {
        return isolate(func, { onion: Lens[func.name] })(
            Object.assign({}, sources, {
                // notice use of 'router' source name,
                // which proxies raw 'history' source ,
                // with additional functionality
                router: sources.router.path(path),
            }),
        )
    }
    const page$ = match$.pipe(
        switchMap(({ path, value }) => {
            try {
                const func = value().then(m => m.default)
                return from(func).pipe(
                    map(func => fac(func, path)),
                )
            } catch (e) {
                return of(fac(value, path))
            }
        }),
        shareReplay(),
    )
    return {
        react: page$.pipe(
            switchMap(c => c.react),
            map(page => (
                <div>
                    dsdsdsds
                    {page}
                </div>
            )),
        ),
        http: page$.pipe(
            filter(c => c.http),
            switchMap(c => c.http),
        ),
        onion: page$.pipe(
            filter(c => c.onion),
            switchMap(c => c.onion),
        ),
        router: page$.pipe(
            filter(c => c.router),
            switchMap(c => c.router),
        ), // Notice use of 'router' sink name,
        // which proxies the original 'history' sink
    }
}
