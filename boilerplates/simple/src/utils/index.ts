import pick from 'lodash/pick'
import isEqual from 'lodash/isEqual'
import { of } from 'rxjs'

export function initialState(state) {
    return of(prevState =>
        typeof prevState !== 'undefined'
            ? { ...prevState, ...state }
            : state,
    )
}

export function getState(keys) {
    return state => pick(state, keys)
}

export function update(...any) {
    if (arguments.length > 1) {
        const state = arguments[0]
        const childState = arguments[1]
        const keys = Object.keys(childState)
        // keys.forEach(key => {
        //     console.log('change', key, 'to: ', childState[key])
        // })
        return isEqual(pick(state, keys), childState) ? state : { ...state, ...childState }
    }
    const external = arguments[0]
    return (state, childState) => {
        const keys = Object.keys(childState)
        return isEqual(pick(state, keys), childState) ? state : { ...state, ...childState, ...external }
    }
}

