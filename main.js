import * as React from 'react';
import ReactDom from 'react-dom';

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
                <Component {...(this.state)} {...this.props} />
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

const CounterButton = function () {
    return (
        <button onClick={() => store.counter++}>Count</button>
    )
}

const App = function () {
    return (
        <div>
            <CounterDisplayWithStore />
            <CounterButton />
        </div>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});
