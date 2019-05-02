import * as React from 'react';
import ReactDom from 'react-dom';

import pascalCase from 'just-pascal-case';

import store from './store';

const withStore = function (Component, ...propNames) {
    
    return class extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                ...Object.fromEntries(propNames.map((propName) => [propName, store[propName]]))
            }

            this.updateState = this.updateState.bind(this);

        }

        componentDidMount() {
            propNames.forEach((propName) => store.subscribe(propName, this.updateState));
        }
    
        componentWillUnmount() {
            propNames.forEach((propName) => store.unsubscribe(propName, this.updateState));
        }
    
        updateState(data) {
            this.setState({
                ...data
            })
        }

        render() {
            return (
                <Component {...(this.state)} {...this.props} {...Object.fromEntries(propNames.map((propName) => [ 'set' + pascalCase(propName), (value) => { store[propName] = value } ] )) } />
            )
        }

    }

}

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithStore = withStore(CounterDisplay, 'counter');

const CounterButton = function ({counter, setCounter}) {
    return (
        <button onClick={() => setCounter(counter+1)}>Count</button>
    )
}

const CounterButtonWithStore = withStore(CounterButton, 'counter');

console.log(store);

const App = function () {
    return (
        <div>
            <CounterDisplayWithStore />
            <CounterButtonWithStore />
        </div>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});
