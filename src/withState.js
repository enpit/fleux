import * as React from 'react';
import compare from 'just-compare';

import { createStore } from './store';
import context from './context';
import * as SYMBOLS from './symbols';
import preventWrites from './preventWrites';
import parseProps from './parseProps';

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

const statefulComponentFactory = function (Component, selectStateProps, bindActionProps) {

    var currentlyRenderingComponent = undefined,
        actionProps,
        stateProps;

    const ComponentWithState = withContext(function ComponentWithContext ({context, ...props}) {

        const localProxy = new Proxy(context, {
            get: function (target, prop) {
                return target[SYMBOLS.STORE_GET](prop, callback);
            }
        });

        const callback = (function () {
            if (typeof selectStateProps === 'function') {
                return function (prop, value) {
                    const updatedStore = {...localProxy, createAction: localProxy.createAction, [prop]: value};
                    const immutableStore = preventWrites(updatedStore, 'Refusing to write to store inside of mapStateToProps.');
                    const updatedProps = selectStateProps(immutableStore, props);
                    if (!compare(stateProps, updatedProps)) {
                        stateProps = updatedProps;
                        currentlyRenderingComponent.setState({[prop]:value});
                    }
                };
            } else {
                return function (prop, value) {
                    currentlyRenderingComponent.setState({[prop]:value});
                }
            }
        }());

        const immutableStore = preventWrites(localProxy, 'Refusing to write to store inside of mapStateToProps or mapDispatchToProps.');

        if (typeof selectStateProps === 'function') {
            stateProps = selectStateProps(immutableStore, props);
        }

        if (typeof bindActionProps === 'function') {
            actionProps = bindActionProps(immutableStore, props);
        }

        class ComponentWithStore extends React.Component {
            constructor(props) {
                super(props);
                currentlyRenderingComponent = this;
                this.state = {};
            }
            render() {
                return (
                    <Component store={localProxy} dispatch={localProxy.dispatch} {...stateProps} {...actionProps} {...this.props} />
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

        const [ selectStateProps, bindActionProps ] = parseProps(args);

        return function (Component) {

            const ComponentWithState = function (ownProps) {

                const explicitlyBoundComponent = function ({store, ...props}) {
                    return (
                        <Component {...props} store={store} />
                    );
                }

                const StatefulComponent = statefulComponentFactory(explicitlyBoundComponent, selectStateProps, bindActionProps);

                return (
                    <StatefulComponent {...ownProps} />
                );

            };

            Object.entries(Component).forEach(([key, value]) => ComponentWithState[key] = value);

            return ComponentWithState;

        }

    }
}

export { withState };
