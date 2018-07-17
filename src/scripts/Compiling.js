import React, {Component} from 'react'

class Compiling extends Component {
    componentDidMount() {
        new Image().src = `${window.location.hash ? window.location.hash.replace('#', '') : window.location.pathname}`
    }

    render() {
        return <div>Compiling...</div>
    }
}

export default Compiling
