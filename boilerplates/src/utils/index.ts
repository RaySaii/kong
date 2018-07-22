import { Observable } from 'rxjs'

export function initialState(state) {
    return Observable.of(prevState =>
        typeof prevState !== 'undefined'
            ? { ...prevState ,...state }
            : state,
    )
}
