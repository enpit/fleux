import * as React from 'react';
import pascalCase from 'just-pascal-case';
import typeOf from 'just-typeof';
import fromEntries from 'fromentries';

import { createStore, isStore } from './store';

const readWriteHOC = function (store, readablePropNames = [], writeablePropNames = []) {
    return function (Component) {
        return class extends React.Component {

            constructor(props) {
                super(props);

                this.state = {
                    ...fromEntries(readablePropNames.map((propName) => [propName, store[propName]]))
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
                    <Component {...(this.state)} {...this.props} {...fromEntries(writeablePropNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
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
const defaultStore = createStore();

const connect = function (Component, value) {

    var store;

    if (typeof value === 'undefined') {
        throw new TypeError('Failed to connect component: Refusing to connect without a store. If you want to use an empty store, pass `{}` to `connect`.');
    }

    if (isStore(value)) {
        store = value;
    } else {
        store = createStore(value);
    }

    return class extends React.Component {
        render() {
            return (
                <context.Provider value={store}>
                    <Component {...this.props} />
                </context.Provider>
            )
        }
    }
}

const withContext = function (Component) {

    class ComponentWithContext extends React.Component {
        render() {
            const value = this.context || defaultStore;
            return (
                <Component context={value} {...this.props} />
            )
        }
    }

    ComponentWithContext.contextType = context;

    return ComponentWithContext;
}

const withStore = function (store, ...propNames) {
    if (propNames.every((propName) => typeof propName === 'string')) {
        return readWriteHOC(store, propNames, propNames);
    } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName))) {
        return readWriteHOC(store, propNames[0] || [], propNames[1] || []);
    }
}

const statefulComponentFactory = function (Component) {

    const ComponentWithState = function (props) {
        const ComponentWithContext = withContext(function ({context, ...props}) {

            class StatefulComponent extends React.Component {
                render() {
                    context.currentlyRenderingComponent = this;
                    const renderOutput = Component(this.props);
                    context.currentlyRenderingComponent = undefined;
                    return renderOutput;
                }
            }

            return (
                <StatefulComponent store={context} {...props} />
            );
        });

        return (
            <ComponentWithContext {...props} />
        );
    }

    Object.entries(Component).forEach(([key, value]) => ComponentWithState[key] = value);

    return ComponentWithState;
};

const withState = function (...args) {

    if (args.length === 0 || typeof args[0] === 'function') {

        if (typeof args[0] === 'function') {

            return statefulComponentFactory(args[0])

        } else {
            return statefulComponentFactory;
        }

    } else {

        const parsedProps = parseProps(args);

        return function (Component) {

            const ComponentWithState = function (props) {

                const conflictingNames = parsedProps.flat().filter(name => props.hasOwnProperty(name));

                if (conflictingNames.length > 0) {
                    throw Error(`Refusing to overwrite store props with parent-injected prop. The name(s) ${conflictingNames} exist in the store and are passed down from the parent component, resulting in a naming conflict.`);
                }

                const ComponentWithContext = withContext(function ({context, ...props}) {
                    const ComponentWithStore = readWriteHOC(context, ...parsedProps)(Component);

                    return (
                        <ComponentWithStore {...props} />
                    );
                });

                return (
                    <ComponentWithContext {...props} />
                );

            };

            Object.entries(Component).forEach(([key, value]) => ComponentWithState[key] = value);

            return ComponentWithState;

        }

    }
}

const parseProps = function (propNames) {
    if (propNames.every((propName) => typeof propName === 'string')) {
        return [ propNames, propNames ];
    } else if (propNames.length === 1 && Array.isArray(propNames) && Array.isArray(propNames[0])) {
        if (propNames[0].every((propName) => typeof propName === 'string')) {
            return [ propNames[0] , [] ];
        } else {
            return parseProps(propNames[0]);
        }
    } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName) || typeOf(propName) === 'null')) {
        return [ propNames[0] || [], propNames[1] || [] ];
    } else {
        throw Error(`Failed to parse props. Rejected arguments of the types ${propNames.map(propName => typeof propName)}`);
    }
}

export { connect, withState, withStore };
