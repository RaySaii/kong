export default function main(sources) {
    const match$ = sources.router.define(require('./.kong/router').default)
    const page$ = match$.map(({ path, value }) => {
        return value(Object.assign({}, sources, {
            router: sources.router.path(path), // notice use of 'router' source name,
            // which proxies raw 'history' source with
            // additional functionality
        }))
    }).shareReplay()
    return {
        REACT: page$.switchMap(c => c.REACT),
        http: page$.switchMap(c => c.HTTP),
        onion: page$.switchMap(c => c.onion),
        router: page$.filter(c => c.router).switchMap(c => c.router), // Notice use of 'router' sink name,
        // which proxies the original 'history' sink
    }
}
