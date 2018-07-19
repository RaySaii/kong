import React, {Component} from 'react'
import {Observable} from 'rxjs'
import {COMPILING_PREFIX} from './routes/createKongDevMiddleware'

function Compiling() {
    function loop(ref, count) {
        ref.style.transform = `rotate(${180 * count++}deg)`
        setTimeout(() => loop(ref, count), 1000)
    }

    function request() {
        new Image().src = `${COMPILING_PREFIX}${window.location.hash
            ? window.location.hash.replace('#', '')
            : window.location.pathname}`
    }

    return {
        REACT: Observable.of(
            <div
                ref={request}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#FFF4DE',
                    margin: '375px auto',
                    padding: '17px 0',
                }}>
                <svg style={{
                    marginRight: 27,
                    transition: 'all 1s linear',
                }} ref={ref => loop(ref, 1)} width="47px" height="47px" viewBox="0 0 47 47" version="1.1">
                    <title>Kong</title>
                    <desc>kong.js logo</desc>
                    <defs></defs>
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Group" fill="#333333">
                            <path
                                d="M23.5,47 C10.5213084,47 0,36.4786916 0,23.5 C0,10.5213084 10.5213084,0 23.5,0 C36.4786916,0 47,10.5213084 47,23.5 C47,36.4786916 36.4786916,47 23.5,47 Z M23.688,42.3 C33.9671238,42.3 42.3,33.9671238 42.3,23.688 C42.3,13.4088762 33.9671238,5.076 23.688,5.076 C13.4088762,5.076 5.076,13.4088762 5.076,23.688 C5.076,33.9671238 13.4088762,42.3 23.688,42.3 Z"
                                id="Combined-Shape"></path>
                            <rect id="Rectangle" x="4.324" y="20.68" width="38.54" height="5.64"></rect>
                        </g>
                    </g>
                </svg>
                Compiling...
            </div>),
    }
}

export default Compiling
