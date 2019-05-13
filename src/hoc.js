import * as React from 'react';
import pascalCase from 'just-pascal-case';

import { createStore, isStore } from './store';

const readWriteHOC = function (store, readablePropNames = [], writeablePropNames = []) {
    return function (Component) {
        return class extends React.Component {

            constructor(props) {
                super(props);

                this.state = {
                    ...Object.fromEntries(readablePropNames.map((propName) => [propName, store[propName]]))
                }

                this.updateState = this.updateState.bind(this);

            }

            componentDidMount() {
                readablePropNames.forEach((propName) => store.subscribe(propName, this.updateState));
            }

            componentWillUnmount() {
                readablePropNames.forEach((propName) => store.unsubscribe(propName, this.updateState));
            }

            updateState(data) {
                this.setState({
                    ...data
                })
            }

            render() {
                return (
                    <Component {...(this.state)} {...this.props} {...Object.fromEntries(writeablePropNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
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

const context = React.createContext();

const connect = function (Component, value) {

    var store;

    if (isStore(value)) {
        store = value;
    } else {
        store = createStore(value);
    }

    return class extends React.Component {
        render() {
            return (
                <context.Provider value={store}>
                    <Component />
                </context.Provider>
            )
        }
    }
}

const withContext = function (Component) {
    return function (props) {
        return (
            <context.Consumer>
                {value => (<Component context={value} {...props} />)}
            </context.Consumer>
        )
    }
}

const withStore = function (store, ...propNames) {
    if (propNames.every((propName) => typeof propName === 'string')) {
        return readWriteHOC(store, propNames, propNames);
    } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName))) {
        return readWriteHOC(store, propNames[0], propNames[1] || []);
    }
}

const withState = function (...propNames) {
    return function (Component) {
        return function (props) {
            const ComponentWithContext = withContext(function ({context, ...props}) {
                const ComponentWithStore = withStore(context, ...propNames)(Component);
                return (
                    <ComponentWithStore {...props} />
                )
            });
            return (
                <ComponentWithContext {...props} />
            )
        }
    }
}

export { connect, withState, withStore };
