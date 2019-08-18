import * as React from 'react';
import pascalCase from 'just-pascal-case';
import typeOf from 'just-typeof';
import fromEntries from 'fromentries';

import { createStore } from './store';
import context from './context';
import * as SYMBOLS from './symbols';

const defaultStore = createStore();

const withContext = function (Component) {

    class ContextWrapper extends React.Component {
        render() {
            const value = this.context || defaultStore;
            return (
                <Component context={value} {...this.props} />
            )
        }
    }

    ContextWrapper.contextType = context;

    return ContextWrapper;
}

const statefulComponentFactory = function (Component) {

    var currentlyRenderingComponent = undefined;

    const handler = {
        get: function (target, prop) {
            return target[SYMBOLS.STORE_GET](prop, currentlyRenderingComponent);
        }
    }

    const ComponentWithState = withContext(function ComponentWithContext ({context, ...props}) {

        const localProxy = new Proxy(context, handler);

        class ComponentWithStore extends React.Component {
            constructor(props) {
                super(props);
                currentlyRenderingComponent = this;
                this.state = {};
            }
            render() {
                return (
                    <Component store={localProxy} {...this.props} />
                );
            }
        }

        return (
            <ComponentWithStore {...props} />
        );

    });

    Object.entries(Component).forEach(([key, value]) => ComponentWithState[key] = value);

    return ComponentWithState;

};

const withState = function (...args) {

    if (args.length === 0) {

        return statefulComponentFactory;

    } else {

        const parsedProps = parseProps(args);

        return function (Component) {

            const ComponentWithState = function (props) {

                const conflictingNames = parsedProps.flat().filter(name => props.hasOwnProperty(name) || props.hasOwnProperty('set' + pascalCase(name)));

                if (conflictingNames.length > 0) {
                    throw Error(`Refusing to overwrite store props with parent-injected prop. The name(s) ${conflictingNames} exist in the store and are passed down from the parent component, resulting in a naming conflict.`);
                }

                const explicitlyBoundComponent = function ({store}) {

                    const readablePropNames = parsedProps[0];
                    const writeablePropNames = parsedProps[1];

                    const readableProps = fromEntries(readablePropNames.map((propName) => [propName, store[propName]]));

                    const writeableProps = fromEntries(writeablePropNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
                        if (typeof value === 'function') {
                            store[propName] = value(store[propName]);
                        } else {
                            store[propName] = value;
                        }
                    } ] ));

                    return (
                        <Component {...props} {...readableProps} {...writeableProps} />
                    );

                }

                const StatefulComponent = statefulComponentFactory(explicitlyBoundComponent);

                return (
                    <StatefulComponent {...props} />
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

export { withState };