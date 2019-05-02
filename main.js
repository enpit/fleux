import * as React from 'react';
import ReactDom from 'react-dom';

import pascalCase from 'just-pascal-case';

import store from './store';

const withStore = function (...propNames) {
    return function (Component) {
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
                    <Component {...(this.state)} {...this.props} {...Object.fromEntries(propNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
                        if (typeof value === 'function') {
                            store[propName] = value(store[propName]);
                        } else {
                            store[propName] = value
                        }
                    } ] )) } />
                )
            }

        }
    }
}

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithStore = withStore('counter')(CounterDisplay);

@withStore('counter')
class CounterButton extends React.Component {
    render() {
        return (
            <button onClick={() => this.props.setCounter((counter) => counter+1)}>Count</button>
        )
    }
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
