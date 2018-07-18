import React, {Component} from 'react'
import {Observable} from 'rxjs'
import {COMPILING_PREFIX} from './routes/createKongDevMiddleware'

function Compiling() {
    return {
        REACT: Observable.of(<div ref={() => {
            new Image().src = `${COMPILING_PREFIX}${window.location.hash
                ? window.location.hash.replace('#', '')
                : window.location.pathname}`
        }}>Compiling...</div>),
    }
}

export default Compiling
